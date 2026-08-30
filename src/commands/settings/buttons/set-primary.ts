import { ButtonBuilder, ButtonStyle, MessageFlags, type ButtonInteraction } from "discord.js";
import { AccountsDB } from "#/drizzle/index.ts";
import { createComponentId } from "#/utils/componentId.ts";
import { accountsContainer } from "../components/accounts.ts";

export default {
  data: (accountKey: string, isPrimary: boolean) =>
    new ButtonBuilder()
      .setCustomId(createComponentId("settings", "set-primary", accountKey))
      .setLabel("Set Primary")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(isPrimary),
  execute: async (interaction: ButtonInteraction, args: string[]) => {
    const accountKey = args[0] as string;

    await AccountsDB.setPrimary(interaction.user.id, accountKey);
    const container = await accountsContainer(interaction.user.id);

    await interaction.update({
      components: [container],
      flags: [MessageFlags.IsComponentsV2],
    });
  },
};
