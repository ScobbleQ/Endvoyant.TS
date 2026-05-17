import { existsSync, readdirSync } from "fs";
import { join } from "path";
import type { Command } from "#/types/discord.js";

function isCommand(command: unknown) {
  return (
    typeof command === "object" &&
    command !== null &&
    "data" in command &&
    "execute" in command &&
    typeof command.execute === "function"
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
