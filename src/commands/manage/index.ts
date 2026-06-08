import { SlashCommandBuilder, MessageFlags, type ChatInputCommandInteraction } from "discord.js";
import { config } from "#/config.ts";
import { AccountsDB, EventsDB, UsersDB } from "#/drizzle/index.ts";
import { discordLocalization } from "#/i18n/index.ts";
import { accountContainer } from "./components/account.ts";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("manage")
    .setNameLocalizations(discordLocalization("command.manage.name"))
    .setDescription("Manage your linked accounts")
    .setDescriptionLocalizations(discordLocalization("command.manage.description"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("accounts")
        .setNameLocalizations(discordLocalization("command.manage.subcommands.accounts.name"))
        .setDescription("Manage your linked accounts")
        .setDescriptionLocalizations(
          discordLocalization("command.manage.subcommands.accounts.description"),
        ),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const user = await UsersDB.findAccess(interaction.user.id);
    if (!user) {
      await interaction.editReply({
        content: "You don't have any linked accounts. Use /add to link an account.",
      });
      return;
    }

    if (config.env === "production" && user.allowData) {
      void EventsDB.record(user.dcid, {
        source: "slash",
        action: "account manager",
      });
    }

    const accounts = await AccountsDB.listForManage(interaction.user.id);
    if (accounts.length === 0) {
      await interaction.editReply({
        content: "You don't have any linked accounts. Use /add to link an account.",
      });
      return;
    }

    await interaction.editReply({
      components: [accountContainer(user.isPremium, accounts)],
      flags: [MessageFlags.IsComponentsV2],
    });
  },
};
