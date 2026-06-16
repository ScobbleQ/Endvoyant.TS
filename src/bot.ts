import {
  Client,
  Collection,
  ContextMenuCommandBuilder,
  GatewayIntentBits,
  SlashCommandBuilder,
} from "discord.js";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { config } from "#/config.ts";
import { loadCommands, loadInteractions } from "#/utils/loader.ts";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.slashCommands = new Collection();
client.contextMenuCommands = new Collection();
client.cooldowns = new Collection();
client.interactions = new Collection();

for (const command of await loadCommands()) {
  if (command.data instanceof SlashCommandBuilder) {
    client.slashCommands.set(command.data.name, command);
  } else if (command.data instanceof ContextMenuCommandBuilder) {
    client.contextMenuCommands.set(command.data.name, command);
  } else {
    console.warn(`Command ${command.data.name} has an invalid data type.`);
  }
}

for (const [key, handler] of await loadInteractions()) {
  client.interactions.set(key, handler);
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
