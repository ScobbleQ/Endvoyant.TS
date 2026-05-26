import { ContainerBuilder } from "discord.js";

export function container(description: string) {
  return new ContainerBuilder().addTextDisplayComponents((t) => t.setContent(description));
}

export function errorContainer({ title, description }: { title?: string; description: string }) {
  return new ContainerBuilder().setAccentColor(0xff0000).addTextDisplayComponents(
    (t) => t.setContent(`## ${title || "An error occurred"}`),
    (t) => t.setContent(description),
  );
}

export function warnContainer({ title, description }: { title?: string; description: string }) {
  return new ContainerBuilder().setAccentColor(0xffff00).addTextDisplayComponents(
    (t) => t.setContent(`## ${title || "Warning"}`),
    (t) => t.setContent(description),
  );
}

export function successContainer({ title, description }: { title?: string; description: string }) {
  return new ContainerBuilder().setAccentColor(0x00ff00).addTextDisplayComponents(
    (t) => t.setContent(`## ${title || "Success"}`),
    (t) => t.setContent(description),
  );
}
