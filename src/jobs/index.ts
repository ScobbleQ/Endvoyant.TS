import type { Client } from "discord.js";
import { config } from "#/config.ts";
import redeemCodesJob from "./redeemCodes.ts";
import refreshTokensJob from "./refreshTokens.ts";
import dailySignInJob from "./signIn.ts";
import { scheduleJobs } from "./utils/scheduler.ts";

export function startCronJobs(client: Client) {
  return scheduleJobs(client, [dailySignInJob, refreshTokensJob, redeemCodesJob], config.env);
}
