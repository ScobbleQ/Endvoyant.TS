import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import {
  type AutocompleteInteraction,
  MessageFlags,
  SlashCommandBuilder,
  ContainerBuilder,
  AttachmentBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import { join } from "path";
import { config } from "#/config.ts";
import { AccountsDB, EventsDB, UsersDB, db } from "#/drizzle/index.ts";
import { errorContainer } from "#/globals/components/container.ts";
import { fromDiscordLocale, localizations, t } from "#/i18n/index.ts";
import EndfieldSDK from "#/packages/EndfieldSDK/index.ts";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("profile")
    .setNameLocalizations(localizations("command.profile.name"))
    .setDescription("View your profile")
    .setDescriptionLocalizations(localizations("command.profile.description"))
    .addStringOption((option) =>
      option.setName("for").setDescription("The account to view profile for").setAutocomplete(true),
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
        action: "profile",
      });
    }

    const selectedAccountId = interaction.options.getString("for");
    const account = selectedAccountId
      ? await AccountsDB.findAccount(interaction.user.id, selectedAccountId)
      : await db.query.accounts.findFirst({
          columns: {
            accountToken: true,
            serverId: true,
            roleId: true,
            isPrivate: true,
          },
          where: {
            dcid: user.dcid,
            isPrimary: true,
          },
        });

    if (!account) {
      await interaction.reply({
        components: [errorContainer({ desc: t(user.lang, "error.notLinked") })],
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
        components: [errorContainer({ desc: "Failed to fetch profile data" })],
        flags: [MessageFlags.IsComponentsV2],
      });
      return;
    }

    const base = data.data.detail.base;
    const canvas = createCanvas(600, 200);
    const ctx = canvas.getContext("2d");
    ctx.textRendering = "optimizeLegibility";

    GlobalFonts.registerFromPath(
      join(
        import.meta.dirname,
        "..",
        "..",
        "assets",
        "geist-font",
        "Geist",
        "variable",
        "Geist[wght].ttf",
      ),
    );

    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, "#1a1f2e");
    bg.addColorStop(1, "#0d1117");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.font = '144px "Geist"';
    ctx.fontVariationSettings = '"wght" 900';
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(base.name.toUpperCase(), -20, -25);
    ctx.restore();

    const avatar = await loadImage(base.avatarUrl);
    ctx.drawImage(avatar, 400, -10, 210, 220);

    ctx.font = '40px "Geist"';
    ctx.fontVariationSettings = '"wght" 700';
    ctx.fillStyle = "#ffffff";
    ctx.fillText(base.name, 20, 46);

    ctx.font = '18px "Geist"';
    ctx.fontVariationSettings = '"wght" 400';
    ctx.fillStyle = "#667788";
    ctx.fillText(`${base.serverName}  ·  ${base.roleId}`, 20, 68);
    ctx.fillText(`Authority Lvl ${base.level}  ·  Exploration Lvl ${base.worldLevel}`, 20, 88);

    const stats = [
      { value: base.charNum, label: "Operators" },
      { value: base.weaponNum, label: "Weapons" },
      { value: base.docNum, label: "Files" },
    ];

    const boxY = 124;
    const boxHeight = 56;
    const boxWidth = 110;
    const boxGap = 16;
    const statsStartX = 20;
    const boxPadding = 14;

    for (const [i, stat] of stats.entries()) {
      const x = statsStartX + i * (boxWidth + boxGap);

      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.beginPath();
      ctx.roundRect(x, boxY, boxWidth, boxHeight, 8);
      ctx.fill();

      ctx.font = '28px "Geist"';
      ctx.fontVariationSettings = '"wght" 700';
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.fillText(String(stat.value), x + boxPadding, boxY + 32);

      ctx.font = '12px "Geist"';
      ctx.fontVariationSettings = '"wght" 400';
      ctx.fillStyle = "#667788";
      ctx.fillText(stat.label, x + boxPadding, boxY + 46);
    }

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        (t) => t.setContent(`## ▼// ${base.name} [\`${base.roleId}\`]`),
        (t) => t.setContent(`Awakening Day: <t:${base.createTime}:D>`),
        (t) => t.setContent(`Last Login: <t:${base.lastLoginTime}:R>`),
      )
      .addMediaGalleryComponents((m) =>
        m.addItems((a) => a.setURL(`attachment://${account.roleId}.jpg`)),
      );

    const imgBuffer = await canvas.encode("jpeg");
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
