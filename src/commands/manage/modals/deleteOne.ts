import {
  LabelBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
  MessageFlags,
} from "discord.js";
import { AccountsDB, UsersDB } from "#/drizzle/index.ts";
import { tx } from "#/i18n/index.ts";
import { successContainer } from "#/ui/container.ts";
import { createComponentId } from "#/utils/componentId.ts";
import { accountContainer } from "../components/account.ts";

export default {
  data: (shortId: string) =>
    new ModalBuilder()
      .setCustomId(createComponentId("manage", "deleteOne", shortId))
      .setTitle("Remove Account")
      .addLabelComponents(
        new LabelBuilder()
          .setLabel("To confirm, type REMOVE in the box below")
          .setTextInputComponent(
            new TextInputBuilder()
              .setCustomId("confirmation")
              .setStyle(TextInputStyle.Short)
              .setRequired(true),
          ),
      ),
  execute: async (interaction: ModalSubmitInteraction, args: string[]) => {
    const confirmation = interaction.fields.getTextInputValue("confirmation");
    if (confirmation.trim() !== "REMOVE") {
      await interaction.reply({
        content: "Account removal cancelled. You must type `REMOVE` to confirm.",
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    await interaction.deferUpdate();
    const shortId = parseInt(args[0]!, 10);
    await AccountsDB.deleteByShortId(interaction.user.id, shortId);

    const user = await UsersDB.findAccess(interaction.user.id);
    if (!user) return;

    const account = await AccountsDB.listForManage(interaction.user.id);

    await interaction.editReply({
      components: [accountContainer(user.isPremium, account)],
      flags: [MessageFlags.IsComponentsV2],
    });

    await interaction.followUp({
      components: [successContainer({ desc: tx(user.lang, "success.accountRemoved") })],
      flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
    });
  },
};
