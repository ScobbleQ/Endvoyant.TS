import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { localizations } from "#/i18n/index.ts";

export default {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName("game")
    .setNameLocalizations(localizations("command.game.name"))
    .setDescription("View recent game news, events, and updates")
    .setDescriptionLocalizations(localizations("command.game.description"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("news")
        .setNameLocalizations(localizations("command.game.subcommands.news.name"))
        .setDescription("View recent game news, events, and updates")
        .setDescriptionLocalizations(
          localizations("command.game.subcommands.news.description"),
        ),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply("About the bot!");
  },
};
