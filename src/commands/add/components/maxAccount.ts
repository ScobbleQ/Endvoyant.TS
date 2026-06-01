import { ContainerBuilder } from "discord.js";

export function maxAccountContainer() {
  return new ContainerBuilder().addTextDisplayComponents(
    (t) => t.setContent("## Maximum Accounts Reached"),
    (t) => t.setContent("You have linked the maximum number of accounts allowed."),
    (t) =>
      t.setContent(
        "Need more? Premium removes the account limit so you can link as many accounts as you want. Learn more with `/premium`.",
      ),
  );
}
