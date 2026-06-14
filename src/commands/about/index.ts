import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { localizations } from "#/i18n/index.ts";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("about")
    .setNameLocalizations(localizations("command.about.name"))
    .setDescription("About the bot")
    .setDescriptionLocalizations(localizations("command.about.description")),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply("About the bot!");
  },
};
