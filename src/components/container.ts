import { ContainerBuilder } from "discord.js";

export function container(description: string) {
  return new ContainerBuilder().addTextDisplayComponents((t) => t.setContent(description));
}

export function errorContainer({ title, desc }: { title?: string; desc: string }) {
  const container = new ContainerBuilder().setAccentColor(0xff0000);
  if (title) container.addTextDisplayComponents((t) => t.setContent(`## ${title}`));
  container.addTextDisplayComponents((t) => t.setContent(desc));
  return container;
}

export function warnContainer({ title, description }: { title?: string; description: string }) {
  const container = new ContainerBuilder().setAccentColor(0xffff00);
  if (title) container.addTextDisplayComponents((t) => t.setContent(`## ${title}`));
  container.addTextDisplayComponents((t) => t.setContent(description));
  return container;
}

export function successContainer({ title, desc }: { title?: string; desc: string }) {
  const container = new ContainerBuilder().setAccentColor(0x00ff00);
  if (title) container.addTextDisplayComponents((t) => t.setContent(`## ${title}`));
  container.addTextDisplayComponents((t) => t.setContent(desc));
  return container;
}
