import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "#/config.ts";
import { relations } from "./relations.ts";
import * as schema from "./schema.ts";

export const db = drizzle(config.database.url, { relations, schema });

export * from "./db/accounts.ts";
export * from "./db/users.ts";
export * from "./db/events.ts";
