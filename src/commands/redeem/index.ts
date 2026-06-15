import {
  type AutocompleteInteraction,
  SlashCommandBuilder,
  ContainerBuilder,
  type ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { and, eq } from "drizzle-orm";
import { UsersDB, db, AccountsDB } from "#/drizzle/index.ts";
import { efAttemptedCodes, efCodes } from "#/drizzle/schema.ts";
import { errorContainer } from "#/globals/components/container.ts";
import { localizations, t, fromDiscordLocale } from "#/i18n/index.ts";
import EndfieldSDK from "#/packages/EndfieldSDK/index.ts";

export default {
  cooldown: 30,
  data: new SlashCommandBuilder()
    .setName("redeem")
    .setNameLocalizations(localizations("command.redeem.name"))
    .setDescription("Redeem a reward code")
    .setDescriptionLocalizations(localizations("command.redeem.description"))
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
    const locale = fromDiscordLocale(interaction.locale);
    const user = await UsersDB.findAccess(interaction.user.id);

    if (!user) {
      await interaction.reply({
        components: [errorContainer({ desc: t(locale, "error.requireSetup") })],
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
        id: selectedAccountId ? selectedAccountId : undefined,
      },
    });

    if (accounts.length === 0) {
      await interaction.reply({
        components: [errorContainer({ desc: t(user.lang, "error.notLinked") })],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
      return;
    }

    const codes: string[] = [];
    const inputCode = interaction.options.getString("code")?.trim();
    if (inputCode) {
      if (inputCode.length < 6 || inputCode.length > 16) {
        await interaction.reply({
          components: [errorContainer({ desc: t(locale, "error.invalidCode") })],
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
        });
        return;
      }

      codes.push(inputCode);
    } else {
      const dbCodes = await db.query.efCodes.findMany({
        columns: {
          code: true,
          rewards: true,
        },
        where: {
          isActive: true,
        },
      });

      for (const dbCode of dbCodes) {
        codes.push(dbCode.code);
      }
    }

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

      const seen = new Set(pastRedemptions.map((r) => r.code));

      const toRedeem = [
        ...pastRedemptions
          .filter((r) => r.status === -1 && codes.includes(r.code))
          .map((r) => r.code),
        ...codes.filter((c) => !seen.has(c)),
      ];

      if (toRedeem.length === 0) {
        container.addTextDisplayComponents((t) =>
          t.setContent("No new codes to redeem for this account."),
        );
        continue;
      }

      const oauth = await EndfieldSDK.grantOAuth2({
        appCode: "d9f6dbb6bbd6bb33",
        token: account.accountToken,
      });

      if (oauth.status !== 0) continue;

      const channelToken = await EndfieldSDK.authenticateWithChannelToken({
        channelId: account.channelId,
        channelToken: oauth.data.code,
      });

      if (channelToken.status !== 0) continue;

      for (const code of toRedeem) {
        const res = await EndfieldSDK.redeemCode({
          code,
          channelId: account.channelId,
          serverId: account.serverId,
          token: channelToken.data.token,
        });

        if (res.code === 0) {
          container.addTextDisplayComponents((t) =>
            t.setContent(`- ${code}\nCode redeemed successfully!`),
          );
        } else {
          container.addTextDisplayComponents((t) => t.setContent(`- ${code}\n${res.msg}`));

          // Inactive code
          if (res.code === 11004) {
            await db.update(efCodes).set({ isActive: false }).where(eq(efCodes.code, code));
          }

          // Already redeemed
          if (res.code === 11005) {
            await db
              .update(efAttemptedCodes)
              .set({ status: 0 })
              .where(and(eq(efAttemptedCodes.aid, account.id), eq(efAttemptedCodes.code, code)));
          }
        }

        await db
          .insert(efAttemptedCodes)
          .values({
            aid: account.id,
            code,
            status: res.code === 0 ? 0 : -1,
          })
          .onConflictDoUpdate({
            target: [efAttemptedCodes.aid, efAttemptedCodes.code],
            set: {
              status: res.code === 0 ? 0 : -1,
            },
          });
      }
    }

    await interaction.editReply({
      components: [container],
      flags: [MessageFlags.IsComponentsV2],
    });
  },
};
