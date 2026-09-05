import { BaseClient } from "../core/BaseClient.ts";

export class EventResource {
  readonly #client: BaseClient;

  constructor(client: BaseClient) {
    this.#client = client;
  }
}
