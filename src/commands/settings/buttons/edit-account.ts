import { ButtonBuilder, ButtonStyle, type ButtonInteraction } from "discord.js";
import { db } from "#/drizzle/index.ts";
import { createComponentId } from "#/utils/componentId.ts";
import AccountSettingModal from "../modals/account-setting.ts";

export default {
  data: (shortId: string) =>
    new ButtonBuilder()
      .setCustomId(createComponentId("settings", "edit-account", shortId))
      .setLabel("Edit")
      .setStyle(ButtonStyle.Primary),
  execute: async (interaction: ButtonInteraction, args: string[]) => {
    const shortId = parseInt(args[0]!, 10);

    const account = await db.query.accounts.findFirst({
      columns: {
        nickname: true,
        isPrivate: true,
        enableRedeem: true,
        enableSignin: true,
        enableNotif: true,
      },
      where: {
        dcid: interaction.user.id,
        shortId,
      },
    });

    if (!account) return;

    await interaction.showModal(
      AccountSettingModal.data({
        name: account.nickname,
        shortId: shortId,
        privacy: account.isPrivate,
        notif: account.enableNotif,
        signin: account.enableSignin,
        redeem: account.enableRedeem,
      }),
    );
  },
};
