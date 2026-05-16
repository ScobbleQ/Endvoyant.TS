import { db } from "../index.ts";

export class UsersDB {
  static async getByDcid(dcid: string) {
    return await db.query.users.findFirst({
      where: {
        dcid,
      },
    });
  }
}
