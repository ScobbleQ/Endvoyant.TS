import { sql } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  uuid,
  text,
  bigint,
  timestamp,
  smallint,
  jsonb,
  boolean,
  uniqueIndex,
  foreignKey,
  primaryKey,
  unique,
} from "drizzle-orm/pg-core";

export const langEnum = pgEnum("langEnum", [
  "de-de",
  "en-us",
  "es-mx",
  "fr-fr",
  "id-id",
  "it-it",
  "ja-jp",
  "ko-kr",
  "pt-br",
  "ru-ru",
  "th-th",
  "vi-vn",
  "zh-cn",
  "zh-tw",
]);

export const accounts = pgTable.withRLS(
  "accounts",
  {
    id: uuid().defaultRandom().primaryKey(),
    dcid: text()
      .notNull()
      .references(() => users.dcid, { onDelete: "cascade", onUpdate: "cascade" }),
    addedOn: timestamp("added_on", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    nickname: text().notNull(),
    accountToken: text("account_token").notNull(),
    hgId: text("hg_id").notNull(),
    userId: text("user_id").notNull(),
    roleId: text("role_id").notNull(),
    channelId: text("channel_id").notNull(),
    serverType: text("server_type").notNull(),
    serverId: text("server_id").notNull(),
    serverName: text("server_name").notNull(),
    isPrivate: boolean("is_private").default(false).notNull(),
    enableNotif: boolean("enable_notif").default(true).notNull(),
    enableSignin: boolean("enable_signin").default(true).notNull(),
    enableRedeem: boolean("enable_redeem").default(true).notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    shortId: smallint("short_id").default(1).notNull(),
  },
  (table) => [
    uniqueIndex("accounts_one_primary_per_user")
      .using("btree", table.dcid.asc().nullsLast())
      .where(sql`is_primary`),
    unique("accounts_dcid_short_id_key").on(table.dcid, table.shortId),
  ],
);

export const efAttemptedCodes = pgTable.withRLS(
  "ef_attempted_codes",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    aid: uuid()
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade", onUpdate: "cascade" }),
    code: text().notNull(),
    attemptedAt: timestamp("attempted_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    status: smallint().notNull(),
    lastAttemptedAt: timestamp("last_attempted_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => [unique("ef_attempted_codes_aid_code_key").on(table.aid, table.code)],
);

export const efCodes = pgTable.withRLS(
  "ef_codes",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    code: text().notNull(),
    rewards: text().array(),
    notes: text().array(),
  },
  (table) => [unique("ef_codes_code_key").on(table.code)],
);

export const events = pgTable.withRLS("events", {
  id: bigint({ mode: "number" })
    .primaryKey()
    .generatedByDefaultAsIdentity({ name: "event_id_seq" }),
  dcid: text()
    .notNull()
    .references(() => users.dcid, { onDelete: "cascade", onUpdate: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
  source: text().notNull(),
  action: text().notNull(),
  metadata: jsonb(),
  aid: uuid().references(() => accounts.id, { onDelete: "cascade", onUpdate: "cascade" }),
});

export const users = pgTable.withRLS("users", {
  dcid: text().primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
  isBanned: boolean("is_banned").default(false).notNull(),
  enableNotif: boolean("enable_notif").default(true).notNull(),
  isPrivate: boolean("is_private").default(false).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
  lang: langEnum().default("en-us").notNull(),
});
