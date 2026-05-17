import {
  LabelBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { createComponentId } from "#/utils/componentId.ts";

export default {
  data: new ModalBuilder()
    .setCustomId(createComponentId("add", "cookies"))
    .setTitle("Link with Cookie tokens")
    .addLabelComponents(
      new LabelBuilder()
        .setLabel("Cookies")
        .setDescription("Enter the copied cookies")
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("token")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("ACCOUNT_TOKEN=___; ssxmod_itna=___; ssxmod_itna2=___; ...etc")
            .setRequired(true),
        ),
    ),
  execute: async (interaction: ModalSubmitInteraction) => {
    console.log(interaction.user.id, "cookie");
  },
};
