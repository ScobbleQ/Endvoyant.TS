import pQueue from "p-queue";
import type { Job } from "#/jobs/type.ts";
import { db } from "#/drizzle/index.ts";

export default {
  schedule: "30 * * * *",
  timezone: "America/New_York",
  productionOnly: true,
  execute: async () => {
    // Random delay between 0 and 30 minutes
    const delay = Math.floor(Math.random() * 31) * 60 * 1000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Get all active codes
    const codes = await db.query.efCodes.findMany({
      columns: { code: true, rewards: true },
      where: { isActive: true },
    });

    // Get all users with active accounts
    const users = await db.query.users.findMany({
      columns: {
        dcid: true,
        lang: true,
        allowData: true,
        enableNotif: true,
      },
      with: {
        accounts: {
          columns: {
            id: true,
            nickname: true,
            accountToken: true,
            roleId: true,
            serverId: true,
          },
          where: { enableRedeem: true },
          orderBy: { isPrimary: "desc", addedOn: "asc" },
        },
      },
    });

    const userQueue = new pQueue({ concurrency: 1 });
    const accountQueue = new pQueue({ concurrency: 1 });

    for (const user of users) {
      void userQueue.add(async () => {
        try {
          if (!user.accounts || user.accounts.length === 0) return;

          const results = await Promise.allSettled(
            user.accounts.map(async (account) =>
              accountQueue.add(async () => {
                // hello
              }),
            ),
          );

          const settled = results.flatMap((r) =>
            r.status === "fulfilled" && r.value != null ? [r.value] : [],
          );

          if (!user.enableNotif) return;
          if (settled.length === 0) return;
        } catch {
          // err
        }
      });
    }
  },
} satisfies Job;
