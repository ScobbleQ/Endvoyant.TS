import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { discordLocalization } from "#/i18n/index.ts";

export default {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName("umbral")
    .setNameLocalizations(discordLocalization("command.umbral.name"))
    .setDescription("View Umbral Monument rewards")
    .setDescriptionLocalizations(discordLocalization("command.umbral.description"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("monument")
        .setNameLocalizations(discordLocalization("command.umbral.subcommands.monument.name"))
        .setDescription("View Umbral Monument rewards")
        .setDescriptionLocalizations(
          discordLocalization("command.umbral.subcommands.monument.description"),
        ),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply("About the bot!");
  },
};
