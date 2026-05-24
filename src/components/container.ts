import { ContainerBuilder } from "discord.js";

export function errorContainer({ title, description }: { title?: string; description: string }) {
  return new ContainerBuilder()
    .setAccentColor(0xff0000)
    .addTextDisplayComponents((t) =>
      t.setContent(`## ${title || "An error occurred"}\n${description}`),
    );
}

export function warningContainer({ title, description }: { title?: string; description: string }) {
  return new ContainerBuilder()
    .setAccentColor(0xffff00)
    .addTextDisplayComponents((t) => t.setContent(`## ${title || "Warning"}\n${description}`));
}

export function successContainer({ title, description }: { title?: string; description: string }) {
  return new ContainerBuilder()
    .setAccentColor(0x00ff00)
    .addTextDisplayComponents((t) => t.setContent(`## ${title || "Success"}\n${description}`));
}
