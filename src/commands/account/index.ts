import { SlashCommandBuilder, MessageFlags, type ChatInputCommandInteraction } from "discord.js";
import { config } from "#/config.ts";
import { AccountsDB, EventsDB, UsersDB } from "#/drizzle/index.ts";
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
    const user = await UsersDB.findByDcid(interaction.user.id);
    if (!user) {
      await interaction.reply({
        content: "You don't have any linked accounts. Use /add to link an account.",
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    if (config.env === "production") {
      void EventsDB.insert(user.dcid, {
        source: "slash",
        action: "account manager",
      });
    }

    const accounts = await AccountsDB.listByDcid(interaction.user.id);
    if (accounts.length === 0) {
      await interaction.reply({
        content: "You don't have any linked accounts. Use /add to link an account.",
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }
  },
};
