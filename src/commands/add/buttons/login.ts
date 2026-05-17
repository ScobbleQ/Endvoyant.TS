import { ButtonBuilder, ButtonStyle, type ButtonInteraction } from "discord.js";
import { createComponentId } from "#/utils/componentId.ts";
import LoginModal from "../modals/login.ts";

export default {
  data: new ButtonBuilder()
    .setCustomId(createComponentId("add", "login"))
    .setLabel("SKPort Login")
    .setStyle(ButtonStyle.Primary),
  execute: async (interaction: ButtonInteraction) => {
    await interaction.showModal(LoginModal.data);
  },
};
