import type {
  CodeCredentialsResponse,
  OAuth2CodeGrantResponse,
  RefreshAccountTokenResponse,
  SkportErrorResponse,
} from "../types/auth.ts";
import type { Locale } from "../types/language.ts";
import { BaseClient } from "../core/BaseClient.ts";
import { getCookie } from "../utils/getCookie.ts";
import { AuthResource } from "./AuthResource.ts";

export class CredentialsResource {
  readonly #client: BaseClient;
  readonly #auth: AuthResource;

  constructor(client: BaseClient, auth: AuthResource) {
    this.#client = client;
    this.#auth = auth;
  }

  async exchangeCodeForCredentials({
    code,
    lang,
  }: {
    code: string;
    lang?: Locale;
  }): Promise<SkportErrorResponse | CodeCredentialsResponse> {
    const body = JSON.stringify({ kind: 1, code });
    const path = "/web/v1/user/auth/generate_cred_by_code";

    const { body: resBody } = await this.#client.request({
      method: "POST",
      origin: "https://zonai.skport.com",
      path,
      headers: {
        "content-type": "application/json",
        ...this.#client.skportHeaders("", path, body, lang),
      },
      body,
    });

    return (await resBody.json()) as SkportErrorResponse | CodeCredentialsResponse;
  }

  async refreshAccountToken({
    cred,
    token,
    lang,
  }: {
    cred: string;
    token: string;
    lang?: Locale;
  }): Promise<SkportErrorResponse | RefreshAccountTokenResponse> {
    const path = "/web/v1/auth/refresh";

    const { body, headers } = await this.#client.request({
      method: "GET",
      origin: "https://zonai.skport.com",
      path,
      headers: {
        "content-type": "application/json",
        language: "en-us",
        vCode: "100000018",
        cred,
        ...this.#client.skportHeaders(token, path, "{}", lang),
      },
    });

    const setCookies = headers["set-cookie"] as string[];
    const acwToken = setCookies
      ?.find((c) => c.startsWith("acw_tc="))
      ?.match(/^acw_tc=([^;]+)/)?.[1];

    const data = (await body.json()) as SkportErrorResponse | RefreshAccountTokenResponse;
    // If success (has data), inject the acw_tc into response
    if ("data" in data && acwToken) {
      data.data.acw_tc = acwToken;
    }

    return data;
  }

  async rotateAccountToken(
    accountToken: string,
    token: string,
    hgId: string,
  ): Promise<{ code: -1; msg: string } | { code: 0; data: { token: string }; msg: string }> {
    const { body, statusCode, headers } = await this.#client.request({
      method: "POST",
      origin: "https://web-api.skport.com",
      path: "/cookie_store/account_token",
      headers: {
        "content-type": "application/json",
        cookie: `ACCOUNT_TOKEN=${accountToken}; SK_OAUTH_CRED_KEY=${token}; HG_INFO_KEY={"hgId":"${hgId}"};`,
        "x-language": "en-us",
      },
      body: JSON.stringify({ content: accountToken }),
    });

    // 201 Created is expected
    if (statusCode !== 201) {
      await body.dump();
      throw new Error("Expected 201");
    }

    const data = (await body.json()) as { code: number; msg: string };
    const setCookies = headers["set-cookie"] as string[];
    const newAccountToken = getCookie(setCookies);
    if (!newAccountToken) return { code: -1, msg: "Failed to extract new account token" };

    return { code: 0, data: { token: newAccountToken }, msg: data.msg || "OK" };
  }

  async createSession({
    accountToken,
  }: {
    accountToken: string;
  }): Promise<(OAuth2CodeGrantResponse["data"] & CodeCredentialsResponse["data"]) | null> {
    const oauth = await this.#auth.grantOAuth2({
      appCode: "6eb76d4e13aa36e6",
      token: accountToken,
    });

    if (oauth.status !== 0) return null;
    const cred = await this.exchangeCodeForCredentials({ code: oauth.data.code });
    if (cred.code !== 0) return null;
    return { ...oauth.data, ...cred.data };
  }
}
