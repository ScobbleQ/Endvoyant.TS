import { describe, it, expect } from "vitest";
import { Language } from "#/types/locale.js";
import { t } from "./index.js";

describe("i18n", () => {
  it("should get a locale", () => {
    expect(t(Language.DE_DE, "lang")).toBe("Deutsch");
  });
});
