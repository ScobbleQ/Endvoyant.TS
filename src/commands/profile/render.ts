import { createCanvas, loadImage } from "@napi-rs/canvas";
import type { CardDetailResponse } from "#/packages/EndfieldSDK/types/auth.ts";
import { tx, type Locale } from "#/i18n/index.ts";
import { getFontStack } from "#/utils/fonts.ts";

export async function renderProfile(
  base: CardDetailResponse["data"]["detail"]["base"],
  lang: Locale,
) {
  const canvas = createCanvas(600, 200);
  const ctx = canvas.getContext("2d");
  ctx.textRendering = "optimizeLegibility";

  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, "#1a1f2e");
  bg.addColorStop(1, "#0d1117");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.font = getFontStack("144px", lang);
  ctx.fontVariationSettings = '"wght" 900';
  ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(base.name.toUpperCase(), -20, -25);
  ctx.restore();

  const avatar = await loadImage(base.avatarUrl);
  ctx.drawImage(avatar, 400, -10, 210, 220);

  ctx.font = getFontStack("40px", lang);
  ctx.fontVariationSettings = '"wght" 700';
  ctx.fillStyle = "#ffffff";
  ctx.fillText(base.name, 20, 46);

  ctx.font = getFontStack("18px", lang);
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

    ctx.font = getFontStack("28px", lang);
    ctx.fontVariationSettings = '"wght" 700';
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.fillText(String(stat.value), x + boxPadding, boxY + 32);

    ctx.font = getFontStack("12px", lang);
    ctx.fontVariationSettings = '"wght" 400';
    ctx.fillStyle = "#667788";
    ctx.fillText(stat.label, x + boxPadding, boxY + 46);
  }

  const imgBuffer = await canvas.encode("jpeg");
  return imgBuffer;
}
