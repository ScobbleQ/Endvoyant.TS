import {
  Events,
  ContainerBuilder,
  ButtonStyle,
  ButtonBuilder,
  MessageFlags,
  type Guild,
} from "discord.js";
import type { BotEvent } from "#/discord.js";
import { config } from "#/config.ts";

export default {
  name: Events.GuildCreate,
  async execute(guild: Guild) {
    console.log(`[Discord] Guild created: ${guild.name} (${guild.id})`);
    const systemChannel = guild.systemChannel;
    if (!systemChannel) return;

    const container = new ContainerBuilder()
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(
          [
            "## ▼// Endvoyant graces your server!",
            "Endvoyant is an utility bot for Arknights: Endfield.",
            "To get started, please use the `/add account` command to add your account.",
            "If you have any questions, please check out our website or support server.",
            "",
            "Thank you for using Endvoyant!",
            "-# We recommend adding the bot to `My Apps` for full functionality.",
          ].join("\n"),
        ),
      )
      .addActionRowComponents((actionRow) =>
        actionRow.addComponents(
          new ButtonBuilder()
            .setURL("https://ake.xentriom.com/")
            .setLabel("Website")
            .setStyle(ButtonStyle.Link),
          new ButtonBuilder()
            .setURL(`https://discord.com/oauth2/authorize?client_id=${config.discord.clientId}`)
            .setLabel("Invite Bot")
            .setStyle(ButtonStyle.Link),
          new ButtonBuilder()
            .setURL(`https://discord.gg/5rUsSZTyf2`)
            .setLabel("Support Server")
            .setStyle(ButtonStyle.Link),
          new ButtonBuilder()
            .setURL("https://github.com/ScobbleQ/Endvoyant")
            .setLabel("GitHub")
            .setStyle(ButtonStyle.Link),
        ),
      );

    await systemChannel.send({
      components: [container],
      flags: [MessageFlags.IsComponentsV2],
    });
  },
} satisfies BotEvent<Events.GuildCreate>;
