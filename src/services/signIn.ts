import type { accounts, users } from "#/drizzle/schema.ts";
import type { SigninResponse } from "#/packages/EndfieldSDK/types/attendance.ts";
import { config } from "#/config.ts";
import { EventsDB } from "#/drizzle/index.ts";
import { sdk } from "#/globals/sdk.ts";

type User = Pick<typeof users.$inferSelect, "dcid" | "lang" | "allowData">;
type Account = Pick<
  typeof accounts.$inferSelect,
  "id" | "nickname" | "accountToken" | "roleId" | "serverId"
>;
export type SignInResult = NonNullable<Awaited<ReturnType<typeof signInAccount>>>;

export async function signInAccount(user: User, account: Account, source: "cron" | "slash") {
  const session = await sdk.credentials.createSession({
    accountToken: account.accountToken,
  });

  if (!session) return null;

  const result = await sdk.attendance.signIn({
    cred: session.cred,
    token: session.token,
    roleId: account.roleId,
    serverId: account.serverId,
    lang: user.lang,
  });

  if (!result) return null;

  const rewards = result.code === 0 ? getSignInRewards(result) : [];
  const mainReward = rewards[0];

  if (config.env === "production" && user.allowData && mainReward) {
    const bonusRewards = rewards.slice(1);

    void EventsDB.record(user.dcid, {
      source,
      action: "attendance",
      aid: account.id,
      metadata: {
        reward: {
          name: mainReward.name,
          count: String(mainReward.count),
          icon: mainReward.icon,
        },
        ...(bonusRewards.length > 0 && {
          bonus: bonusRewards.map((reward) => ({
            name: reward.name,
            count: String(reward.count),
            icon: reward.icon,
          })),
        }),
      },
    });
  }

  return {
    account: { id: account.id, nickname: account.nickname, roleId: account.roleId },
    code: result.code,
    message: result.message,
    rewards,
  };
}

function getSignInRewards(result: SigninResponse) {
  return (result.data?.awardIds ?? [])
    .map(({ id }) => result.data.resourceInfoMap?.[id])
    .filter(
      (reward): reward is NonNullable<typeof reward> =>
        reward != null &&
        typeof reward.name === "string" &&
        Number.isFinite(reward.count) &&
        typeof reward.icon === "string",
    );
}
