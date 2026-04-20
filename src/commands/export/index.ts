import { MessageFlags, SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import JSZip from "jszip";
import { AccountsDB, EventsDB, UsersDB } from "#/drizzle/index.js";

export default {
  cooldown: 86400,
  data: new SlashCommandBuilder()
    .setName("export")
    .setDescription("Export your Endvoyant data")
    .addSubcommand((subcommand) =>
      subcommand.setName("data").setDescription("Export your Endvoyant data"),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const user = await UsersDB.getByDcid(interaction.user.id);
    if (!user) return;

    const accounts = await AccountsDB.getByDcid(interaction.user.id);
    const events = await EventsDB.getUserEvents(interaction.user.id);

    const zip = new JSZip();
    zip.file("user.json", JSON.stringify(user, null, 2));

    if (accounts && accounts.length > 0) {
      zip.file("accounts.json", JSON.stringify(accounts, null, 2));
    }

    if (events && events.length > 0) {
      zip.file("events.json", JSON.stringify(events, null, 2));
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
    const fileName = `endvoyant-${interaction.user.id}.zip`;

    await interaction.reply({
      content: "Download the zip file below to view your data",
      files: [{ attachment: zipBuffer, name: fileName }],
      flags: MessageFlags.Ephemeral,
    });
  },
};
