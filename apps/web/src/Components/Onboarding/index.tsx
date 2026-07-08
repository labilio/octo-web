import React, { useEffect, useMemo, useRef, useState } from "react";
import { Building2, ExternalLink, Github, Sparkles, X } from "lucide-react";
import { useI18n, WKApp } from "@octo/base";
import {
  createOnboardingSections,
  ONBOARDING_STORAGE_VERSION,
  type OnboardingSection,
} from "./content";
import { OnboardingIntro } from "./Intro";
import { OnboardingHoverButton } from "./HoverButton";
import { runOnboardingViewTransition } from "./viewTransition";
import "./index.css";

const MAX_AI_AVATAR_NAME_LENGTH = 24;
const COMPLETION_CELEBRATION_MS = 920;
const COMPLETION_REDUCED_MOTION_MS = 120;
const BROWSER_EXTENSION_URL =
  "https://chromewebstore.google.com/detail/octo-%E6%8F%92%E4%BB%B6%E7%89%88/nemameogpfkponoomeblkjcnbidgmndk";
const CELEBRATION_COLORS = [
  "#7C3AED",
  "#06B6D4",
  "#F59E0B",
  "#10B981",
  "#F8FAFC",
] as const;
const CELEBRATION_PARTICLES = Array.from({ length: 24 }, (_, index) => {
  const lane = index % 12;
  const side = index < 12 ? -1 : 1;
  const spread = 28 + (lane % 4) * 7;
  const rise = -30 + Math.floor(lane / 4) * 13;

  return {
    id: index,
    x: side < 0 ? "16%" : "84%",
    y: `${50 + (lane % 4) * 4}%`,
    tx: `${side * spread}vw`,
    ty: `${rise}vh`,
    rotate: `${side * (150 + lane * 17)}deg`,
    delay: `${lane * 18}ms`,
    color: CELEBRATION_COLORS[lane % CELEBRATION_COLORS.length],
  };
});

type OnboardingSectionId = OnboardingSection["id"];

function isBrowserExtensionSection(section: OnboardingSection) {
  return section.id === "browser-extension";
}

function isAiAvatarSection(section: OnboardingSection) {
  return section.id === "ai-avatar";
}

function getStorageKey() {
  const uid = WKApp.loginInfo.uid || "anonymous";
  return `octo:onboarding:first-run:${ONBOARDING_STORAGE_VERSION}:${uid}`;
}

function getIntroStorageKey() {
  const uid = WKApp.loginInfo.uid || "anonymous";
  return `octo:onboarding:intro:${ONBOARDING_STORAGE_VERSION}:${uid}`;
}

function getAiAvatarNameStorageKey() {
  const uid = WKApp.loginInfo.uid || "anonymous";
  return `octo:onboarding:ai-avatar-name:${ONBOARDING_STORAGE_VERSION}:${uid}`;
}

function normalizeAiAvatarName(name: string) {
  return name.trim().slice(0, MAX_AI_AVATAR_NAME_LENGTH);
}

function isPreviewMode() {
  return (
    new URLSearchParams(window.location.search).get("onboarding") === "preview"
  );
}

function isIntroPreviewMode() {
  return new URLSearchParams(window.location.search).get("intro") === "1";
}

function getCompletionCloseDelay() {
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")
    .matches;

  return reduceMotion
    ? COMPLETION_REDUCED_MOTION_MS
    : COMPLETION_CELEBRATION_MS;
}

function ImageVisual({ section }: { section: OnboardingSection }) {
  return (
    <img
      className={`wk-onboarding-image${
        section.imageFit === "contain" ? " is-contain" : ""
      }`}
      src={section.imageSrc}
      alt={section.visualTitle}
    />
  );
}

function IdentitySetupVisual({
  aiAvatarName,
  onNameChange,
  onEnter,
}: {
  aiAvatarName: string;
  onNameChange: (value: string) => void;
  onEnter: () => void;
}) {
  const { t } = useI18n();
  const normalizedName = normalizeAiAvatarName(aiAvatarName);
  const previewName =
    normalizedName || t("app.onboarding.sections.aiAvatar.previewName");
  const avatarText = Array.from(previewName).slice(0, 2).join("");

  return (
    <div className="wk-onboarding-identity-stage">
      <div className="wk-onboarding-identity-grid" aria-hidden="true" />
      <div className="wk-onboarding-identity-compose">
        <div className="wk-onboarding-longxia-avatar" aria-hidden="true">
          <span>{avatarText}</span>
          <i />
        </div>
        <div className="wk-onboarding-name-field">
          <label htmlFor="wk-onboarding-ai-avatar-name">
            {t("app.onboarding.sections.aiAvatar.nameLabel")}
          </label>
          <div className="wk-onboarding-name-input-shell">
            <input
              id="wk-onboarding-ai-avatar-name"
              value={aiAvatarName}
              maxLength={MAX_AI_AVATAR_NAME_LENGTH}
              placeholder={t(
                "app.onboarding.sections.aiAvatar.namePlaceholder"
              )}
              autoComplete="off"
              onChange={(event) => onNameChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && normalizedName) {
                  onEnter();
                }
              }}
            />
            <span>
              {normalizedName.length}/{MAX_AI_AVATAR_NAME_LENGTH}
            </span>
          </div>
        </div>
        <div className="wk-onboarding-mention-preview">
          <span className="wk-onboarding-mention-token">@{previewName}</span>
          <strong>{t("app.onboarding.sections.aiAvatar.previewHint")}</strong>
        </div>
      </div>
    </div>
  );
}

export const Onboarding: React.FC = () => {
  const { t } = useI18n();
  const storageKey = useMemo(() => getStorageKey(), []);
  const introStorageKey = useMemo(() => getIntroStorageKey(), []);
  const aiAvatarNameStorageKey = useMemo(() => getAiAvatarNameStorageKey(), []);
  const previewMode = useMemo(() => isPreviewMode(), []);
  const introPreviewMode = useMemo(() => isIntroPreviewMode(), []);
  const onboardingSections = useMemo(() => createOnboardingSections(t), [t]);
  const [activeId, setActiveId] =
    useState<OnboardingSectionId>("workspace-map");
  const [aiAvatarName, setAiAvatarName] = useState(() => {
    return localStorage.getItem(aiAvatarNameStorageKey) || "";
  });
  const [visible, setVisible] = useState(() => {
    if (previewMode) return true;

    // The production trigger policy is intentionally not enabled in this PR.
    // This keeps existing users undisturbed while the route can be reviewed via preview params.
    return false;
  });
  const [showIntro, setShowIntro] = useState(() => {
    if (introPreviewMode) return true;
    if (previewMode) return false;
    return localStorage.getItem(introStorageKey) !== "seen";
  });
  const [introLeaving, setIntroLeaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const completionStartedRef = useRef(false);
  const completionTimerRef = useRef<number | null>(null);

  const activeSection =
    onboardingSections.find((section) => section.id === activeId) ||
    onboardingSections[0];
  const isFinalSection =
    activeSection.id === onboardingSections[onboardingSections.length - 1].id;
  const finalAiAvatarName = normalizeAiAvatarName(aiAvatarName);

  useEffect(() => {
    return () => {
      if (completionTimerRef.current !== null) {
        window.clearTimeout(completionTimerRef.current);
      }
    };
  }, []);

  const persistDismissed = () => {
    if (!previewMode) {
      localStorage.setItem(storageKey, "dismissed");
      localStorage.setItem(introStorageKey, "seen");
    }
  };

  const handleClose = () => {
    if (isCompleting) return;

    if (isFinalSection && finalAiAvatarName) {
      handleFinish();
      return;
    }

    persistDismissed();
    setVisible(false);
  };

  const handleFinish = () => {
    if (completionStartedRef.current || !finalAiAvatarName) return;

    completionStartedRef.current = true;
    localStorage.setItem(aiAvatarNameStorageKey, finalAiAvatarName);
    persistDismissed();
    setIsCompleting(true);
    WKApp.mittBus.emit("onboarding-ai-avatar-created" as any);
    completionTimerRef.current = window.setTimeout(() => {
      completionTimerRef.current = null;
      setVisible(false);
    }, getCompletionCloseDelay());
  };

  const handleIntroContinue = () => {
    if (introLeaving) return;

    if (!previewMode) {
      localStorage.setItem(introStorageKey, "seen");
    }
    const transitioned = runOnboardingViewTransition({
      duration: 1240,
      onTransition: () => {
        setShowIntro(false);
        setIntroLeaving(false);
      },
    });
    if (transitioned) return;

    setIntroLeaving(true);
    window.setTimeout(() => {
      setShowIntro(false);
      setIntroLeaving(false);
    }, 620);
  };

  if (!visible) {
    return null;
  }

  if (showIntro) {
    return (
      <div
        className={`wk-onboarding-overlay wk-onboarding-overlay-intro${
          introLeaving ? " is-intro-leaving" : ""
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={t("app.onboarding.dialog.introAria")}
      >
        <OnboardingIntro onContinue={handleIntroContinue} />
      </div>
    );
  }

  return (
    <div
      className={`wk-onboarding-overlay wk-onboarding-overlay-panel${
        isCompleting ? " is-completing" : ""
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wk-onboarding-title"
    >
      {isCompleting ? (
        <div className="wk-onboarding-celebration" aria-hidden="true">
          {CELEBRATION_PARTICLES.map((particle) => (
            <span
              key={particle.id}
              style={
                {
                  "--wk-particle-x": particle.x,
                  "--wk-particle-y": particle.y,
                  "--wk-particle-tx": particle.tx,
                  "--wk-particle-ty": particle.ty,
                  "--wk-particle-rotate": particle.rotate,
                  "--wk-particle-delay": particle.delay,
                  "--wk-particle-color": particle.color,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      ) : null}
      <span className="wk-onboarding-sr-only" role="status" aria-live="polite">
        {isCompleting
          ? t("app.onboarding.sections.aiAvatar.completionStatus")
          : ""}
      </span>
      <section className="wk-onboarding-panel">
        <aside
          className="wk-onboarding-nav"
          aria-label={t("app.onboarding.dialog.sectionsAria")}
        >
          <div className="wk-onboarding-brand">
            <strong>{t("app.onboarding.nav.welcome")}</strong>
          </div>
          <nav className="wk-onboarding-nav-list">
            {onboardingSections.map((section, index) => (
              <React.Fragment key={section.id}>
                {section.id === "ai-avatar" ? (
                  <div
                    className="wk-onboarding-nav-divider"
                    aria-hidden="true"
                  />
                ) : null}
                <button
                  type="button"
                  className={section.id === activeSection.id ? "is-active" : ""}
                  onClick={() => setActiveId(section.id)}
                >
                  <span className="wk-onboarding-nav-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="wk-onboarding-nav-label">
                    {section.label}
                  </span>
                </button>
              </React.Fragment>
            ))}
          </nav>
          <div className="wk-onboarding-resource-links">
            <a
              className="wk-onboarding-open-source"
              href="https://github.com/Mininglamp-OSS"
              target="_blank"
              rel="noreferrer"
            >
              <Github size={15} aria-hidden="true" />
              {t("app.onboarding.links.openSource")}
            </a>
            <a
              className="wk-onboarding-open-source"
              href="https://www.mininglamp.com/about/"
              target="_blank"
              rel="noreferrer"
            >
              <Building2 size={15} aria-hidden="true" />
              {t("app.onboarding.links.aboutMininglamp")}
            </a>
          </div>
        </aside>

        <main className="wk-onboarding-content">
          <button
            className="wk-onboarding-close"
            type="button"
            onClick={handleClose}
            aria-label={t("app.onboarding.actions.closeAria")}
          >
            <X size={18} aria-hidden="true" />
          </button>

          <h1 className="wk-onboarding-title" id="wk-onboarding-title">
            {activeSection.title}
          </h1>

          <div
            className={`wk-onboarding-media-frame${
              isAiAvatarSection(activeSection) ? " is-identity" : ""
            }`}
            aria-label={activeSection.visualTitle}
          >
            {isAiAvatarSection(activeSection) ? (
              <IdentitySetupVisual
                aiAvatarName={aiAvatarName}
                onNameChange={(value) =>
                  setAiAvatarName(value.slice(0, MAX_AI_AVATAR_NAME_LENGTH))
                }
                onEnter={handleFinish}
              />
            ) : (
              <ImageVisual section={activeSection} />
            )}
          </div>

          <p className="wk-onboarding-description">
            {activeSection.description}
          </p>

          {isBrowserExtensionSection(activeSection) ? (
            <div className="wk-onboarding-extension-row">
              <a
                className="wk-onboarding-hover-button is-brand wk-onboarding-extension-action"
                href={BROWSER_EXTENSION_URL}
                target="_blank"
                rel="noreferrer"
                aria-label={t("app.onboarding.actions.installExtensionAria")}
              >
                <span
                  className="wk-onboarding-hover-button-fill"
                  aria-hidden="true"
                />
                <span className="wk-onboarding-hover-button-idle">
                  <span className="wk-onboarding-hover-button-text">
                    {t("app.onboarding.actions.installExtension")}
                  </span>
                  <ExternalLink size={15} aria-hidden="true" />
                </span>
              </a>
            </div>
          ) : null}

          {isAiAvatarSection(activeSection) ? (
            <div className="wk-onboarding-finish-row">
              <OnboardingHoverButton
                className="wk-onboarding-finish-button"
                text={t("app.onboarding.sections.aiAvatar.enableAction")}
                icon={<Sparkles size={15} aria-hidden="true" />}
                variant="brand"
                onClick={handleFinish}
                disabled={!finalAiAvatarName || isCompleting}
              />
            </div>
          ) : null}
        </main>
      </section>
    </div>
  );
};
