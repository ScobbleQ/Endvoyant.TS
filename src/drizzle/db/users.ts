import { eq } from "drizzle-orm";
import { db } from "../index.ts";
import { users } from "../schema.ts";

export class UsersDB {
  static async insert(dcid: string) {
    await db.insert(users).values({ dcid });
  }

  static async delete(dcid: string) {
    await db.delete(users).where(eq(users.dcid, dcid));
  }

  static async listAll() {
    return await db.query.users.findMany({
      columns: {
        dcid: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findByDcid(dcid: string) {
    return await db.query.users.findFirst({
      where: {
        dcid,
      },
    });
  }
}
