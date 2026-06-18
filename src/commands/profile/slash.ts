import {
  type AutocompleteInteraction,
  MessageFlags,
  SlashCommandBuilder,
  ContainerBuilder,
  AttachmentBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import { config } from "#/config.ts";
import { AccountsDB, EventsDB, UsersDB, db } from "#/drizzle/index.ts";
import { fromDiscordLocale, dtx, tx } from "#/i18n/index.ts";
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
    .addUserOption((option) =>
      option
        .setName("user")
        .setNameLocalizations(dtx("command.profile.user.name"))
        .setDescription("User to view (defaults to you)")
        .setDescriptionLocalizations(dtx("command.profile.user.description")),
    )
    .addStringOption((option) =>
      option
        .setName("account")
        .setNameLocalizations(dtx("command.profile.account.name"))
        .setDescription("Account to view (defaults to primary)")
        .setDescriptionLocalizations(dtx("command.profile.account.description"))
        .setAutocomplete(true),
    ),
  autocomplete: async (interaction: AutocompleteInteraction) => {
    const target = interaction.options.get("user");
    const targetDcid = target ? (target.value as string) : interaction.user.id;
    const accounts = await AccountsDB.listByDcid(targetDcid);

    if (accounts.length === 0) {
      const locale = fromDiscordLocale(interaction.locale);
      await interaction.respond([{ name: tx(locale, "error.noAccounts"), value: "NO_ACCOUNTS" }]);
      return;
    }

    const isOwnProfile = targetDcid === interaction.user.id;
    const visibleAccounts = isOwnProfile
      ? accounts
      : accounts.filter((account) => !account.isPrivate);

    if (visibleAccounts.length === 0) {
      const locale = fromDiscordLocale(interaction.locale);
      await interaction.respond([{ name: tx(locale, "error.privateAccounts"), value: "PRIVATE" }]);
      return;
    }

    const focusedValue = interaction.options.getFocused();
    const choices = visibleAccounts.map((account) => ({
      name: `${account.nickname} (${account.roleId})`,
      value: account.id,
    }));

    const filtered = choices
      .filter((choice) => choice.name.toLowerCase().includes(focusedValue.toLowerCase()))
      .slice(0, 25);

    await interaction.respond(filtered);
  },
  execute: async (interaction: ChatInputCommandInteraction) => {
    const target = interaction.options.getUser("user");
    const selectedAccountId = interaction.options.getString("account");

    const targetDcid = target?.id ?? interaction.user.id;
    const isOwnProfile = targetDcid === interaction.user.id;

    const viewer = await UsersDB.findAccess(interaction.user.id);
    const lang = viewer?.lang || fromDiscordLocale(interaction.locale) || "en-us";

    if (selectedAccountId === "NO_ACCOUNTS") {
      await interaction.reply({
        components: [errorContainer({ desc: tx(lang, "error.noAccounts") })],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
      return;
    }

    if (selectedAccountId === "PRIVATE") {
      await interaction.reply({
        components: [errorContainer({ desc: tx(lang, "error.privateAccounts") })],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
      return;
    }

    if (isOwnProfile && !viewer) {
      await interaction.reply({
        components: [errorContainer({ desc: tx(lang, "error.requireSetup") })],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
      return;
    }

    if (config.env === "production" && viewer?.allowData) {
      void EventsDB.record(viewer.dcid, {
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
        dcid: targetDcid,
        isPrimary: selectedAccountId ? undefined : true,
        id: selectedAccountId ?? undefined,
      },
    });

    if (!account) {
      await interaction.reply({
        components: [
          errorContainer({
            desc: tx(lang, isOwnProfile ? "error.notLinked" : "error.notLinked"),
          }),
        ],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
      return;
    }

    if (!isOwnProfile && account.isPrivate) {
      await interaction.reply({
        components: [errorContainer({ desc: tx(lang, "error.privateAccount") })],
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
      lang,
    });

    if (data.code !== 0) {
      await interaction.editReply({
        components: [errorContainer({ desc: tx(lang, "error.fetchFailed") })],
        flags: [MessageFlags.IsComponentsV2],
      });
      return;
    }

    const base = data.data.detail.base;
    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        (t) => t.setContent(`## ▼// ${base.name} [\`${base.roleId}\`]`),
        (t) =>
          t.setContent(`${tx(lang, "command.profile.ui.awakeningDay")}: <t:${base.createTime}:D>`),
        (t) =>
          t.setContent(`${tx(lang, "command.profile.ui.lastLogin")}: <t:${base.lastLoginTime}:R>`),
      )
      .addMediaGalleryComponents((m) =>
        m.addItems((a) => a.setURL(`attachment://${account.roleId}.jpg`)),
      );

    const imgBuffer = await renderProfile(data.data.detail.base, lang);
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
