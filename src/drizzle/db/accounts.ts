import { eq, sql, and } from "drizzle-orm";
import { accounts, users } from "../schema.ts";
import { db } from "./client.ts";

export type Account = typeof accounts.$inferSelect;
export type ManageAccount = Pick<
  Account,
  "isPrimary" | "nickname" | "roleId" | "serverName" | "shortId"
>;
type AccountPatch = Partial<typeof accounts.$inferInsert>;

export class AccountsDB {
  static async deleteByShortId(dcid: string, shortId: number) {
    await db.transaction(async (tx) => {
      // Get the account to be deleted
      const account = await tx.query.accounts.findFirst({
        columns: {
          id: true,
          isPrimary: true,
        },
        where: {
          dcid,
          shortId,
        },
      });

      if (!account) return;
      await tx.delete(accounts).where(eq(accounts.id, account.id));

      // If deleted account was primary, get the replacement (lowest shortId)
      if (!account.isPrimary) return;
      const replacement = await tx.query.accounts.findFirst({
        columns: {
          id: true,
        },
        where: {
          dcid,
        },
        orderBy: {
          shortId: "asc",
        },
      });

      if (!replacement) return;
      await tx.update(accounts).set({ isPrimary: true }).where(eq(accounts.id, replacement.id));
    });
  }

  static async createForUser(
    dcid: string,
    data: Omit<typeof accounts.$inferInsert, "dcid" | "shortId">,
  ) {
    await db.transaction(async (tx) => {
      await tx.execute(sql`
        SELECT 1
        FROM ${users}
        WHERE ${users.dcid} = ${dcid}
        FOR UPDATE
      `);
      await tx.insert(accounts).values({
        dcid,
        shortId: sql`(
          SELECT COALESCE(MAX(${accounts.shortId}), 0) + 1
          FROM ${accounts}
          WHERE ${accounts.dcid} = ${dcid}
        )`,
        ...data,
      });
    });
  }

  static async listForManage(dcid: string): Promise<ManageAccount[]> {
    return await db.query.accounts.findMany({
      columns: {
        isPrimary: true,
        nickname: true,
        roleId: true,
        serverName: true,
        shortId: true,
      },
      where: {
        dcid,
      },
      orderBy: {
        isPrimary: "desc",
        shortId: "asc",
      },
    });
  }

  static async updateByAccountId(id: Account["id"], patch: AccountPatch) {
    if (Object.keys(patch).length === 0) return;
    await db.update(accounts).set(patch).where(eq(accounts.id, id));
  }

  static async updateByShortId(dcid: string, shortId: number, patch: AccountPatch) {
    if (Object.keys(patch).length === 0) return;
    await db
      .update(accounts)
      .set(patch)
      .where(and(eq(accounts.dcid, dcid), eq(accounts.shortId, shortId)));
  }

  static async findBindingOwner(hgId: string, roleId: string, serverId: string) {
    const res = await db.query.accounts.findFirst({
      columns: {
        dcid: true,
      },
      where: {
        hgId,
        roleId,
        serverId,
      },
    });

    return { exists: res !== undefined, dcid: res?.dcid };
  }

  static async setPrimary(dcid: string, shortId: number) {
    await db.transaction(async (tx) => {
      await tx.update(accounts).set({ isPrimary: false }).where(eq(accounts.dcid, dcid));

      const target = await tx.query.accounts.findFirst({
        columns: {
          id: true,
        },
        where: {
          dcid,
          shortId,
        },
      });

      if (target) {
        await tx.update(accounts).set({ isPrimary: true }).where(eq(accounts.id, target.id));
      }
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
      },
      where: {
        dcid: targetId,
      },
      orderBy: {
        isPrimary: "desc",
        shortId: "asc",
      },
    });
  }
}
