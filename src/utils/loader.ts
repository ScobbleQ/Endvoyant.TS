import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Command, InteractionHandler } from "#/discord.js";

function isCommand(command: unknown) {
  return (
    typeof command === "object" &&
    command !== null &&
    "data" in command &&
    "execute" in command &&
    typeof command.execute === "function"
  );
}

function isInteractionHandler(handler: unknown) {
  return (
    typeof handler === "object" &&
    handler !== null &&
    "execute" in handler &&
    typeof handler.execute === "function"
  );
}

const COMMAND_ENTRY_FILES = ["slash.ts", "context.ts"] as const;

export async function loadCommands() {
  const commands: Command[] = [];
  const commandsPath = join(import.meta.dirname, "..", "commands");
  const commandFolders = readdirSync(commandsPath);

  for (const folder of commandFolders) {
    if (folder.startsWith("_")) continue;

    for (const entry of COMMAND_ENTRY_FILES) {
      const filePath = join(commandsPath, folder, entry);
      if (!existsSync(filePath)) continue;

      const command = (await import(filePath)).default;
      if (isCommand(command)) {
        commands.push(command);
      } else {
        console.warn(`Command at ${filePath} is missing a required property.`);
      }
    }
  }

  return commands;
}

const INTERACTION_TYPES = ["buttons", "modals", "selectmenus"] as const;

export async function loadInteractions() {
  const interactions = new Map<string, InteractionHandler>();
  const commandsPath = join(import.meta.dirname, "..", "commands");
  const commandFolders = readdirSync(commandsPath);

  for (const folder of commandFolders) {
    if (folder.startsWith("_")) continue;

    for (const type of INTERACTION_TYPES) {
      const typePath = join(commandsPath, folder, type);
      if (!existsSync(typePath)) continue;

      const files = readdirSync(typePath).filter((f) => f.endsWith(".ts"));
      for (const file of files) {
        const filePath = join(typePath, file);
        const handler = (await import(filePath)).default;
        if (isInteractionHandler(handler)) {
          const key = `${folder}|${type}|${file.replace(".ts", "")}`;
          interactions.set(key, handler);
        }
      }
    }
  }

  const globalsPath = join(import.meta.dirname, "..", "globals");

  for (const type of INTERACTION_TYPES) {
    const typePath = join(globalsPath, type);
    if (!existsSync(typePath)) continue;

    const files = readdirSync(typePath).filter((f) => f.endsWith(".ts"));
    for (const file of files) {
      const filePath = join(typePath, file);
      const handler = (await import(filePath)).default;
      if (isInteractionHandler(handler)) {
        const key = `globals|${type}|${file.replace(".ts", "")}`;
        interactions.set(key, handler);
      }
    }
  }

  return interactions;
}
