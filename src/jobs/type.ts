import type { CronJobParams } from "cron";
import type { Client } from "discord.js";

export interface Job {
  schedule: CronJobParams<null, null>["cronTime"];
  timezone: CronJobParams<null, null>["timeZone"];
  productionOnly: boolean;
  execute: (client: Client) => Promise<void>;
}
