import {
  Collection,
  type SlashCommandBuilder,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
} from "discord.js";

export interface Command {
  cooldown?: number;
  data: SlashCommandBuilder;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

declare module "discord.js" {
  interface Client {
    commands: Collection<string, Command>;
    cooldowns: Collection<string, Collection<string, number>>;
  }
}
