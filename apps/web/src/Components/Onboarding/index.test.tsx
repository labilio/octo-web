import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WKApp } from "@octo/base";
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
        "app.onboarding.sections.workspace.description":
          "Workspace lead\nShared context\nHuman and AI coordination",
        "app.onboarding.sections.subspaces.label": "Subspaces",
        "app.onboarding.sections.subspaces.description":
          "Specific problem\nFocused task\nHuman and AI coordination",
        "app.onboarding.sections.favorites.label": "Favorites",
        "app.onboarding.sections.favorites.description":
          "Favorites lead\nSupporting copy",
        "app.onboarding.sections.groupMd.description":
          "Group handbook lead\nOwner writes the rules\nPeople and Agents read first",
        "app.onboarding.sections.smartSummary.label": "AI Summary",
        "app.onboarding.sections.smartSummary.title":
          "Summarize multiple group chats in one click",
        "app.onboarding.sections.smartSummary.description":
          "Clear context\nBring conclusions back\nReturn to judgment",
        "app.onboarding.sections.webhook.title":
          "Use Webhooks so important updates do not wait to be forwarded",
        "app.onboarding.sections.webhook.description":
          "External systems notify Octo\nConnect a dedicated address\nPeople and AI act on the same message",
        "app.onboarding.sections.browserExtension.label": "Extension",
        "app.onboarding.sections.browserExtension.title":
          "Connect to Octo from the browser you already use",
        "app.onboarding.sections.browserExtension.description":
          "The browser extension prevents tool switching\nOpen Octo beside the current page\nKeep working while the conversation continues",
        "app.onboarding.sections.aiAvatar.label": "Create your Bot",
        "app.onboarding.sections.aiAvatar.title": "Create your Bot",
        "app.onboarding.sections.aiAvatar.description":
          "Go to BotFather, create your first Bot, and start experiencing Octo.",
        "app.onboarding.actions.finish": "Finish",
        "app.onboarding.actions.completed": "Completed",
        "app.onboarding.sections.aiAvatar.visualTitle":
          "Cursor hovering over the BotFather entry",
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

  it("presents the Favorites definition as a lead followed by supporting copy", () => {
    window.history.pushState({}, "", "/?onboarding=preview");

    render(<Onboarding />);

    fireEvent.click(screen.getByRole("button", { name: /Favorites/ }));

    expect(screen.getByText("Favorites lead")).toHaveClass(
      "wk-onboarding-description-lead"
    );
    expect(screen.getByText("Supporting copy")).toHaveClass(
      "wk-onboarding-description-support-line"
    );
  });

  it("keeps the Workspace explanation as a three-line lead and support block", () => {
    window.history.pushState({}, "", "/?onboarding=preview");

    render(<Onboarding />);

    expect(screen.getByText("Workspace lead")).toHaveClass(
      "wk-onboarding-description-lead"
    );
    expect(
      screen.getByText(
        (_, element) =>
          element?.classList.contains("wk-onboarding-description-support") &&
          element.textContent === "Shared context\nHuman and AI coordination"
      )
    ).toHaveClass("wk-onboarding-description-support");
    expect(
      document.querySelectorAll(".wk-onboarding-description-support-line")
    ).toHaveLength(2);
  });

  it("keeps the Subspaces explanation as a three-line lead and support block", () => {
    window.history.pushState({}, "", "/?onboarding=preview");

    render(<Onboarding />);

    fireEvent.click(screen.getByRole("button", { name: /Subspaces/ }));

    expect(screen.getByText("Specific problem")).toHaveClass(
      "wk-onboarding-description-lead"
    );
    expect(
      screen.getByText(
        (_, element) =>
          element?.classList.contains("wk-onboarding-description-support") &&
          element.textContent === "Focused task\nHuman and AI coordination"
      )
    ).toHaveClass("wk-onboarding-description-support");
  });

  it("keeps the GROUP.md explanation as a three-line lead and support block", () => {
    window.history.pushState({}, "", "/?onboarding=preview");

    render(<Onboarding />);

    fireEvent.click(screen.getByRole("button", { name: /GROUP\.md/ }));

    expect(screen.getByText("Group handbook lead")).toHaveClass(
      "wk-onboarding-description-lead"
    );
    expect(
      screen.getByText(
        (_, element) =>
          element?.classList.contains("wk-onboarding-description-support") &&
          element.textContent ===
            "Owner writes the rules\nPeople and Agents read first"
      )
    ).toHaveClass("wk-onboarding-description-support");
  });

  it("uses the new AI Summary title and three-line explanation", () => {
    window.history.pushState({}, "", "/?onboarding=preview");

    render(<Onboarding />);

    fireEvent.click(screen.getByRole("button", { name: /AI Summary/ }));

    expect(
      screen.getByRole("heading", {
        name: "Summarize multiple group chats in one click",
      })
    ).toBeInTheDocument();
    expect(screen.getByText("Clear context")).toHaveClass(
      "wk-onboarding-description-lead"
    );
    expect(
      screen.getByText(
        (_, element) =>
          element?.classList.contains("wk-onboarding-description-support") &&
          element.textContent ===
            "Bring conclusions back\nReturn to judgment"
      )
    ).toHaveClass("wk-onboarding-description-support");
  });

  it("uses the Webhook benefit title and three-line explanation", () => {
    window.history.pushState({}, "", "/?onboarding=preview");

    render(<Onboarding />);

    fireEvent.click(screen.getByRole("button", { name: /Webhook/ }));

    expect(
      screen.getByRole("heading", {
        name: "Use Webhooks so important updates do not wait to be forwarded",
      })
    ).toBeInTheDocument();
    expect(screen.getByText("External systems notify Octo")).toHaveClass(
      "wk-onboarding-description-lead"
    );
    expect(
      screen.getByText(
        (_, element) =>
          element?.classList.contains("wk-onboarding-description-support") &&
          element.textContent ===
            "Connect a dedicated address\nPeople and AI act on the same message"
      )
    ).toHaveClass("wk-onboarding-description-support");
  });

  it("frames the browser extension around uninterrupted work", () => {
    window.history.pushState({}, "", "/?onboarding=preview");

    render(<Onboarding />);

    fireEvent.click(screen.getByRole("button", { name: /Extension/ }));

    expect(
      screen.getByRole("heading", {
        name: "Connect to Octo from the browser you already use",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText("The browser extension prevents tool switching")
    ).toHaveClass("wk-onboarding-description-lead");
    expect(
      screen.getByText(
        (_, element) =>
          element?.classList.contains("wk-onboarding-description-support") &&
          element.textContent ===
            "Open Octo beside the current page\nKeep working while the conversation continues"
      )
    ).toHaveClass("wk-onboarding-description-support");
  });

  it("uses a standard image page for Bot creation and keeps the completion celebration", () => {
    window.history.pushState({}, "", "/?onboarding=preview");

    render(<Onboarding />);

    fireEvent.click(screen.getByRole("button", { name: /Create your Bot/ }));

    expect(
      screen.getByRole("heading", { name: "Create your Bot" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /BotFather entry/ })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Go to BotFather, create your first Bot, and start experiencing Octo."
      )
    ).toHaveClass("wk-onboarding-description-lead");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Finish" }));

    expect(document.querySelector(".wk-onboarding-celebration")).toBeInTheDocument();
    expect(WKApp.mittBus.emit).toHaveBeenCalledWith("onboarding-completed");
  });
});
