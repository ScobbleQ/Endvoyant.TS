import {
  ApplicationCommandType,
  AttachmentBuilder,
  ContextMenuCommandBuilder,
  MessageFlags,
  type ContextMenuCommandInteraction,
} from "discord.js";
import { config } from "#/config.ts";
import { db, EventsDB, UsersDB } from "#/drizzle/index.ts";
import { fromDiscordLocale, tx } from "#/i18n/index.ts";
import EndfieldSDK from "#/packages/EndfieldSDK/index.ts";
import { errorContainer } from "#/ui/container.ts";
import { renderProfile } from "./render.ts";

export default {
  cooldown: 60,
  data: new ContextMenuCommandBuilder().setName("Profile").setType(ApplicationCommandType.User),
  execute: async (interaction: ContextMenuCommandInteraction) => {
    const viewer = await UsersDB.findAccess(interaction.user.id);
    const lang = viewer?.lang || fromDiscordLocale(interaction.locale) || "en-us";

    if (viewer && viewer.allowData) {
      if (config.env === "production") {
        void EventsDB.record(viewer.dcid, {
          source: "context",
          action: "view profile",
        });
      }
    }

    const account = await db.query.accounts.findFirst({
      columns: {
        accountToken: true,
        serverId: true,
        roleId: true,
        isPrivate: true,
      },
      where: {
        dcid: interaction.targetId,
        isPrimary: true,
      },
    });

    if (!account) {
      await interaction.reply({
        components: [errorContainer({ desc: tx(lang, "error.noAccounts") })],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
      return;
    }

    if (interaction.user.id !== interaction.targetId) {
      if (account.isPrivate) {
        await interaction.reply({
          components: [errorContainer({ desc: tx(lang, "error.privateAccounts") })],
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
        });
        return;
      }
    }

    await interaction.deferReply();

    const session = await EndfieldSDK.createSkportSession({ accountToken: account.accountToken });
    if (!session) return;

    const data = await EndfieldSDK.fetchCardDetail({
      cred: session.cred,
      token: session.token,
      serverId: account.serverId,
      roleId: account.roleId,
      lang,
    });

    if (data.code !== 0) {
      await interaction.editReply({
        components: [errorContainer({ desc: tx(lang, "error.fetchFailed") })],
        flags: [MessageFlags.IsComponentsV2],
      });
      return;
    }

    const imgBuffer = await renderProfile(data.data.detail.base, lang);
    const attachment = new AttachmentBuilder(imgBuffer, {
      name: `${account.roleId}.jpg`,
    });

    await interaction.editReply({ files: [attachment] });
  },
};
