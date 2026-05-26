import { ContainerBuilder } from "discord.js";
import CookiesButton from "../buttons/cookies.ts";
import HelpButton from "../buttons/help.ts";
import LoginButton from "../buttons/login.ts";

export function addAccountContainer() {
  return new ContainerBuilder()
    .addSectionComponents((s) =>
      s
        .addTextDisplayComponents(
          (t) => t.setContent("## ▼// Add SKPort account"),
          (t) =>
            t.setContent(
              "Choose how to add your SKPort account to Discord. The source is on [GitHub](https://github.com/ScobbleQ/Endvoyant) if you want to review it.",
            ),
          (t) => t.setContent("-# Note: Each Discord account can add up to **6** SKPORT accounts."),
        )
        .setButtonAccessory(HelpButton.data),
    )
    .addSeparatorComponents((s) => s)
    .addSectionComponents((s) =>
      s
        .addTextDisplayComponents(
          (t) => t.setContent("### • Email Login (Recommended)"),
          (t) =>
            t.setContent(
              "Sign in with your email and password. We never store either; they are only used once to fetch a token from SKPORT, which is then saved. This is the **simplest** and **recommended** option.",
            ),
        )
        .setButtonAccessory(LoginButton.data),
    )
    .addSectionComponents((s) =>
      s
        .addTextDisplayComponents(
          (t) => t.setContent("### • Cookies"),
          (t) =>
            t.setContent(
              "Paste your SKPORT auth cookies. This avoids entering credentials, but it is more involved. Use the Help button for details.",
            ),
        )
        .setButtonAccessory(CookiesButton.data),
    );
}
