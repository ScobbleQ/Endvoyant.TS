import { ContainerBuilder, type Client } from "discord.js";
import { setTimeout as delay } from "node:timers/promises";
import PQueue from "p-queue";
import type { accounts, efCodes, users } from "#/drizzle/schema.ts";
import { db } from "#/drizzle/index.ts";
import { createRedemptionSession, redeemCode } from "#/services/redeem.ts";
import { logger } from "#/utils/logger.ts";
import type { Job } from "./types.ts";
import { sendJobNotification } from "./utils/notifications.ts";
import { paginate } from "./utils/paginate.ts";

type RedemptionCode = Pick<typeof efCodes.$inferSelect, "code" | "rewards">;
type User = Pick<typeof users.$inferSelect, "dcid" | "allowData" | "enableNotif">;
type Account = Pick<
  typeof accounts.$inferSelect,
  "id" | "nickname" | "roleId" | "accountToken" | "channelId" | "serverId" | "enableNotif"
>;

type AccountRedemptionResult = {
  account: Pick<Account, "nickname" | "roleId">;
  redeemedCodes: RedemptionCode[];
};

type RedemptionNotificationsByUser = Map<string, Map<string, AccountRedemptionResult>>;

const REDEMPTION_DELAY_MS = 500;
const CODE_BATCH_SIZE = 10;

export default {
  schedule: "30 * * * *",
  timezone: "America/New_York",
  productionOnly: true,
  jitterMinutes: 30,
  execute: async (client: Client) => {
    const queue = new PQueue({ concurrency: 5 });
    const notificationsByUser: RedemptionNotificationsByUser = new Map();

    for await (const codes of paginate(
      (after, limit) =>
        db.query.efCodes.findMany({
          columns: { code: true, rewards: true },
          where: { isActive: true, code: after !== undefined ? { gt: after } : undefined },
          orderBy: { code: "asc" },
          limit,
        }),
      (row) => row.code,
      CODE_BATCH_SIZE,
    )) {
      await redeemCodeBatch(
        new Map(codes.map((row) => [row.code, row])),
        notificationsByUser,
        queue,
      );
    }

    // Send once per user after merging successes from every code batch.
    await Promise.all(
      [...notificationsByUser].map(([dcid, accountResults]) =>
        queue.add(() =>
          sendJobNotification(client, dcid, () =>
            buildRedemptionMessage([...accountResults.values()]),
          ),
        ),
      ),
    );
  },
} satisfies Job;

async function redeemCodeBatch(
  activeCodes: Map<string, RedemptionCode>,
  notificationsByUser: RedemptionNotificationsByUser,
  queue: PQueue,
) {
  for await (const accounts of paginate(
    (after, limit) =>
      db.query.accounts.findMany({
        columns: {
          id: true,
          nickname: true,
          roleId: true,
          accountToken: true,
          channelId: true,
          serverId: true,
          enableNotif: true,
        },
        with: { user: { columns: { dcid: true, allowData: true, enableNotif: true } } },
        where: {
          enableRedeem: true,
          user: { isBanned: false },
          id: after ? { gt: after } : undefined,
        },
        orderBy: { id: "asc" },
        limit,
      }),
    (account) => account.id,
  )) {
    if (activeCodes.size === 0) return;

    // Both successful and failed attempts are excluded from automatic redemption.
    const attempts = await db.query.efAttemptedCodes.findMany({
      columns: { aid: true, code: true },
      where: {
        aid: { in: accounts.map((account) => account.id) },
        code: { in: [...activeCodes.keys()] },
      },
    });

    const attemptedCodesByAccountId = new Map<string, Set<string>>();
    for (const attempt of attempts) {
      let codes = attemptedCodesByAccountId.get(attempt.aid);
      if (!codes) {
        codes = new Set();
        attemptedCodesByAccountId.set(attempt.aid, codes);
      }

      codes.add(attempt.code);
    }

    await Promise.all(
      accounts.map((account) =>
        queue.add(async () => {
          if (!account.user) return;

          try {
            const redeemedCodes = await redeemAccountCodes(
              account.user,
              account,
              activeCodes,
              attemptedCodesByAccountId.get(account.id),
            );

            if (!account.user.enableNotif || !account.enableNotif || redeemedCodes.length === 0)
              return;

            appendAccountRedemptions(
              notificationsByUser,
              account.user.dcid,
              account,
              redeemedCodes,
            );
          } catch {
            logger.error({ accountId: account.id }, "Failed to process automatic redemption");
          }
        }),
      ),
    );
  }
}

function appendAccountRedemptions(
  notificationsByUser: RedemptionNotificationsByUser,
  dcid: string,
  account: Account,
  redeemedCodes: RedemptionCode[],
) {
  let accountResults = notificationsByUser.get(dcid);
  if (!accountResults) {
    accountResults = new Map();
    notificationsByUser.set(dcid, accountResults);
  }

  const existingResult = accountResults.get(account.id);
  if (existingResult) {
    existingResult.redeemedCodes.push(...redeemedCodes);
  } else {
    accountResults.set(account.id, {
      account: { nickname: account.nickname, roleId: account.roleId },
      redeemedCodes,
    });
  }
}

async function redeemAccountCodes(
  user: User,
  account: Account,
  activeCodes: Map<string, RedemptionCode>,
  attemptedCodes: Set<string> | undefined,
): Promise<RedemptionCode[]> {
  const pendingCodes = [...activeCodes.values()].filter(({ code }) => !attemptedCodes?.has(code));
  if (pendingCodes.length === 0) return [];

  const sessionToken = await createRedemptionSession(account);
  if (!sessionToken) {
    logger.warn({ accountId: account.id }, "Unable to authenticate for redemption");
    return [];
  }

  const redeemedCodes: RedemptionCode[] = [];
  let hasAttemptedCode = false;
  for (const giftCode of pendingCodes) {
    const { code } = giftCode;
    // Another worker may have discovered that this code is expired.
    if (!activeCodes.has(code)) continue;

    if (hasAttemptedCode) await delay(REDEMPTION_DELAY_MS);

    // Recheck after yielding: another worker may have expired the code during the delay.
    if (!activeCodes.has(code)) continue;
    hasAttemptedCode = true;

    try {
      const result = await redeemCode(user, account, code, sessionToken, "cron");
      // Invalid or expired codes are removed for every worker in this batch.
      if (result.code === 11004) activeCodes.delete(code);
      if (result.code === 0) redeemedCodes.push(giftCode);
    } catch {
      logger.error({ accountId: account.id }, "Failed to redeem a code");
    }
  }

  return redeemedCodes;
}

function buildRedemptionMessage(accountResults: AccountRedemptionResult[]) {
  const container = new ContainerBuilder().addTextDisplayComponents(
    (text) => text.setContent("## ▼// Code Claimed"),
    (text) => text.setContent(`-# <t:${Math.floor(Date.now() / 1000)}:F>`),
  );

  for (const { account, redeemedCodes } of accountResults) {
    const codeText = redeemedCodes
      .map(({ code, rewards }) => {
        const rewardText = rewards?.filter((reward) => reward.trim().length > 0).join("\n⤷ ");
        return `\`${code}\`\n⤷ ${rewardText || "No reward details available."}`;
      })
      .join("\n");

    container.addSeparatorComponents((separator) => separator);
    container.addTextDisplayComponents(
      (text) => text.setContent(`### ${account.nickname} (${account.roleId})`),
      (text) => text.setContent(codeText),
    );
  }

  return container;
}
