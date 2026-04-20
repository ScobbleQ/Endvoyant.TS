import { readFileSync } from "fs";
import { join } from "path";
import type { Locale } from "#/types/locale.js";

type TemplateArgs = Record<string, string | number | boolean>;

const localeCache = new Map<Locale, unknown>();

const LOCALE_TOKEN_RE = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

/**
 * Translate a dotted key for a locale and optionally replace `{{placeholders}}`.
 * @example
 * // locales/en-us.json -> { "test": { "1": "Test 1 {{name}}" } }
 * t(Language.EN_US, "test.1", { name: "BOB" }) // "Test 1 BOB"
 */
export const t = (lang: Locale, key: string, args?: TemplateArgs): unknown => {
  const data = loadLocale(lang);
  const value = getByKey(data, key);
  if (value === null) return null;
  return deepFormat(value, args);
};

/**
 * Load a locale from the filesystem.
 */
const loadLocale = (lang: Locale): unknown => {
  const cached = localeCache.get(lang);
  if (cached !== undefined) return cached;
  const path = join(import.meta.dirname, "locales", `${lang}.json`);
  const data = JSON.parse(readFileSync(path, "utf8")) as unknown;
  localeCache.set(lang, data);
  return data;
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
