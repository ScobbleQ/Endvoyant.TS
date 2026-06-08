import { MessageFlags, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { errorContainer } from "#/components/container.ts";
import { config } from "#/config.ts";
import { AccountsDB, EventsDB, UsersDB } from "#/drizzle/index.ts";
import { discordLocalization } from "#/i18n/index.ts";
import { addAccountContainer } from "./components/addAccount.ts";
import { maxAccountContainer } from "./components/maxAccount.ts";
import { onboardingContainer } from "./components/onboarding.ts";

export default {
  cooldown: 30,
  data: new SlashCommandBuilder()
    .setName("add")
    .setNameLocalizations(discordLocalization("command.add.name"))
    .setDescription("Add an account to your Discord")
    .setDescriptionLocalizations(discordLocalization("command.add.description"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("account")
        .setNameLocalizations(discordLocalization("command.add.subcommands.account.name"))
        .setDescription("Add an account to your Discord")
        .setDescriptionLocalizations(
          discordLocalization("command.add.subcommands.account.description"),
        ),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const user = await UsersDB.findAccess(interaction.user.id);
    if (!user) {
      await interaction.reply({
        components: [onboardingContainer()],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
      return;
    }

    if (config.env === "production" && user.allowData) {
      void EventsDB.record(user.dcid, {
        source: "slash",
        action: "add account",
      });
    }

    if (user.isBanned) {
      await interaction.reply({
        components: [
          errorContainer({
            title: "Banned",
            description: "Please contact support for more information.",
          }),
        ],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
      return;
    }

    const linkedAmount = await AccountsDB.countByDcid(interaction.user.id);
    if (!user.isPremium && linkedAmount >= 3) {
      await interaction.reply({
        components: [maxAccountContainer()],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
      return;
    }

    await interaction.reply({
      components: [addAccountContainer()],
      flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
    });
  },
};
