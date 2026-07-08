export const ONBOARDING_STORAGE_VERSION = "v2";

const workspaceMapImage = new URL(
  "./assets/onboarding-workspace-map.png",
  import.meta.url
).href;
const subspacesImage = new URL(
  "./assets/onboarding-subspaces.png",
  import.meta.url
).href;
const favoritesImage = new URL(
  "./assets/onboarding-favorites.png",
  import.meta.url
).href;
const groupMdImage = new URL(
  "./assets/onboarding-group-md.png",
  import.meta.url
).href;
const smartSummaryImage = new URL(
  "./assets/onboarding-smart-summary.png",
  import.meta.url
).href;
const browserExtensionImage = new URL(
  "./assets/onboarding-browser-extension.png",
  import.meta.url
).href;
const webhookImage = new URL("./assets/onboarding-webhook.png", import.meta.url)
  .href;
const aiAvatarImage = new URL(
  "./assets/octo-logo-white-symbol.png",
  import.meta.url
).href;

export type OnboardingSection = {
  id:
    | "workspace-map"
    | "subspaces"
    | "favorites"
    | "group-md"
    | "smart-summary"
    | "webhook"
    | "browser-extension"
    | "ai-avatar";
  label: string;
  title: string;
  description: string;
  visualTitle: string;
  imageSrc: string;
  imageFit?: "cover" | "contain";
};

type TranslateFn = (key: string) => string;

export function createOnboardingSections(t: TranslateFn): OnboardingSection[] {
  return [
    {
      id: "workspace-map",
      label: t("app.onboarding.sections.workspace.label"),
      title: t("app.onboarding.sections.workspace.title"),
      description: t("app.onboarding.sections.workspace.description"),
      visualTitle: t("app.onboarding.sections.workspace.visualTitle"),
      imageSrc: workspaceMapImage,
    },
    {
      id: "subspaces",
      label: t("app.onboarding.sections.subspaces.label"),
      title: t("app.onboarding.sections.subspaces.title"),
      description: t("app.onboarding.sections.subspaces.description"),
      visualTitle: t("app.onboarding.sections.subspaces.visualTitle"),
      imageSrc: subspacesImage,
    },
    {
      id: "favorites",
      label: t("app.onboarding.sections.favorites.label"),
      title: t("app.onboarding.sections.favorites.title"),
      description: t("app.onboarding.sections.favorites.description"),
      visualTitle: t("app.onboarding.sections.favorites.visualTitle"),
      imageSrc: favoritesImage,
    },
    {
      id: "group-md",
      label: "GROUP.md",
      title: t("app.onboarding.sections.groupMd.title"),
      description: t("app.onboarding.sections.groupMd.description"),
      visualTitle: t("app.onboarding.sections.groupMd.visualTitle"),
      imageSrc: groupMdImage,
    },
    {
      id: "smart-summary",
      label: t("app.onboarding.sections.smartSummary.label"),
      title: t("app.onboarding.sections.smartSummary.title"),
      description: t("app.onboarding.sections.smartSummary.description"),
      visualTitle: t("app.onboarding.sections.smartSummary.visualTitle"),
      imageSrc: smartSummaryImage,
    },
    {
      id: "webhook",
      label: "Webhook",
      title: t("app.onboarding.sections.webhook.title"),
      description: t("app.onboarding.sections.webhook.description"),
      visualTitle: t("app.onboarding.sections.webhook.visualTitle"),
      imageSrc: webhookImage,
    },
    {
      id: "browser-extension",
      label: t("app.onboarding.sections.browserExtension.label"),
      title: t("app.onboarding.sections.browserExtension.title"),
      description: t("app.onboarding.sections.browserExtension.description"),
      visualTitle: t("app.onboarding.sections.browserExtension.visualTitle"),
      imageSrc: browserExtensionImage,
    },
    {
      id: "ai-avatar",
      label: t("app.onboarding.sections.aiAvatar.label"),
      title: t("app.onboarding.sections.aiAvatar.title"),
      description: t("app.onboarding.sections.aiAvatar.description"),
      visualTitle: t("app.onboarding.sections.aiAvatar.visualTitle"),
      imageSrc: aiAvatarImage,
      imageFit: "contain",
    },
  ];
}
