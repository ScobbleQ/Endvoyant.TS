import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { dtx } from "#/i18n/index.ts";

export default {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName("full")
    .setNameLocalizations(dtx("command.full.name"))
    .setDescription("View a complete player profile")
    .setDescriptionLocalizations(dtx("command.full.description"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("profile")
        .setNameLocalizations(dtx("command.full.subcommands.profile.name"))
        .setDescription("View a complete player profile")
        .setDescriptionLocalizations(dtx("command.full.subcommands.profile.description")),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply("About the bot!");
  },
};
