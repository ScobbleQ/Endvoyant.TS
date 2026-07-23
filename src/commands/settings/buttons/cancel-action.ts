import { ButtonBuilder, ButtonStyle, MessageFlags, type ButtonInteraction } from "discord.js";
import { createComponentId } from "#/utils/componentId.ts";
import { accountsContainer } from "../components/accounts.ts";
import { privacyContainer } from "../components/privacy.ts";

export default {
  data: (type: "unlink" | "delete") =>
    new ButtonBuilder()
      .setCustomId(createComponentId("settings", "cancel-action", type))
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Secondary),
  execute: async (interaction: ButtonInteraction, args: string[]) => {
    const container =
      args[0] === "unlink"
        ? await accountsContainer(interaction.user.id)
        : await privacyContainer(interaction.user.id);

    await interaction.update({
      components: [container],
      flags: [MessageFlags.IsComponentsV2],
    });
  },
};
