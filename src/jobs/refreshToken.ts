import pQueue from "p-queue";
import { AccountsDB, db } from "#/drizzle/index.ts";
import EndfieldSDK from "#/packages/EndfieldSDK/index.ts";

export async function refreshTokens() {
  // Random delay between 0 and 55 minutes
  const delay = Math.floor(Math.random() * 56) * 60 * 1000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const accounts = await db.query.accounts.findMany({
    columns: {
      id: true,
      dcid: true,
      accountToken: true,
      hgId: true,
    },
  });

  const queue = new pQueue({ concurrency: 10 });

  accounts.forEach((account) => {
    void queue.add(async () => {
      try {
        const session = await EndfieldSDK.createSkportSession({
          accountToken: account.accountToken,
        });

        if (!session) return;

        const refreshedToken = await EndfieldSDK.getAccountToken(
          account.accountToken,
          session.token,
          account.hgId,
        );
        if (refreshedToken.code !== 0) return;

        await AccountsDB.updateByAccountId(account.id, { accountToken: refreshedToken.data.token });
      } catch (error) {
        console.error(`Failed to refresh token for account ${account.id}:`, error);
      }
    });
  });

  await queue.onIdle();
}
