import pLimit from "p-limit";
import { AccountsDB } from "#/drizzle/index.ts";
import EndfieldSDK from "#/packages/EndfieldSDK/index.ts";

export async function refreshTokens() {
  // Random delay between 0 and 55 minutes
  const delay = Math.floor(Math.random() * 56) * 60 * 1000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const accounts = await AccountsDB.listForTokenRefresh();

  const limit = pLimit(10);
  const task = accounts.map((account) =>
    limit(async () => {
      try {
        // Create a session with existing token
        const session = await EndfieldSDK.createSkportSession({
          accountToken: account.accountToken,
        });

        if (!session) return;

        // Refresh the token
        const refreshedToken = await EndfieldSDK.refreshAccountToken(session);
        if (refreshedToken.code !== 0) return;

        // Update only the account that produced this token.
        await AccountsDB.updateByAccountId(account.id, { accountToken: refreshedToken.data.token });
      } catch (error) {
        console.error(`Failed to refresh token for ${account.dcid}:`, error);
      }
    }),
  );

  await Promise.allSettled(task);
}
