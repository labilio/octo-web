import React, { useMemo, useState } from "react";
import { Building2, ExternalLink, Github, X } from "lucide-react";
import { WKApp } from "@octo/base";
import { onboardingSections, ONBOARDING_STORAGE_VERSION, type OnboardingSection } from "./content";
import { OnboardingIntro } from "./Intro";
import { runOnboardingViewTransition } from "./viewTransition";
import "./index.css";

const BROWSER_EXTENSION_URL =
    "https://chromewebstore.google.com/detail/octo-%E6%8F%92%E4%BB%B6%E7%89%88/nemameogpfkponoomeblkjcnbidgmndk";

type OnboardingSectionId = OnboardingSection["id"];

function isBrowserExtensionSection(section: OnboardingSection) {
    return section.id === "browser-extension";
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
    return new URLSearchParams(window.location.search).get("onboarding") === "preview";
}

function isIntroPreviewMode() {
    return new URLSearchParams(window.location.search).get("intro") === "1";
}

function ImageVisual({ section }: { section: OnboardingSection }) {
    return <img className="wk-onboarding-image" src={section.imageSrc} alt={section.visualTitle} />;
}

export const Onboarding: React.FC = () => {
    const storageKey = useMemo(() => getStorageKey(), []);
    const introStorageKey = useMemo(() => getIntroStorageKey(), []);
    const previewMode = useMemo(() => isPreviewMode(), []);
    const introPreviewMode = useMemo(() => isIntroPreviewMode(), []);
    const [activeId, setActiveId] = useState<OnboardingSectionId>(onboardingSections[0].id);
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

    const activeSection = onboardingSections.find((section) => section.id === activeId) || onboardingSections[0];

    const persistDismissed = () => {
        if (!previewMode) {
            localStorage.setItem(storageKey, "dismissed");
            localStorage.setItem(introStorageKey, "seen");
        }
    };

    const handleClose = () => {
        persistDismissed();
        setVisible(false);
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
                className={`wk-onboarding-overlay wk-onboarding-overlay-intro${introLeaving ? " is-intro-leaving" : ""}`}
                role="dialog"
                aria-modal="true"
                aria-label="Octo onboarding intro"
            >
                <OnboardingIntro onContinue={handleIntroContinue} />
            </div>
        );
    }

    return (
        <div
            className="wk-onboarding-overlay wk-onboarding-overlay-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wk-onboarding-title"
        >
            <section className="wk-onboarding-panel">
                <aside className="wk-onboarding-nav" aria-label="Onboarding sections">
                    <div className="wk-onboarding-brand">
                        <strong>Welcome!</strong>
                    </div>
                    <nav className="wk-onboarding-nav-list">
                        {onboardingSections.map((section, index) => (
                            <button
                                key={section.id}
                                type="button"
                                className={section.id === activeSection.id ? "is-active" : ""}
                                onClick={() => setActiveId(section.id)}
                            >
                                <span>{String(index + 1).padStart(2, "0")}</span>
                                {section.label}
                            </button>
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
                            开源地址
                        </a>
                        <a
                            className="wk-onboarding-open-source"
                            href="https://www.mininglamp.com/about/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Building2 size={15} aria-hidden="true" />
                            关于明略
                        </a>
                    </div>
                </aside>

                <main className="wk-onboarding-content">
                    <button className="wk-onboarding-close" type="button" onClick={handleClose} aria-label="关闭 onboarding">
                        <X size={18} aria-hidden="true" />
                    </button>

                    <h1 className="wk-onboarding-title" id="wk-onboarding-title">
                        {activeSection.title}
                    </h1>

                    <div className="wk-onboarding-media-frame" aria-label={activeSection.visualTitle}>
                        <ImageVisual section={activeSection} />
                    </div>

                    <p className="wk-onboarding-description">{activeSection.description}</p>

                    {isBrowserExtensionSection(activeSection) ? (
                        <div className="wk-onboarding-extension-row">
                            <a
                                className="wk-onboarding-hover-button is-brand wk-onboarding-extension-action"
                                href={BROWSER_EXTENSION_URL}
                                target="_blank"
                                rel="noreferrer"
                                aria-label="安装 Octo 浏览器插件，打开 Chrome Web Store"
                            >
                                <span className="wk-onboarding-hover-button-fill" aria-hidden="true" />
                                <span className="wk-onboarding-hover-button-idle">
                                    <span className="wk-onboarding-hover-button-text">安装浏览器插件</span>
                                    <ExternalLink size={15} aria-hidden="true" />
                                </span>
                            </a>
                        </div>
                    ) : null}
                </main>
            </section>
        </div>
    );
};
