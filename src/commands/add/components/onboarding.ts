import { ContainerBuilder } from "discord.js";
import { TermsOfServiceButton, PrivacyPolicyButton } from "#/components/legal.ts";
import AgreeButton from "../buttons/agree.ts";

export function onboardingContainer() {
  return new ContainerBuilder()
    .addSectionComponents((s) =>
      s
        .addTextDisplayComponents(
          (t) => t.setContent("## ▼// Welcome to Endvoyant"),
          (t) =>
            t.setContent(
              "Before you continue, please review our Terms of Service and Privacy Policy. By clicking **Agree**, you confirm that you accept these terms. If you do not agree, simply dismiss this message.",
            ),
        )
        .setButtonAccessory(AgreeButton.data),
    )
    .addActionRowComponents((a) => a.addComponents(TermsOfServiceButton(), PrivacyPolicyButton()));
}

export function onboardingSuccessContainer() {
  const ts = Math.floor(Date.now() / 1000) + 10;
  return new ContainerBuilder().addTextDisplayComponents(
    (t) => t.setContent("## Agreement saved"),
    (t) =>
      t.setContent(
        `You're all set. We'll move you to account setup <t:${ts}:R>, if nothing happens use \`/add account\` again.`,
      ),
  );
}
