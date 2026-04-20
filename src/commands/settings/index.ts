import { SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder().setName("settings").setDescription("Settings for the bot"),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply("Settings for the bot!");
  },
};
