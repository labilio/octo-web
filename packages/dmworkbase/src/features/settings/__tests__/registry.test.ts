import { describe, expect, it } from "vitest";
import { SETTINGS_CATEGORIES, SETTINGS_ITEMS } from "../registry";

describe("settings registry", () => {
  it("keeps exactly five stable primary categories", () => {
    expect(SETTINGS_CATEGORIES.map((item) => item.id)).toEqual([
      "account",
      "notifications",
      "appearance",
      "ai-input",
      "about",
    ]);
  });

  it("provides bilingual search terms and a route for every setting", () => {
    expect(SETTINGS_ITEMS.length).toBeGreaterThan(10);
    for (const item of SETTINGS_ITEMS) {
      expect(item.id).toBeTruthy();
      expect(item.titleKey).toMatch(/^base\.settingsCenter\./);
      expect(item.route).toMatch(/^\//);
      expect(item.searchTerms.zhCN.length).toBeGreaterThan(0);
      expect(item.searchTerms.enUS.length).toBeGreaterThan(0);
    }
  });

  it("models clients and extensions as an about detail page, not a primary category", () => {
    expect(SETTINGS_CATEGORIES.some((item) => item.id === "clients")).toBe(
      false
    );
    expect(
      SETTINGS_ITEMS.find((item) => item.id === "clients-and-extensions")
    ).toMatchObject({
      categoryId: "about",
      route: "/about/clients-and-extensions",
    });
  });

  it("indexes trust and enterprise links under help and about", () => {
    const ids = [
      "octo-website",
      "octo-source",
      "about-mininglamp",
      "mininglamp-open-source",
      "enterprise-support",
    ];
    expect(
      SETTINGS_ITEMS.filter((item) => ids.includes(item.id)).map((item) => ({
        id: item.id,
        categoryId: item.categoryId,
      }))
    ).toEqual(ids.map((id) => ({ id, categoryId: "about" })));
  });
});
