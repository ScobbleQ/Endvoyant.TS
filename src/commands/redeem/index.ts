import { SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";

export default {
  cooldown: 30,
  data: new SlashCommandBuilder().setName("redeem").setDescription("Redeem a new item"),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply("About the bot!");
  },
};
