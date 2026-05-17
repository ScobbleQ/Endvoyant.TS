import { ApplicationCommand, REST, Routes } from "discord.js";
import { config } from "#/config.ts";
import { loadCommands } from "#/utils/loader.ts";

const commands = (await loadCommands()).map((command) => command.data.toJSON());

const rest = new REST().setToken(config.discord.token);

void (async () => {
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
