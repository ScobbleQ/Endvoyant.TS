import {
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { UsersDB } from "#/drizzle/index.ts";
import { tx } from "#/i18n/index.ts";
import EndfieldSDK from "#/packages/EndfieldSDK/index.ts";
import { container, errorContainer, successContainer } from "#/ui/container.ts";
import { createComponentId } from "#/utils/componentId.ts";
import { getDefaultBinding, linkBindingAccounts } from "./shared.ts";

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
    await interaction.deferUpdate();
    const email = interaction.fields.getTextInputValue("email");
    const password = interaction.fields.getTextInputValue("password");

    const user = await UsersDB.findAccess(interaction.user.id);
    if (!user) {
      return;
    }

    await interaction.editReply({
      components: [container("Logging in...")],
      flags: [MessageFlags.IsComponentsV2],
    });

    const res = await EndfieldSDK.loginWithEmailPassword(email, password);
    if (res.status !== 0) {
      await interaction.editReply({
        components: [errorContainer({ title: "Login Failed", desc: res.msg })],
        flags: [MessageFlags.IsComponentsV2],
      });
      return;
    }

    await interaction.editReply({
      components: [successContainer({ desc: tx(user.lang, "success.loginSuccessful") })],
      flags: [MessageFlags.IsComponentsV2],
    });

    const binding = await getDefaultBinding(res.data.token);
    if (!binding) {
      await interaction.editReply({
        components: [errorContainer({ desc: tx(user.lang, "error.fetchFailed") })],
        flags: [MessageFlags.IsComponentsV2],
      });
      return;
    }

    await linkBindingAccounts({
      interaction,
      user,
      bind: binding.bind,
      accountToken: res.data.token,
      hgId: res.data.hgId,
      userId: binding.session.userId,
    });
  },
};
