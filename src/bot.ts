import { readdirSync } from "node:fs";
import { join } from "node:path";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import { config } from "#/config.ts";
import { loadCommands } from "#/utils/loader.ts";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();
client.cooldowns = new Collection();

for (const command of await loadCommands()) {
  client.commands.set(command.data.name, command);
}

const eventsPath = join(import.meta.dirname, "events");
const eventFiles = readdirSync(eventsPath).filter((file) => file.endsWith(".ts"));

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
