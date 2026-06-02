import { ButtonBuilder, ButtonStyle, MessageFlags, type ButtonInteraction } from "discord.js";
import { AccountsDB, UsersDB } from "#/drizzle/index.ts";
import { createComponentId } from "#/utils/componentId.ts";
import { accountContainer } from "../components/account.ts";

export default {
  data: (shortId: string, isPrimary: boolean) =>
    new ButtonBuilder()
      .setCustomId(createComponentId("manage", "primary", shortId))
      .setLabel("Set Primary")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(isPrimary),
  execute: async (interaction: ButtonInteraction, args: string[]) => {
    await interaction.deferUpdate();
    const shortId = parseInt(args[0]!, 10);

    const user = await UsersDB.findByDcid(interaction.user.id);
    if (!user) {
      return;
    }

    await AccountsDB.setPrimary(interaction.user.id, shortId);
    const account = await AccountsDB.listByDcid(interaction.user.id);

    await interaction.editReply({
      components: [accountContainer(user.isPremium, account)],
      flags: [MessageFlags.IsComponentsV2],
    });
  },
};
