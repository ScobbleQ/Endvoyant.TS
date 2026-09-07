import {
  ContainerBuilder,
  DiscordAPIError,
  MessageFlags,
  RESTJSONErrorCodes,
  type Client,
} from "discord.js";
import { db, UsersDB } from "#/drizzle/index.ts";
import { logger } from "#/utils/logger.ts";

const dmPermissionErrors = new Set<number>([
  RESTJSONErrorCodes.CannotSendMessagesToThisUser,
  RESTJSONErrorCodes.CannotSendMessagesToThisUserDueToHavingNoMutualGuilds,
  RESTJSONErrorCodes.MissingAccess,
  RESTJSONErrorCodes.MissingPermissions,
]);

export async function sendJobNotification(
  client: Client,
  dcid: string,
  container: ContainerBuilder | (() => ContainerBuilder),
) {
  try {
    // Recheck preferences because an earlier DM may have disabled notifications.
    const user = await db.query.users.findFirst({
      columns: { enableNotif: true },
      where: { dcid, isBanned: false },
    });

    if (!user?.enableNotif) return;

    await client.users.send(dcid, {
      components: [typeof container === "function" ? container() : container],
      flags: [MessageFlags.IsComponentsV2],
      allowedMentions: { parse: [] },
    });
  } catch (error) {
    if (
      error instanceof DiscordAPIError &&
      typeof error.code === "number" &&
      dmPermissionErrors.has(error.code)
    ) {
      try {
        await UsersDB.updateByDcid(dcid, { enableNotif: false });
      } catch {
        logger.error({ userId: dcid }, "Failed to disable job notifications");
      }
    }

    logger.error({ userId: dcid }, "Failed to send job notification");
  }
}
