import { AccountsDB } from "#/drizzle/index.ts";
import { sdk } from "#/globals/sdk.ts";
import { logger } from "#/utils/logger.ts";

export async function refreshAccountToken(account: {
  id: string;
  hgId: string;
  accountToken: string;
}) {
  try {
    const session = await sdk.credentials.createSession({ accountToken: account.accountToken });
    if (!session) return;

    const refreshedToken = await sdk.credentials.rotateAccountToken(
      account.accountToken,
      session.token,
      account.hgId,
    );

    if (refreshedToken.code !== 0) return;

    await AccountsDB.updateByAccountId(account.id, { accountToken: refreshedToken.data.token });
  } catch {
    logger.error({ accountId: account.id }, "Failed to refresh account token");
  }
}
