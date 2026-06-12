import { eq, sql, desc, asc, and } from "drizzle-orm";
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
    await db.delete(accounts).where(and(eq(accounts.dcid, dcid), eq(accounts.shortId, shortId)));
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

  static async listForTokenRefresh() {
    return await db.query.accounts.findMany({
      columns: {
        dcid: true,
        id: true,
        accountToken: true,
        hgId: true,
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

  static async findEditSettings(dcid: string, shortId: number) {
    return await db.query.accounts.findFirst({
      columns: {
        enableRedeem: true,
        enableSignin: true,
        isPrivate: true,
      },
      where: {
        dcid,
        shortId,
      },
    });
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

  static async findAccount(dcid: string, aid: string) {
    return await db.query.accounts.findFirst({
      columns: {
        id: true,
        nickname: true,
        roleId: true,
        serverId: true,
        accountToken: true,
      },
      where: {
        id: aid,
        dcid,
      },
    });
  }

  static async listByDcid(dcid: string) {
    return await db.query.accounts.findMany({
      columns: {
        id: true,
        nickname: true,
        roleId: true,
        serverId: true,
        accountToken: true,
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

  static async listForDailySignin() {
    const rows = await db
      .select({
        dcid: users.dcid,
        lang: users.lang,
        allowData: users.allowData,
        enableNotif: users.enableNotif,
        accountId: accounts.id,
        nickname: accounts.nickname,
        accountToken: accounts.accountToken,
        roleId: accounts.roleId,
        serverId: accounts.serverId,
      })
      .from(accounts)
      .innerJoin(users, eq(accounts.dcid, users.dcid))
      .where(eq(accounts.enableSignin, true))
      .orderBy(desc(accounts.isPrimary), asc(accounts.addedOn));

    return [...Map.groupBy(rows, (row) => row.dcid).values()].map((group) => ({
      dcid: group[0]!.dcid,
      lang: group[0]!.lang,
      allowData: group[0]!.allowData,
      enableNotif: group[0]!.enableNotif,
      accounts: group.map(({ accountId, nickname, accountToken, roleId, serverId }) => ({
        accountId,
        nickname,
        accountToken,
        roleId,
        serverId,
      })),
    }));
  }
}
