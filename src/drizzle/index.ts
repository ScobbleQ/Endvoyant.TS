import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "#/config.js";
import { relations } from "./relations.js";
import * as schema from "./schema.js";

export const db = drizzle(config.database.url, { relations, schema });
