import { type Client, DiscordAPIError, ContainerBuilder, MessageFlags } from "discord.js";
import pQueue from "p-queue";
import { config } from "#/config.ts";
import { AccountsDB, EventsDB } from "#/drizzle/index.ts";
import EndfieldSDK from "#/packages/EndfieldSDK/index.ts";

export async function dailySignin(client: Client) {
  // Random delay between 0 and 55 minutes
  const delay = Math.floor(Math.random() * 56) * 60 * 1000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const users = await AccountsDB.listForDailySignin();
  const userQueue = new pQueue({ concurrency: 10 });
  const accountQueue = new pQueue({ concurrency: 5 });

  for (const user of users) {
    void userQueue.add(async () => {
      try {
        if (!user.accounts?.length) return;

        const results = await Promise.allSettled(
          user.accounts.map((account) =>
            accountQueue.add(async () => {
              const session = await EndfieldSDK.createSkportSession({
                accountToken: account.accountToken,
              });

              if (!session) return null;

              const result = await EndfieldSDK.completeSignIn({
                cred: session.cred,
                token: session.token,
                roleId: account.roleId,
                serverId: account.serverId,
                lang: user.lang,
              });

              if (!result) return null;

              if (config.env === "production" && user.allowData && result.code === 0) {
                const rewards = result.data.awardIds.map((a) => result.data.resourceInfoMap[a.id]!);
                const main = rewards[0]!;
                const rest = rewards.slice(1);

                void EventsDB.record(user.dcid, {
                  source: "cron",
                  action: "attendance",
                  aid: account.id,
                  metadata: {
                    reward: {
                      name: main.name,
                      count: String(main.count),
                      icon: main.icon,
                    },
                    ...(rest.length > 0 && {
                      bonus: rest.map((r) => ({
                        name: r.name,
                        count: String(r.count),
                        icon: r.icon,
                      })),
                    }),
                  },
                });
              }

              return { account, result };
            }),
          ),
        );

        const settled = results.flatMap((r) =>
          r.status === "fulfilled" && r.value != null ? [r.value] : [],
        );

        if (!user.enableNotif) return;
        if (settled.length === 0) return;

        const container = new ContainerBuilder().addTextDisplayComponents(
          (txt) => txt.setContent(`## ▼// Daily Signin`),
          (txt) => txt.setContent(`-# <t:${Math.floor(Date.now() / 1000)}:F>`),
        );

        for (const { account, result } of settled) {
          if (result.code !== 0) {
            container
              .addSeparatorComponents((s) => s)
              .addTextDisplayComponents(
                (t) => t.setContent(`### ${account.nickname} (${account.roleId})`),
                (t) => t.setContent(result.message || "Failed to signin for unknown reason."),
              );
          } else {
            const rewards = result.data.awardIds.map((a) => result.data.resourceInfoMap[a.id]!);
            const mainReward = rewards[0]!;
            const extraRewards = rewards.slice(1);

            container
              .addSeparatorComponents((s) => s)
              .addSectionComponents((s) =>
                s
                  .addTextDisplayComponents(
                    (t) => t.setContent(`### ${account.nickname} (${account.roleId})`),
                    (t) => t.setContent(`${mainReward.name} x${mainReward.count}`),
                  )
                  .setThumbnailAccessory((a) =>
                    a.setURL(mainReward.icon).setDescription(mainReward.name),
                  ),
              );

            if (extraRewards.length > 0) {
              container.addTextDisplayComponents(
                (t) => t.setContent(`Bonus Rewards:`),
                (t) => t.setContent(extraRewards.map((r) => `- ${r.name} x${r.count}`).join("\n")),
              );
            }
          }
        }

        try {
          await client.users.send(user.dcid, {
            components: [container],
            flags: [MessageFlags.IsComponentsV2],
          });
        } catch (error) {
          if (error instanceof DiscordAPIError && error.code === 50007) {
            // Permission error
          }
        }
      } catch (error) {
        console.error(`Failed to process daily signin user ${user.dcid}:`, error);
      }
    });
  }

  await userQueue.onIdle();
}
