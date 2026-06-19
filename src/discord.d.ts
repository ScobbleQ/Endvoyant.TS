import {
  Collection,
  type AutocompleteInteraction,
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  type ClientEvents,
  type Events,
  type ModalSubmitInteraction,
  type SlashCommandBuilder,
  type StringSelectMenuInteraction,
} from "discord.js";

export interface BotEvent<E extends Events = Events> {
  name: E;
  once?: boolean;
  execute: (...args: ClientEvents[E]) => Promise<void> | void;
}

interface SlashCommand {
  cooldown: number;
  data: SlashCommandBuilder;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

interface ContextMenuCommand {
  cooldown: number;
  data: ContextMenuCommandBuilder;
  execute: (interaction: ContextMenuCommandInteraction) => Promise<void>;
}

export type Command = SlashCommand | ContextMenuCommand;

export interface InteractionHandler {
  execute: (
    interaction: ButtonInteraction | ModalSubmitInteraction | StringSelectMenuInteraction,
    args: string[],
  ) => Promise<void>;
}

declare module "discord.js" {
  interface Client {
    slashCommands: Collection<string, SlashCommand>;
    contextMenuCommands: Collection<string, ContextMenuCommand>;
    cooldowns: Collection<string, Collection<string, number>>;
    interactions: Collection<string, InteractionHandler>;
  }
}
