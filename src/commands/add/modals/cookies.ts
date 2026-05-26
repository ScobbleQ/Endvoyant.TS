import {
  LabelBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
  DiscordAPIError,
  MessageFlags,
} from "discord.js";
import { errorContainer, successContainer, warnContainer } from "#/components/container.ts";
import { AccountsDB } from "#/drizzle/index.ts";
import { EndfieldSDK } from "#/packages/EndfieldSDK/index.ts";
import { createComponentId } from "#/utils/componentId.ts";

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

    // Decode the tokens
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
        components: [
          errorContainer({
            title: "Invalid Cookies",
            description: "Please ensure you have provided valid cookie tokens.",
          }),
        ],
        flags: [MessageFlags.IsComponentsV2],
      });
      return;
    }

    const { hgId } = JSON.parse(cookies["HG_INFO_KEY"]);

    const sdk = new EndfieldSDK();

    const sesh = await sdk.createSkportSession({ accountToken: cookies["ACCOUNT_TOKEN"] });
    if (!sesh) {
      return;
    }

    const bindings = await sdk.fetchPlayerBindings({ cred: sesh.cred, token: sesh.token });
    if (bindings.code !== 0) {
      return;
    }

    const efBinding = bindings.data.list.find((b) => b.appCode === "endfield");
    if (!efBinding) {
      return;
    }

    const bind = efBinding.bindingList.find((b) => b.isDefault) ?? efBinding.bindingList[0];
    if (!bind) {
      return;
    }

    if (bind.defaultRole.isBanned) {
      return;
    }

    const existing = await AccountsDB.findBindingOwner(
      hgId,
      bind.defaultRole.roleId,
      bind.defaultRole.serverId,
    );

    if (existing.exists) {
      const isOwner = interaction.user.id === existing.dcid;
      await interaction.editReply({
        components: [
          errorContainer({
            title: "Account Already Linked",
            description: isOwner
              ? "This account is already linked to your Discord."
              : "This account is already linked to another Discord account.",
          }),
        ],
        flags: [MessageFlags.IsComponentsV2],
      });
      return;
    }

    const amt = await AccountsDB.countByDcid(interaction.user.id);
    if (amt > 6) {
      await interaction.editReply({
        components: [
          errorContainer({
            title: "Maximum Accounts Linked",
            description: "You have already linked the maximum number of accounts.",
          }),
        ],
        flags: [MessageFlags.IsComponentsV2],
      });
      return;
    }

    await AccountsDB.insert(interaction.user.id, {
      nickname: bind.defaultRole.nickname,
      accountToken: cookies["ACCOUNT_TOKEN"],
      hgId,
      userId: sesh.userId,
      channelId: bind.channelMasterId,
      serverType: bind.defaultRole.serverType,
      serverId: bind.defaultRole.serverId,
      serverName: bind.defaultRole.serverName,
      roleId: bind.defaultRole.roleId,
      isPrimary: amt === 0,
    });

    await interaction.editReply({
      components: [
        successContainer({
          title: "Accounts Linked",
          description: "Your accounts have been successfully linked.",
        }),
      ],
      flags: [MessageFlags.IsComponentsV2],
    });

    try {
      const msg = await interaction.user.send({
        content: "test",
      });

      // Pin if possible
      if (msg) await msg.pin();
    } catch (error) {
      if (!interaction.inGuild()) return; // theres nothing we can do
      if (error instanceof DiscordAPIError && error.code === 50007) {
        await interaction.followUp({
          components: [
            warnContainer({
              title: "Unable to Send DM",
              description:
                "We were unable to send you a DM. Please enable permissions for notifications.",
            }),
          ],
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
        });
      }
    }
  },
};
