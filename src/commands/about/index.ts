import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { discordLocalization } from "#/i18n/index.ts";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("about")
    .setNameLocalizations(discordLocalization("command.about.name"))
    .setDescription("About the bot")
    .setDescriptionLocalizations(discordLocalization("command.about.description")),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply("About the bot!");
  },
};
