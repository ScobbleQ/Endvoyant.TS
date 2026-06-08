import {
  SlashCommandBuilder,
  MessageFlags,
  type ChatInputCommandInteraction,
  type AutocompleteInteraction,
  ContainerBuilder,
} from "discord.js";
import { config } from "#/config.ts";
import { AccountsDB, EventsDB, UsersDB } from "#/drizzle/index.ts";
import { discordLocalization } from "#/i18n/index.ts";
import EndfieldSDK from "#/packages/EndfieldSDK/index.ts";

export default {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName("daily")
    .setNameLocalizations(discordLocalization("command.daily.name"))
    .setDescription("Claim daily in-game rewards")
    .setDescriptionLocalizations(discordLocalization("command.daily.description"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("signin")
        .setNameLocalizations(discordLocalization("command.daily.subcommands.signin.name"))
        .setDescription("Claim daily in-game rewards")
        .setDescriptionLocalizations(
          discordLocalization("command.daily.subcommands.signin.description"),
        )
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
      await interaction.reply({
        content: "Please link an account first using /add account.",
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    if (config.env === "production") {
      void EventsDB.record(user.dcid, {
        source: "slash",
        action: "add account",
      });
    }

    const selectedAccountId = interaction.options.getString("for");
    let accounts = selectedAccountId
      ? [await AccountsDB.findAccount(user.dcid, selectedAccountId)]
      : await AccountsDB.listByDcid(user.dcid);

    if (accounts.length === 0) {
      return;
    }

    await interaction.deferReply();

    const container = new ContainerBuilder().addTextDisplayComponents(
      (txt) => txt.setContent(`## ▼// Manual Signin Summary`),
      (t) => t.setContent(`-# <t:${Math.floor(Date.now() / 1000)}:F>`),
    );

    for (const account of accounts) {
      if (!account) continue; // in case the selected account doesn't exist or something

      const session = await EndfieldSDK.createSkportSession({ accountToken: account.accountToken });
      if (!session) {
        console.error(`Failed to create session for account ${account.id} (${account.nickname})`);
        continue;
      }

      const res = await EndfieldSDK.completeSignIn({
        cred: session.cred,
        token: session.token,
        roleId: account.roleId,
        serverId: account.serverId,
        lang: user.lang,
      });

      if (res.code !== 0) {
        container
          .addSeparatorComponents((s) => s)
          .addTextDisplayComponents(
            (t) => t.setContent(`### ${account.nickname} (${account.roleId})`),
            (t) => t.setContent(res.message || "Failed to signin for unknown reason."),
          );
      } else {
        // Map reward IDs to their info
        const rewards = res.data.awardIds.map((a) => {
          return res.data.resourceInfoMap[a.id]!; // Always present
        });

        const mainReward = rewards[0]!; // Always be at least 1
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
