import { SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";

export default {
  cooldown: 30,
  data: new SlashCommandBuilder()
    .setName("add")
    .setDescription("Add an account to your Discord")
    .addSubcommand((subcommand) =>
      subcommand.setName("account").setDescription("Add an account to your Discord"),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply("About the bot!");
  },
};
