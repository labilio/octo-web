import { describe, expect, it } from "vitest";
import {
  isElementVisibleInViewport,
  isRectangleVisibleWithin,
  shouldMarkConversationRead,
  shouldSuppressImmediateAlert,
} from "./messageAttention";

describe("message attention", () => {
  const visibleCurrentMessage = {
    chatModuleActive: true,
    documentVisible: true,
    windowFocused: true,
    currentConversation: true,
    newMessageVisible: true,
  };

  it("suppresses an alert only when the new message is actually visible", () => {
    expect(shouldSuppressImmediateAlert(visibleCurrentMessage)).toBe(true);
    expect(
      shouldSuppressImmediateAlert({
        ...visibleCurrentMessage,
        newMessageVisible: false,
      })
    ).toBe(false);
  });

  it("does not treat an open background tab as read", () => {
    expect(
      shouldMarkConversationRead({
        ...visibleCurrentMessage,
        documentVisible: false,
      })
    ).toBe(false);
    expect(
      shouldMarkConversationRead({
        ...visibleCurrentMessage,
        windowFocused: false,
      })
    ).toBe(false);
  });

  it("checks the actual element rectangle against the viewport", () => {
    expect(
      isElementVisibleInViewport(
        { top: 20, bottom: 60, left: 10, right: 100, width: 90, height: 40 },
        { width: 1440, height: 900 }
      )
    ).toBe(true);
    expect(
      isElementVisibleInViewport(
        { top: 920, bottom: 960, left: 10, right: 100, width: 90, height: 40 },
        { width: 1440, height: 900 }
      )
    ).toBe(false);
  });

  it("does not count a message clipped outside its conversation viewport", () => {
    expect(
      isRectangleVisibleWithin(
        {
          top: 620,
          bottom: 680,
          left: 100,
          right: 500,
          width: 400,
          height: 60,
        },
        { top: 100, bottom: 600, left: 80, right: 700, width: 620, height: 500 }
      )
    ).toBe(false);
    expect(
      isRectangleVisibleWithin(
        {
          top: 560,
          bottom: 620,
          left: 100,
          right: 500,
          width: 400,
          height: 60,
        },
        { top: 100, bottom: 600, left: 80, right: 700, width: 620, height: 500 }
      )
    ).toBe(true);
  });
});
