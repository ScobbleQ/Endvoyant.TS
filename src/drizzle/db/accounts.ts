import { eq, sql } from "drizzle-orm";
import { db } from "../index.ts";
import { accounts } from "../schema.ts";

type Account = typeof accounts.$inferSelect;
type AccountColumn = keyof Account;
type AccountPatch = Partial<typeof accounts.$inferInsert>;
type PickAccount<T extends readonly AccountColumn[]> = T extends readonly []
  ? { dcid: string }
  : { dcid: string } & Pick<Account, T[number]>;

export class AccountsDB {
  static async insert(dcid: string, data: Omit<typeof accounts.$inferInsert, "dcid" | "shortId">) {
    return await db
      .insert(accounts)
      .values({
        dcid,
        shortId: sql`(SELECT COALESCE(MAX(${accounts.shortId}), 0) + 1 FROM ${accounts} WHERE ${accounts.dcid} = ${dcid})`,
        ...data,
      })
      .returning({ id: accounts.id });
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

  static async countByDcid(dcid: string) {
    return await db.$count(accounts, eq(accounts.dcid, dcid));
  }
}
