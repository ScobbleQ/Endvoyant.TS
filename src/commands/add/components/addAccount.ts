import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "discord.js";
import CookiesButton from "../buttons/cookies.ts";
import InfoButton from "../buttons/info.ts";
import LoginButton from "../buttons/login.ts";

export function addAccountEmbed() {
  return new EmbedBuilder()
    .setTitle("▼// Add SKPort account")
    .setDescription(
      [
        "Please select a method to add your account:",
        "- SKPork Login: Use your email and password to login to SKPort.",
        "- Enter Cookies: Use your cookies to login to SKPort.",
        "-# Multiple accounts can be added by using the `/add account` command again.",
        "",
        "The source code is avaialable on [GitHub](https://github.com/ScobbleQ/Endministrator). We **do not** store your login credentials after the login process is completed. Need help? Join our [Support Server](https://discord.gg/5rUsSZTyf2) or view the [guide online](https://ake.xentriom.com/docs/add).",
      ].join("\n"),
    );
}

export function addAccountActions() {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    LoginButton.data,
    CookiesButton.data,
    InfoButton.data,
  );
}
