import { db } from "../index.js";

export class UsersDB {
  static async getByDcid(dcid: string) {
    return await db.query.users.findFirst({
      where: {
        dcid,
      },
    });
  }
}
