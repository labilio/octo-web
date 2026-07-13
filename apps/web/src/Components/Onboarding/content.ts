import sectionConfigs from "./sections.json";

export const ONBOARDING_STORAGE_VERSION = "v2";

const onboardingSectionImageSources = {
  "onboarding-workspace.png": new URL(
    "./assets/onboarding-workspace.png",
    import.meta.url
  ).href,
  "onboarding-subspaces.png": new URL(
    "./assets/onboarding-subspaces.png",
    import.meta.url
  ).href,
  "onboarding-favorites.png": new URL(
    "./assets/onboarding-favorites.png",
    import.meta.url
  ).href,
  "onboarding-group-md.png": new URL(
    "./assets/onboarding-group-md.png",
    import.meta.url
  ).href,
  "onboarding-smart-summary.png": new URL(
    "./assets/onboarding-smart-summary.png",
    import.meta.url
  ).href,
  "onboarding-browser-extension.png": new URL(
    "./assets/onboarding-browser-extension.png",
    import.meta.url
  ).href,
  "onboarding-webhook.png": new URL(
    "./assets/onboarding-webhook.png",
    import.meta.url
  ).href,
  "onboarding-create-bot.png": new URL(
    "./assets/onboarding-create-bot.png",
    import.meta.url
  ).href,
} as const;

export type OnboardingSectionId =
  | "workspace"
  | "subspaces"
  | "favorites"
  | "group-md"
  | "smart-summary"
  | "webhook"
  | "browser-extension"
  | "create-bot";

type OnboardingSectionImage = keyof typeof onboardingSectionImageSources;
type OnboardingTranslationKey = `app.onboarding.${string}`;

export type OnboardingSectionConfig = {
  id: OnboardingSectionId;
  label?: string;
  labelKey?: OnboardingTranslationKey;
  titleKey: OnboardingTranslationKey;
  descriptionKey: OnboardingTranslationKey;
  visualTitleKey: OnboardingTranslationKey;
  image: OnboardingSectionImage;
  imageFit?: "cover" | "contain";
};

export type OnboardingSection = {
  id: OnboardingSectionId;
  label: string;
  title: string;
  description: string;
  visualTitle: string;
  imageSrc: string;
  imageFit?: "cover" | "contain";
};

type TranslateFn = (key: string) => string;

export const ONBOARDING_SECTION_CONFIGS =
  sectionConfigs as readonly OnboardingSectionConfig[];

function resolveConfigText(
  t: TranslateFn,
  config: { key?: OnboardingTranslationKey; literal?: string }
) {
  if (config.key) return t(config.key);
  return config.literal || "";
}

export function createOnboardingSections(t: TranslateFn): OnboardingSection[] {
  return ONBOARDING_SECTION_CONFIGS.map((section) => ({
    id: section.id,
    label: resolveConfigText(t, {
      key: section.labelKey,
      literal: section.label,
    }),
    title: t(section.titleKey),
    description: t(section.descriptionKey),
    visualTitle: t(section.visualTitleKey),
    imageSrc: onboardingSectionImageSources[section.image],
    imageFit: section.imageFit,
  }));
}
