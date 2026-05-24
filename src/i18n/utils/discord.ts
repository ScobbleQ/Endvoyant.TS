import { Locale as DiscordLocale } from "discord.js";
import type { Locale } from "#/types/locale.ts";

const DISCORD_LOCALE_MAP = {
  "de-de": DiscordLocale.German,
  "en-us": DiscordLocale.EnglishUS,
  "es-mx": DiscordLocale.SpanishES,
  "fr-fr": DiscordLocale.French,
  "id-id": DiscordLocale.Indonesian,
  "it-it": DiscordLocale.Italian,
  "ja-jp": DiscordLocale.Japanese,
  "ko-kr": DiscordLocale.Korean,
  "pt-br": DiscordLocale.PortugueseBR,
  "ru-ru": DiscordLocale.Russian,
  "th-th": DiscordLocale.Thai,
  "vi-vn": DiscordLocale.Vietnamese,
  "zh-cn": DiscordLocale.ChineseCN,
  "zh-tw": DiscordLocale.ChineseTW,
} as const satisfies Record<Locale, DiscordLocale>;

export const toDiscordLocale = (locale: Locale): DiscordLocale => {
  return DISCORD_LOCALE_MAP[locale] ?? DiscordLocale.EnglishUS;
};
