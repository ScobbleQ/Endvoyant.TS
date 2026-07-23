import { ContainerBuilder, type BaseInteraction, type CacheType } from "discord.js";
import { db } from "#/drizzle/index.ts";
import { tx } from "#/i18n/index.ts";
import MenuSelector from "../selectmenus/selector.ts";

export async function overviewContainer(user: BaseInteraction<CacheType>["user"]) {
  const settings = await db.query.users.findFirst({
    columns: {
      createdAt: true,
      isPremium: true,
      lang: true,
    },
    where: {
      dcid: user.id,
    },
    with: {
      accounts: {
        columns: {
          enableSignin: true,
          enableRedeem: true,
        },
      },
    },
  });

  // This should never happen, but just in case, we handle it
  if (!settings) {
    return new ContainerBuilder()
      .addActionRowComponents((a) => a.addComponents(MenuSelector.data("overview")))
      .addTextDisplayComponents(
        (t) => t.setContent("### Error"),
        (t) => t.setContent("Unable to retrieve settings. Please try again later."),
      );
  }

  const total = settings.accounts.length;
  const signinCount = settings.accounts.filter((a) => a.enableSignin).length;
  const redeemCount = settings.accounts.filter((a) => a.enableRedeem).length;
  const createdAtTs = Math.floor(settings.createdAt.getTime() / 1000);

  const container = new ContainerBuilder()
    .addActionRowComponents((a) => a.addComponents(MenuSelector.data("overview")))
    .addTextDisplayComponents(
      (t) => t.setContent(`### ${user.username} - ${user.id}`),
      (t) =>
        t.setContent(
          [
            `**Member Since** <t:${createdAtTs}:f>`,
            `**Selected Language**: ${tx(settings.lang, "lang")}`,
            `**Premium**: ${settings.isPremium ? "Active ⭐" : "Free"}`,
            `**Accounts**: ${total} linked`,
          ].join("\n"),
        ),
    );

  if (total > 0) {
    container.addTextDisplayComponents((t) =>
      t.setContent(
        [
          `⚙️ Auto Sign-in: ${signinCount}/${total} enabled`,
          `⚙️ Auto Code Redeem: ${redeemCount}/${total} enabled`,
        ].join("\n"),
      ),
    );
  }

  return container;
}
