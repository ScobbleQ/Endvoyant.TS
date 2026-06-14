import { Locale as DiscordLocale } from "discord.js";
import { Language } from "../constants.ts";
import type { Locale } from "../types.ts";

const DISCORD_LOCALE_MAP = {
  [Language.DE_DE]: DiscordLocale.German,
  [Language.EN_US]: DiscordLocale.EnglishUS,
  [Language.ES_MX]: DiscordLocale.SpanishES,
  [Language.FR_FR]: DiscordLocale.French,
  [Language.ID_ID]: DiscordLocale.Indonesian,
  [Language.IT_IT]: DiscordLocale.Italian,
  [Language.JA_JP]: DiscordLocale.Japanese,
  [Language.KO_KR]: DiscordLocale.Korean,
  [Language.PT_BR]: DiscordLocale.PortugueseBR,
  [Language.RU_RU]: DiscordLocale.Russian,
  [Language.TH_TH]: DiscordLocale.Thai,
  [Language.VI_VN]: DiscordLocale.Vietnamese,
  [Language.ZH_CN]: DiscordLocale.ChineseCN,
  [Language.ZH_TW]: DiscordLocale.ChineseTW,
} as const;

export const toDiscordLocale = (locale: Locale): DiscordLocale => {
  return DISCORD_LOCALE_MAP[locale] ?? DiscordLocale.EnglishUS;
};
