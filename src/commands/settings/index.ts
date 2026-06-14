import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { UsersDB } from "#/drizzle/index.ts";
import { localizations } from "#/i18n/index.ts";
import SettingModal from "./modals/setting.ts";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("settings")
    .setNameLocalizations(localizations("command.settings.name"))
    .setDescription("Adjust your bot settings")
    .setDescriptionLocalizations(localizations("command.settings.description")),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const user = await UsersDB.findUser(interaction.user.id);
    if (!user) {
      await interaction.reply("Please link an account first using /add account.");
      return;
    }

    await interaction.showModal(
      SettingModal.data({
        curLang: user.lang,
        curPrivacy: user.isPrivate,
        curNotif: user.enableNotif,
        curReminder: user.enableReminder,
        curData: user.allowData,
      }),
    );
  },
};
