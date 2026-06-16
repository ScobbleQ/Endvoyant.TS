import { SlashCommandBuilder, MessageFlags, type ChatInputCommandInteraction } from "discord.js";
import { UsersDB } from "#/drizzle/index.ts";
import { errorContainer } from "#/globals/components/container.ts";
import { tx, dtx, fromDiscordLocale } from "#/i18n/index.ts";
import SettingModal from "./modals/setting.ts";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("settings")
    .setNameLocalizations(dtx("command.settings.name"))
    .setDescription("Adjust your bot settings")
    .setDescriptionLocalizations(dtx("command.settings.description")),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const user = await UsersDB.findUser(interaction.user.id);
    if (!user) {
      const locale = fromDiscordLocale(interaction.locale);
      await interaction.reply({
        components: [errorContainer({ desc: tx(locale, "error.requireSetup") })],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
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
