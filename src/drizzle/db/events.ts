import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { events } from "../schema.js";

export class EventsDB {
  static async create(
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

  static async update(eid: number) {
    await db.update(events).set({}).where(eq(events.id, eid));
  }

  static async getUserEvents(dcid: string, opt: { limit?: number; offset?: number } = {}) {
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
