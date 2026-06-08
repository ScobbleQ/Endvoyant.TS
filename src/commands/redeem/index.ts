import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { discordLocalization } from "#/i18n/index.ts";

export default {
  cooldown: 30,
  data: new SlashCommandBuilder()
    .setName("redeem")
    .setNameLocalizations(discordLocalization("command.redeem.name"))
    .setDescription("Redeem a reward code")
    .setDescriptionLocalizations(discordLocalization("command.redeem.description"))
    .addStringOption((option) =>
      option.setName("code").setDescription("The reward code to redeem"),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply("About the bot!");
  },
};
