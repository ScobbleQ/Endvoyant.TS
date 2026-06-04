import { request } from "undici";
import type {
  GryphlineErrorResponse,
  EmailPasswordLoginResponse,
  OAuth2GrantByKind,
  CredentialsFromCodeResponse,
  SkportZonaiErrorResponse,
  PlayerBindingsResponse,
  RefreshAccountTokenResponse,
  ChannelTokenAuthResponse,
  SigninResponse,
} from "./types/auth.ts";
import { type Locale } from "./types/language.ts";
import { toWebLocale } from "./utils/convert.ts";
import { getCookie } from "./utils/getCookie.ts";
import { computeSign } from "./utils/signing.ts";

// as uses msg/status/type
// zonai uses message/code/timestamp

const SKPORT_APPCODES = {
  "6eb76d4e13aa36e6": 0,
  d9f6dbb6bbd6bb33: 0,
  "973bd727dd11cbb6ead8": 0,
  "3dacefa138426cfe": 1,
} as const;

type AppCode = keyof typeof SKPORT_APPCODES;

type OAuth2GrantByAppCode = {
  [K in AppCode]: OAuth2GrantByKind<(typeof SKPORT_APPCODES)[K]>;
};

export class EndfieldSDK {
  private readonly defaultLang: Locale = "en-us";

  constructor(options: { defaultLang?: Locale } = {}) {
    this.defaultLang = options.defaultLang || this.defaultLang;
  }

  /**
   * Authenticate with email and password (Gryphline AS).
   */
  async loginWithEmailPassword(
    email: string,
    password: string,
    options: { lang?: Locale } = {},
  ): Promise<GryphlineErrorResponse | EmailPasswordLoginResponse> {
    const url = "https://as.gryphline.com/user/auth/v1/token_by_email_password";

    try {
      const { body, statusCode, statusText } = await request(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Host: "as.gryphline.com",
          "X-Captcha-Version": "4.0",
          "X-Language": options.lang || this.defaultLang,
        },
        body: JSON.stringify({ email, from: 1, password }),
      });

      if (statusCode !== 200) {
        await body.dump();
        throw new Error(statusText);
      }

      const data = await body.json();
      return data as EmailPasswordLoginResponse;
    } catch (error) {
      throw new Error("INVALID_EMAIL_OR_PASSWORD", { cause: error });
    }
  }

  /**
   * Exchange a channel token for a Gryphline account token (U8).
   */
  async authenticateWithChannelToken({
    channelId,
    channelToken,
  }: {
    channelId: string;
    channelToken: string;
  }): Promise<GryphlineErrorResponse | ChannelTokenAuthResponse> {
    const url = "https://u8.gryphline.com/u8/user/auth/v2/token_by_channel_token";

    try {
      const { body, statusCode, statusText } = await request(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appCode: "973bd727dd11cbb6ead8",
          channelMasterId: channelId,
          channelToken: {
            type: 1,
            isSuc: true,
            code: channelToken,
          },
          platform: 0,
          type: 0,
        }),
      });

      if (statusCode !== 200) {
        await body.dump();
        throw new Error(statusText);
      }

      const data = await body.json();
      return data as ChannelTokenAuthResponse;
    } catch (error) {
      throw new Error("INVALID_CHANNEL_TOKEN", { cause: error });
    }
  }

  async grantOAuth2<T extends AppCode>({
    appCode,
    token,
  }: {
    appCode: T;
    token: string;
  }): Promise<GryphlineErrorResponse | OAuth2GrantByAppCode[T]> {
    const url = "https://as.gryphline.com/user/oauth2/v2/grant";

    try {
      const { body, statusCode, statusText } = await request(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appCode, token, type: SKPORT_APPCODES[appCode] }),
      });

      if (statusCode !== 200) {
        await body.dump();
        throw new Error(statusText);
      }

      const data = await body.json();
      return data as OAuth2GrantByAppCode[T];
    } catch (error) {
      throw new Error("INVALID_OAUTH2_GRANT", { cause: error });
    }
  }

  async createCredentialsFromCode({
    code,
    lang,
  }: {
    code: string;
    lang?: Locale;
  }): Promise<SkportZonaiErrorResponse | CredentialsFromCodeResponse> {
    const url = "https://zonai.skport.com/web/v1/user/auth/generate_cred_by_code";

    try {
      const { body, statusCode, statusText } = await request(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          platform: "3",
          "sk-language": toWebLocale(lang ?? this.defaultLang),
          timestamp: Math.floor(Date.now() / 1000).toString(),
          vName: "1.0.0",
        },
        body: JSON.stringify({
          kind: 1,
          code,
        }),
      });

      if (statusCode !== 200) {
        await body.dump();
        throw new Error(statusText);
      }

      const data = await body.json();
      return data as CredentialsFromCodeResponse;
    } catch (error) {
      throw new Error("INVALID_GENERATED_CREDENTIALS", { cause: error });
    }
  }

  async getAccountToken(
    accountToken: string,
    token: string,
    hgId: string,
  ): Promise<{ code: -1; msg: string } | { code: 0; data: { token: string }; msg: string }> {
    const url = "https://web-api.skport.com/cookie_store/account_token";

    try {
      const { body, statusCode, statusText, headers } = await request(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `ACCOUNT_TOKEN=${accountToken}; SK_OAUTH_CRED_KEY=${token}; HG_INFO_KEY={"hgId":"${hgId}"};`,
          "x-language": "en-us",
        },
        body: JSON.stringify({
          content: accountToken,
        }),
      });

      // 201 Created is expected
      if (statusCode !== 201) {
        await body.dump();
        throw new Error(statusText);
      }

      const data = (await body.json()) as { code: number; msg: string };
      const setCookies = headers["set-cookie"] as string[];

      const newAccountToken = getCookie(setCookies);
      if (!newAccountToken) return { code: -1, msg: "Failed to extract new account token" };

      // imiate the response structure
      return { code: 0, data: { token: newAccountToken }, msg: data.msg || "OK" };
    } catch (error) {
      throw new Error("FAILED_TO_GET_ACCOUNT_TOKEN", { cause: error });
    }
  }

  async refreshAccountToken({
    cred,
    token,
    lang,
  }: {
    cred: string;
    token: string;
    lang?: Locale;
  }): Promise<SkportZonaiErrorResponse | RefreshAccountTokenResponse> {
    const url = "https://zonai.skport.com/web/v1/auth/refresh";
    const ts = Math.floor(Date.now() / 1000).toString();

    try {
      const { body, statusCode, statusText } = await request(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          language: "en-us",
          sign: computeSign({ token, path: "/web/v1/auth/refresh", body: "{}", timestamp: ts }),
          timestamp: ts,
          vCode: "100000018",
          vName: "1.0.0",
          cred,
          platform: "3",
          "sk-language": toWebLocale(lang ?? this.defaultLang),
        },
      });

      if (statusCode !== 200) {
        await body.dump();
        throw new Error(statusText);
      }

      const data = await body.json();
      return data as RefreshAccountTokenResponse;
    } catch (error) {
      throw new Error("TOKEN_REFRESH_FAILED", { cause: error });
    }
  }

  async createSkportSession({ accountToken }: { accountToken: string }) {
    const oauth = await this.grantOAuth2({ appCode: "6eb76d4e13aa36e6", token: accountToken });
    if (oauth.status !== 0) return null;
    const cred = await this.createCredentialsFromCode({ code: oauth.data.code });
    if (cred.code !== 0) return null;
    return { ...oauth.data, ...cred.data };
  }

  async fetchPlayerBindings({
    cred,
    token,
    lang,
  }: {
    cred: string;
    token: string;
    lang?: Locale;
  }): Promise<SkportZonaiErrorResponse | PlayerBindingsResponse> {
    const url = "https://zonai.skport.com/api/v1/game/player/binding?";
    const ts = Math.floor(Date.now() / 1000).toString();

    try {
      const { body, statusCode, statusText } = await request(url, {
        method: "GET",
        headers: {
          cred,
          platform: "3",
          "sk-language": toWebLocale(lang ?? this.defaultLang),
          vName: "1.0.0",
          timestamp: ts,
          sign: computeSign({
            token,
            path: "/api/v1/game/player/binding",
            body: "",
            timestamp: ts,
          }),
        },
      });

      if (statusCode !== 200) {
        await body.dump();
        throw new Error(statusText);
      }

      const data = await body.json();
      return data as PlayerBindingsResponse;
    } catch (error) {
      throw new Error("", { cause: error });
    }
  }

  async completeSignIn({
    cred,
    token,
    roleId,
    serverId,
    lang,
  }: {
    cred: string;
    token: string;
    roleId: string;
    serverId: string;
    lang?: Locale;
  }): Promise<SigninResponse | SkportZonaiErrorResponse> {
    const url = "https://zonai.skport.com/web/v1/game/endfield/attendance";
    const ts = Math.floor(Date.now() / 1000).toString();

    try {
      const { body } = await request(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cred: cred,
          platform: "3",
          "sk-game-role": `3_${roleId}_${serverId}`,
          "sk-language": toWebLocale(lang ?? this.defaultLang),
          vName: "1.0.0",
          timestamp: ts,
          sign: computeSign({
            token: token,
            path: "/web/v1/game/endfield/attendance",
            body: "",
            timestamp: ts,
          }),
        },
      });

      const data = await body.json();
      return data as SigninResponse | SkportZonaiErrorResponse;
    } catch (error) {
      throw new Error("", { cause: error });
    }
  }
}
