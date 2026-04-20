import { SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";

export default {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Claim daily in-game rewards")
    .addSubcommand((subcommand) =>
      subcommand.setName("signin").setDescription("Claim daily in-game rewards"),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply("About the bot!");
  },
};
