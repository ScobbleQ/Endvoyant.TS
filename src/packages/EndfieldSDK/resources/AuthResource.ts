import type {
  ChannelTokenLoginResponse,
  EmailPasswordLoginResponse,
  GryphlineErrorResponse,
  OAuth2GrantByKind,
} from "../types/auth.ts";
import type { Locale } from "../types/language.ts";
import { BaseClient } from "../core/BaseClient.ts";

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

export class AuthResource {
  readonly #client: BaseClient;

  constructor(client: BaseClient) {
    this.#client = client;
  }

  async loginWithEmailPassword(
    email: string,
    password: string,
    options: { lang?: Locale } = {},
  ): Promise<GryphlineErrorResponse | EmailPasswordLoginResponse> {
    const { body } = await this.#client.request({
      method: "POST",
      origin: "https://as.gryphline.com",
      path: "/user/auth/v1/token_by_email_password",
      headers: {
        "content-type": "application/json",
        host: "as.gryphline.com",
        "x-captcha-version": "4.0",
        "x-language": options.lang || this.#client.defaultLang,
      },
      body: JSON.stringify({ email, from: 1, password }),
    });

    return (await body.json()) as GryphlineErrorResponse | EmailPasswordLoginResponse;
  }

  async loginWithChannelToken({
    channelId,
    channelToken,
  }: {
    channelId: string;
    channelToken: string;
  }): Promise<GryphlineErrorResponse | ChannelTokenLoginResponse> {
    const { body } = await this.#client.request({
      method: "POST",
      origin: "https://u8.gryphline.com",
      path: "/u8/user/auth/v2/token_by_channel_token",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        appCode: "973bd727dd11cbb6ead8",
        channelMasterId: channelId,
        channelToken: { type: 1, isSuc: true, code: channelToken },
        platform: 0,
        type: 0,
      }),
    });

    return (await body.json()) as GryphlineErrorResponse | ChannelTokenLoginResponse;
  }

  async grantOAuth2<T extends AppCode>({
    appCode,
    token,
  }: {
    appCode: T;
    token: string;
  }): Promise<GryphlineErrorResponse | OAuth2GrantByAppCode[T]> {
    const { body } = await this.#client.request({
      method: "POST",
      origin: "https://as.gryphline.com",
      path: "/user/oauth2/v2/grant",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ appCode, token, type: SKPORT_APPCODES[appCode] }),
    });

    return (await body.json()) as GryphlineErrorResponse | OAuth2GrantByAppCode[T];
  }
}
