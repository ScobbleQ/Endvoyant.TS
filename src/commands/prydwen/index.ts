import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { discordLocalization } from "#/i18n/index.ts";

export default {
  cooldown: 0,
  data: new SlashCommandBuilder()
    .setName("prydwen")
    .setNameLocalizations(discordLocalization("command.prydwen.name"))
    .setDescription("Prydwen tools and guides")
    .setDescriptionLocalizations(discordLocalization("command.prydwen.description"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("tierlist")
        .setNameLocalizations(discordLocalization("command.prydwen.subcommands.tierlist.name"))
        .setDescription("Show the current Prydwen tier list")
        .setDescriptionLocalizations(
          discordLocalization("command.prydwen.subcommands.tierlist.description"),
        ),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply({
      content: "Prydwyn is coming soon!",
    });
  },
};
