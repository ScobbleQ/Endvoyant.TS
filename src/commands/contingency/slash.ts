import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { dtx } from "#/i18n/index.ts";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("contingency")
    .setNameLocalizations(dtx("command.contingency.name"))
    .setDescription("About the bot")
    .setDescriptionLocalizations(dtx("command.contingency.description"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("contract")
        .setNameLocalizations(dtx("command.contingency.subcommands.contract.name"))
        .setDescription("About the bot")
        .setDescriptionLocalizations(dtx("command.contingency.subcommands.contract.description")),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply("About the bot!");
  },
};
