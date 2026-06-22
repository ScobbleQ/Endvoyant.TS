import { ContainerBuilder } from "discord.js";
import type { ManageAccount } from "#/drizzle/db/accounts.ts";
import EditButton from "../buttons/edit.ts";
import PrimaryButton from "../buttons/primary.ts";
import RemoveButton from "../buttons/remove.ts";
import UnlinkButton from "../buttons/unlink.ts";

export function accountContainer(isPremium: boolean, accounts: ManageAccount[]) {
  if (accounts.length === 0) {
    return new ContainerBuilder().addTextDisplayComponents(
      (t) => t.setContent("## ▼// Linked Accounts"),
      (t) => t.setContent("You have no accounts linked."),
    );
  }

  const container = new ContainerBuilder().addSectionComponents((s) =>
    s
      .addTextDisplayComponents(
        (t) => t.setContent("## ▼// Linked Accounts"),
        (t) =>
          t.setContent(
            `You have linked **${accounts.length}** of **${isPremium ? "∞" : "3"}** accounts. Select one below to edit, set as primary, or remove.`,
          ),
      )
      .setButtonAccessory(UnlinkButton.data),
  );

  for (const account of accounts) {
    const isPrimary = account.isPrimary ? " (Primary)" : "";

    container.addSeparatorComponents((s) => s);
    container.addTextDisplayComponents(
      (t) => t.setContent(`### ${account.nickname}${isPrimary}`),
      (t) => t.setContent(`UID: ${account.roleId}\nServer: ${account.serverName}`),
    );
    container.addActionRowComponents((a) =>
      a.addComponents(
        EditButton.data(account.shortId.toString()),
        PrimaryButton.data(account.shortId.toString(), account.isPrimary),
        RemoveButton.data(account.shortId.toString()),
      ),
    );
  }

  return container;
}
