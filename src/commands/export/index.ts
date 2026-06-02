import { SlashCommandBuilder, MessageFlags, type ChatInputCommandInteraction } from "discord.js";
import { zipSync, strToU8, type Zippable } from "fflate";
import { AccountsDB, EventsDB, UsersDB } from "#/drizzle/index.ts";
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
    const user = await UsersDB.findForExport(interaction.user.id);
    if (!user) return;

    const [accounts, events] = await Promise.all([
      AccountsDB.listForExport(interaction.user.id),
      EventsDB.listForExport(interaction.user.id),
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

    await interaction.reply({
      content: "Download the zip file below to view your data",
      files: [{ attachment: zipBuffer, name: fileName }],
      flags: MessageFlags.Ephemeral,
    });
  },
};
