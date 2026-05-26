import { ContainerBuilder } from "discord.js";
import HelpStringSelect from "../selectmenus/help.ts";

export function helpContainer(page: string = "faqs") {
  const container = new ContainerBuilder().addActionRowComponents((a) =>
    a.addComponents(HelpStringSelect.data(page)),
  );

  if (page === "faqs") {
    container
      .addTextDisplayComponents(
        (t) =>
          t.setContent(
            "### Does Endvoyant store my credentials?\nNo. Endvoyant does not store your email or password, they are deleted after we use them to fetch an account token from SKPORT.",
          ),
        (t) =>
          t.setContent(
            "### Can Endvoyant alter the account?\nNo. After login, the only thing we have access to is your account token, which does not have permissions to alter account data.",
          ),
        (t) =>
          t.setContent(
            "### How does signin with Email work?\nWhen you enter your email and password, we send them to Gryphline servers and they return an account token.",
          ),
      )
      .addTextDisplayComponents(
        (t) =>
          t.setContent(
            "### Can I get banned using Endvoyant?\nI do not know. There has been no known cases of accounts getting banned resulting from the use of Endvoyant.",
          ),
        (t) =>
          t.setContent(
            "### Can I remove my account after adding it?\nYes, you can remove and delete your account data at any time using `/manage accounts`.",
          ),
      );
  } else if (page === "cookies") {
    container.addTextDisplayComponents((t) =>
      t.setContent(
        [
          "1. Go to [skport.com](<https://game.skport.com/endfield/sign-in>) do __NOT__ log in yet.",
          "2. Open your browser's developer tools ([How to open DevTools](https://balsamiq.com/support/faqs/browserconsole/))",
          "3. Navigate to the **“Network”** tab in developer tools.",
          "4. Now log in with the developer tools open, you should see things populate in the network tab.",
          "5. In the search box, type **token** and click on the result labeled **account_token**.",
          "6. Under the **Headers** tab, locate the **Request** section.",
          "7. Copy everything after **Cookie:** and paste it into the text field provided.",
        ].join("\n"),
      ),
    );
  }

  container
    .addSeparatorComponents((s) => s)
    .addTextDisplayComponents((t) =>
      t.setContent(
        "-# Still need help or have more questions? Check out our [website](https://ake.xentriom.com), [GitHub](https://github.com/ScobbleQ/Endvoyant), or join our [Discord server](https://discord.gg/5rUsSZTyf2).",
      ),
    );

  return container;
}
