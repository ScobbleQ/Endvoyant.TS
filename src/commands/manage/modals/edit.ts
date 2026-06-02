import {
  LabelBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  TextDisplayBuilder,
  MessageFlags,
  CheckboxBuilder,
  RadioGroupBuilder,
} from "discord.js";
import { AccountsDB, UsersDB } from "#/drizzle/index.ts";
import { createComponentId } from "#/utils/componentId.ts";
import { accountContainer } from "../components/account.ts";

export default {
  data: (shortId: string, isPrivate: boolean, enableSignin: boolean, enableRedeem: boolean) => {
    return new ModalBuilder()
      .setCustomId(createComponentId("manage", "edit", shortId))
      .setTitle("Edit Account")
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("Account Visibility")
          .setDescription("Control whether this account appears on your public profile.")
          .setRadioGroupComponent(
            new RadioGroupBuilder().setCustomId("showOnProfile").addOptions(
              {
                label: "Public",
                value: "public",
                description: "Visible on your profile",
                default: isPrivate ? false : true,
              },
              {
                label: "Private",
                value: "private",
                description: "Only visible to you",
                default: isPrivate ? true : false,
              },
            ),
          ),
      )
      .addTextDisplayComponents(new TextDisplayBuilder().setContent("▬".repeat(25)))
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("Auto Check-in")
          .setDescription("Automatically perform the daily check-in for this account.")
          .setCheckboxComponent(
            new CheckboxBuilder().setCustomId("autoCheckin").setDefault(enableSignin),
          ),
        new LabelBuilder()
          .setLabel("Auto Redeem")
          .setDescription("Automatically redeem available rewards for this account.")
          .setCheckboxComponent(
            new CheckboxBuilder().setCustomId("autoRedeem").setDefault(enableRedeem),
          ),
      );
  },
  execute: async (interaction: ModalSubmitInteraction, args: string[]) => {
    await interaction.deferUpdate();
    const shortId = parseInt(args[0]!, 10);

    const showOnProfile = interaction.fields.getRadioGroup("showOnProfile");
    const autoCheckin = interaction.fields.getCheckbox("autoCheckin");
    const autoRedeem = interaction.fields.getCheckbox("autoRedeem");

    await AccountsDB.updateByShortId(interaction.user.id, shortId, {
      isPrivate: showOnProfile === "private",
      enableSignin: autoCheckin,
      enableRedeem: autoRedeem,
    });

    const user = await UsersDB.findByDcid(interaction.user.id);
    const account = await AccountsDB.listByDcid(interaction.user.id);

    await interaction.editReply({
      components: [accountContainer(user?.isPremium!, account)],
      flags: [MessageFlags.IsComponentsV2],
    });

    await interaction.followUp({
      content: "Account updated successfully.",
      flags: [MessageFlags.Ephemeral],
    });
  },
};
