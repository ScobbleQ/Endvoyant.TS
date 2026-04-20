import { SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder().setName("about").setDescription("About the bot"),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply("About the bot!");
  },
};
