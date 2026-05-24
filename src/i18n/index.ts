import type { LocalizationMap } from "discord.js";
import { Language, type Locale } from "#/types/locale.ts";
import { toDiscordLocale } from "./utils/discord.ts";
import { loadLocale } from "./utils/load.ts";

type TemplateArgs = Record<string, string | number | boolean>;

const LOCALE_TOKEN_RE = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

/**
 * Translate a dotted key for a locale and optionally replace `{{placeholders}}`.
 * @example
 * // locales/en-us.tson -> { "test": { "1": "Test 1 {{name}}" } }
 * t(Language.EN_US, "test.1", { name: "BOB" }) // "Test 1 BOB"
 */
export const t = (lang: Locale, key: string, args?: TemplateArgs): unknown => {
  const data = loadLocale(lang);
  const value = getByKey(data, key);
  if (value === null) return null;
  return deepFormat(value, args);
};

/**
 * Returns an object containing localized versions of the given key for all supported languages.
 * @example
 * // locales/en-us.tson -> { "test": "Test" }
 * // locales/zh-cn.tson -> { "test": "测试" }
 * discordLocalization("test") // { "en-US": "Test", "zh-CN": "测试" }
 */
export const discordLocalization = (key: string, args?: TemplateArgs): LocalizationMap => {
  const out: LocalizationMap = {};
  for (const lang of Object.values(Language)) {
    const value = t(lang, key, args);
    if (typeof value !== "string" || !value) continue;
    out[toDiscordLocale(lang)] = value;
  }
  return out;
};

/**
 * Get a value from a nested object by key.
 */
const getByKey = (root: unknown, key: string): unknown => {
  const parts = key.split(".");
  let current: unknown = root;
  for (const part of parts) {
    if (current === null || typeof current !== "object") return null;
    if (!(part in current)) return null;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
};

/**
 * Format strings (and nested objects/arrays containing strings) with placeholders.
 */
const deepFormat = (value: unknown, args?: TemplateArgs): unknown => {
  if (typeof value === "string") {
    if (!args) return value;
    return value.replace(LOCALE_TOKEN_RE, (match: string, key: string) => {
      const replacement = args[key];
      return replacement === undefined ? match : String(replacement);
    });
  }

  if (Array.isArray(value)) return value.map((v) => deepFormat(v, args));
  if (!value || typeof value !== "object") return value;

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) out[k] = deepFormat(v, args);
  return out;
};
