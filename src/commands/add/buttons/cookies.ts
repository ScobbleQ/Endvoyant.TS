import { ButtonBuilder, ButtonStyle, type ButtonInteraction } from "discord.js";
import { createComponentId } from "#/utils/componentId.ts";
import CookiesModal from "../modals/cookies.ts";

export default {
  data: new ButtonBuilder()
    .setCustomId(createComponentId("add", "cookies"))
    .setLabel("Enter Cookies")
    .setStyle(ButtonStyle.Primary),
  execute: async (interaction: ButtonInteraction) => {
    await interaction.showModal(CookiesModal.data);
  },
};
