import { ContainerBuilder } from "discord.js";
import { db } from "#/drizzle/index.ts";
import DeleteAccountButton from "../buttons/delete-account.ts";
import ToggleButton from "../buttons/toggle.ts";
import MenuSelector from "../selectmenus/selector.ts";

export async function privacyContainer(dcid: string) {
  const settings = await db.query.users.findFirst({
    columns: {
      isPrivate: true,
      allowData: true,
    },
    where: {
      dcid,
    },
  });

  // This should never happen, but just in case, we handle it
  if (!settings) {
    return new ContainerBuilder()
      .addActionRowComponents((a) => a.addComponents(MenuSelector.data("privacy")))
      .addTextDisplayComponents(
        (t) => t.setContent("### Error"),
        (t) => t.setContent("Unable to retrieve settings. Please try again later."),
      );
  }

  return new ContainerBuilder()
    .addActionRowComponents((a) => a.addComponents(MenuSelector.data("privacy")))
    .addSectionComponents((s) =>
      s
        .addTextDisplayComponents(
          (t) => t.setContent("### Private Account"),
          (t) =>
            t.setContent(
              "Keep your profile and command responses private by defaulting to ephemeral messages.",
            ),
        )
        .setButtonAccessory(ToggleButton.data("isPrivate", settings.isPrivate)),
    )
    .addSectionComponents((s) =>
      s
        .addTextDisplayComponents(
          (t) => t.setContent("### Data Privacy"),
          (t) =>
            t.setContent(
              "Allow Endvoyant to collect anonymous command usage metrics and event logs to improve performance.",
            ),
        )
        .setButtonAccessory(ToggleButton.data("allowData", settings.allowData)),
    )
    .addSeparatorComponents((s) => s)
    .addSectionComponents((s) =>
      s
        .addTextDisplayComponents(
          (t) => t.setContent("### Delete Endvoyant Account"),
          (t) =>
            t.setContent(
              "Permanently remove your Endvoyant account and all of its associated data. This action is not reversible, please proceed with caution.",
            ),
        )
        .setButtonAccessory(DeleteAccountButton.data),
    );
}
