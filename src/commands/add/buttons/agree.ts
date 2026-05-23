import { ButtonBuilder, ButtonStyle, type ButtonInteraction } from "discord.js";
import { UsersDB } from "#/drizzle/index.ts";
import { createComponentId } from "#/utils/componentId.ts";
import { addAccountEmbed, addAccountActions } from "../components/addAccount.ts";
import { onboardingSuccessEmbed } from "../components/onboarding.ts";

export default {
  data: new ButtonBuilder()
    .setCustomId(createComponentId("add", "agree"))
    .setLabel("I Agree")
    .setStyle(ButtonStyle.Success),
  execute: async (interaction: ButtonInteraction) => {
    await UsersDB.insert(interaction.user.id);
    await interaction.update({
      embeds: [onboardingSuccessEmbed()],
      components: [],
    });

    await new Promise((resolve) => setTimeout(resolve, 5000));
    await interaction.editReply({
      embeds: [addAccountEmbed()],
      components: [addAccountActions()],
    });
  },
};
