import { ButtonBuilder, ButtonStyle, type ButtonInteraction } from "discord.js";
import { db } from "#/drizzle/index.ts";
import { createComponentId } from "#/utils/componentId.ts";
import AccountSettingModal from "../modals/account-setting.ts";

export default {
  data: (accountKey: string) =>
    new ButtonBuilder()
      .setCustomId(createComponentId("settings", "edit-account", accountKey))
      .setLabel("Edit")
      .setStyle(ButtonStyle.Primary),
  execute: async (interaction: ButtonInteraction, args: string[]) => {
    const accountKey = args[0] as string;

    const account = await db.query.accounts.findFirst({
      columns: {
        nickname: true,
        isPrivate: true,
        enableRedeem: true,
        enableSignin: true,
        enableNotif: true,
      },
      where: { dcid: interaction.user.id, accountKey },
    });

    if (!account) return;

    await interaction.showModal(
      AccountSettingModal.data({
        accountKey,
        name: account.nickname,
        privacy: account.isPrivate,
        notif: account.enableNotif,
        signin: account.enableSignin,
        redeem: account.enableRedeem,
      }),
    );
  },
};
