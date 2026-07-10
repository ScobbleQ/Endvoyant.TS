import type { SigninResponse } from "../types/attendance.ts";
import type { SkportErrorResponse } from "../types/auth.ts";
import type { Locale } from "../types/language.ts";
import { BaseClient } from "../core/BaseClient.ts";

export class AttendanceResource {
  readonly #client: BaseClient;

  constructor(client: BaseClient) {
    this.#client = client;
  }

  async signIn({
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
  }): Promise<SigninResponse | SkportErrorResponse> {
    const path = "/web/v1/game/endfield/attendance";

    const { body } = await this.#client.request({
      method: "POST",
      origin: "https://zonai.skport.com",
      path,
      headers: {
        "content-type": "application/json",
        Origin: "https://game.skport.com",
        cred,
        "sk-game-role": `3_${roleId}_${serverId}`,
        ...this.#client.skportHeaders(token, path, "", lang),
      },
    });

    return (await body.json()) as SigninResponse | SkportErrorResponse;
  }
}
