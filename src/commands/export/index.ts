import { SlashCommandBuilder, MessageFlags, type ChatInputCommandInteraction } from "discord.js";
import { zipSync, strToU8, type Zippable } from "fflate";
import { db } from "#/drizzle/index.ts";
import { discordLocalization } from "#/i18n/index.ts";

export default {
  cooldown: 86400,
  data: new SlashCommandBuilder()
    .setName("export")
    .setNameLocalizations(discordLocalization("command.export.name"))
    .setDescription("Export your Endvoyant data")
    .setDescriptionLocalizations(discordLocalization("command.export.description"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("data")
        .setNameLocalizations(discordLocalization("command.export.subcommands.data.name"))
        .setDescription("Export your Endvoyant data")
        .setDescriptionLocalizations(
          discordLocalization("command.export.subcommands.data.description"),
        ),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    const user = await db.query.users.findFirst({
      where: {
        dcid: interaction.user.id,
      },
    });

    if (!user) {
      await interaction.editReply("Not a registered Endvoyant user.");
      return;
    }

    const [accounts, events] = await Promise.all([
      db.query.accounts.findMany({
        where: {
          dcid: interaction.user.id,
        },
        orderBy: {
          isPrimary: "desc",
          addedOn: "desc",
        },
      }),
      db.query.events.findMany({
        where: {
          dcid: interaction.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        limit: 1000,
      }),
    ]);

    const zip: Zippable = {
      "user.json": strToU8(JSON.stringify(user, null, 2)),
    };

    if (accounts && accounts.length > 0) {
      zip["accounts.json"] = strToU8(JSON.stringify(accounts, null, 2));
    }

    if (events && events.length > 0) {
      zip["events.json"] = strToU8(JSON.stringify(events, null, 2));
    }

    const { buffer, byteOffset, byteLength } = zipSync(zip, { level: 6 });
    const zipBuffer = Buffer.from(buffer, byteOffset, byteLength);

    const fileName = `endvoyant-${interaction.user.id}.zip`;

    await interaction.editReply({
      content: "Download the zip file below to view your data",
      files: [{ attachment: zipBuffer, name: fileName }],
    });
  },
};
