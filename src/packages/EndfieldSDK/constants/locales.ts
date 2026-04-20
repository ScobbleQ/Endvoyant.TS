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

export type Locale = (typeof Language)[keyof typeof Language];
