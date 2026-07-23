import {
  ButtonBuilder,
  ButtonStyle,
  DiscordAPIError,
  MessageFlags,
  type ButtonInteraction,
} from "discord.js";
import { createComponentId } from "#/utils/componentId.ts";

export default {
  data: new ButtonBuilder()
    .setCustomId(createComponentId("settings", "test-dm"))
    .setLabel("Test DM")
    .setStyle(ButtonStyle.Primary),
  execute: async (interaction: ButtonInteraction) => {
    // Send the DM, but capture failure separately so the reply below can
    // never double-acknowledge the interaction or leak the raw error.
    let dmFailed = false;
    try {
      await interaction.user.send(
        "This is a test DM.\nIf you received this message, your DMs are working correctly!",
      );
    } catch (error) {
      dmFailed = true;
      if (error instanceof DiscordAPIError && error.code === 50007) {
        // User has DMs disabled or has blocked the bot — expected case.
        console.warn(`Test DM blocked for ${interaction.user.id} (50007).`);
      } else {
        console.error(`Test DM failed for ${interaction.user.id}:`, error);
      }
    }

    const content = dmFailed
      ? "Failed to send a test DM — your DMs may be disabled or you may have blocked the bot. Enable DMs from server members and try again."
      : "Test DM sent successfully! Please check your DMs.";

    await interaction.reply({ content, flags: [MessageFlags.Ephemeral] });
  },
};
