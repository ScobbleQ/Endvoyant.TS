import type { LocalizationMap } from "discord.js";
import { Language } from "../constants.ts";
import type {
  Locale,
  LocaleData,
  LocaleSchema,
  TemplateArgs,
  CommandKey,
  TranslationKey,
  PathValue,
} from "../types.ts";
import { toDiscordLocale } from "./discord.ts";
import { loadLocale } from "./load.ts";

const LOCALE_TOKEN_RE = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

/**
 * Translate a dotted key for a locale and optionally replace `{{placeholders}}`.
 * @example
 * // locales/en-us.json -> { "test": { "1": "Test 1 {{name}}" } }
 * t(Language.EN_US, "test.1", { name: "BOB" }) // "Test 1 BOB"
 */
export function t<K extends TranslationKey>(
  lang: Locale,
  key: K,
  args?: TemplateArgs,
): PathValue<LocaleSchema, K> {
  const data = loadLocale(lang) as LocaleData;
  const value = getByKey(data, key);

  if (value === null) {
    throw new Error(`Missing translation key '${key}' for locale '${lang}'`);
  }

  return deepFormat(value, args) as PathValue<LocaleSchema, K>;
}

/**
 * Returns a Discord LocalizationMap for the given command key across all supported languages.
 * Restricted to command.* paths only.
 * @example
 * localizations("command.about.name") // { "en-US": "about", "zh-CN": "关于", ... }
 */
export function localizations<K extends CommandKey>(key: K, args?: TemplateArgs): LocalizationMap {
  const out: LocalizationMap = {};
  for (const lang of Object.values(Language)) {
    const value = t(lang, key, args);
    if (typeof value !== "string" || !value) continue;
    out[toDiscordLocale(lang)] = value;
  }
  return out;
}

const getByKey = <K extends TranslationKey>(
  root: LocaleData,
  key: K,
): PathValue<LocaleSchema, K> | null => {
  const parts = key.split(".");
  let current: unknown = root;

  for (const part of parts) {
    if (current === null || typeof current !== "object") return null;
    if (!(part in current)) return null;
    current = (current as Record<string, unknown>)[part];
  }

  return current as PathValue<LocaleSchema, K>;
};

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
