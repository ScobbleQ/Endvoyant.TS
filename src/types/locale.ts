export const Language = {
  DE_DE: "de-de",
  EN_US: "en-us",
  ES_MX: "es-mx",
  FR_FR: "fr-fr",
  ID_ID: "id-id",
  IT_IT: "it-it",
  JA_JP: "ja-jp",
  KO_KR: "ko-kr",
  PT_BR: "pt-br",
  RU_RU: "ru-ru",
  TH_TH: "th-th",
  VI_VN: "vi-vn",
  ZH_CN: "zh-cn",
  ZH_TW: "zh-tw",
} as const;

export const WebLanguage = {
  ZH_CN: "zh_Hans",
  ZH_TW: "zh_Hant",
  DE_DE: "de_DE",
  EN_US: "en",
  ES_MX: "es_MX",
  FR_FR: "fr_FR",
  ID_ID: "id_ID",
  IT_IT: "it_IT",
  JA_JP: "ja",
  KO_KR: "ko",
  PT_BR: "pt_BR",
  RU_RU: "ru_RU",
  TH_TH: "th_TH",
  VI_VN: "vi_VN",
} as const;

export type Locale = (typeof Language)[keyof typeof Language];
export type WebLocale = (typeof WebLanguage)[keyof typeof WebLanguage];
