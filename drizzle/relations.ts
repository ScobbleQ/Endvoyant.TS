import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  accounts: {
    user: r.one.users({
      from: r.accounts.dcid,
      to: r.users.dcid,
      alias: "accounts_dcid_users_dcid",
    }),
    efAttemptedCodes: r.many.efAttemptedCodes(),
    users: r.many.users({
      alias: "users_dcid_accounts_id_via_events",
    }),
  },
  users: {
    accountsDcid: r.one.accounts({
      alias: "accounts_dcid_users_dcid",
    }),
    accountsViaEvents: r.many.accounts({
      from: r.users.dcid.through(r.events.dcid),
      to: r.accounts.id.through(r.events.aid),
      alias: "users_dcid_accounts_id_via_events",
    }),
  },
  efAttemptedCodes: {
    account: r.one.accounts({
      from: r.efAttemptedCodes.aid,
      to: r.accounts.id,
    }),
  },
}));
