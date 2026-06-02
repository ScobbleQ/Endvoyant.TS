import { ButtonBuilder, ButtonStyle, MessageFlags, type ButtonInteraction } from "discord.js";
import { createComponentId } from "#/utils/componentId.ts";

export default {
  data: new ButtonBuilder()
    .setCustomId(createComponentId("manage", "unlink"))
    .setLabel("Unlink All Account(s)")
    .setStyle(ButtonStyle.Danger),
  execute: async (interaction: ButtonInteraction) => {
    await interaction.reply({
      content: "This feature is not implemented yet.",
      flags: [MessageFlags.Ephemeral],
    });
  },
};
