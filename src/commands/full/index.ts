import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { localizations } from "#/i18n/index.ts";

export default {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName("full")
    .setNameLocalizations(localizations("command.full.name"))
    .setDescription("View a complete player profile")
    .setDescriptionLocalizations(localizations("command.full.description"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("profile")
        .setNameLocalizations(localizations("command.full.subcommands.profile.name"))
        .setDescription("View a complete player profile")
        .setDescriptionLocalizations(localizations("command.full.subcommands.profile.description")),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply("About the bot!");
  },
};
