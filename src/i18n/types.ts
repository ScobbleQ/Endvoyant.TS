import { Language, WebLanguage } from "./constants.ts";
import enUS from "./locales/en-us.json" with { type: "json" };

export type Locale = (typeof Language)[keyof typeof Language];
export type WebLocale = (typeof WebLanguage)[keyof typeof WebLanguage];

export type LocaleSchema = typeof enUS;
export type LocaleData = LocaleSchema;

export type TemplateArgs = Record<string, string | number | boolean>;

export type DotPaths<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object ? K | `${K}.${DotPaths<T[K]>}` : K;
    }[keyof T & string]
  : never;

export type TranslationKey = DotPaths<LocaleSchema>;
export type CommandKey = Extract<TranslationKey, `command.${string}`>;

export type PathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? PathValue<T[K], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;
