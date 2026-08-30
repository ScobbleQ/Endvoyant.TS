import { ContainerBuilder } from "discord.js";
import CancelActionButton from "../buttons/cancel-action.ts";
import ConfirmDeleteButton from "../buttons/confirm-delete.ts";
import ConfirmUnlinkButton from "../buttons/confirm-unlink.ts";

type ConfirmationParams = [type: "unlink", accountKey: string] | [type: "delete"];

export async function confirmationContainer(...[type, accountKey]: ConfirmationParams) {
  const heading = type === "unlink" ? "Unlink Account" : "Delete Endvoyant Account";

  return new ContainerBuilder()
    .addTextDisplayComponents(
      (t) => t.setContent(`## ${heading}`),
      (t) => t.setContent("This action cannot be undone. Are you sure you want to proceed?"),
    )
    .addActionRowComponents((a) =>
      a.addComponents(
        type === "unlink" ? ConfirmUnlinkButton.data(accountKey) : ConfirmDeleteButton.data,
        CancelActionButton.data(type),
      ),
    );
}
