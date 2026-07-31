import {
  ContainerBuilder,
  MessageFlags,
  SlashCommandBuilder,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
} from "discord.js";
import pQueue from "p-queue";
import { config } from "#/config.ts";
import { AccountsDB, EventsDB, UsersDB, db } from "#/drizzle/index.ts";
import { sdk } from "#/globals/sdk.ts";
import { dtx, fromDiscordLocale, tx } from "#/i18n/index.ts";
import { errorContainer } from "#/ui/container.ts";

export default {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName("daily")
    .setNameLocalizations(dtx("command.daily.name"))
    .setDescription("Claim daily in-game rewards")
    .setDescriptionLocalizations(dtx("command.daily.description"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("signin")
        .setNameLocalizations(dtx("command.daily.subcommands.signin.name"))
        .setDescription("Claim daily in-game rewards")
        .setDescriptionLocalizations(dtx("command.daily.subcommands.signin.description"))
        .addStringOption((option) =>
          option.setName("for").setDescription("The account to signin for").setAutocomplete(true),
        ),
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
      const locale = fromDiscordLocale(interaction.locale);
      await interaction.reply({
        components: [errorContainer({ desc: tx(locale, "error.requireSetup") })],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
      return;
    }

    if (config.env === "production" && user.allowData) {
      void EventsDB.record(user.dcid, {
        source: "slash",
        action: "signin",
      });
    }

    const selectedAccountId = interaction.options.getString("for");
    const accounts = await db.query.accounts.findMany({
      columns: {
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
      orderBy: {
        isPrimary: "desc",
        shortId: "asc",
      },
    });

    if (accounts.length === 0) {
      await interaction.reply({
        components: [errorContainer({ desc: tx(user.lang, "error.notLinked") })],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
      return;
    }

    await interaction.deferReply();

    const queue = new pQueue({ concurrency: 5 });

    const results = await Promise.allSettled(
      accounts
        .filter((a): a is NonNullable<typeof a> => a != null)
        .map((account) =>
          queue.add(async () => {
            const session = await sdk.credentials.createSession({
              accountToken: account.accountToken,
            });

            if (!session) return null;

            const res = await sdk.attendance.signIn({
              cred: session.cred,
              token: session.token,
              roleId: account.roleId,
              serverId: account.serverId,
              lang: user.lang,
            });

            return { account, res };
          }),
        ),
    );

    const container = new ContainerBuilder();
    let hasContent = false;

    for (const result of results) {
      if (!result || result.status !== "fulfilled" || !result.value) continue;

      const { account, res } = result.value;

      if (hasContent) {
        container.addSeparatorComponents((s) => s);
      }

      if (res.code !== 0) {
        container.addTextDisplayComponents(
          (t) => t.setContent(`### ${account.nickname} (${account.roleId})`),
          (t) => t.setContent(res.message || "Failed to signin for unknown reason."),
        );

        hasContent = true;
        continue;
      }

      const rewards = res.data.awardIds.map(({ id }) => res.data.resourceInfoMap[id]!);
      const [mainReward, ...extraRewards] = rewards;

      if (!mainReward) {
        container.addTextDisplayComponents(
          (t) => t.setContent(`### ${account.nickname} (${account.roleId})`),
          (t) => t.setContent("No rewards received."),
        );

        hasContent = true;
        continue;
      }

      const rewardText =
        extraRewards.length === 0
          ? `${mainReward.name} x${mainReward.count}`
          : rewards.map((reward) => `- ${reward.name} x${reward.count}`).join("\n");

      container.addSectionComponents((s) =>
        s
          .addTextDisplayComponents(
            (t) => t.setContent(`### ${account.nickname} (${account.roleId})`),
            (t) => t.setContent(rewardText),
          )
          .setThumbnailAccessory((a) => a.setURL(mainReward.icon).setDescription(mainReward.name)),
      );

      hasContent = true;
    }

    await interaction.editReply({
      components: [container],
      flags: [MessageFlags.IsComponentsV2],
    });
  },
};
