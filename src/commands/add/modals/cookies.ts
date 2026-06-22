import {
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { UsersDB } from "#/drizzle/index.ts";
import { tx } from "#/i18n/index.ts";
import { errorContainer } from "#/ui/container.ts";
import { createComponentId } from "#/utils/componentId.ts";
import { getDefaultBinding, linkBindingAccounts } from "./shared.ts";

export default {
  data: new ModalBuilder()
    .setCustomId(createComponentId("add", "cookies"))
    .setTitle("Link with Cookie tokens")
    .addLabelComponents(
      new LabelBuilder()
        .setLabel("Cookies")
        .setDescription("Enter the copied cookies")
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("token")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("ACCOUNT_TOKEN=___; ssxmod_itna=___; ssxmod_itna2=___; ...etc")
            .setRequired(true),
        ),
    ),
  execute: async (interaction: ModalSubmitInteraction) => {
    await interaction.deferUpdate();
    const tokens = interaction.fields.getTextInputValue("token");

    const user = await UsersDB.findAccess(interaction.user.id);
    if (!user) return;

    const decoded = decodeURIComponent(tokens);
    const cookies = Object.fromEntries(
      decoded.split(/;\s*/).map((part) => {
        const i = part.indexOf("=");
        const key = part.slice(0, i);
        const value = part.slice(i + 1);
        return [key, value];
      }),
    );

    if (!cookies["ACCOUNT_TOKEN"] || !cookies["SK_OAUTH_CRED_KEY"] || !cookies["HG_INFO_KEY"]) {
      await interaction.editReply({
        components: [errorContainer({ desc: tx(user.lang, "error.invalidCookies") })],
        flags: [MessageFlags.IsComponentsV2],
      });
      return;
    }

    let hgInfo: { hgId?: string };
    try {
      hgInfo = JSON.parse(cookies["HG_INFO_KEY"]);
    } catch {
      await interaction.editReply({
        components: [errorContainer({ desc: tx(user.lang, "error.invalidCookies") })],
        flags: [MessageFlags.IsComponentsV2],
      });
      return;
    }

    if (!hgInfo.hgId) {
      await interaction.editReply({
        components: [errorContainer({ desc: tx(user.lang, "error.invalidCookies") })],
        flags: [MessageFlags.IsComponentsV2],
      });
      return;
    }

    const binding = await getDefaultBinding(cookies["ACCOUNT_TOKEN"]);
    if (!binding) {
      await interaction.editReply({
        components: [errorContainer({ desc: tx(user.lang, "error.fetchFailed") })],
        flags: [MessageFlags.IsComponentsV2],
      });
      return;
    }

    await linkBindingAccounts({
      interaction,
      user,
      bind: binding.bind,
      accountToken: cookies["ACCOUNT_TOKEN"],
      hgId: hgInfo.hgId,
      userId: binding.session.userId,
    });
  },
};
