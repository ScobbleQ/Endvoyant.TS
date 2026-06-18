import {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  type ContextMenuCommandInteraction,
  AttachmentBuilder,
} from "discord.js";
import { UsersDB, db } from "#/drizzle/index.ts";
import { fromDiscordLocale } from "#/i18n/index.ts";
import EndfieldSDK from "#/packages/EndfieldSDK/index.ts";
import { renderProfile } from "./render.ts";

export default {
  cooldown: 60,
  data: new ContextMenuCommandBuilder().setName("Profile").setType(ApplicationCommandType.User),
  execute: async (interaction: ContextMenuCommandInteraction) => {
    const viewer = await UsersDB.findAccess(interaction.user.id);
    const lang = viewer?.lang || fromDiscordLocale(interaction.locale) || "en-us";

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
      return;
    }

    if (interaction.user.id !== interaction.targetId) {
      if (account.isPrivate) {
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
      return;
    }

    const imgBuffer = await renderProfile(data.data.detail.base, lang);
    const attachment = new AttachmentBuilder(imgBuffer, {
      name: `${account.roleId}.jpg`,
    });

    await interaction.editReply({ files: [attachment] });
  },
};
