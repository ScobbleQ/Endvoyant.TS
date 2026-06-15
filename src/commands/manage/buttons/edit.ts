import { ButtonBuilder, ButtonStyle, type ButtonInteraction } from "discord.js";
import { db } from "#/drizzle/index.ts";
import { createComponentId } from "#/utils/componentId.ts";
import EditModal from "../modals/edit.ts";

export default {
  data: (shortId: string) =>
    new ButtonBuilder()
      .setCustomId(createComponentId("manage", "edit", shortId))
      .setLabel("Edit")
      .setStyle(ButtonStyle.Primary),
  execute: async (interaction: ButtonInteraction, args: string[]) => {
    const shortId = parseInt(args[0]!, 10);

    const account = await db.query.accounts.findFirst({
      columns: {
        isPrivate: true,
        enableRedeem: true,
        enableSignin: true,
      },
      where: {
        dcid: interaction.user.id,
        shortId,
      },
    });

    if (!account) return;

    await interaction.showModal(
      EditModal.data(args[0]!, account.isPrivate, account.enableSignin, account.enableRedeem),
    );
  },
};
