import {
  MessageFlags,
  StringSelectMenuBuilder,
  type StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { createComponentId } from "#/utils/componentId.ts";
import { helpContainer } from "../components/help.ts";

export default {
  data: (page: string) =>
    new StringSelectMenuBuilder()
      .setCustomId(createComponentId("add", "help"))
      .setPlaceholder("Select a help topic...")
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("Common FAQs")
          .setValue("faqs")
          .setDefault(page === "faqs"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Getting SKPORT Cookies")
          .setValue("cookies")
          .setDefault(page === "cookies"),
      ),
  execute: async (interaction: StringSelectMenuInteraction) => {
    await interaction.update({
      components: [helpContainer(interaction.values[0])],
      flags: [MessageFlags.IsComponentsV2],
    });
  },
};
