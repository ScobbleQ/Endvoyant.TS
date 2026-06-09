import {
  type AutocompleteInteraction,
  SlashCommandBuilder,
  ContainerBuilder,
  type ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { UsersDB, db, AccountsDB } from "#/drizzle/index.ts";
import { discordLocalization } from "#/i18n/index.ts";

export default {
  cooldown: 30,
  data: new SlashCommandBuilder()
    .setName("redeem")
    .setNameLocalizations(discordLocalization("command.redeem.name"))
    .setDescription("Redeem a reward code")
    .setDescriptionLocalizations(discordLocalization("command.redeem.description"))
    .addStringOption((option) => option.setName("code").setDescription("The reward code to redeem"))
    .addStringOption((option) =>
      option.setName("for").setDescription("The account to redeem for").setAutocomplete(true),
    ),
  autocomplete: async (interaction: AutocompleteInteraction) => {
    const accounts = await AccountsDB.listByDcid(interaction.user.id);

    const focusedValue = interaction.options.getFocused();
    const choices = accounts.map((account) => ({
      name: `${account.nickname} (${account.roleId})`,
      value: account.id,
    }));

    const filtered = choices
      .filter((choice) => choice.name.toLowerCase().includes(focusedValue.toLowerCase()))
      .slice(0, 25);

    await interaction.respond(filtered);
  },
  execute: async (interaction: ChatInputCommandInteraction) => {
    const user = await UsersDB.findAccess(interaction.user.id);
    if (!user) {
      await interaction.followUp("Please link an account first using /add account.");
      return;
    }

    const codes = [];
    const inputCode = interaction.options.getString("code");
    if (inputCode) {
      codes.push(inputCode);
    } else {
      const dbCodes = await db.query.efCodes.findMany({
        columns: {
          code: true,
          rewards: true,
        },
      });

      for (const dbCode of dbCodes) {
        codes.push(dbCode.code);
      }
    }

    const selectedAccountId = interaction.options.getString("for");
    const accounts = selectedAccountId
      ? [await AccountsDB.findAccount(user.dcid, selectedAccountId)]
      : await AccountsDB.listByDcid(user.dcid);

    await interaction.deferReply();

    const container = new ContainerBuilder().addTextDisplayComponents(
      (t) => t.setContent("Header"),
      (t) => t.setContent("Description"),
    );

    for (const account of accounts) {
      if (!account) continue;
      container.addSeparatorComponents((s) => s);
      container.addTextDisplayComponents((t) =>
        t.setContent(`### ${account.nickname} (${account.roleId})`),
      );

      const pastRedemptions = await db.query.efAttemptedCodes.findMany({
        columns: {
          code: true,
          status: true,
        },
        where: {
          aid: account.id,
        },
      });

      // Sets for faster lookups
      const activeCodes = new Set(codes);
      const seen = new Set(pastRedemptions.map((r) => r.code));

      const toRedeem = [
        // Failed codes from previous attempts that are still active
        ...pastRedemptions
          .filter((r) => r.status === -1 && activeCodes.has(r.code))
          .map((r) => r.code),
        // New codes that haven't been attempted
        ...codes.filter((c) => !seen.has(c)),
      ];

      for (const code of toRedeem) {
        // TODO: Add redeem logic here

        container.addTextDisplayComponents((t) => t.setContent(`- ${code}`));
      }
    }

    await interaction.editReply({
      components: [container],
      flags: [MessageFlags.IsComponentsV2],
    });
  },
};
