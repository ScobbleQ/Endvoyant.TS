import {
  LabelBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
  DiscordAPIError,
  MessageFlags,
} from "discord.js";
import { AccountsDB, UsersDB } from "#/drizzle/index.ts";
import { tx } from "#/i18n/index.ts";
import EndfieldSDK from "#/packages/EndfieldSDK/index.ts";
import { errorContainer, successContainer, warnContainer } from "#/ui/container.ts";
import { createComponentId } from "#/utils/componentId.ts";
import { maxAccountContainer } from "../components/maxAccount.ts";

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
        components: [errorContainer({ desc: tx(user.lang, "error.invalidCookies") })],
        flags: [MessageFlags.IsComponentsV2],
      });
      return;
    }

    const { hgId } = JSON.parse(cookies["HG_INFO_KEY"]);

    const sesh = await EndfieldSDK.createSkportSession({ accountToken: cookies["ACCOUNT_TOKEN"] });
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
            desc: isOwner
              ? tx(user.lang, "error.alreadyLinked.owner")
              : tx(user.lang, "error.alreadyLinked.other"),
          }),
        ],
        flags: [MessageFlags.IsComponentsV2],
      });
      return;
    }

    const linkedAmount = await AccountsDB.countByDcid(interaction.user.id);
    if (!user.isPremium && linkedAmount >= 3) {
      await interaction.editReply({
        components: [maxAccountContainer()],
        flags: [MessageFlags.IsComponentsV2],
      });
      return;
    }

    await AccountsDB.createForUser(interaction.user.id, {
      nickname: bind.defaultRole.nickname,
      accountToken: cookies["ACCOUNT_TOKEN"],
      hgId,
      userId: sesh.userId,
      channelId: bind.channelMasterId,
      serverType: bind.defaultRole.serverType,
      serverId: bind.defaultRole.serverId,
      serverName: bind.defaultRole.serverName,
      roleId: bind.defaultRole.roleId,
      isPrimary: linkedAmount === 0,
    });

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
