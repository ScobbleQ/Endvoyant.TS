import { ContainerBuilder } from "discord.js";
import { db } from "#/drizzle/index.ts";

export async function buildLinkedSummaryContainer(dcid: string) {
  const accounts = await db.query.accounts.findMany({
    columns: {
      nickname: true,
      roleId: true,
      serverType: true,
    },
    where: {
      dcid: dcid,
    },
    with: {
      user: {
        columns: {
          lang: true,
        },
        where: {
          dcid: dcid,
        },
      },
    },
    orderBy: {
      isPrimary: "desc",
      addedOn: "asc",
    },
  });

  if (accounts.length === 0) return null;

  const accountList = accounts
    .map((a) => `- ${a.nickname} [${a.serverType}-\`${a.roleId}\`]`)
    .join("\n");

  const container = new ContainerBuilder()
    .addTextDisplayComponents((t) => t.setContent("## ▼// Linked Accounts"))
    .addSeparatorComponents((s) => s)
    .addTextDisplayComponents((t) => t.setContent(accountList));

  return container;
}
