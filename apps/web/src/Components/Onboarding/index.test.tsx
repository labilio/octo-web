import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Onboarding } from "./index";

const { runOnboardingViewTransition } = vi.hoisted(() => ({
  runOnboardingViewTransition: vi.fn(
    ({ onTransition }: { onTransition: () => void }) => {
      onTransition();
      return true;
    }
  ),
}));

vi.mock("@octo/base", () => ({
  useI18n: () => ({
    locale: "en-US",
    t: (key: string) =>
      ({
        "app.onboarding.dialog.introAria": "Octo onboarding introduction",
        "app.onboarding.intro.actions.skip": "Skip intro",
      })[key] || key,
  }),
  WKApp: {
    loginInfo: { uid: "tester" },
    mittBus: { emit: vi.fn() },
  },
}));

vi.mock("./Intro", () => ({
  OnboardingIntro: ({ onSkip }: { onSkip?: () => void }) => (
    <button type="button" onClick={onSkip}>
      Skip intro
    </button>
  ),
}));

vi.mock("./viewTransition", () => ({
  runOnboardingViewTransition,
}));

describe("Onboarding", () => {
  beforeEach(() => {
    runOnboardingViewTransition.mockClear();
    localStorage.clear();
    window.history.pushState({}, "", "/?intro=1&onboarding=preview");
  });

  it("uses the intro view transition when users skip without opening the section directory", () => {
    render(<Onboarding />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Skip intro" }));

    expect(runOnboardingViewTransition).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
