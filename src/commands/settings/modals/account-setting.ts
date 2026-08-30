import { LabelBuilder, MessageFlags, ModalBuilder, ModalSubmitInteraction } from "discord.js";
import { AccountsDB } from "#/drizzle/index.ts";
import { createComponentId } from "#/utils/componentId.ts";

type settingParams = {
  accountKey: string;
  name: string;
  privacy: boolean;
  notif: boolean;
  signin: boolean;
  redeem: boolean;
};

export default {
  data: (params: settingParams) =>
    new ModalBuilder()
      .setCustomId(createComponentId("settings", "account-setting", params.accountKey))
      .setTitle(`${params.name}'s Settings`)
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("Profile Visibility")
          .setDescription("Choose whether your profile and activity are visible to other users.")
          .setRadioGroupComponent((radioGroup) =>
            radioGroup.setCustomId("privacy").addOptions([
              {
                label: "Private",
                value: "on",
                description: "Hide your profile and activity from other users.",
                default: params.privacy,
              },
              {
                label: "Public",
                value: "off",
                description: "Allow other users to see your profile and activity.",
                default: !params.privacy,
              },
            ]),
          ),
      )
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("Notification")
          .setDescription("Choose whether you want to receive notifications.")
          .setRadioGroupComponent((radioGroup) =>
            radioGroup.setCustomId("notif").addOptions([
              {
                label: "Enabled",
                value: "on",
                description: "Receive notifications about relevant activity.",
                default: params.notif,
              },
              {
                label: "Disabled",
                value: "off",
                description: "Stop receiving notifications.",
                default: !params.notif,
              },
            ]),
          ),
      )
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("Automatic Sign-in")
          .setDescription("Control your sign-in preferences.")
          .setRadioGroupComponent((radioGroup) =>
            radioGroup.setCustomId("signin").addOptions([
              {
                label: "Enabled",
                value: "on",
                description: "Automatically sign in when the app is opened.",
                default: params.signin,
              },
              {
                label: "Disabled",
                value: "off",
                description: "Require manual sign-in each time.",
                default: !params.signin,
              },
            ]),
          ),
      )
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("Automatic Code Redeem")
          .setDescription("Control your redeem preferences.")
          .setRadioGroupComponent((radioGroup) =>
            radioGroup.setCustomId("redeem").addOptions([
              {
                label: "Enabled",
                value: "on",
                description: "Automatically redeem codes when available.",
                default: params.redeem,
              },
              {
                label: "Disabled",
                value: "off",
                description: "Stop automatically redeeming codes.",
                default: !params.redeem,
              },
            ]),
          ),
      ),
  execute: async (interaction: ModalSubmitInteraction, args: string[]) => {
    const accountKey = args[0] as string;
    const [privacy, notif, signin, redeem] = [
      interaction.fields.getRadioGroup("privacy"),
      interaction.fields.getRadioGroup("notif"),
      interaction.fields.getRadioGroup("signin"),
      interaction.fields.getRadioGroup("redeem"),
    ];

    try {
      await AccountsDB.updateWithAccountKey(interaction.user.id, accountKey, {
        isPrivate: privacy === "on",
        enableNotif: notif === "on",
        enableSignin: signin === "on",
        enableRedeem: redeem === "on",
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
