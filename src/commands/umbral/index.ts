import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";

export default {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName("umbral")
    .setDescription("Claim daily in-game rewards")
    .addSubcommand((subcommand) =>
      subcommand.setName("monument").setDescription("Claim daily in-game rewards"),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply("About the bot!");
  },
};
