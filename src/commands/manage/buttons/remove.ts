import { ButtonBuilder, ButtonStyle, type ButtonInteraction } from "discord.js";
import { createComponentId } from "#/utils/componentId.ts";
import DeleteOneModal from "../modals/deleteOne.ts";

export default {
  data: (shortId: string) =>
    new ButtonBuilder()
      .setCustomId(createComponentId("manage", "remove", shortId))
      .setLabel("Remove")
      .setStyle(ButtonStyle.Danger),
  execute: async (interaction: ButtonInteraction, args: string[]) => {
    await interaction.showModal(DeleteOneModal.data(args[0]!));
  },
};
