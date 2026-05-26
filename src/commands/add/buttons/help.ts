import { ButtonBuilder, ButtonStyle, MessageFlags, type ButtonInteraction } from "discord.js";
import { createComponentId } from "#/utils/componentId.ts";
import { helpContainer } from "../components/help.ts";

export default {
  data: new ButtonBuilder()
    .setCustomId(createComponentId("add", "help"))
    .setLabel("Help")
    .setStyle(ButtonStyle.Primary),
  execute: async (interaction: ButtonInteraction) => {
    await interaction.reply({
      components: [helpContainer()],
      flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
    });
  },
};
