import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  Check,
  ExternalLink,
  Github,
  Sparkles,
  X,
} from "lucide-react";
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

const COMPLETION_CELEBRATION_MS = 1180;
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
const CELEBRATION_PARTICLES = Array.from({ length: 46 }, (_, index) => {
  const lane = index % 23;
  const ring = Math.floor(index / 23);
  const angle = (-168 + lane * 7.2) * (Math.PI / 180);
  const distance = ring === 0 ? 110 + (lane % 4) * 12 : 154 + (lane % 5) * 14;

  return {
    id: index,
    tx: `${Math.round(Math.cos(angle) * distance)}px`,
    ty: `${Math.round(Math.sin(angle) * distance)}px`,
    rotate: `${ring === 0 ? 140 + lane * 17 : -120 - lane * 13}deg`,
    delay: `${ring * 44 + lane * 11}ms`,
    color: CELEBRATION_COLORS[lane % CELEBRATION_COLORS.length],
  };
});

type OnboardingSectionId = OnboardingSection["id"];
const preloadedOnboardingImages = new Map<string, HTMLImageElement>();

function isBrowserExtensionSection(section: OnboardingSection) {
  return section.id === "browser-extension";
}

function hasStructuredDescription(section: OnboardingSection) {
  return (
    section.id === "workspace" ||
    section.id === "subspaces" ||
    section.id === "favorites" ||
    section.id === "group-md" ||
    section.id === "smart-summary" ||
    section.id === "webhook" ||
    section.id === "browser-extension" ||
    section.id === "create-bot"
  );
}

function getDescriptionParts(description: string) {
  const [lead, ...support] = description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    lead,
    support,
  };
}

function getStorageKey() {
  const uid = WKApp.loginInfo.uid || "anonymous";
  return `octo:onboarding:first-run:${ONBOARDING_STORAGE_VERSION}:${uid}`;
}

function getIntroStorageKey() {
  const uid = WKApp.loginInfo.uid || "anonymous";
  return `octo:onboarding:intro:${ONBOARDING_STORAGE_VERSION}:${uid}`;
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

function getElementCenter(element: HTMLElement | null) {
  if (element) {
    const rect = element.getBoundingClientRect();

    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }

  return {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };
}

function getCompletionOrigin(
  event?: React.MouseEvent<HTMLButtonElement>,
  fallbackElement?: HTMLButtonElement | null
) {
  if (event && (event.clientX > 0 || event.clientY > 0)) {
    return {
      x: event.clientX,
      y: event.clientY,
    };
  }

  return getElementCenter(event?.currentTarget || fallbackElement || null);
}

function preloadOnboardingImages(
  sections: OnboardingSection[],
  currentImageSrc: string
) {
  sections.forEach((section) => {
    const { imageSrc } = section;

    if (imageSrc === currentImageSrc || preloadedOnboardingImages.has(imageSrc)) {
      return;
    }

    const image = new Image();
    image.decoding = "async";
    image.src = imageSrc;
    preloadedOnboardingImages.set(imageSrc, image);
    void image.decode?.().catch(() => undefined);
  });
}

function ImageVisual({ section }: { section: OnboardingSection }) {
  return (
    <img
      className={`wk-onboarding-image${
        section.imageFit === "contain" ? " is-contain" : ""
      }`}
      src={section.imageSrc}
      alt={section.visualTitle}
      decoding="async"
    />
  );
}

export const Onboarding: React.FC = () => {
  const { locale, t } = useI18n();
  const storageKey = useMemo(() => getStorageKey(), []);
  const introStorageKey = useMemo(() => getIntroStorageKey(), []);
  const previewMode = useMemo(() => isPreviewMode(), []);
  const introPreviewMode = useMemo(() => isIntroPreviewMode(), []);
  const onboardingSections = useMemo(() => createOnboardingSections(t), [t]);
  const [activeId, setActiveId] =
    useState<OnboardingSectionId>("workspace");
  const [completionOrigin, setCompletionOrigin] = useState<{
    x: number;
    y: number;
  } | null>(null);
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
  const finishButtonRef = useRef<HTMLButtonElement | null>(null);
  const completionStartedRef = useRef(false);
  const completionTimerRef = useRef<number | null>(null);

  const activeSection =
    onboardingSections.find((section) => section.id === activeId) ||
    onboardingSections[0];
  const structuredDescription = hasStructuredDescription(activeSection)
    ? getDescriptionParts(activeSection.description)
    : null;
  const isFinalSection =
    activeSection.id === onboardingSections[onboardingSections.length - 1].id;

  useEffect(() => {
    return () => {
      if (completionTimerRef.current !== null) {
        window.clearTimeout(completionTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!visible || showIntro) return;

    const preloadTimer = window.setTimeout(() => {
      preloadOnboardingImages(onboardingSections, activeSection.imageSrc);
    }, 0);

    return () => window.clearTimeout(preloadTimer);
  }, [activeSection.imageSrc, onboardingSections, showIntro, visible]);

  const persistDismissed = () => {
    if (!previewMode) {
      localStorage.setItem(storageKey, "dismissed");
      localStorage.setItem(introStorageKey, "seen");
    }
  };

  const handleClose = () => {
    if (isCompleting) return;

    persistDismissed();
    setVisible(false);
  };

  const handleFinish = (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (completionStartedRef.current) return;

    completionStartedRef.current = true;
    setCompletionOrigin(getCompletionOrigin(event, finishButtonRef.current));
    persistDismissed();
    setIsCompleting(true);
    WKApp.mittBus.emit("onboarding-completed" as any);
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

  const handleIntroSkip = () => {
    if (introLeaving) return;

    const closeIntro = () => {
      persistDismissed();
      setVisible(false);
      setIntroLeaving(false);
    };

    const transitioned = runOnboardingViewTransition({
      duration: 1240,
      onTransition: closeIntro,
    });
    if (transitioned) return;

    setIntroLeaving(true);
    window.setTimeout(closeIntro, 620);
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
        <OnboardingIntro
          onContinue={handleIntroContinue}
          onSkip={handleIntroSkip}
        />
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
        <div
          className="wk-onboarding-celebration"
          aria-hidden="true"
          style={
            completionOrigin
              ? ({
                  "--wk-celebration-x": `${completionOrigin.x}px`,
                  "--wk-celebration-y": `${completionOrigin.y}px`,
                } as React.CSSProperties)
              : undefined
          }
        >
          {CELEBRATION_PARTICLES.map((particle) => (
            <span
              key={particle.id}
              style={
                {
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
          ? t("app.onboarding.actions.completed")
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
                {section.id === "create-bot" ? (
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
              href={
                locale === "en-US"
                  ? "https://www.mininglamp.com/en/about/"
                  : "https://www.mininglamp.com/about/"
              }
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
            className="wk-onboarding-media-frame"
            aria-label={activeSection.visualTitle}
          >
            <ImageVisual section={activeSection} />
          </div>

          {structuredDescription ? (
            <p
              className={`wk-onboarding-description is-${activeSection.id}`}
            >
              <strong className="wk-onboarding-description-lead">
                {structuredDescription.lead}
              </strong>
              {structuredDescription.support.length > 0 ? (
                <span className="wk-onboarding-description-support">
                  {structuredDescription.support.map((paragraph, index) => (
                    <span
                      className="wk-onboarding-description-support-line"
                      key={paragraph}
                    >
                      {paragraph}
                      {index < structuredDescription.support.length - 1
                        ? "\n"
                        : null}
                    </span>
                  ))}
                </span>
              ) : null}
            </p>
          ) : (
            <p className={`wk-onboarding-description is-${activeSection.id}`}>
              {activeSection.description}
            </p>
          )}

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

          {isFinalSection ? (
            <div className="wk-onboarding-finish-row">
              <OnboardingHoverButton
                ref={finishButtonRef}
                className={`wk-onboarding-finish-button${
                  isCompleting ? " is-complete" : ""
                }`}
                text={
                  isCompleting
                    ? t("app.onboarding.actions.completed")
                    : t("app.onboarding.actions.finish")
                }
                icon={
                  isCompleting ? (
                    <Check size={15} aria-hidden="true" />
                  ) : (
                    <Sparkles size={15} aria-hidden="true" />
                  )
                }
                variant="brand"
                onClick={handleFinish}
                disabled={isCompleting}
              />
            </div>
          ) : null}
        </main>
      </section>
    </div>
  );
};
