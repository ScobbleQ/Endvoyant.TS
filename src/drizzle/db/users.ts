import { eq } from "drizzle-orm";
import { users } from "../schema.ts";
import { db } from "./client.ts";

export class UsersDB {
  static async create(dcid: string) {
    await db.insert(users).values({ dcid });
  }

  static async updateByDcid(dcid: string, patch: Partial<typeof users.$inferInsert>) {
    await db.update(users).set(patch).where(eq(users.dcid, dcid));
  }

  static async findUser(dcid: string) {
    return await db.query.users.findFirst({
      columns: {
        isPrivate: true,
        enableNotif: true,
        enableReminder: true,
        allowData: true,
        lang: true,
      },
      where: {
        dcid,
      },
    });
  }

  static async findAccess(dcid: string) {
    return await db.query.users.findFirst({
      columns: {
        dcid: true,
        isBanned: true,
        isPrivate: true,
        isPremium: true,
        allowData: true,
        lang: true,
      },
      where: {
        dcid,
      },
    });
  }
}
