import { describe, it, expect } from "vitest";
import type { Locale } from "#/types/locale.js";
import { t } from "./index.js";

describe("i18n", () => {
  it("should get a locale", () => {
    expect(t("de-de" as unknown as Locale, "lang")).toBe("Deutsch");
  });
});
