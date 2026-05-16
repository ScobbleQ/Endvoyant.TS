import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";

export default {
  cooldown: 0,
  data: new SlashCommandBuilder()
    .setName("prydwen")
    .setDescription("prydwen")
    .addSubcommand((subcommand) =>
      subcommand.setName("tierlist").setDescription("Show the current Prydwyn tier list"),
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply({
      content: "Prydwyn is coming soon!",
    });
  },
};
