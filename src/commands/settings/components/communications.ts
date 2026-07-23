import { ContainerBuilder } from "discord.js";
import { db } from "#/drizzle/index.ts";
import TestDmButton from "../buttons/test-dm.ts";
import ToggleButton from "../buttons/toggle.ts";
import MenuSelector from "../selectmenus/selector.ts";

export async function communicationsContainer(dcid: string) {
  const settings = await db.query.users.findFirst({
    columns: {
      enableNotif: true,
      enableReminder: true,
      // enableUpdates: true
    },
    where: {
      dcid,
    },
  });

  // This should never happen, but just in case, we handle it
  if (!settings) {
    return new ContainerBuilder()
      .addActionRowComponents((a) => a.addComponents(MenuSelector.data("communications")))
      .addTextDisplayComponents(
        (t) => t.setContent("### Error"),
        (t) => t.setContent("Unable to retrieve settings. Please try again later."),
      );
  }

  return new ContainerBuilder()
    .addActionRowComponents((a) => a.addComponents(MenuSelector.data("communications")))
    .addSectionComponents((s) =>
      s
        .addTextDisplayComponents(
          (t) => t.setContent("### DM Alerts"),
          (t) =>
            t.setContent(
              "Recieve DMs when automated tasks (like Daily Sign-ins or Code Redeems) run on any account.",
            ),
        )
        .setButtonAccessory(ToggleButton.data("enableNotif", settings.enableNotif)),
    )
    .addSectionComponents((s) =>
      s
        .addTextDisplayComponents(
          (t) => t.setContent("### Reminders"),
          (t) =>
            t.setContent(
              "Get notified when in-game resources (like full Stamina, finished Dispatches, or idle Factories) need attention.",
            ),
        )
        .setButtonAccessory(ToggleButton.data("enableReminder", settings.enableReminder)),
    )
    .addTextDisplayComponents(
      (t) => t.setContent("### Updates"),
      (t) => t.setContent("Recieve promotional updates, news, and announcements about Endvoyant."),
    )
    .addSeparatorComponents((s) => s)
    .addActionRowComponents((a) => a.addComponents(TestDmButton.data));
}
