import { describe, it, expect } from "vitest";
import { t, localizations, Language } from "./index.ts";

describe("i18n", () => {
  it("should get a locale", () => {
    expect(t(Language.JA_JP, "lang")).toBe("日本語");
  });

  it("should get a discord localization", () => {
    expect(localizations("command.about.name")).toMatchObject({
      "en-US": "about",
      "zh-CN": "关于",
    });
  });
});
