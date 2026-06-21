import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("contingency")
    .setDescription("About the bot")
    .addSubcommand((subcommand) => subcommand.setName("contract").setDescription("About the bot")),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply("About the bot!");
  },
};
