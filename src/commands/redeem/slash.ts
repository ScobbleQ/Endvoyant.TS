import {
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  ContainerBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { AccountsDB, UsersDB, db } from "#/drizzle/index.ts";
import { errorContainer } from "#/globals/ui/container.ts";
import { dtx, fromDiscordLocale, tx } from "#/i18n/index.ts";
import { createRedemptionSession, redeemCode } from "#/services/redeem.ts";

export default {
  cooldown: 30,
  data: new SlashCommandBuilder()
    .setName("redeem")
    .setNameLocalizations(dtx("command.redeem.name"))
    .setDescription("Redeem a reward code")
    .setDescriptionLocalizations(dtx("command.redeem.description"))
    .addStringOption((option) =>
      option
        .setName("code")
        .setDescription("The reward code to redeem")
        .setMinLength(6)
        .setMaxLength(16),
    )
    .addStringOption((option) =>
      option.setName("for").setDescription("The account to redeem for").setAutocomplete(true),
    ),
  autocomplete: async (interaction: AutocompleteInteraction) => {
    const accounts = await AccountsDB.listByDcid(interaction.user.id);

    const focusedValue = interaction.options.getFocused();
    const choices = accounts.map((account) => ({
      name: `${account.nickname} (${account.roleId})`,
      value: account.accountKey,
    }));

    const filtered = choices
      .filter((choice) => choice.name.toLowerCase().includes(focusedValue.toLowerCase()))
      .slice(0, 25);

    await interaction.respond(filtered);
  },
  execute: async (interaction: ChatInputCommandInteraction) => {
    const locale = fromDiscordLocale(interaction.locale);
    const user = await UsersDB.findAccess(interaction.user.id);

    if (!user) {
      await interaction.reply({
        components: [errorContainer({ desc: tx(locale, "error.requireSetup") })],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
      return;
    }

    const selectedAccountId = interaction.options.getString("for");
    const accounts = await db.query.accounts.findMany({
      columns: {
        id: true,
        nickname: true,
        roleId: true,
        accountToken: true,
        channelId: true,
        serverId: true,
      },
      where: {
        dcid: user.dcid,
        accountKey: selectedAccountId ? selectedAccountId : undefined,
      },
      orderBy: { isPrimary: "desc", addedOn: "asc" },
    });

    if (accounts.length === 0) {
      await interaction.reply({
        components: [errorContainer({ desc: tx(user.lang, "error.notLinked") })],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
      return;
    }

    const codes: string[] = [];
    const inputCode = interaction.options.getString("code");
    if (inputCode) {
      codes.push(inputCode.trim());
    } else {
      const dbCodes = await db.query.efCodes.findMany({
        columns: { code: true },
        where: { isActive: true },
      });

      for (const dbCode of dbCodes) {
        codes.push(dbCode.code);
      }
    }

    await interaction.deferReply();

    const container = new ContainerBuilder();
    let hasContent = false;

    for (const account of accounts) {
      if (!account) continue;

      if (hasContent) {
        container.addSeparatorComponents((s) => s);
      }

      container.addTextDisplayComponents((t) =>
        t.setContent(`### ${account.nickname} (${account.roleId})`),
      );

      hasContent = true;

      const pastRedemptions = await db.query.efAttemptedCodes.findMany({
        columns: { code: true, status: true },
        where: { aid: account.id },
      });

      const codeSet = new Set(codes);
      const seen = new Set(pastRedemptions.map((r) => r.code));

      const toRedeem = [
        ...pastRedemptions.filter((r) => r.status === -1 && codeSet.has(r.code)).map((r) => r.code),
        ...codes.filter((code) => !seen.has(code)),
      ];

      if (toRedeem.length === 0) {
        container.addTextDisplayComponents((t) =>
          t.setContent("No new codes to redeem for this account."),
        );
        continue;
      }

      const token = await createRedemptionSession(account);
      if (!token) continue;

      for (const code of toRedeem) {
        const res = await redeemCode(user, account, code, token, "slash");

        if (res.code === 0) {
          container.addTextDisplayComponents((t) =>
            t.setContent(`${code}\n⤷ Code redeemed successfully!`),
          );
        } else {
          container.addTextDisplayComponents((t) => t.setContent(`${code}\n⤷ ${res.msg}`));
        }
      }
    }

    await interaction.editReply({
      components: [container],
      flags: [MessageFlags.IsComponentsV2],
    });
  },
};
