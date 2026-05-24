import pLimit from "p-limit";
import { AccountsDB } from "#/drizzle/index.ts";
import { EndfieldSDK } from "#/packages/EndfieldSDK/index.ts";

export async function refreshTokens() {
  // Random delay between 0 and 55 minutes
  const delay = Math.floor(Math.random() * 56) * 60 * 1000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const sdk = new EndfieldSDK();
  const users = await AccountsDB.listAll(["accountToken"]);

  const limit = pLimit(10);
  const task = users.map((user) =>
    limit(async () => {
      try {
        // Create a session with existing token
        const session = await sdk.createSkportSession({ accountToken: user.accountToken });
        if (!session) return;

        // Refresh the token
        const refreshedToken = await sdk.refreshAccountToken(session);
        if (refreshedToken.code !== 0) return;

        // Update the token
        await AccountsDB.update(user.dcid, { accountToken: refreshedToken.data.token });
      } catch (error) {
        console.error(`Failed to refresh token for ${user.dcid}:`, error);
      }
    }),
  );

  await Promise.allSettled(task);
}
