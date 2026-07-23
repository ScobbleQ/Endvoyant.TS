import {
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  type ContainerBuilder,
  type StringSelectMenuInteraction,
} from "discord.js";
import { createComponentId } from "#/utils/componentId.ts";
import { accountsContainer } from "../components/accounts.ts";
import { communicationsContainer } from "../components/communications.ts";
import { overviewContainer } from "../components/overview.ts";
import { privacyContainer } from "../components/privacy.ts";

export default {
  data: (page: string) =>
    new StringSelectMenuBuilder()
      .setCustomId(createComponentId("settings", "selector"))
      .setPlaceholder("Select a settings category...")
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setEmoji("🏠")
          .setLabel("Overview")
          .setValue("overview")
          .setDescription("View your current settings overview.")
          .setDefault(page === "overview"),
        new StringSelectMenuOptionBuilder()
          .setEmoji("🔗")
          .setLabel("Manage Account(s)")
          .setValue("accounts")
          .setDescription("Manage your linked accounts and account settings.")
          .setDefault(page === "accounts"),
        new StringSelectMenuOptionBuilder()
          .setEmoji("🔔")
          .setLabel("Communication")
          .setValue("communications")
          .setDescription("Manage your communication preferences.")
          .setDefault(page === "communications"),
        new StringSelectMenuOptionBuilder()
          .setEmoji("🛡️")
          .setLabel("Privacy & Security")
          .setValue("privacy")
          .setDescription("Manage your privacy and security settings.")
          .setDefault(page === "privacy"),
      ),
  async execute(interaction: StringSelectMenuInteraction) {
    await interaction.deferUpdate();

    const containerMap = {
      overview: () => overviewContainer(interaction.user),
      accounts: () => accountsContainer(interaction.user.id),
      communications: () => communicationsContainer(interaction.user.id),
      privacy: () => privacyContainer(interaction.user.id),
    } satisfies Record<string, () => Promise<ContainerBuilder>>;

    type ContainerKeys = keyof typeof containerMap;
    const page = String(interaction.values[0]).toLowerCase() as ContainerKeys;
    const getContainer = containerMap[page] || containerMap["overview"];

    await interaction.editReply({
      components: [await getContainer()],
      flags: [MessageFlags.IsComponentsV2],
    });
  },
};
