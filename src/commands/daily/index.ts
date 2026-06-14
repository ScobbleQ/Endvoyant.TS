import {
  SlashCommandBuilder,
  MessageFlags,
  type ChatInputCommandInteraction,
  type AutocompleteInteraction,
  ContainerBuilder,
} from "discord.js";
import pQueue from "p-queue";
import { errorContainer } from "#/components/container.ts";
import { config } from "#/config.ts";
import { AccountsDB, EventsDB, UsersDB } from "#/drizzle/index.ts";
import { localizations, t, fromDiscordLocale } from "#/i18n/index.ts";
import EndfieldSDK from "#/packages/EndfieldSDK/index.ts";

export default {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName("daily")
    .setNameLocalizations(localizations("command.daily.name"))
    .setDescription("Claim daily in-game rewards")
    .setDescriptionLocalizations(localizations("command.daily.description"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("signin")
        .setNameLocalizations(localizations("command.daily.subcommands.signin.name"))
        .setDescription("Claim daily in-game rewards")
        .setDescriptionLocalizations(localizations("command.daily.subcommands.signin.description"))
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
        components: [errorContainer({ desc: t(locale, "error.requireSetup") })],
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
    const accounts = selectedAccountId
      ? [await AccountsDB.findAccount(user.dcid, selectedAccountId)]
      : await AccountsDB.listByDcid(user.dcid);

    await interaction.deferReply();

    const queue = new pQueue({ concurrency: 5 });

    const results = await Promise.allSettled(
      accounts
        .filter((a): a is NonNullable<typeof a> => a != null)
        .map((account) =>
          queue.add(async () => {
            const session = await EndfieldSDK.createSkportSession({
              accountToken: account.accountToken,
            });

            if (!session) return null;

            const res = await EndfieldSDK.completeSignIn({
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

    const container = new ContainerBuilder().addTextDisplayComponents(
      (txt) => txt.setContent(`## ▼// Manual Signin Summary`),
      (t) => t.setContent(`-# <t:${Math.floor(Date.now() / 1000)}:F>`),
    );

    for (const result of results) {
      if (result.status !== "fulfilled" || !result.value) continue;
      const { account, res } = result.value;

      if (res.code !== 0) {
        container
          .addSeparatorComponents((s) => s)
          .addTextDisplayComponents(
            (t) => t.setContent(`### ${account.nickname} (${account.roleId})`),
            (t) => t.setContent(res.message || "Failed to signin for unknown reason."),
          );
      } else {
        const rewards = res.data.awardIds.map((a) => res.data.resourceInfoMap[a.id]!);
        const mainReward = rewards[0]!;
        const extraRewards = rewards.slice(1);

        container
          .addSeparatorComponents((s) => s)
          .addSectionComponents((s) =>
            s
              .addTextDisplayComponents(
                (t) => t.setContent(`### ${account.nickname} (${account.roleId})`),
                (t) => t.setContent(`${mainReward.name} x${mainReward.count}`),
              )
              .setThumbnailAccessory((a) =>
                a.setURL(mainReward.icon).setDescription(mainReward.name),
              ),
          );

        if (extraRewards.length > 0) {
          container.addTextDisplayComponents(
            (t) => t.setContent(`Bonus Rewards:`),
            (t) => t.setContent(extraRewards.map((r) => `- ${r.name} x${r.count}`).join("\n")),
          );
        }
      }
    }

    await interaction.editReply({
      components: [container],
      flags: [MessageFlags.IsComponentsV2],
    });
  },
};
