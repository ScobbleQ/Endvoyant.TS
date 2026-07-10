import type { SkportErrorResponse } from "../types/auth.ts";
import type { Locale } from "../types/language.ts";
import type { CardDetailResponse, PlayerBindingsResponse } from "../types/player.ts";
import { BaseClient } from "../core/BaseClient.ts";

export class PlayerResource {
  readonly #client: BaseClient;

  constructor(client: BaseClient) {
    this.#client = client;
  }

  async fetchBindings({
    cred,
    token,
    lang,
  }: {
    cred: string;
    token: string;
    lang?: Locale;
  }): Promise<SkportErrorResponse | PlayerBindingsResponse> {
    const path = "/api/v1/game/player/binding";

    const { body } = await this.#client.request({
      method: "GET",
      origin: "https://zonai.skport.com",
      path,
      headers: {
        cred,
        ...this.#client.skportHeaders(token, path, "", lang),
      },
    });

    return (await body.json()) as SkportErrorResponse | PlayerBindingsResponse;
  }

  async fetchCardDetail({
    cred,
    token,
    serverId,
    roleId,
    lang,
  }: {
    cred: string;
    token: string;
    serverId: string;
    roleId: string;
    lang?: Locale;
  }): Promise<SkportErrorResponse | CardDetailResponse> {
    const path = "/api/v1/game/endfield/card/detail";

    const { body } = await this.#client.request({
      method: "GET",
      origin: "https://zonai.skport.com",
      path,
      headers: {
        cred,
        "sk-game-role": `3_${roleId}_${serverId}`,
        ...this.#client.skportHeaders(token, path, "", lang),
      },
    });

    return (await body.json()) as CardDetailResponse | SkportErrorResponse;
  }

  async fetchEnums({ cred, token, lang }: { cred: string; token: string; lang?: Locale }) {
    const path = "/web/v1/game/endfield/enums";

    const { body } = await this.#client.request({
      method: "GET",
      origin: "https://zonai.skport.com",
      path,
      headers: {
        cred,
        ...this.#client.skportHeaders(token, path, "", lang),
      },
    });

    return body.json();
  }
}
