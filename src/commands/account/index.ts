import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { discordLocalization } from "#/i18n/index.ts";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("account")
    .setNameLocalizations(discordLocalization("command.account.name"))
    .setDescription("Manage your linked accounts")
    .setDescriptionLocalizations(discordLocalization("command.account.description"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("manager")
        .setNameLocalizations(discordLocalization("command.account.subcommands.manager.name"))
        .setDescription("Manage your linked accounts")
        .setDescriptionLocalizations(
          discordLocalization("command.account.subcommands.manager.description"),
        ),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply("About the bot!");
  },
};
