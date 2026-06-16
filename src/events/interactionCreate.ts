import { Collection, ContainerBuilder, Events, MessageFlags, type Interaction } from "discord.js";
import { fromDiscordLocale, tx } from "#/i18n/index.ts";
import { parseComponentId } from "#/utils/componentId.ts";

export default {
  name: Events.InteractionCreate,
  execute: async (interaction: Interaction) => {
    const locale = fromDiscordLocale(interaction.locale);

    if (interaction.isChatInputCommand()) {
      const { commands, cooldowns } = interaction.client;
      const command = commands.get(interaction.commandName);
      if (!command || typeof command.execute !== "function") return;

      let timestamps = cooldowns.get(command.data.name);
      if (!timestamps) {
        timestamps = new Collection();
        cooldowns.set(command.data.name, timestamps);
      }

      const now = Date.now();
      const cooldownAmount = (command.cooldown ?? 5) * 1000;

      const lastUsed = timestamps.get(interaction.user.id);
      if (lastUsed !== undefined) {
        const expirationTime = lastUsed + cooldownAmount;
        if (now < expirationTime) {
          const expiredTimestamp = Math.round(expirationTime / 1000);
          const commandName =
            command.data.name_localizations?.[interaction.locale] ?? command.data.name;
          return interactionReply(
            interaction,
            tx(locale, "error.cooldown", { command: commandName, time: expiredTimestamp }),
          );
        }
      }

      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interactionReply(interaction, tx(locale, "error.commandFailed"));
      }
    } else if (interaction.isAutocomplete()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command || typeof command.autocomplete !== "function") return;

      try {
        await command.autocomplete(interaction);
      } catch (error) {
        console.error(error);
      }
    } else if (
      interaction.isButton() ||
      interaction.isModalSubmit() ||
      interaction.isStringSelectMenu()
    ) {
      const parsed = parseComponentId(interaction.customId);
      if (!parsed) {
        await interactionReply(interaction, tx(locale, "error.generic"));
        return;
      }

      let interactionType = "";
      if (interaction.isButton()) interactionType = "buttons";
      if (interaction.isModalSubmit()) interactionType = "modals";
      if (interaction.isStringSelectMenu()) interactionType = "selectmenus";

      const key = `${parsed.commandName}|${interactionType}|${parsed.interactionName}`;
      const handler = interaction.client.interactions.get(key);

      if (!handler) return;

      try {
        await handler.execute(interaction, parsed.args);
      } catch (error) {
        console.error(error);
        return;
      }
    }
  },
};

const interactionReply = async (interaction: Interaction, content: string) => {
  if (interaction.isAutocomplete()) return;

  const container = new ContainerBuilder()
    .setAccentColor(0xff0000)
    .addTextDisplayComponents((t) => t.setContent(content));

  if (interaction.deferred || interaction.replied) {
    await interaction.followUp({
      components: [container],
      flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
    });
  } else {
    await interaction.reply({
      components: [container],
      flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
    });
  }
};
