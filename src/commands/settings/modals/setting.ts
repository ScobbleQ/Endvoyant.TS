import {
  LabelBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  StringSelectMenuBuilder,
  CheckboxBuilder,
  MessageFlags,
} from "discord.js";
import { UsersDB } from "#/drizzle/index.ts";
import { tx, Language, type Locale } from "#/i18n/index.ts";
import { successContainer, errorContainer } from "#/ui/container.ts";
import { createComponentId } from "#/utils/componentId.ts";

type settingParams = {
  curLang: Locale;
  curPrivacy: boolean;
  curNotif: boolean;
  curReminder: boolean;
  curData: boolean;
};

export default {
  data: ({ curLang, curPrivacy, curNotif, curReminder, curData }: settingParams) =>
    new ModalBuilder()
      .setCustomId(createComponentId("settings", "setting"))
      .setTitle("Account Settings")
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("Preferred Language")
          .setDescription("Select the language used for bot messages.")
          .setStringSelectMenuComponent(
            new StringSelectMenuBuilder().setCustomId("language").addOptions(
              Object.values(Language).map((lang) => ({
                label: tx(lang, "lang") as string,
                value: lang,
                default: lang === curLang,
              })),
            ),
          ),
      )
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("Account Privacy")
          .setDescription("Hide your profile and activity from other users.")
          .setCheckboxComponent(
            new CheckboxBuilder().setCustomId("accountPrivacy").setDefault(curPrivacy),
          ),
      )
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("Notifications")
          .setDescription("Receive updates when automated tasks are completed.")
          .setCheckboxComponent(
            new CheckboxBuilder().setCustomId("notifications").setDefault(curNotif),
          ),
      )
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("Reminders")
          .setDescription("Receive alerts when resources or activities need attention.")
          .setCheckboxComponent(
            new CheckboxBuilder().setCustomId("reminders").setDefault(curReminder),
          ),
      )
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("Data Collection")
          .setDescription("Allow Endvoyant to generate personalized stats and improve features.")
          .setCheckboxComponent(
            new CheckboxBuilder().setCustomId("dataSharing").setDefault(curData),
          ),
      ),
  execute: async (interaction: ModalSubmitInteraction) => {
    const selectedLang = interaction.fields.getStringSelectValues("language")[0] as Locale;
    const selectedPrivacy = interaction.fields.getCheckbox("accountPrivacy");
    const selectedNotif = interaction.fields.getCheckbox("notifications");
    const selectedReminder = interaction.fields.getCheckbox("reminders");
    const selectedData = interaction.fields.getCheckbox("dataSharing");

    try {
      await UsersDB.updateByDcid(interaction.user.id, {
        lang: selectedLang,
        isPrivate: selectedPrivacy,
        enableNotif: selectedNotif,
        enableReminder: selectedReminder,
        allowData: selectedData,
      });

      await interaction.reply({
        components: [successContainer({ desc: tx(selectedLang, "success.settingsSaved") })],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
    } catch {
      await interaction.reply({
        components: [errorContainer({ desc: tx(selectedLang, "error.settingsFailed") })],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
    }
  },
};
