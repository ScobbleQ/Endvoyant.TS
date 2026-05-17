import { ButtonBuilder, ButtonStyle, MessageFlags, type ButtonInteraction } from "discord.js";
import { createComponentId } from "#/utils/componentId.ts";

export default {
  data: new ButtonBuilder()
    .setCustomId(createComponentId("add", "info"))
    .setLabel("ⓘ")
    .setStyle(ButtonStyle.Secondary),
  execute: async (interaction: ButtonInteraction) => {
    await interaction.reply({
      content: "hehe",
      flags: [MessageFlags.Ephemeral],
    });
  },
};
