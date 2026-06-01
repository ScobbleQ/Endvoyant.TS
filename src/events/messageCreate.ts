import { Events, type Message } from "discord.js";

export default {
  name: Events.MessageCreate,
  once: true,
  execute: async (message: Message) => {
    if (!message.channel.isDMBased()) return;
    if (message.author.bot) return;
  },
};
