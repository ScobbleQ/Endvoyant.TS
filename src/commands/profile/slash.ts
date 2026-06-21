import {
  AttachmentBuilder,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  ContainerBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { config } from "#/config.ts";
import { AccountsDB, EventsDB, UsersDB, db } from "#/drizzle/index.ts";
import { dtx, fromDiscordLocale, tx } from "#/i18n/index.ts";
import EndfieldSDK from "#/packages/EndfieldSDK/index.ts";
import { errorContainer } from "#/ui/container.ts";
import { renderProfile } from "./render.ts";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("profile")
    .setNameLocalizations(dtx("command.profile.name"))
    .setDescription("View a player's profile")
    .setDescriptionLocalizations(dtx("command.profile.description"))
    .addStringOption((option) =>
      option
        .setName("account")
        .setNameLocalizations(dtx("command.profile.account.name"))
        .setDescription("Account to view (defaults to primary)")
        .setDescriptionLocalizations(dtx("command.profile.account.description"))
        .setAutocomplete(true),
    ),
  autocomplete: async (interaction: AutocompleteInteraction) => {
    const accounts = await AccountsDB.listByDcid(interaction.user.id);

    if (accounts.length === 0) {
      const locale = fromDiscordLocale(interaction.locale);
      await interaction.respond([{ name: tx(locale, "error.noAccounts"), value: "NO_ACCOUNTS" }]);
      return;
    }

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
      await interaction.editReply({
        components: [errorContainer({ desc: tx(locale, "error.requireSetup") })],
        flags: [MessageFlags.IsComponentsV2],
      });
      return;
    }

    const selectedAccountId = interaction.options.getString("account");
    if (selectedAccountId === "NO_ACCOUNTS") {
      await interaction.reply({
        components: [errorContainer({ desc: tx(user.lang, "error.noAccounts") })],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
      return;
    }

    if (config.env === "production" && user.allowData) {
      void EventsDB.record(user.dcid, {
        source: "slash",
        action: "profile",
      });
    }

    const account = await db.query.accounts.findFirst({
      columns: {
        accountToken: true,
        serverId: true,
        roleId: true,
        isPrivate: true,
      },
      where: {
        dcid: interaction.user.id,
        isPrimary: selectedAccountId ? undefined : true,
        id: selectedAccountId ?? undefined,
      },
    });

    if (!account) {
      await interaction.reply({
        components: [errorContainer({ desc: tx(user.lang, "error.notLinked") })],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
      return;
    }

    await interaction.deferReply({ flags: account.isPrivate ? [MessageFlags.Ephemeral] : [] });

    const session = await EndfieldSDK.createSkportSession({ accountToken: account.accountToken });
    if (!session) return;

    const data = await EndfieldSDK.fetchCardDetail({
      cred: session.cred,
      token: session.token,
      serverId: account.serverId,
      roleId: account.roleId,
      lang: user.lang,
    });

    if (data.code !== 0) {
      await interaction.editReply({
        components: [errorContainer({ desc: tx(user.lang, "error.fetchFailed") })],
        flags: [MessageFlags.IsComponentsV2],
      });
      return;
    }

    const base = data.data.detail.base;
    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        (t) => t.setContent(`## ▼// ${base.name} [\`${base.roleId}\`]`),
        (t) =>
          t.setContent(
            `${tx(user.lang, "command.profile.ui.awakeningDay")}: <t:${base.createTime}:D>`,
          ),
        (t) =>
          t.setContent(
            `${tx(user.lang, "command.profile.ui.lastLogin")}: <t:${base.lastLoginTime}:R>`,
          ),
      )
      .addMediaGalleryComponents((m) =>
        m.addItems((a) => a.setURL(`attachment://${account.roleId}.jpg`)),
      );

    const imgBuffer = await renderProfile(data.data.detail.base, user.lang);
    const attachment = new AttachmentBuilder(imgBuffer, {
      name: `${account.roleId}.jpg`,
    });

    await interaction.editReply({
      components: [container],
      files: [attachment],
      flags: [MessageFlags.IsComponentsV2],
    });
  },
};
