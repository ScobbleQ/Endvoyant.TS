import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dtx, Language, tx } from "./index.ts";

describe("i18n", () => {
  it("should get a locale", () => {
    assert.strictEqual(tx(Language.JA_JP, "lang"), "日本語");
  });

  it("should get a discord localization", () => {
    assert.partialDeepStrictEqual(dtx("command.about.name"), {
      "en-US": "about",
      "zh-CN": "关于",
    });
  });
});
