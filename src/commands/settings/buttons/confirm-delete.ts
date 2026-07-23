import { ButtonBuilder, ButtonStyle, MessageFlags, type ButtonInteraction } from "discord.js";
import { UsersDB } from "#/drizzle/index.ts";
import { errorContainer, successContainer } from "#/ui/container.ts";
import { createComponentId } from "#/utils/componentId.ts";

export default {
  data: new ButtonBuilder()
    .setCustomId(createComponentId("settings", "confirm-delete"))
    .setLabel("Confirm Delete")
    .setStyle(ButtonStyle.Danger),
  execute: async (interaction: ButtonInteraction) => {
    try {
      await UsersDB.delete(interaction.user.id);
      await interaction.update({
        components: [successContainer({ desc: "Your account has been successfully deleted." })],
        flags: [MessageFlags.IsComponentsV2],
      });
    } catch {
      await interaction.update({
        components: [
          errorContainer({
            title: "Failed to Delete Account",
            desc: "Please try again later or contact support if the issue persists.",
          }),
        ],
        flags: [MessageFlags.IsComponentsV2],
      });
    }
  },
};
