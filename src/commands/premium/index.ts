import { SlashCommandBuilder, MessageFlags, type ChatInputCommandInteraction } from "discord.js";
import { discordLocalization } from "#/i18n/index.ts";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("premium")
    .setNameLocalizations(discordLocalization("command.premium.name"))
    .setDescription("View your premium status")
    .setDescriptionLocalizations(discordLocalization("command.premium.description")),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const premiumFeatures = [
      "Infinite account links",
      "AI chat (frontier open weight models)\*",
      "Automatic code redemption\*\*",
      "Support the bot's development",
    ]
      .map((f) => `- ${f}`)
      .join("\n");

    const disclaimer = [
      "\*AI chat feature is in early development and may not work as expected. It is also subject to change based on user feedback and performance.",
      "\*\*Automatic code redemption uses our in-house detection system, accuracy may vary. It is in early testing currently.",
    ]
      .map((f) => `-# ${f}`)
      .join("\n");

    await interaction.reply({
      content: `Premium coming soon! Features may include:\n${premiumFeatures}\n\n${disclaimer}`,
      flags: [MessageFlags.Ephemeral],
    });
  },
};
