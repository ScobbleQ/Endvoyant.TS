import { EmbedBuilder } from "discord.js";

export function onboardingEmbed() {
  return new EmbedBuilder()
    .setTitle("▼// Welcome to Endvoyant")
    .setDescription(
      [
        "Before you continue, please read out Terms of Service and Privacy Policy.",
        "-# Terms of Service: <https://ake.xentriom.com/docs/terms-of-service>",
        "-# Privacy Policy: <https://ake.xentriom.com/docs/privacy-policy>",
        "",
        "By clicking the button below, you **agree** to our conditions",
        "If you do not agree, simply dismiss this message.",
      ].join("\n"),
    );
}

export function onboardingSuccessEmbed() {
  return new EmbedBuilder().setDescription("woo congrats etc etc + rmb to change language");
}
