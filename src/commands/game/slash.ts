import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { config } from "#/config.ts";
import { UsersDB } from "#/drizzle/db/users.ts";
import { dtx, fromDiscordLocale } from "#/i18n/index.ts";

export default {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName("game")
    .setNameLocalizations(dtx("command.game.name"))
    .setDescription("View recent game news, events, and updates")
    .setDescriptionLocalizations(dtx("command.game.description"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("news")
        .setNameLocalizations(dtx("command.game.subcommands.news.name"))
        .setDescription("View recent game news, events, and updates")
        .setDescriptionLocalizations(dtx("command.game.subcommands.news.description")),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();
    const eventCid = interaction.options.getString("name");

    const user = await UsersDB.findAccess(interaction.user.id);
    const lang = user?.lang || fromDiscordLocale(interaction.locale) || "en-us";

    if (user && user.allowData && config.env === "production") {
      // log activity
    }

    await interaction.reply("About the bot!");
  },
};
