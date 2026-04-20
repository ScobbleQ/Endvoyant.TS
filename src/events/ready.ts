import { Events, type Client } from "discord.js";

export default {
  name: Events.ClientReady,
  once: true,
  execute: async (client: Client) => {
    console.log(`Logged in as ${client.user?.tag}`);
  },
};
