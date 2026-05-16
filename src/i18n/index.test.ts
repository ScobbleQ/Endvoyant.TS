import { describe, it, expect } from "vitest";
import { Language } from "#/types/locale.ts";
import { t } from "./index.ts";

describe("i18n", () => {
  it("should get a locale", () => {
    expect(t(Language.DE_DE, "lang")).toBe("Deutsch");
  });
});
