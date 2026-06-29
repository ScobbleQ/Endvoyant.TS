import { Events, type Message } from "discord.js";
import type { BotEvent } from "#/discord.js";

export default {
  name: Events.MessageCreate,
  async execute(message: Message) {
    // Ensure bot is mentioned and not from a bot
    if (!message.mentions.has(message.client.user.id)) return;
    if (message.author.bot) return;

    // Have our agent respond
  },
} satisfies BotEvent<Events.MessageCreate>;
