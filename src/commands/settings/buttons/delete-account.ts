import { ButtonBuilder, ButtonStyle, MessageFlags, type ButtonInteraction } from "discord.js";
import { createComponentId } from "#/utils/componentId.ts";
import { confirmationContainer } from "../components/confirmation.ts";

export default {
  data: new ButtonBuilder()
    .setCustomId(createComponentId("settings", "delete-account"))
    .setLabel("Delete Endvoyant Account")
    .setStyle(ButtonStyle.Danger),
  execute: async (interaction: ButtonInteraction) => {
    await interaction.update({
      components: [await confirmationContainer("delete")],
      flags: [MessageFlags.IsComponentsV2],
    });
  },
};
