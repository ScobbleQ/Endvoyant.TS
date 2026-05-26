import { ButtonBuilder, ButtonStyle, MessageFlags, type ButtonInteraction } from "discord.js";
import { UsersDB } from "#/drizzle/index.ts";
import { createComponentId } from "#/utils/componentId.ts";
import { addAccountContainer } from "../components/addAccount.ts";
import { onboardingSuccessContainer } from "../components/onboarding.ts";

export default {
  data: new ButtonBuilder()
    .setCustomId(createComponentId("add", "agree"))
    .setLabel("Agree and Continue")
    .setStyle(ButtonStyle.Success),
  execute: async (interaction: ButtonInteraction) => {
    await UsersDB.insert(interaction.user.id);
    await interaction.update({
      components: [onboardingSuccessContainer()],
      flags: [MessageFlags.IsComponentsV2],
    });

    await new Promise((resolve) => setTimeout(resolve, 10000));
    await interaction.editReply({
      components: [addAccountContainer()],
      flags: [MessageFlags.IsComponentsV2],
    });
  },
};
