import type { Client } from "discord.js";
import { CronJob } from "cron";
import { config } from "#/config.ts";
import codeRedeemJob from "#/jobs/codeRedeem.ts";
import dailySigninJob from "#/jobs/dailySignin.ts";
import refreshTokensJob from "#/jobs/refreshToken.ts";

export function startCronJobs(client: Client) {
  const jobs = [codeRedeemJob, dailySigninJob, refreshTokensJob];

  for (const job of jobs) {
    if (job.productionOnly && config.env !== "production") continue;
    new CronJob(job.schedule, () => job.execute(client), null, true, job.timezone, null, false);
  }
}
