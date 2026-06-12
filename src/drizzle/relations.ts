import { defineRelations } from "drizzle-orm";
import * as schema from "./schema.ts";

export const relations = defineRelations(schema, (r) => ({
  users: {
    accounts: r.many.accounts(),
    events: r.many.events(),
  },
  accounts: {
    user: r.one.users({
      from: r.accounts.dcid,
      to: r.users.dcid,
    }),
    events: r.many.events(),
    efAttemptedCodes: r.many.efAttemptedCodes(),
  },
  events: {
    user: r.one.users({
      from: r.events.dcid,
      to: r.users.dcid,
    }),
    account: r.one.accounts({
      from: r.events.aid,
      to: r.accounts.id,
    }),
  },
  efAttemptedCodes: {
    account: r.one.accounts({
      from: r.efAttemptedCodes.aid,
      to: r.accounts.id,
    }),
  },
}));
