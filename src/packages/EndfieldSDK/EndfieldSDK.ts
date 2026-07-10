import { BaseClient, type ClientOptions } from "./core/BaseClient.ts";
import { AttendanceResource } from "./resources/AttendanceResource.ts";
import { AuthResource } from "./resources/AuthResource.ts";
import { CredentialsResource } from "./resources/CredentialsResource.ts";
import { GiftcodeResource } from "./resources/GiftcodeResource.ts";
import { PlayerResource } from "./resources/PlayerResource.ts";

export class EndfieldSDK {
  readonly auth: AuthResource;
  readonly credentials: CredentialsResource;
  readonly player: PlayerResource;
  readonly attendance: AttendanceResource;
  readonly giftcode: GiftcodeResource;

  constructor(options: ClientOptions = {}) {
    const base = new BaseClient(options);
    this.auth = new AuthResource(base);
    this.credentials = new CredentialsResource(base, this.auth);
    this.player = new PlayerResource(base);
    this.attendance = new AttendanceResource(base);
    this.giftcode = new GiftcodeResource(base);
  }
}
