import { eq, sql } from "drizzle-orm";
import { db } from "../index.js";
import { accounts } from "../schema.js";

export class AccountsDB {
  static async create(dcid: string, data: Omit<typeof accounts.$inferInsert, "dcid" | "shortId">) {
    const [next] = await db
      .select({ next: sql`COALESCE(MAX(${accounts.shortId}), 0) + 1` })
      .from(accounts)
      .where(eq(accounts.dcid, dcid));

    const shortId = Number(next?.next ?? 1);
    return await db
      .insert(accounts)
      .values({
        dcid,
        shortId,
        ...data,
      })
      .returning({ id: accounts.id });
  }

  static async getByDcid(dcid: string) {
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
}
