import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { discordLocalization } from "#/i18n/index.ts";

export default {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName("daily")
    .setNameLocalizations(discordLocalization("command.daily.name"))
    .setDescription("Claim daily in-game rewards")
    .setDescriptionLocalizations(discordLocalization("command.daily.description"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("signin")
        .setNameLocalizations(discordLocalization("command.daily.subcommands.signin.name"))
        .setDescription("Claim daily in-game rewards")
        .setDescriptionLocalizations(
          discordLocalization("command.daily.subcommands.signin.description"),
        ),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply("About the bot!");
  },
};
