import { MessageFlags, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { UsersDB } from "#/drizzle/index.ts";
import { dtx, fromDiscordLocale, tx } from "#/i18n/index.ts";
import { errorContainer } from "#/ui/container.ts";
import { overviewContainer } from "./components/overview.ts";

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("settings")
    .setNameLocalizations(dtx("command.settings.name"))
    .setDescription("Adjust your bot settings")
    .setDescriptionLocalizations(dtx("command.settings.description")),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const user = await UsersDB.findUser(interaction.user.id);
    if (!user) {
      const locale = fromDiscordLocale(interaction.locale);
      await interaction.reply({
        components: [errorContainer({ desc: tx(locale, "error.requireSetup") })],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
      return;
    }

    await interaction.reply({
      components: [await overviewContainer(interaction.user)],
      flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
    });
  },
};
