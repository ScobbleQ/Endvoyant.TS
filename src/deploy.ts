import { readdirSync } from "fs";
import { join } from "path";
import { ApplicationCommand, REST, Routes, type SlashCommandBuilder } from "discord.js";
import { config } from "#/config.js";

const commands: SlashCommandBuilder[] = [];

const foldersPath = join(import.meta.dirname, "commands");
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
  if (folder.startsWith("_")) continue;
  const commandPath = join(foldersPath, folder);
  const commandFiles = readdirSync(commandPath).filter((file) => file.endsWith(".ts"));
  for (const file of commandFiles) {
    const filePath = join(commandPath, file);
    const command = (await import(filePath)).default;
    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    } else {
      console.warn(`Command at ${filePath} is missing a required property.`);
    }
  }
}

const rest = new REST().setToken(config.discord.token);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);
    const data = (await rest.put(Routes.applicationCommands(config.discord.clientId), {
      body: commands,
    })) as ApplicationCommand[];
    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();
