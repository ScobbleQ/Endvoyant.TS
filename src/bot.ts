import { readdirSync } from "fs";
import { join } from "path";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import { config } from "#/config.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();
client.cooldowns = new Collection();

const foldersPath = join(import.meta.dirname, "commands");
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
  if (folder.startsWith("_")) continue;
  const commandPath = join(foldersPath, folder);
  const commandFiles = readdirSync(commandPath).filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = join(commandPath, file);
    const command = (await import(filePath)).default;
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.warn(`Command at ${filePath} is missing a required property.`);
    }
  }
}

const eventsPath = join(import.meta.dirname, "events");
const eventFiles = readdirSync(eventsPath).filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = join(eventsPath, file);
  const event = (await import(filePath)).default;
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(config.discord.token).catch((error) => {
  console.error(error);
});
