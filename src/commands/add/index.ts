import {
  ActionRowBuilder,
  ButtonBuilder,
  MessageFlags,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import { errorEmbed } from "#/components/embed.ts";
import { config } from "#/config.ts";
import { EventsDB, UsersDB } from "#/drizzle/index.ts";
import AgreeButton from "./buttons/agree.ts";
import { addAccountEmbed, addAccountActions } from "./components/addAccount.ts";
import { onboardingEmbed } from "./components/onboarding.ts";

export default {
  cooldown: 30,
  data: new SlashCommandBuilder()
    .setName("add")
    .setDescription("Add an account to your Discord")
    .addSubcommand((subcommand) =>
      subcommand.setName("account").setDescription("Add an account to your Discord"),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const user = await UsersDB.findByDcid(interaction.user.id);
    if (!user) {
      await interaction.reply({
        embeds: [onboardingEmbed()],
        components: [new ActionRowBuilder<ButtonBuilder>().addComponents(AgreeButton.data)],
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    if (config.env === "production") {
      void EventsDB.insert(user.dcid, {
        source: "slash",
        action: "add",
      });
    }

    if (user.isBanned) {
      await interaction.reply({
        embeds: [
          errorEmbed({
            title: "Banned",
            description: "Please contact support for more information.",
          }),
        ],
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    await interaction.reply({
      embeds: [addAccountEmbed()],
      components: [addAccountActions()],
      flags: [MessageFlags.Ephemeral],
    });
  },
};
