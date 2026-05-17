import { join } from "path";
import { Collection, ContainerBuilder, Events, MessageFlags, type Interaction } from "discord.js";
import { parseComponentId } from "#/utils/componentId.ts";

export default {
  name: Events.InteractionCreate,
  execute: async (interaction: Interaction) => {
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
          return interactionReply(
            interaction,
            `Please wait, you are on cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
          );
        }
      }

      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interactionReply(interaction, `There was an error while executing this command!`);
      }
    } else if (interaction.isAutocomplete()) {
      // temp
    } else if (
      interaction.isButton() ||
      interaction.isModalSubmit() ||
      interaction.isStringSelectMenu()
    ) {
      const parsed = parseComponentId(interaction.customId);
      if (!parsed) {
        await interactionReply(interaction, "Womp womp");
        return;
      }

      let interactionType = "";
      if (interaction.isButton()) interactionType = "buttons";
      if (interaction.isModalSubmit()) interactionType = "modals";
      if (interaction.isStringSelectMenu()) interactionType = "selectmenus";

      const mod = await import(
        join(
          import.meta.dirname,
          "..",
          "commands",
          parsed.commandName,
          interactionType,
          `${parsed.interactionName}.ts`,
        )
      );

      if (!mod) {
        // malformed
        return;
      }

      try {
        await mod.default.execute(interaction, parsed.args);
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
