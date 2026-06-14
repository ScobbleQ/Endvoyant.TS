import { describe, it, expect } from "vitest";
import { t, discordLocalization, Language } from "./index.ts";

describe("i18n", () => {
  it("should get a locale", () => {
    expect(t(Language.JA_JP, "lang")).toBe("日本語");
  });

  it("should get a discord localization", () => {
    expect(discordLocalization("lang")).toMatchObject({
      de: "Deutsch",
      "zh-CN": "简体中文",
    });
  });
});
