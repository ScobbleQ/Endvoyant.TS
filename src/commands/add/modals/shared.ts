import {
  ContainerBuilder,
  DiscordAPIError,
  MessageFlags,
  type ModalSubmitInteraction,
} from "discord.js";
import type { PlayerBindingsResponse } from "#/packages/EndfieldSDK/types/auth.ts";
import { config } from "#/config.ts";
import { AccountsDB, type UsersDB } from "#/drizzle/index.ts";
import EndfieldSDK from "#/packages/EndfieldSDK/index.ts";
import { errorContainer, warnContainer } from "#/ui/container.ts";
import { sendUpdatedLinkedPins } from "#/utils/updatePins.ts";

type UserAccess = NonNullable<Awaited<ReturnType<typeof UsersDB.findAccess>>>;
type Binding = PlayerBindingsResponse["data"]["list"][number]["bindingList"][number];
type Role = Binding["roles"][number];

interface RoleSummary {
  nickname: string;
  serverName: string;
}

interface FailedRoleSummary extends RoleSummary {
  roleId: string;
  reason: "LinkedByUser" | "LinkedByOther" | "ExceedLimit";
}

interface LinkAccountsOptions {
  interaction: ModalSubmitInteraction;
  user: UserAccess;
  bind: Binding;
  accountToken: string;
  hgId: string;
  userId: string;
}

export async function getDefaultBinding(accountToken: string) {
  const session = await EndfieldSDK.createSkportSession({ accountToken });
  if (!session) return null;

  const bindings = await EndfieldSDK.fetchPlayerBindings({
    cred: session.cred,
    token: session.token,
  });

  if (bindings.code !== 0) return null;

  const efBinding = bindings.data.list.find((binding) => binding.appCode === "endfield");
  const bind =
    efBinding?.bindingList.find((binding) => binding.isDefault) ?? efBinding?.bindingList[0];
  if (!bind) return null;

  return { bind, session };
}

function addRoleSection(container: ContainerBuilder, title: string, roles: readonly RoleSummary[]) {
  if (roles.length === 0) return;

  container.addSeparatorComponents((separator) => separator);
  container.addTextDisplayComponents(
    (text) => text.setContent(`### ${title}`),
    (text) =>
      text.setContent(roles.map((role) => `- ${role.nickname} (${role.serverName})`).join("\n")),
  );
}

function buildLinkSummaryContainer(
  linkedRoles: readonly RoleSummary[],
  failedRoles: readonly FailedRoleSummary[],
) {
  const own = failedRoles.filter((role) => role.reason === "LinkedByUser");
  const other = failedRoles.filter((role) => role.reason === "LinkedByOther");
  const max = failedRoles.filter((role) => role.reason === "ExceedLimit");

  const summary = new ContainerBuilder().addTextDisplayComponents((text) =>
    text.setContent("# Account Linking Summary"),
  );

  addRoleSection(summary, `✅ Linked (${linkedRoles.length})`, linkedRoles);
  addRoleSection(summary, `⚠️ Already linked to you (${own.length})`, own);
  addRoleSection(summary, `❌ Linked to another Discord account (${other.length})`, other);
  addRoleSection(summary, `🚫 Skipped due to account limit (${max.length})`, max);

  return summary;
}

function addFailedRole(
  failedRoles: FailedRoleSummary[],
  role: Role,
  reason: FailedRoleSummary["reason"],
) {
  failedRoles.push({
    nickname: role.nickname,
    roleId: role.roleId,
    serverName: role.serverName,
    reason,
  });
}

export async function linkBindingAccounts({
  interaction,
  user,
  bind,
  accountToken,
  hgId,
  userId,
}: LinkAccountsOptions) {
  const linkedAmount = await AccountsDB.countByDcid(interaction.user.id);
  const rolesToLink: Role[] = [];
  const failedRoles: FailedRoleSummary[] = [];

  for (const role of bind.roles) {
    if (role.isBanned) continue;

    const existing = await AccountsDB.findBindingOwner(hgId, role.roleId, role.serverId);
    if (existing.exists) {
      addFailedRole(
        failedRoles,
        role,
        interaction.user.id === existing.dcid ? "LinkedByUser" : "LinkedByOther",
      );
      continue;
    }

    rolesToLink.push(role);
  }

  const availableSlots = user.isPremium
    ? Number.MAX_SAFE_INTEGER
    : Math.max(0, config.settings.maxAccountLinks - linkedAmount);
  const rolesToInsert = rolesToLink.slice(0, availableSlots);

  for (const role of rolesToLink.slice(availableSlots)) {
    addFailedRole(failedRoles, role, "ExceedLimit");
  }

  if (rolesToInsert.length === 0) {
    await interaction.editReply({
      components: [
        errorContainer({
          title: "Failed to Link Accounts",
          desc:
            failedRoles.length > 0
              ? "All available accounts were skipped due to already being linked or account limits. Check your pinned messages for a summary of linked accounts. Contact support if you believe this is an error."
              : "No valid accounts found to link.",
        }),
      ],
      flags: [MessageFlags.IsComponentsV2],
    });

    return;
  }

  let currentCount = linkedAmount;
  for (const role of rolesToInsert) {
    await AccountsDB.createForUser(interaction.user.id, {
      nickname: role.nickname,
      accountToken,
      hgId,
      userId,
      channelId: bind.channelMasterId,
      serverType: role.serverType,
      serverId: role.serverId,
      serverName: role.serverName,
      roleId: role.roleId,
      isPrimary: currentCount === 0,
    });

    currentCount++;
  }

  await interaction.editReply({
    components: [buildLinkSummaryContainer(rolesToInsert, failedRoles)],
    flags: [MessageFlags.IsComponentsV2],
  });

  try {
    await sendUpdatedLinkedPins(interaction);
  } catch (error) {
    await warnAboutDmFailure(interaction, error);
  }
}

async function warnAboutDmFailure(interaction: ModalSubmitInteraction, error: unknown) {
  if (!interaction.inGuild()) return;
  if (!(error instanceof DiscordAPIError)) return;

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
