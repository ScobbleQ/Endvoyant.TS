import { describe, it, expect } from "vitest";
import { tx, dtx, Language } from "./index.ts";

describe("i18n", () => {
  it("should get a locale", () => {
    expect(tx(Language.JA_JP, "lang")).toBe("日本語");
  });

  it("should get a discord localization", () => {
    expect(dtx("command.about.name")).toMatchObject({
      "en-US": "about",
      "zh-CN": "关于",
    });
  });
});
