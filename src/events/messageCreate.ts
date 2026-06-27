import {
  Events,
  ContainerBuilder,
  ButtonStyle,
  ButtonBuilder,
  MessageFlags,
  type Message,
} from "discord.js";
import type { BotEvent } from "#/discord.js";
import { config } from "#/config.ts";

export default {
  name: Events.MessageCreate,
  async execute(message: Message) {
    // Ensure bot is mentioned and not from a bot
    if (!message.mentions.has(message.client.user.id)) return;
    if (message.author.bot) return;

    // Have our agent respond
  },
} satisfies BotEvent<Events.MessageCreate>;
