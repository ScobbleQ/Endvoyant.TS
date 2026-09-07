import { ButtonBuilder, ButtonStyle } from "discord.js";

export function TermsOfServiceButton() {
  return new ButtonBuilder()
    .setURL("https://ake.xentriom.com/docs/terms-of-service")
    .setLabel("Terms of Service")
    .setStyle(ButtonStyle.Link);
}

export function PrivacyPolicyButton() {
  return new ButtonBuilder()
    .setURL("https://ake.xentriom.com/docs/privacy-policy")
    .setLabel("Privacy Policy")
    .setStyle(ButtonStyle.Link);
}
