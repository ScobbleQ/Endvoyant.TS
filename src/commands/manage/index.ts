import { SlashCommandBuilder, MessageFlags, type ChatInputCommandInteraction } from "discord.js";
import { config } from "#/config.ts";
import { AccountsDB, EventsDB, UsersDB } from "#/drizzle/index.ts";
import { errorContainer } from "#/globals/components/container.ts";
import { dtx, tx, fromDiscordLocale } from "#/i18n/index.ts";
import { accountContainer } from "./components/account.ts";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("manage")
    .setNameLocalizations(dtx("command.manage.name"))
    .setDescription("Manage your linked accounts")
    .setDescriptionLocalizations(dtx("command.manage.description"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("accounts")
        .setNameLocalizations(dtx("command.manage.subcommands.accounts.name"))
        .setDescription("Manage your linked accounts")
        .setDescriptionLocalizations(dtx("command.manage.subcommands.accounts.description")),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const user = await UsersDB.findAccess(interaction.user.id);
    if (!user) {
      const locale = fromDiscordLocale(interaction.locale);
      await interaction.editReply({
        components: [errorContainer({ desc: tx(locale, "error.requireSetup") })],
        flags: [MessageFlags.IsComponentsV2],
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
        components: [errorContainer({ desc: tx(user.lang, "error.notLinked") })],
        flags: [MessageFlags.IsComponentsV2],
      });
      return;
    }

    await interaction.editReply({
      components: [accountContainer(user.isPremium, accounts)],
      flags: [MessageFlags.IsComponentsV2],
    });
  },
};
