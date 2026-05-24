import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Locale } from "#/types/locale.ts";

const localeCache = new Map<Locale, unknown>();

export const loadLocale = (lang: Locale): unknown => {
  const cached = localeCache.get(lang);
  if (cached !== undefined) return cached;
  const path = join(import.meta.dirname, "..", "locales", `${lang}.json`);
  const data = JSON.parse(readFileSync(path, "utf8")) as unknown;
  localeCache.set(lang, data);
  return data;
};
