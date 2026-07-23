import { ButtonBuilder, ButtonStyle, MessageFlags, type ButtonInteraction } from "discord.js";
import { AccountsDB } from "#/drizzle/index.ts";
import { createComponentId } from "#/utils/componentId.ts";
import { accountsContainer } from "../components/accounts.ts";

export default {
  data: (shortId: string, isPrimary: boolean) =>
    new ButtonBuilder()
      .setCustomId(createComponentId("settings", "set-primary", shortId))
      .setLabel("Set Primary")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(isPrimary),
  execute: async (interaction: ButtonInteraction, args: string[]) => {
    const shortId = parseInt(args[0]!, 10);

    await AccountsDB.setPrimary(interaction.user.id, shortId);
    const container = await accountsContainer(interaction.user.id);

    await interaction.update({
      components: [container],
      flags: [MessageFlags.IsComponentsV2],
    });
  },
};
