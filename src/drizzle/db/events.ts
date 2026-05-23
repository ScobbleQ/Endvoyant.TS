import { eq } from "drizzle-orm";
import { db } from "../index.ts";
import { events } from "../schema.ts";

export class EventsDB {
  static async insert(
    dcid: string,
    {
      source,
      action,
      metadata,
      aid,
    }: {
      source: "slash" | "button" | "modal" | "select" | "cron";
      action: string;
      metadata?: Record<string, unknown>;
      aid?: string | null;
    },
  ) {
    return await db
      .insert(events)
      .values({
        dcid,
        source,
        action,
        metadata,
        aid,
      })
      .returning({ id: events.id });
  }

  static async updateById(eid: number) {
    await db.update(events).set({}).where(eq(events.id, eid));
  }

  static async listByDcid(dcid: string, opt: { limit?: number; offset?: number } = {}) {
    return await db.query.events.findMany({
      where: {
        dcid,
      },
      orderBy: {
        createdAt: "desc",
      },
      limit: opt.limit,
      offset: opt.offset,
    });
  }
}
