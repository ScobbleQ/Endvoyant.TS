import { ContainerBuilder, inlineCode } from "discord.js";
import { db } from "#/drizzle/index.ts";
import EditAccountButton from "../buttons/edit-account.ts";
import SetPrimaryButton from "../buttons/set-primary.ts";
import UnlinkAccountButton from "../buttons/unlink-account.ts";
import MenuSelector from "../selectmenus/selector.ts";

export async function accountsContainer(dcid: string) {
  const accounts = await db.query.accounts.findMany({
    columns: {
      shortId: true,
      addedOn: true,
      isPrimary: true,
      nickname: true,
      roleId: true,
      serverName: true,
    },
    where: {
      dcid,
    },
    orderBy: {
      isPrimary: "desc",
      addedOn: "asc",
    },
  });

  const container = new ContainerBuilder().addActionRowComponents((a) =>
    a.addComponents(MenuSelector.data("accounts")),
  );

  if (accounts.length === 0) {
    container.addTextDisplayComponents(
      (t) => t.setContent("### No Accounts Linked"),
      (t) => t.setContent("You currently have no accounts linked to your Discord account."),
    );
    return container;
  }

  for (const account of accounts) {
    const isPrimary = account.isPrimary ? " (Primary)" : "";

    container
      .addTextDisplayComponents(
        (t) => t.setContent(`### ${account.nickname}${isPrimary}`),
        (t) => t.setContent(`UID: ${inlineCode(account.roleId)}\nServer: ${account.serverName}`),
      )
      .addActionRowComponents((a) =>
        a.addComponents(
          EditAccountButton.data(account.shortId.toString()),
          SetPrimaryButton.data(account.shortId.toString(), account.isPrimary),
          UnlinkAccountButton.data(account.shortId.toString()),
        ),
      );
  }

  return container;
}
