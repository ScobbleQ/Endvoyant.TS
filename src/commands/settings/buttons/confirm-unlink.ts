import { ButtonBuilder, ButtonStyle, MessageFlags, type ButtonInteraction } from "discord.js";
import { AccountsDB } from "#/drizzle/index.ts";
import { errorContainer } from "#/ui/container.ts";
import { createComponentId } from "#/utils/componentId.ts";
import { accountsContainer } from "../components/accounts.ts";

export default {
  data: (shortId: string) =>
    new ButtonBuilder()
      .setCustomId(createComponentId("settings", "confirm-unlink", shortId))
      .setLabel("Confirm Unlink")
      .setStyle(ButtonStyle.Danger),
  execute: async (interaction: ButtonInteraction, args: string[]) => {
    const shortId = parseInt(args[0]!, 10);

    try {
      await AccountsDB.deleteByShortId(interaction.user.id, shortId);
      await interaction.update({
        components: [await accountsContainer(interaction.user.id)],
        flags: [MessageFlags.IsComponentsV2],
      });
    } catch {
      await interaction.update({
        components: [
          errorContainer({
            title: "Failed to Unlink Account",
            desc: "Please try again later or contact support if the issue persists.",
          }),
        ],
        flags: [MessageFlags.IsComponentsV2],
      });
    }
  },
};
