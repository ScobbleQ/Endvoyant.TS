import {
  CheckboxBuilder,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  ModalSubmitInteraction,
} from "discord.js";
import { AccountsDB } from "#/drizzle/index.ts";
import { createComponentId } from "#/utils/componentId.ts";

type settingParams = {
  name: string;
  shortId: number;
  privacy: boolean;
  notif: boolean;
  signin: boolean;
  redeem: boolean;
};

export default {
  data: (params: settingParams) =>
    new ModalBuilder()
      .setCustomId(createComponentId("settings", "account-setting", params.shortId.toString()))
      .setTitle(`${params.name}'s Settings`)
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("Account Privacy")
          .setDescription("Hide your profile and activity from other users.")
          .setCheckboxComponent(
            new CheckboxBuilder().setCustomId("privacy").setDefault(params.privacy),
          ),
      )
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("Notification Settings")
          .setDescription("Control your notification preferences.")
          .setCheckboxComponent(
            new CheckboxBuilder().setCustomId("notifs").setDefault(params.notif),
          ),
      )
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("Sign-in Settings")
          .setDescription("Control your sign-in preferences.")
          .setCheckboxComponent(
            new CheckboxBuilder().setCustomId("signin").setDefault(params.signin),
          ),
      )
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("Redeem Settings")
          .setDescription("Control your redeem preferences.")
          .setCheckboxComponent(
            new CheckboxBuilder().setCustomId("redeem").setDefault(params.redeem),
          ),
      ),
  execute: async (interaction: ModalSubmitInteraction, args: string[]) => {
    const privacy = interaction.fields.getCheckbox("privacy");
    const notif = interaction.fields.getCheckbox("notifs");
    const signin = interaction.fields.getCheckbox("signin");
    const redeem = interaction.fields.getCheckbox("redeem");
    const shortId = parseInt(args[0]!, 10);

    try {
      await AccountsDB.updateByShortId(interaction.user.id, shortId, {
        isPrivate: privacy,
        enableNotif: notif,
        enableSignin: signin,
        enableRedeem: redeem,
      });

      await interaction.reply({
        content: "Account settings updated successfully.",
        flags: [MessageFlags.Ephemeral],
      });
    } catch (error) {
      console.error(`Failed to update account settings for ${interaction.user.id}:`, error);
    }
  },
};
