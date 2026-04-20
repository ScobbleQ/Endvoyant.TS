import { SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";

export default {
  cooldown: 86400,
  data: new SlashCommandBuilder()
    .setName("export")
    .setDescription("Export your data")
    .addSubcommand((subcommand) => subcommand.setName("data").setDescription("Export your data")),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply("Export your data");
  },
};
