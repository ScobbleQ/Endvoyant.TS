import { eq, sql, desc, asc, and } from "drizzle-orm";
import { db } from "../index.ts";
import { accounts, users } from "../schema.ts";

export type Account = typeof accounts.$inferSelect;
type AccountColumn = keyof Account;
type AccountPatch = Partial<typeof accounts.$inferInsert>;
type PickAccount<T extends readonly AccountColumn[]> = T extends readonly []
  ? { dcid: string }
  : { dcid: string } & Pick<Account, T[number]>;
type DeleteOptions =
  | { shortId: number; deleteAll?: never }
  | { shortId?: never; deleteAll: boolean };

export class AccountsDB {
  static async delete(dcid: string, options: DeleteOptions) {
    if (options.deleteAll) {
      await db.delete(accounts).where(eq(accounts.dcid, dcid));
    } else if (options.shortId !== undefined) {
      await db
        .delete(accounts)
        .where(and(eq(accounts.dcid, dcid), eq(accounts.shortId, options.shortId)));
    }
  }

  static async insert(dcid: string, data: Omit<typeof accounts.$inferInsert, "dcid" | "shortId">) {
    return await db
      .insert(accounts)
      .values({
        dcid,
        shortId: sql`(
          SELECT COALESCE(MAX(${accounts.shortId}), 0) + 1 
          FROM ${accounts} 
          WHERE ${accounts.dcid} = ${dcid}
        )`,
        ...data,
      })
      .returning({ id: accounts.id });
  }

  static async hasLinkedAccount(dcid: string) {
    const count = await db.$count(accounts, eq(accounts.dcid, dcid));
    return count > 0;
  }

  static async listByDcid(dcid: string) {
    return await db.query.accounts.findMany({
      where: {
        dcid,
      },
      orderBy: {
        isPrimary: "desc",
        shortId: "asc",
      },
    });
  }

  static async listAll<const T extends readonly AccountColumn[] = []>(
    columns?: T,
  ): Promise<PickAccount<T>[]> {
    const cols = columns ?? ([] as unknown as T);
    return (await db.query.accounts.findMany({
      columns: {
        dcid: true,
        ...Object.fromEntries(cols.map((col) => [col, true])),
      },
    })) as PickAccount<T>[];
  }

  static async update(dcid: string, patch: AccountPatch) {
    if (Object.keys(patch).length === 0) return;
    await db.update(accounts).set(patch).where(eq(accounts.dcid, dcid));
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

  static async byDcidAndShortId(dcid: string, shortId: number) {
    return await db.query.accounts.findFirst({
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

  static async withSigninEnabled() {
    const rows = await db
      .select({
        dcid: users.dcid,
        lang: users.lang,
        enableNotif: users.enableNotif,
        accountId: accounts.id,
        accountToken: accounts.accountToken,
        enableSignin: accounts.enableSignin,
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
      enableNotif: group[0]!.enableNotif,
      accounts: group.map(({ accountId, accountToken, enableSignin, roleId, serverId }) => ({
        accountId,
        accountToken,
        enableSignin,
        roleId,
        serverId,
      })),
    }));
  }
}
