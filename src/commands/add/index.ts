import { MessageFlags, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { config } from "#/config.ts";
import { AccountsDB, EventsDB, UsersDB } from "#/drizzle/index.ts";
import { dtx, tx } from "#/i18n/index.ts";
import { errorContainer } from "#/ui/container.ts";
import { addAccountContainer } from "./components/addAccount.ts";
import { maxAccountContainer } from "./components/maxAccount.ts";
import { onboardingContainer } from "./components/onboarding.ts";

export default {
  cooldown: 30,
  data: new SlashCommandBuilder()
    .setName("add")
    .setNameLocalizations(dtx("command.add.name"))
    .setDescription("Add an account to your Discord")
    .setDescriptionLocalizations(dtx("command.add.description"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("account")
        .setNameLocalizations(dtx("command.add.subcommands.account.name"))
        .setDescription("Add an account to your Discord")
        .setDescriptionLocalizations(dtx("command.add.subcommands.account.description")),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    const user = await UsersDB.findAccess(interaction.user.id);
    if (!user) {
      await interaction.editReply({
        components: [onboardingContainer()],
        flags: [MessageFlags.IsComponentsV2],
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
      await interaction.editReply({
        components: [errorContainer({ desc: tx(user.lang, "error.isBanned") })],
        flags: [MessageFlags.IsComponentsV2],
      });
      return;
    }

    const linkedAmount = await AccountsDB.countByDcid(interaction.user.id);
    if (!user.isPremium && linkedAmount >= 3) {
      await interaction.editReply({
        components: [maxAccountContainer()],
        flags: [MessageFlags.IsComponentsV2],
      });
      return;
    }

    await interaction.editReply({
      components: [addAccountContainer()],
      flags: [MessageFlags.IsComponentsV2],
    });
  },
};
