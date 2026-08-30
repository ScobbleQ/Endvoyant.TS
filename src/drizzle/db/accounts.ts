import { and, eq, sql } from "drizzle-orm";
import { generateKey } from "#/utils/generateKey.ts";
import { accounts, users } from "../schema.ts";
import { db } from "./client.ts";

type Account = typeof accounts.$inferSelect;

export class AccountsDB {
  static async delete(dcid: string, accountKey: string) {
    await db.transaction(async (tx) => {
      await tx.execute(sql`
        SELECT 1
        FROM ${users}
        WHERE ${users.dcid} = ${dcid}
        FOR UPDATE
      `);

      const account = await tx.query.accounts.findFirst({
        columns: { id: true, isPrimary: true },
        where: { dcid, accountKey },
      });

      if (!account) return;
      await tx.delete(accounts).where(eq(accounts.id, account.id));

      if (!account.isPrimary) return;
      const replacement = await tx.query.accounts.findFirst({
        columns: { id: true },
        where: { dcid },
        orderBy: { addedOn: "asc" },
      });

      if (!replacement) return;
      await tx.update(accounts).set({ isPrimary: true }).where(eq(accounts.id, replacement.id));
    });
  }

  static async create(
    dcid: string,
    data: Omit<typeof accounts.$inferInsert, "dcid" | "isPrimary" | "accountKey">,
  ) {
    await db.transaction(async (tx) => {
      await tx.execute(sql`
        SELECT 1
        FROM ${users}
        WHERE ${users.dcid} = ${dcid}
        FOR UPDATE
      `);

      const existing = await tx.query.accounts.findFirst({
        columns: { id: true },
        where: { dcid },
      });

      await tx.insert(accounts).values({
        dcid,
        accountKey: generateKey(6),
        isPrimary: !existing,
        ...data,
      });
    });
  }

  static async listForManage(dcid: string) {
    return await db.query.accounts.findMany({
      columns: {
        isPrimary: true,
        nickname: true,
        roleId: true,
        serverName: true,
        accountKey: true,
      },
      where: { dcid },
      orderBy: { isPrimary: "desc", addedOn: "asc" },
    });
  }

  static async updateByAccountId(id: Account["id"], patch: Partial<Account>) {
    if (Object.keys(patch).length === 0) return;
    await db.update(accounts).set(patch).where(eq(accounts.id, id));
  }

  static async updateWithAccountKey(dcid: string, accountKey: string, patch: Partial<Account>) {
    if (Object.keys(patch).length === 0) return;
    await db
      .update(accounts)
      .set(patch)
      .where(and(eq(accounts.dcid, dcid), eq(accounts.accountKey, accountKey)));
  }

  static async findBindingOwner(hgId: string, roleId: string, serverId: string) {
    const res = await db.query.accounts.findFirst({
      columns: { dcid: true },
      where: { hgId, roleId, serverId },
    });

    return { exists: res !== undefined, dcid: res?.dcid };
  }

  static async setPrimary(dcid: string, accountKey: string) {
    await db.transaction(async (tx) => {
      await tx.update(accounts).set({ isPrimary: false }).where(eq(accounts.dcid, dcid));

      const target = await tx.query.accounts.findFirst({
        columns: { id: true },
        where: { dcid, accountKey },
      });

      if (!target) return;
      await tx.update(accounts).set({ isPrimary: true }).where(eq(accounts.id, target.id));
    });
  }

  static async countByDcid(dcid: string) {
    return await db.$count(accounts, eq(accounts.dcid, dcid));
  }

  static async listByDcid(targetId: string | undefined) {
    return await db.query.accounts.findMany({
      columns: {
        id: true,
        dcid: true,
        nickname: true,
        roleId: true,
        serverId: true,
        isPrivate: true,
        accountKey: true,
      },
      where: { dcid: targetId },
      orderBy: { isPrimary: "desc", addedOn: "asc" },
    });
  }
}
