import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder().setName("profile").setDescription("View your profile"),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply("View your profile!");
  },
};
