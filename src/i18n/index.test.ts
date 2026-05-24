import { describe, it, expect } from "vitest";
import { Language } from "#/types/locale.ts";
import { t, discordLocalization } from "./index.ts";

describe("i18n", () => {
  it("should return null for missing keys", () => {
    expect(t(Language.EN_US, "nonexistent.key")).toBeNull();
  });

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
