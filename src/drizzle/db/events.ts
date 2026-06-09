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
}
