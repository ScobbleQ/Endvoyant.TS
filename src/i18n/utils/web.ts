import type { Locale, WebLocale } from "../types.ts";
import { Language, WebLanguage } from "../constants.ts";

const WEB_LOCALE_MAP = {
  [Language.ZH_CN]: WebLanguage.ZH_CN,
  [Language.ZH_TW]: WebLanguage.ZH_TW,
  [Language.DE_DE]: WebLanguage.DE_DE,
  [Language.EN_US]: WebLanguage.EN_US,
  [Language.ES_MX]: WebLanguage.ES_MX,
  [Language.FR_FR]: WebLanguage.FR_FR,
  [Language.ID_ID]: WebLanguage.ID_ID,
  [Language.IT_IT]: WebLanguage.IT_IT,
  [Language.JA_JP]: WebLanguage.JA_JP,
  [Language.KO_KR]: WebLanguage.KO_KR,
  [Language.PT_BR]: WebLanguage.PT_BR,
  [Language.RU_RU]: WebLanguage.RU_RU,
  [Language.TH_TH]: WebLanguage.TH_TH,
  [Language.VI_VN]: WebLanguage.VI_VN,
} as const;

export function toWebLocale(locale: Locale): WebLocale {
  return WEB_LOCALE_MAP[locale] ?? WebLanguage.EN_US;
}
