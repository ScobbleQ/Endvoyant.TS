import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Command, InteractionHandler } from "#/types/discord.js";

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

export async function loadCommands() {
  const commands: Command[] = [];
  const commandsPath = join(import.meta.dirname, "..", "commands");
  const commandFolders = readdirSync(commandsPath);

  for (const folder of commandFolders) {
    if (folder.startsWith("_")) continue;

    const filePath = join(commandsPath, folder, "index.ts");
    if (!existsSync(filePath)) {
      console.warn(`Command folder ${folder} is missing an index.ts file.`);
      continue;
    }

    const command = (await import(filePath)).default;
    if (isCommand(command)) {
      commands.push(command);
    } else {
      console.warn(`Command at ${filePath} is missing a required property.`);
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

  return interactions;
}
