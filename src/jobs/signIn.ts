import { ContainerBuilder, type Client } from "discord.js";
import PQueue from "p-queue";
import { db } from "#/drizzle/index.ts";
import { signInAccount, type SignInResult } from "#/services/signIn.ts";
import { logger } from "#/utils/logger.ts";
import type { Job } from "./types.ts";
import { sendJobNotification } from "./utils/notifications.ts";
import { paginate } from "./utils/paginate.ts";

export default {
  schedule: "5 12 * * *",
  timezone: "America/New_York",
  productionOnly: true,
  jitterMinutes: 55,
  execute: async (client: Client) => {
    const queue = new PQueue({ concurrency: 5 });
    for await (const users of paginate(
      (after, limit) =>
        db.query.users.findMany({
          columns: { dcid: true, lang: true, allowData: true, enableNotif: true },
          where: {
            isBanned: false,
            dcid: after ? { gt: after } : undefined,
            accounts: { enableSignin: true },
          },
          orderBy: { dcid: "asc" },
          limit,
        }),
      (user) => user.dcid,
    )) {
      await Promise.all(
        users.map((user) =>
          queue
            .add(async () => {
              const accounts = await db.query.accounts.findMany({
                columns: {
                  id: true,
                  nickname: true,
                  accountToken: true,
                  roleId: true,
                  serverId: true,
                  enableNotif: true,
                },
                where: { dcid: user.dcid, enableSignin: true, user: { isBanned: false } },
                orderBy: { id: "asc" },
              });

              const notifications: SignInResult[] = [];
              for (const account of accounts) {
                try {
                  const result = await signInAccount(user, account, "cron");
                  if (!result) {
                    logger.warn({ accountId: account.id }, "No sign-in result returned");
                    continue;
                  }
                  if (user.enableNotif && account.enableNotif) notifications.push(result);
                } catch {
                  logger.error({ accountId: account.id }, "Failed to sign in account");
                }
              }

              if (notifications.length === 0) return;

              await sendJobNotification(client, user.dcid, () => buildSignInMessage(notifications));
            })
            .catch(() => {
              // A failed user lookup must not prevent later user pages from running.
              logger.error({ userId: user.dcid }, "Failed to process automatic sign-in");
            }),
        ),
      );
    }
  },
} satisfies Job;

function buildSignInMessage(results: SignInResult[]) {
  const container = new ContainerBuilder().addTextDisplayComponents(
    (text) => text.setContent(`## ▼// Daily Signin`),
    (text) => text.setContent(`-# <t:${Math.floor(Date.now() / 1000)}:F>`),
  );

  for (const { account, code, message, rewards } of results) {
    const title = `### ${account.nickname} (${account.roleId})`;

    container.addSeparatorComponents((separator) => separator);
    if (code !== 0) {
      container.addTextDisplayComponents(
        (text) => text.setContent(title),
        (text) => text.setContent(message || `Sign-in failed (code ${code}).`),
      );
      continue;
    }

    const mainReward = rewards[0]!;
    const extraRewards = rewards.slice(1);

    container.addSectionComponents((section) => {
      section.addTextDisplayComponents(
        (t) => t.setContent(title),
        (t) => t.setContent(`${mainReward.name} x${mainReward.count}`),
      );

      if (extraRewards.length > 0) {
        const extraRewardText = extraRewards
          .map((reward) => `${reward.name} x${reward.count}`)
          .join("\n");
        section.addTextDisplayComponents((text) =>
          text.setContent(`Additional rewards:\n${extraRewardText}`),
        );
      }

      return section.setThumbnailAccessory((thumbnail) =>
        thumbnail.setURL(mainReward.icon).setDescription(mainReward.name),
      );
    });
  }

  return container;
}
