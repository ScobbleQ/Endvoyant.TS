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

  users.forEach((user) => {
    void userQueue.add(async () => {
      try {
        if (!user.accounts || user.accounts.length === 0) return;

        let hasContent = false;
        const container = new ContainerBuilder().addTextDisplayComponents(
          (txt) => txt.setContent(`## ▼// ${t(user.lang, "signin.header")}`),
          (txt) => txt.setContent(`-# <t:${Math.floor(Date.now() / 1000)}:F>`),
        );

        const accountQueue = new pQueue({ concurrency: 5 });
        user.accounts.forEach((account) => {
          void accountQueue.add(async () => {
            try {
              const session = await EndfieldSDK.createSkportSession({
                accountToken: account.accountToken,
              });

              if (!session) return;

              const result = await EndfieldSDK.completeSignIn({
                cred: session.cred,
                token: session.token,
                roleId: account.roleId,
                serverId: account.serverId,
                lang: user.lang,
              });

              if (!result) return;

              if (config.env === "production" && user.allowData) {
                await EventsDB.record(user.dcid, {
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

              hasContent = true;
            } catch (error) {
              console.error(`Failed to sign in for ${user.dcid}.${account.roleId}:`, error);
            }
          });
        });

        await accountQueue.onIdle();

        if (!user.enableNotif) return;
        if (!hasContent) return;

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
  });

  await userQueue.onIdle();
}
