import React, { useEffect, useRef, useState } from "react";
import { OnboardingHoverButton } from "./HoverButton";
import NarrativeRail from "./NarrativeRail";
import { OnboardingCustomCursor } from "./OnboardingCustomCursor";
import SilkBackground from "./SilkBackground";
import Strands from "./Strands";
import TrueFocus from "./TrueFocus";

const logoSrc = new URL("./assets/octo-logo-white-symbol.png", import.meta.url).href;

const octoMeanings = [
    {
        word: "Open",
        title: "开源开放",
        description: "数据为你所用，不被收录，只服务你的工作流。",
    },
    {
        word: "Context",
        title: "上下文",
        description: "知识的上下文归属清晰，来源与责任可追溯。",
    },
    {
        word: "Taste",
        title: "品鉴",
        description: "人的判断与取舍受最高保护，偏好不会被平均掉。",
    },
    {
        word: "Orchestration",
        title: "编排协作",
        description: "人与 AI 编排协作，任务在同一上下文里推进。",
    },
];

const narrativeItems = [
    {
        title: "您和同事来判断",
    },
    {
        title: "AI 分身学会执行",
    },
    {
        title: "这就是 OCTO",
        emoji: "👋",
    },
];

const narrativeDurations = [2150, 2150, 2900];
const CONTENT_TRANSITION_MS = 280;
const FULL_TRANSITION_OUT_MS = 460;
const FULL_TRANSITION_IN_MS = 620;

const silkBackdropSettings = {
    opening: {
        hue: 252,
        saturation: 0.62,
        brightness: 0.98,
        speed: 0.28,
        mouseSensitivity: 0.42,
        damping: 0.08,
        textureScale: 0.78,
    },
    meaning: {
        hue: 266,
        saturation: 0.68,
        brightness: 0.95,
        speed: 0.34,
        mouseSensitivity: 0.48,
        damping: 0.09,
        textureScale: 0.96,
    },
    silk: {
        hue: 264,
        saturation: 0.68,
        brightness: 0.96,
        speed: 0.42,
        mouseSensitivity: 0.54,
        damping: 0.1,
        textureScale: 1.08,
    },
};

type OnboardingIntroProps = {
    onContinue: () => void;
};

type IntroPhase = "opening" | "meaning" | "silk";
type PhaseTransitionMode = "none" | "content" | "full";
type FullTransitionStage = "idle" | "out" | "in";

export const OnboardingIntro: React.FC<OnboardingIntroProps> = ({ onContinue }) => {
    const [phase, setPhase] = useState<IntroPhase>("opening");
    const [phaseTransitionMode, setPhaseTransitionMode] = useState<PhaseTransitionMode>("none");
    const [fullTransitionStage, setFullTransitionStage] = useState<FullTransitionStage>("idle");
    const [activeMeaningIndex, setActiveMeaningIndex] = useState(0);
    const transitionTimerRefs = useRef<number[]>([]);
    const activeMeaning = octoMeanings[activeMeaningIndex] || octoMeanings[0];
    const focusSentence = octoMeanings.map((meaning) => meaning.word).join(" ");
    const silkBackdrop = silkBackdropSettings[phase];

    const clearTransitionTimers = () => {
        transitionTimerRefs.current.forEach((timer) => window.clearTimeout(timer));
        transitionTimerRefs.current = [];
    };

    const goToPhase = (nextPhase: Exclude<IntroPhase, "opening">) => {
        if (phaseTransitionMode !== "none" || nextPhase === phase) return;

        clearTransitionTimers();

        if (nextPhase === "silk") {
            setPhaseTransitionMode("full");
            setFullTransitionStage("out");

            const swapTimer = window.setTimeout(() => {
                setPhase(nextPhase);
                setFullTransitionStage("in");
            }, FULL_TRANSITION_OUT_MS);

            const doneTimer = window.setTimeout(() => {
                setPhaseTransitionMode("none");
                setFullTransitionStage("idle");
                transitionTimerRefs.current = [];
            }, FULL_TRANSITION_OUT_MS + FULL_TRANSITION_IN_MS);

            transitionTimerRefs.current = [swapTimer, doneTimer];
            return;
        }

        setPhaseTransitionMode("content");

        const timer = window.setTimeout(() => {
            setPhase(nextPhase);
            setPhaseTransitionMode("none");
            transitionTimerRefs.current = [];
        }, CONTENT_TRANSITION_MS);

        transitionTimerRefs.current = [timer];
    };

    useEffect(() => {
        if (phase !== "silk") return;

        const timer = window.setTimeout(() => {
            onContinue();
        }, 7200);

        return () => window.clearTimeout(timer);
    }, [onContinue, phase]);

    useEffect(() => {
        return () => {
            clearTransitionTimers();
        };
    }, []);

    return (
        <div
            className={`wk-onboarding-intro is-${phase} has-custom-cursor${
                phaseTransitionMode !== "none" ? " is-phase-transitioning" : ""
            }${phaseTransitionMode === "full" ? " is-full-phase-transitioning" : ""}${
                fullTransitionStage !== "idle" ? ` is-full-transition-${fullTransitionStage}` : ""
            }`}
            role="presentation"
        >
            <SilkBackground className={`wk-onboarding-silk-canvas is-${phase}`} {...silkBackdrop} />
            <div className="wk-onboarding-intro-atmosphere" aria-hidden="true" />
            <div className="wk-onboarding-stage-fade" aria-hidden="true" />

            <div className="wk-onboarding-intro-logo-anchor">
                <div className="wk-onboarding-intro-logo-shell" data-cursor-interactive="true">
                    <img className="wk-onboarding-intro-logo" src={logoSrc} alt="Octo" draggable={false} />
                </div>
            </div>

            <div className="wk-onboarding-intro-core">
                {phase === "opening" ? (
                    <div className="wk-onboarding-intro-opening">
                        <div className="wk-onboarding-intro-effect" aria-hidden="true">
                            <Strands
                                colors={["#F8FAFC", "#7C3AED", "#06B6D4"]}
                                count={4}
                                speed={0.7}
                                amplitude={0.6}
                                waviness={1.5}
                                thickness={1}
                                glow={2.25}
                                taper={1.5}
                                spread={1.3}
                                intensity={0.35}
                                saturation={1.5}
                                opacity={1}
                                scale={1.5}
                                style={{}}
                            />
                        </div>

                        <div className="wk-onboarding-intro-copy">
                            <h1>Octo 为人与 AI 协作而生</h1>
                            <p>让人和 AI 在同一个上下文里工作</p>
                        </div>
                    </div>
                ) : phase === "meaning" ? (
                    <div className="wk-onboarding-intro-meaning" aria-live="polite">
                        <TrueFocus
                            sentence={focusSentence}
                            blurAmount={3}
                            borderColor="#A78BFA"
                            glowColor="rgba(124, 58, 237, 0.52)"
                            animationDuration={0.62}
                            pauseBetweenAnimations={1.65}
                            enablePointerSelection
                            onActiveIndexChange={setActiveMeaningIndex}
                        />
                        <div className="wk-onboarding-intro-meaning-copy">
                            <strong>{activeMeaning.title}</strong>
                            <p>
                                <span>{activeMeaning.word}</span>
                                {" · "}
                                {activeMeaning.description}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="wk-onboarding-silk-stage" aria-live="polite">
                        <NarrativeRail items={narrativeItems} durations={narrativeDurations} />
                    </div>
                )}
            </div>

            <div className="wk-onboarding-intro-actions">
                <OnboardingHoverButton
                    text={phase === "opening" ? "开始了解" : "进入引导"}
                    variant="light"
                    disabled={phaseTransitionMode !== "none"}
                    onClick={phase === "opening" ? () => goToPhase("meaning") : () => goToPhase("silk")}
                />
            </div>

            <OnboardingCustomCursor active />
        </div>
    );
};
