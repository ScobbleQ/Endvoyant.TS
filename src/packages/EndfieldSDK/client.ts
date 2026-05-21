import { Cache } from "./cache.ts";
import type {
  ErrorResponse,
  TokenByEmailPasswordResponse,
  OAuth2GrantResponse,
} from "./types/auth.ts";
import type { Language } from "./types/language.ts";

// as uses msg/status/type
// zonai uses message/code/timestamp

export class EndfieldSDK {
  private readonly tokenByEmailPasswordCache: Cache<Promise<TokenByEmailPasswordResponse>>;
  private readonly oauthCache: Cache<Promise<OAuth2GrantResponse>>;
  private lang: Language = "en-us";

  constructor(options: { lang?: Language } = {}) {
    this.lang = options.lang || this.lang;
    this.tokenByEmailPasswordCache = new Cache(5 * 60 * 1000); // 5 minutes
    this.oauthCache = new Cache(5 * 60 * 1000); // 5 minutes
  }

  setLanguage(lang: Language) {
    this.lang = lang;
  }

  clear() {
    this.oauthCache.clear();
  }

  /**
   * Get token via email and password
   */
  async tokenByEmailPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<ErrorResponse | TokenByEmailPasswordResponse> {
    const url = "https://as.gryphline.com/user/auth/v1/token_by_email_password";
    const body = JSON.stringify({ email, from: 1, password });
    const headers: RequestInit["headers"] = {
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Type": "application/json",
      Host: "as.gryphline.com",
      "User-Agent": "skport-ios/100000018 CFNetwork/3860.300.31 Darwin/25.2.0",
      "X-Captcha-Version": "4.0",
      "X-Language": this.lang,
    };

    try {
      return this.tokenByEmailPasswordCache.getOrSet(email, async () => {
        const res = await fetch(url, {
          method: "POST",
          headers,
          body,
        });

        if (!res.ok) {
          throw new Error(res.statusText);
        }

        const data = await res.json();
        return data as TokenByEmailPasswordResponse;
      });
    } catch (error) {
      throw new Error("INVALID_EMAIL_OR_PASSWORD", { cause: error });
    }
  }

  /**
   * Get token via channel token
   */
  async tokenByChannelToken({
    channelId,
    channelToken,
  }: {
    channelId: string;
    channelToken: string;
  }) {
    const url = "https://u8.gryphline.com/u8/user/auth/v2/token_by_channel_token";
    const body = JSON.stringify({
      appCode: "973bd727dd11cbb6ead8",
      channelMasterId: channelId,
      channelToken: {
        type: 1,
        isSuc: true,
        code: channelToken,
      },
      platform: 0,
      type: 0,
    });
    const headers: RequestInit["headers"] = {
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Type": "application/json",
      Host: "u8.gryphline.com",
      "User-Agent": "Endfield/0 CFNetwork/3860.400.51 Darwin/25.3.0",
    };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body,
      });

      if (!res.ok) {
        throw new Error(res.statusText);
      }

      const data = await res.json();
      return data;
    } catch (error) {
      throw new Error("INVALID_CHANNEL_TOKEN", { cause: error });
    }
  }

  async oauth2Grant({
    appCode,
    token,
  }: {
    appCode: string;
    token: string;
  }): Promise<ErrorResponse | OAuth2GrantResponse> {
    const url = "https://as.gryphline.com/user/oauth2/v2/grant";
    const body = JSON.stringify({
      appCode: appCode,
      token: token,
      type: 0,
    });
    const headers: RequestInit["headers"] = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    try {
      return this.oauthCache.getOrSet(token, async () => {
        const res = await fetch(url, {
          method: "POST",
          headers,
          body,
        });

        if (!res.ok) {
          throw new Error(res.statusText);
        }

        const data = await res.json();
        return data as OAuth2GrantResponse;
      });
    } catch (error) {
      throw new Error("INVALID_OAUTH2_GRANT", { cause: error });
    }
  }

  async generateCredByCode({ code }: { code: string }) {
    const url = "https://zonai.skport.com/web/v1/user/auth/generate_cred_by_code";
    const body = JSON.stringify({
      kind: 1,
      code,
    });
    const headers: RequestInit["headers"] = {
      "Content-Type": "application/json",
      "Content-Length": body.length.toString(),
      platform: "3",
      "sk-language": "en",
      timestamp: Math.floor(Date.now() / 1000).toString(),
      vName: "1.0.0",
    };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body,
      });

      if (!res.ok) {
        throw new Error(res.statusText);
      }

      const data = await res.json();
      return data;
    } catch (error) {
      throw new Error("INVALID_GENERATED_CREDENTIALS", { cause: error });
    }
  }
}
