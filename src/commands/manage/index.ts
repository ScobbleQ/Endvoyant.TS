import { SlashCommandBuilder, MessageFlags, type ChatInputCommandInteraction } from "discord.js";
import { errorContainer } from "#/components/container.ts";
import { config } from "#/config.ts";
import { AccountsDB, EventsDB, UsersDB } from "#/drizzle/index.ts";
import { localizations, t, fromDiscordLocale } from "#/i18n/index.ts";
import { accountContainer } from "./components/account.ts";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("manage")
    .setNameLocalizations(localizations("command.manage.name"))
    .setDescription("Manage your linked accounts")
    .setDescriptionLocalizations(localizations("command.manage.description"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("accounts")
        .setNameLocalizations(localizations("command.manage.subcommands.accounts.name"))
        .setDescription("Manage your linked accounts")
        .setDescriptionLocalizations(
          localizations("command.manage.subcommands.accounts.description"),
        ),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const user = await UsersDB.findAccess(interaction.user.id);
    if (!user) {
      const locale = fromDiscordLocale(interaction.locale);
      await interaction.editReply({
        components: [errorContainer({ desc: t(locale, "error.requireSetup") })],
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
        components: [errorContainer({ desc: t(user.lang, "error.notLinked") })],
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
