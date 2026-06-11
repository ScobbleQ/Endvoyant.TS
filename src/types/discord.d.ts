import {
  Collection,
  type SlashCommandBuilder,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  type ButtonInteraction,
  type ModalSubmitInteraction,
  type StringSelectMenuInteraction,
} from "discord.js";

export interface Command {
  cooldown?: number;
  data: SlashCommandBuilder;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface InteractionHandler {
  execute: (
    interaction: ButtonInteraction | ModalSubmitInteraction | StringSelectMenuInteraction,
    args: string[],
  ) => Promise<void>;
}

declare module "discord.js" {
  interface Client {
    commands: Collection<string, Command>;
    cooldowns: Collection<string, Collection<string, number>>;
    interactions: Collection<string, InteractionHandler>;
  }
}
