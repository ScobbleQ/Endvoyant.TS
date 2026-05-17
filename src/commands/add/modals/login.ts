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
    .setCustomId(createComponentId("add", "login"))
    .setTitle("Login with Email & Password")
    .addLabelComponents(
      new LabelBuilder()
        .setLabel("Email")
        .setDescription("Enter your email address")
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("email")
            .setStyle(TextInputStyle.Short)
            .setRequired(true),
        ),
      new LabelBuilder()
        .setLabel("Password")
        .setDescription("Enter your password")
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("password")
            .setStyle(TextInputStyle.Short)
            .setRequired(true),
        ),
    ),
  execute: async (interaction: ModalSubmitInteraction) => {
    console.log(interaction.user.id, "login");
  },
};
