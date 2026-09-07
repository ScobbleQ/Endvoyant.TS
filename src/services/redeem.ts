import { eq } from "drizzle-orm";
import { config } from "#/config.ts";
import { db, EventsDB } from "#/drizzle/index.ts";
import { efAttemptedCodes, efCodes, type accounts, type users } from "#/drizzle/schema.ts";
import { sdk } from "#/globals/sdk.ts";
import { logger } from "#/utils/logger.ts";

type User = Pick<typeof users.$inferSelect, "dcid" | "allowData">;
type Account = Pick<typeof accounts.$inferSelect, "id" | "accountToken" | "channelId" | "serverId">;

export async function createRedemptionSession(
  account: Pick<Account, "accountToken" | "channelId">,
) {
  const oauth = await sdk.auth.grantOAuth2({
    appCode: "d9f6dbb6bbd6bb33",
    token: account.accountToken,
  });

  if (oauth.status !== 0) return null;

  const channel = await sdk.auth.loginWithChannelToken({
    channelId: account.channelId,
    channelToken: oauth.data.code,
  });

  if (channel.status !== 0) return null;

  return channel.data.token;
}

export async function redeemCode(
  user: User,
  account: Account,
  code: string,
  token: string,
  source: "cron" | "slash",
) {
  const result = await sdk.giftcode.redeem({
    code,
    channelId: account.channelId,
    serverId: account.serverId,
    token,
  });

  // 11004 = code is invalid or expired
  if (result.code === 11004) {
    await db.update(efCodes).set({ isActive: false }).where(eq(efCodes.code, code));
  }

  // 11005 = code has already been redeemed
  const status = result.code === 0 || result.code === 11005 ? 0 : -1;
  const lastAttemptedAt = new Date();

  await db
    .insert(efAttemptedCodes)
    .values({
      aid: account.id,
      code,
      status,
      lastAttemptedAt,
    })
    .onConflictDoUpdate({
      target: [efAttemptedCodes.aid, efAttemptedCodes.code],
      set: { status, lastAttemptedAt },
      setWhere: eq(efAttemptedCodes.status, -1),
    });

  if (result.code === 0) {
    if (config.env === "production" && user.allowData) {
      void EventsDB.record(user.dcid, {
        source,
        action: "redeem",
        aid: account.id,
        metadata: { code },
      });
    }
  } else if (result.code !== 11005 && result.code !== 11004) {
    logger.error({ accountId: account.id, code: result.code }, "Code redemption failed");
  }

  return result;
}
