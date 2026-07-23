import { ButtonBuilder, ButtonStyle, MessageFlags, type ButtonInteraction } from "discord.js";
import { createComponentId } from "#/utils/componentId.ts";
import { confirmationContainer } from "../components/confirmation.ts";

export default {
  data: (shortId: string) =>
    new ButtonBuilder()
      .setCustomId(createComponentId("settings", "unlink-account", shortId))
      .setLabel("Unlink")
      .setStyle(ButtonStyle.Danger),
  execute: async (interaction: ButtonInteraction, args: string[]) => {
    await interaction.update({
      components: [await confirmationContainer("unlink", args[0]!)],
      flags: [MessageFlags.IsComponentsV2],
    });
  },
};
