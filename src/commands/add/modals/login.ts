import {
  DiscordAPIError,
  LabelBuilder,
  MessageFlags,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { AccountsDB, UsersDB } from "#/drizzle/index.ts";
import { tx } from "#/i18n/index.ts";
import EndfieldSDK from "#/packages/EndfieldSDK/index.ts";
import { container, errorContainer, successContainer, warnContainer } from "#/ui/container.ts";
import { createComponentId } from "#/utils/componentId.ts";
import { maxAccountContainer } from "../components/maxAccount.ts";

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

    const user = await UsersDB.findAccess(interaction.user.id);
    if (!user) {
      return;
    }

    await interaction.editReply({
      components: [container("Logging in...")],
      flags: [MessageFlags.IsComponentsV2],
    });

    const res = await EndfieldSDK.loginWithEmailPassword(email, password);
    if (res.status !== 0) {
      await interaction.editReply({
        components: [errorContainer({ title: "Login Failed", desc: res.msg })],
        flags: [MessageFlags.IsComponentsV2],
      });
      return;
    }

    await interaction.editReply({
      components: [successContainer({ desc: tx(user.lang, "success.loginSuccessful") })],
      flags: [MessageFlags.IsComponentsV2],
    });

    const sesh = await EndfieldSDK.createSkportSession({ accountToken: res.data.token });
    if (!sesh) {
      return;
    }

    const bindings = await EndfieldSDK.fetchPlayerBindings({ cred: sesh.cred, token: sesh.token });
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

    for (const role of bind.roles) {
      if (role.isBanned) continue;

      const existing = await AccountsDB.findBindingOwner(res.data.hgId, role.roleId, role.serverId);
      if (existing.exists) {
        const isOwner = interaction.user.id === existing.dcid;
        await interaction.editReply({
          components: [
            errorContainer({
              desc: isOwner
                ? tx(user.lang, "error.alreadyLinked.owner")
                : tx(user.lang, "error.alreadyLinked.other"),
            }),
          ],
          flags: [MessageFlags.IsComponentsV2],
        });
        return;
      }

      // Premium users have no limit, non-premium users have max of 3
      const linkedAmount = await AccountsDB.countByDcid(interaction.user.id);
      if (!user.isPremium && linkedAmount >= 3) {
        await interaction.editReply({
          components: [maxAccountContainer()],
          flags: [MessageFlags.IsComponentsV2],
        });
        return;
      }

      await AccountsDB.createForUser(interaction.user.id, {
        nickname: role.nickname,
        accountToken: res.data.token,
        hgId: res.data.hgId,
        userId: sesh.userId,
        channelId: bind.channelMasterId,
        serverType: role.serverType,
        serverId: role.serverId,
        serverName: role.serverName,
        roleId: role.roleId,
        isPrimary: linkedAmount === 0,
      });
    }

    await interaction.editReply({
      components: [successContainer({ desc: tx(user.lang, "success.accountsLinked") })],
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
      if (!(error instanceof DiscordAPIError)) return; // unknown error, just ignore
      if (error.code === 50007) {
        await interaction.followUp({
          components: [
            warnContainer({
              title: "Unable to Send DM",
              desc: "We were unable to send you a DM. Please check your DM settings if you want to receive notifications in the future.",
            }),
          ],
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
        });
      } else if (error.code === 50278) {
        await interaction.followUp({
          components: [
            warnContainer({
              title: "Unable to Send DM",
              desc: "We were unable to send you a DM. Your settings require a mutual server to send you DMs, but you don't share a server with the bot. Please change your DM settings or join a server with the bot.",
            }),
          ],
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
        });
      }
    }
  },
};
