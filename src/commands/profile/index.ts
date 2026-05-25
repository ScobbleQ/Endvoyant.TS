import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { discordLocalization } from "#/i18n/index.ts";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("profile")
    .setNameLocalizations(discordLocalization("command.profile.name"))
    .setDescription("View your profile")
    .setDescriptionLocalizations(discordLocalization("command.profile.description")),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply("View your profile!");
  },
};
