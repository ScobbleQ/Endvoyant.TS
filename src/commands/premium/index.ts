import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { discordLocalization } from "#/i18n/index.ts";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("premium")
    .setNameLocalizations(discordLocalization("command.premium.name"))
    .setDescription("View your premium status")
    .setDescriptionLocalizations(discordLocalization("command.premium.description")),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply("View your premium status!");
  },
};
