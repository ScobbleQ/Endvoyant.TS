import type { Client } from "discord.js";
import { CronJob } from "cron";
import { setTimeout } from "node:timers/promises";
import { logger } from "#/utils/logger.ts";
import type { Job } from "../types.ts";

const scheduledJobs = new WeakMap<Client, CronJob[]>();

export function scheduleJobs(client: Client, jobs: readonly Job[], env: string) {
  // ShardingManager runs a copy of the bot per shard. Only shard zero owns jobs.
  if (client.shard && !client.shard.ids.includes(0)) return [];
  const existing = scheduledJobs.get(client);
  if (existing) return existing;

  const cronJobs = jobs
    .filter((job) => !job.productionOnly || env === "production")
    .map((job) =>
      CronJob.from({
        cronTime: job.schedule,
        timeZone: job.timezone ?? "America/New_York",
        onTick: async () => {
          await setTimeout(Math.floor(Math.random() * (job.jitterMinutes + 1)) * 60_000);
          await job.execute(client);
        },
        waitForCompletion: true,
        errorHandler: () => {
          // Database errors may embed credentials in their messages/parameters.
          logger.error({ schedule: String(job.schedule) }, "Scheduled job failed");
        },
        start: false,
      }),
    );

  // Validate every schedule before starting any timers.
  for (const cronJob of cronJobs) cronJob.start();
  scheduledJobs.set(client, cronJobs);
  return cronJobs;
}
