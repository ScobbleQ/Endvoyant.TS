import { events } from "../schema.ts";
import { db } from "./client.ts";

export class EventsDB {
  static async record(
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
    await db.insert(events).values({
      dcid,
      source,
      action,
      metadata,
      aid,
    });
  }

  static async listForExport(dcid: string, opt: { limit?: number; offset?: number } = {}) {
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
