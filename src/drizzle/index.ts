import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "#/config.ts";
import { relations } from "./relations.ts";

export const db = drizzle(config.database.url, { relations });

export * from "./db/accounts.ts";
export * from "./db/users.ts";
export * from "./db/events.ts";
