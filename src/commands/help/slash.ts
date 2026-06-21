import {
  codeBlock,
  ContainerBuilder,
  MessageFlags,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import { config } from "#/config.ts";
import { EventsDB, UsersDB } from "#/drizzle/index.ts";
import { dtx, fromDiscordLocale, tx } from "#/i18n/index.ts";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("help")
    .setNameLocalizations(dtx("command.help.name"))
    .setDescription("Get help and support for the bot")
    .setDescriptionLocalizations(dtx("command.help.description")),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const user = await UsersDB.findAccess(interaction.user.id);
    const lang = user?.lang || fromDiscordLocale(interaction.locale) || "en-us";

    if (user && user.allowData) {
      if (config.env === "production") {
        void EventsDB.record(user.dcid, {
          source: "slash",
          action: "help",
        });
      }
    }

    const container = new ContainerBuilder()
      .addTextDisplayComponents((t) => t.setContent("## Endvoyant"))
      .addTextDisplayComponents((t) =>
        t.setContent(
          "Most questions can be answered simply by paying a visit to Endvoyant's website - https://ake.xentriom.com/docs",
        ),
      )
      .addTextDisplayComponents((t) =>
        t.setContent(
          "If however that doesn't prove to be enough, you can pass by Endvoyant's official server - https://discord.gg/5rUsSZTyf2",
        ),
      )
      .addTextDisplayComponents((t) =>
        t.setContent(
          "**If you have any suggestions** that you think will help improve Endvoyant in any way, we urge you to join our official server and share them with us.",
        ),
      )
      .addTextDisplayComponents((t) =>
        t.setContent(
          "Same goes for issues. **If you have found an annoying bug** we kindly request from you to report it there so that we can get rid of it as soon as possible.",
        ),
      )
      .addTextDisplayComponents((t) =>
        t.setContent(
          "Now regarding commands. While everything can be found on the website here are a few to get you started.",
        ),
      )
      .addTextDisplayComponents(
        (t) => t.setContent(codeBlock(`/${tx(lang, "command.add.full")}`)),
        (t) => t.setContent(tx(lang, "command.add.description")),
      )
      .addTextDisplayComponents(
        (t) => t.setContent(codeBlock(`/${tx(lang, "command.manage.full")}`)),
        (t) => t.setContent(tx(lang, "command.manage.description")),
      )
      .addTextDisplayComponents(
        (t) => t.setContent(codeBlock(`/${tx(lang, "command.settings.full")}`)),
        (t) => t.setContent(tx(lang, "command.settings.description")),
      );

    await interaction.reply({
      components: [container],
      flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
    });
  },
};
