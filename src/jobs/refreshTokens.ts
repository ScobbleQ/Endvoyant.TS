import PQueue from "p-queue";
import { db } from "#/drizzle/index.ts";
import { refreshAccountToken } from "#/services/refreshToken.ts";
import type { Job } from "./types.ts";

export default {
  schedule: "0 0 * * *",
  timezone: "America/New_York",
  productionOnly: true,
  jitterMinutes: 55,
  execute: async () => {
    const accounts = await db.query.accounts.findMany({
      columns: { id: true, accountToken: true, hgId: true },
      where: { user: { isBanned: false } },
    });

    const queue = new PQueue({ concurrency: 10 });
    await Promise.all(accounts.map((account) => queue.add(() => refreshAccountToken(account))));
  },
} satisfies Job;
