import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { discordLocalization } from "#/i18n/index.ts";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("settings")
    .setNameLocalizations(discordLocalization("command.settings.name"))
    .setDescription("Adjust your bot settings")
    .setDescriptionLocalizations(discordLocalization("command.settings.description")),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply("Settings for the bot!");
  },
};
