import type { RedeemCodeResponse } from "../types/giftcode.ts";
import { BaseClient } from "../core/BaseClient.ts";

export class GiftcodeResource {
  readonly #client: BaseClient;

  constructor(client: BaseClient) {
    this.#client = client;
  }

  async redeem({
    code,
    channelId,
    serverId,
    token,
  }: {
    code: string;
    channelId: string;
    serverId: string;
    token: string;
  }): Promise<RedeemCodeResponse> {
    const { body } = await this.#client.request({
      method: "POST",
      origin: "https://game-hub.gryphline.com",
      path: "/giftcode/api/redeem",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ channelId, code, confirm: false, platform: "iOS", serverId, token }),
    });

    return (await body.json()) as RedeemCodeResponse;
  }
}
