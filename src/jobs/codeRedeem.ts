import type { Job } from "#/jobs/type.ts";

export default {
  schedule: "30 * * * *",
  timezone: "America/New_York",
  productionOnly: true,
  execute: async () => {},
} satisfies Job;
