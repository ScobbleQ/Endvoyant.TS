import { GlobalFonts } from "@napi-rs/canvas";
import { join } from "path";
import { Language, type Locale } from "#/i18n/index.ts";

const FONT_MAP = {
  NotoSans: "Noto_Sans/NotoSans-VariableFont_wdth,wght.ttf",
  NotoSansJP: "Noto_Sans_JP/NotoSansJP-VariableFont_wght.ttf",
  NotoSansKR: "Noto_Sans_KR/NotoSansKR-VariableFont_wght.ttf",
  NotoSansSC: "Noto_Sans_SC/NotoSansSC-VariableFont_wght.ttf",
  NotoSansTC: "Noto_Sans_TC/NotoSansTC-VariableFont_wght.ttf",
  NotoSansThai: "Noto_Sans_Thai/NotoSansThai-VariableFont_wdth,wght.ttf",
};

export function initFonts() {
  for (const [alias, fileName] of Object.entries(FONT_MAP)) {
    GlobalFonts.registerFromPath(
      join(import.meta.dirname, "..", "assets", "noto-font", fileName),
      alias,
    );
  }
}

export function getFontStack(size: string, userLanguage: Locale) {
  const fallbacks = ['"NotoSans"', '"NotoSansJP"', '"NotoSansKR"', '"NotoSansThai"'];

  // Handle chinese separately
  if (userLanguage === Language.ZH_TW) {
    fallbacks.unshift('"NotoSansTC"');
    fallbacks.push('"NotoSansSC"');
  } else {
    fallbacks.unshift('"NotoSansSC"');
    fallbacks.push('"NotoSansTC"');
  }

  return `${size} ${fallbacks.join(", ")}`;
}
