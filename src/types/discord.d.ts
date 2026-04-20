import type {
  AutocompleteInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  ModalSubmitInteraction,
  SelectMenuInteraction,
} from "discord.js";

interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

declare module "discord.js" {
  interface Client {
    commands: Collection<string, Command>;
    cooldowns: Collection<string, Collection<string, number>>;
  }
}
