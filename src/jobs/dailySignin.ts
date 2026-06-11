import { type Client, DiscordAPIError, ContainerBuilder, MessageFlags } from "discord.js";
import pQueue from "p-queue";
import { config } from "#/config.ts";
import { AccountsDB, EventsDB } from "#/drizzle/index.ts";
import { t } from "#/i18n/index.ts";
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

              if (config.env === "production" && user.allowData) {
                void EventsDB.record(user.dcid, {
                  source: "cron",
                  action: "signin",
                  aid: account.accountId,
                  metadata: {
                    reward: {
                      name: "",
                      count: "",
                      icon: "",
                    },
                  },
                });
              }

              return result;
            }),
          ),
        );

        const succeeded = results.filter(
          (
            r,
          ): r is PromiseFulfilledResult<
            NonNullable<Awaited<ReturnType<typeof EndfieldSDK.completeSignIn>>>
          > => r.status === "fulfilled" && r.value != null,
        );

        if (!user.enableNotif) return;
        if (succeeded.length === 0) return;

        const container = new ContainerBuilder().addTextDisplayComponents(
          (txt) => txt.setContent(`## ▼// ${t(user.lang, "signin.header")}`),
          (txt) => txt.setContent(`-# <t:${Math.floor(Date.now() / 1000)}:F>`),
        );

        for (const _ of succeeded) {
          container
            .addSeparatorComponents((s) => s)
            .addSectionComponents((s) =>
              s
                .addTextDisplayComponents(
                  (txt) => txt.setContent(""),
                  (txt) => txt.setContent(""),
                )
                .setThumbnailAccessory((a) => a.setURL("")),
            );
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
