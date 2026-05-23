import {
  DiscordAPIError,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { AccountsDB } from "#/drizzle/index.ts";
import { EndfieldSDK } from "#/packages/EndfieldSDK/index.ts";
import { createComponentId } from "#/utils/componentId.ts";

export default {
  data: new ModalBuilder()
    .setCustomId(createComponentId("add", "login"))
    .setTitle("Login with Email & Password")
    .addLabelComponents(
      new LabelBuilder()
        .setLabel("Email")
        .setDescription("Enter your email address")
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("email")
            .setStyle(TextInputStyle.Short)
            .setRequired(true),
        ),
      new LabelBuilder()
        .setLabel("Password")
        .setDescription("Enter your password")
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("password")
            .setStyle(TextInputStyle.Short)
            .setRequired(true),
        ),
    ),
  execute: async (interaction: ModalSubmitInteraction) => {
    await interaction.deferUpdate();
    const email = interaction.fields.getTextInputValue("email");
    const password = interaction.fields.getTextInputValue("password");

    await interaction.editReply({
      content: `Logging in...`,
    });

    const sdk = new EndfieldSDK();
    const res = await sdk.loginWithEmailPassword({ email, password });
    if (res.status !== 0) {
      await interaction.editReply({
        content: `Login failed: ${res.msg}`,
      });
      return;
    }

    await interaction.editReply({
      content: `Login successful! Fetching account data...`,
    });

    const sesh = await sdk.createSkportSession({ accountToken: res.data.token });
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
      res.data.hgId,
      bind.defaultRole.roleId,
      bind.defaultRole.serverId,
    );

    if (existing.exists) {
      const isOwner = interaction.user.id === existing.dcid;
      await interaction.editReply({
        content: isOwner ? "already linked" : `linked by ${existing.dcid}`,
      });
      return;
    }

    const amt = await AccountsDB.countByDcid(interaction.user.id);
    if (amt > 5) {
      await interaction.editReply({
        content: "already have max amount of accounts linked",
      });
      return;
    }

    await AccountsDB.insert(interaction.user.id, {
      nickname: bind.defaultRole.nickname,
      accountToken: res.data.token,
      hgId: res.data.hgId,
      userId: sesh.userId,
      channelId: bind.channelMasterId,
      serverType: bind.defaultRole.serverType,
      serverId: bind.defaultRole.serverId,
      serverName: bind.defaultRole.serverName,
      roleId: bind.defaultRole.roleId,
      isPrimary: amt === 0,
    });

    await interaction.editReply({
      content: "done",
    });

    try {
      await interaction.user.send({
        content: "test",
      });
    } catch (error) {
      if (!interaction.inGuild()) return; // theres nothing we can do
      if (error instanceof DiscordAPIError && error.code === 50007) {
        await interaction.followUp({
          content: "yo you gotta enable perms for notifications",
          flags: [MessageFlags.Ephemeral],
        });
      }
    }
  },
};
