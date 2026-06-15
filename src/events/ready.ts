import { CronJob } from "cron";
import { Events, type Client } from "discord.js";
import { codeRedeem } from "#/jobs/codeRedeem.ts";
import { dailySignin } from "#/jobs/dailySignin.ts";
import { refreshTokens } from "#/jobs/refreshToken.ts";

export default {
  name: Events.ClientReady,
  once: true,
  execute: async (client: Client) => {
    console.log(`Logged in as ${client.user?.tag}`);

    new CronJob(
      "5 12 * * *",
      () => dailySignin(client),
      null,
      true,
      "America/New_York",
      null,
      false,
    );

    new CronJob("30 * * * *", () => codeRedeem(), null, true, "America/New_York", null, false);

    new CronJob("0 0 * * *", () => refreshTokens(), null, true, "America/New_York", null, false);
  },
};
