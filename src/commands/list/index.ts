import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  ContainerBuilder,
  MessageFlags,
  codeBlock,
} from "discord.js";
import { config } from "#/config.ts";
import { db, EventsDB } from "#/drizzle/index.ts";
import { warnContainer } from "#/globals/components/container.ts";
import { dtx, tx, fromDiscordLocale } from "#/i18n/index.ts";

export default {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName("list")
    .setNameLocalizations(dtx("command.list.name"))
    .setDescription("View active redemption codes")
    .setDescriptionLocalizations(dtx("command.list.description"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("codes")
        .setNameLocalizations(dtx("command.list.subcommands.codes.name"))
        .setDescription("View active redemption codes")
        .setDescriptionLocalizations(dtx("command.list.subcommands.codes.description")),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const user = await db.query.users.findFirst({
      columns: {
        allowData: true,
      },
      where: {
        dcid: interaction.user.id,
      },
    });

    const locale = fromDiscordLocale(interaction.locale);

    if (config.env === "production" && user?.allowData) {
      void EventsDB.record(interaction.user.id, {
        source: "slash",
        action: "list codes",
      });
    }

    const codes = await db.query.efCodes.findMany({
      columns: {
        code: true,
        rewards: true,
        notes: true,
      },
      where: {
        isActive: true,
      },
    });

    if (codes.length === 0) {
      await interaction.reply({
        components: [warnContainer({ desc: tx(locale, "info.noActiveCodes") })],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
      return;
    }

    const container = new ContainerBuilder();
    for (const code of codes) {
      const lines: string[] = ["**Rewards:**"];
      if (code.rewards?.length) {
        lines.push(...code.rewards.map((r) => `- ${r}`));
      } else {
        lines.push("- Unknown Rewards");
      }

      if (code.notes?.length) {
        lines.push("**Notes:**");
        lines.push(...code.notes.map((n) => `- ${n}`));
      }

      container.addTextDisplayComponents(
        (t) => t.setContent(codeBlock(code.code)),
        (t) => t.setContent(lines.join("\n")),
      );
    }

    await interaction.reply({
      components: [container],
      flags: [MessageFlags.IsComponentsV2],
    });
  },
};
