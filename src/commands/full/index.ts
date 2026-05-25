import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { discordLocalization } from "#/i18n/index.ts";

export default {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName("full")
    .setNameLocalizations(discordLocalization("command.full.name"))
    .setDescription("View a complete player profile")
    .setDescriptionLocalizations(discordLocalization("command.full.description"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("profile")
        .setNameLocalizations(discordLocalization("command.full.subcommands.profile.name"))
        .setDescription("View a complete player profile")
        .setDescriptionLocalizations(
          discordLocalization("command.full.subcommands.profile.description"),
        ),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply("About the bot!");
  },
};
