import { MessageFlags, type Interaction } from "discord.js";
import { buildLinkedSummaryContainer } from "#/ui/linkedSummary.ts";

export async function sendUpdatedLinkedPins(interaction: Interaction) {
  const container = await buildLinkedSummaryContainer(interaction.user.id);

  // null container means no linked accounts
  // we can safely unpin any existing bot messages
  if (!container) {
    const dms = await interaction.user.createDM();
    const pins = await dms.messages.fetchPins();

    for (const pin of pins.items) {
      if (pin.message.author.id !== interaction.client.user.id) continue;
      await pin.message.unpin();
    }

    return;
  }

  // Send the container in DMS
  const message = await interaction.user.send({
    components: [container],
    flags: [MessageFlags.IsComponentsV2],
  });

  // Unpin any messages sent by the bot
  const pins = await message.channel.messages.fetchPins();
  for (const pin of pins.items) {
    if (pin.message.author.id !== interaction.client.user.id) continue;
    await pin.message.unpin();
  }

  // Pin the message
  await message.pin();
}
