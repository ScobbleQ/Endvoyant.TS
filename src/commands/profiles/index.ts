import { createCanvas, loadImage } from "@napi-rs/canvas";
import {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  type ContextMenuCommandInteraction,
  AttachmentBuilder,
} from "discord.js";
import { UsersDB, db } from "#/drizzle/index.ts";
import { fromDiscordLocale, tx } from "#/i18n/index.ts";
import EndfieldSDK from "#/packages/EndfieldSDK/index.ts";

export default {
  cooldown: 60,
  data: new ContextMenuCommandBuilder().setName("Profile").setType(ApplicationCommandType.User),
  execute: async (interaction: ContextMenuCommandInteraction) => {
    const viewer = await UsersDB.findAccess(interaction.user.id);
    const lang = viewer?.lang || fromDiscordLocale(interaction.locale) || "en-us";

    const account = await db.query.accounts.findFirst({
      columns: {
        accountToken: true,
        serverId: true,
        roleId: true,
        isPrivate: true,
      },
      where: {
        dcid: interaction.targetId,
        isPrimary: true,
      },
    });

    if (!account) {
      return;
    }

    if (interaction.user.id !== interaction.targetId) {
      if (account.isPrivate) {
        return;
      }
    }

    await interaction.deferReply();

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
      return;
    }

    const base = data.data.detail.base;
    const canvas = createCanvas(600, 200);
    const ctx = canvas.getContext("2d");
    ctx.textRendering = "optimizeLegibility";

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
      { value: base.charNum, label: tx(lang, "command.profile.ui.operators") },
      { value: base.weaponNum, label: tx(lang, "command.profile.ui.weapons") },
      { value: base.docNum, label: tx(lang, "command.profile.ui.files") },
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

    const imgBuffer = await canvas.encode("jpeg");
    const attachment = new AttachmentBuilder(imgBuffer, {
      name: `${account.roleId}.jpg`,
    });

    await interaction.editReply({ files: [attachment] });
  },
};
