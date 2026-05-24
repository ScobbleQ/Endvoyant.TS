import { EmbedBuilder } from "discord.js";

export function errorEmbed({ title, description }: { title?: string; description: string }) {
  return new EmbedBuilder()
    .setTitle(title || "An error occurred")
    .setDescription(description)
    .setColor(0xff0000);
}

export function warningEmbed({ title, description }: { title?: string; description: string }) {
  return new EmbedBuilder()
    .setTitle(title || "Warning")
    .setDescription(description)
    .setColor(0xffff00);
}

export function successEmbed({ title, description }: { title?: string; description: string }) {
  return new EmbedBuilder()
    .setTitle(title || "Success")
    .setDescription(description)
    .setColor(0x00ff00);
}
