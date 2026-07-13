import { describe, expect, it } from "vitest";
import rawSectionConfigs from "./sections.json";
import {
  createOnboardingSections,
  ONBOARDING_SECTION_CONFIGS,
} from "./content";

describe("onboarding content config", () => {
  it("keeps section structure in JSON while resolving visible copy through i18n keys", () => {
    expect(ONBOARDING_SECTION_CONFIGS.map((section) => section.id)).toEqual([
      "workspace-map",
      "subspaces",
      "favorites",
      "group-md",
      "smart-summary",
      "webhook",
      "browser-extension",
      "ai-avatar",
    ]);

    expect(rawSectionConfigs).toEqual(ONBOARDING_SECTION_CONFIGS);
    expect(
      rawSectionConfigs.every(
        (section) =>
          !("title" in section) &&
          !("description" in section) &&
          "titleKey" in section &&
          "descriptionKey" in section
      )
    ).toBe(true);

    const sections = createOnboardingSections((key) => `t:${key}`);

    expect(sections[0]).toMatchObject({
      id: "workspace-map",
      label: "t:app.onboarding.sections.workspace.label",
      title: "t:app.onboarding.sections.workspace.title",
      description: "t:app.onboarding.sections.workspace.description",
      visualTitle: "t:app.onboarding.sections.workspace.visualTitle",
    });
    expect(sections[3].label).toBe("GROUP.md");
    expect(sections[5].label).toBe("Webhook");
    expect(ONBOARDING_SECTION_CONFIGS[7].image).toBe(
      "onboarding-botfather.png"
    );
    expect(sections[7].imageFit).toBeUndefined();
    expect(sections.every((section) => section.imageSrc)).toBe(true);
  });
});
