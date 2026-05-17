import { join } from "path";
import { Collection, ContainerBuilder, Events, MessageFlags, type Interaction } from "discord.js";
import { parseComponentId } from "#/utils/componentId.ts";

export default {
  name: Events.InteractionCreate,
  execute: async (interaction: Interaction) => {
    if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
      const { commands, cooldowns } = interaction.client;
      const command = commands.get(interaction.commandName);
      if (!command || typeof command.execute !== "function") return;

      if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
      }

      const now = Date.now();
      const timestamps = cooldowns.get(command.data.name);
      const cooldownAmount = (command.cooldown ?? 5) * 1000;

      if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
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
