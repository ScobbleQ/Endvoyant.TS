import { ButtonBuilder, ButtonStyle, MessageFlags, type ButtonInteraction } from "discord.js";
import { UsersDB } from "#/drizzle/index.ts";
import { createComponentId } from "#/utils/componentId.ts";
import { communicationsContainer } from "../components/communications.ts";
import { privacyContainer } from "../components/privacy.ts";

type ToggleableField = "allowData" | "enableNotif" | "enableReminder" | "isPrivate";
const toggleFields = new Set<string>(["allowData", "enableNotif", "enableReminder", "isPrivate"]);

export default {
  data: (field: ToggleableField, current: boolean) =>
    new ButtonBuilder()
      .setCustomId(createComponentId("settings", "toggle", field))
      .setLabel(current ? "Enabled" : "Disabled")
      .setStyle(current ? ButtonStyle.Success : ButtonStyle.Secondary),
  execute: async (interaction: ButtonInteraction, args: string[]) => {
    const field = args[0]!;
    if (!toggleFields.has(field)) return;

    const key = field as ToggleableField;
    const user = await UsersDB.findUser(interaction.user.id);
    if (!user) return;

    const current = user[key as keyof typeof user] as boolean;
    await UsersDB.updateByDcid(interaction.user.id, { [key]: !current });

    const container =
      key === "isPrivate" || key === "allowData"
        ? await privacyContainer(interaction.user.id)
        : await communicationsContainer(interaction.user.id);

    await interaction.update({
      components: [container],
      flags: [MessageFlags.IsComponentsV2],
    });
  },
};
