import { Events, type Client } from "discord.js";
import type { BotEvent } from "#/discord.js";
import { startCronJobs } from "#/jobs/index.ts";
import { initFonts } from "#/utils/fonts.ts";

export default {
  name: Events.ClientReady,
  once: true,
  execute: async (client: Client) => {
    console.log(`Logged in as ${client.user?.tag}`);

    initFonts();
    startCronJobs(client);
  },
} satisfies BotEvent<Events.ClientReady>;
