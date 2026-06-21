import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { dtx } from "#/i18n/index.ts";

export default {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName("umbral")
    .setNameLocalizations(dtx("command.umbral.name"))
    .setDescription("View Umbral Monument records")
    .setDescriptionLocalizations(dtx("command.umbral.description"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("monument")
        .setNameLocalizations(dtx("command.umbral.subcommands.monument.name"))
        .setDescription("View Umbral Monument records")
        .setDescriptionLocalizations(dtx("command.umbral.subcommands.monument.description")),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply("About the bot!");
  },
};
