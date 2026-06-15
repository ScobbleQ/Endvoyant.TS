import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  ContainerBuilder,
  MessageFlags,
  codeBlock,
} from "discord.js";
import { db } from "#/drizzle/index.ts";
import { warnContainer } from "#/globals/components/container.ts";
import { localizations, t, fromDiscordLocale } from "#/i18n/index.ts";

export default {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName("list")
    .setNameLocalizations(localizations("command.list.name"))
    .setDescription("View active redemption codes")
    .setDescriptionLocalizations(localizations("command.list.description"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("codes")
        .setNameLocalizations(localizations("command.list.subcommands.codes.name"))
        .setDescription("View active redemption codes")
        .setDescriptionLocalizations(localizations("command.list.subcommands.codes.description")),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const locale = fromDiscordLocale(interaction.locale);
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
        components: [warnContainer({ desc: t(locale, "info.noActiveCodes") })],
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
        (ct) => ct.setContent(codeBlock(code.code)),
        (ct) => ct.setContent(lines.join("\n")),
      );
    }

    await interaction.reply({
      components: [container],
      flags: [MessageFlags.IsComponentsV2],
    });
  },
};
