import { db } from "../index.ts";
import { users } from "../schema.ts";

export class UsersDB {
  static async create(dcid: string) {
    await db.insert(users).values({ dcid });
  }

  static async getByDcid(dcid: string) {
    return await db.query.users.findFirst({
      where: {
        dcid,
      },
    });
  }
}
