import React from "react";
import ReactDOM from "react-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../../../Components/WKButton", () => ({
  default: ({
    children,
    icon,
    iconOnly: _iconOnly,
    loading: _loading,
    size: _size,
    variant: _variant,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: React.ReactNode;
    iconOnly?: boolean;
    loading?: boolean;
    size?: string;
    variant?: string;
  }) => (
    <button {...props}>
      {icon}
      {children}
    </button>
  ),
}));

import { GroupAnnouncementEditor } from "../GroupAnnouncementEditor";

describe("GroupAnnouncementEditor", () => {
  let container: HTMLDivElement | undefined;

  afterEach(() => {
    if (container) {
      ReactDOM.unmountComponentAtNode(container);
      container.remove();
      container = undefined;
    }
  });

  async function renderEditor(
    editable: boolean,
    options: {
      initialNotice?: string;
      initialNoticeDoc?: string;
    } = {}
  ) {
    container = document.createElement("div");
    document.body.appendChild(container);
    ReactDOM.render(
      <GroupAnnouncementEditor
        context={{ pop: vi.fn() } as any}
        initialNotice={options.initialNotice ?? "Important notice"}
        initialNoticeDoc={options.initialNoticeDoc}
        editable={editable}
        onPublish={vi.fn()}
      />,
      container
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  it("renders the full announcement without editing controls for members", async () => {
    await renderEditor(false);

    expect(
      container?.querySelector('.tiptap[contenteditable="false"]')?.textContent
    ).toContain("Important notice");
    expect(
      container?.querySelector(".wk-group-announcement-editor__toolbar")
    ).toBeNull();
    expect(
      container?.querySelector(".wk-group-announcement-editor__actions")
    ).toBeNull();
    expect(
      container?.querySelector(
        ".wk-group-announcement-editor__canvas--reading-card"
      )
    ).not.toBeNull();
    expect(
      container?.querySelector(".wk-group-announcement-editor__detail-actions")
    ).toBeNull();
    expect(
      container?.querySelector(".wk-group-announcement-editor__divider")
    ).toBeNull();
    expect(
      Array.from(container?.querySelectorAll("button") ?? []).some(
        (button) => button.textContent === "base.common.edit"
      )
    ).toBe(false);
  });

  it("shows a read-only empty state without an edit action for members", async () => {
    await renderEditor(false, { initialNotice: "" });

    expect(container?.textContent).toContain("base.groupAnnouncement.empty");
    expect(
      Array.from(container?.querySelectorAll("button") ?? []).some(
        (button) => button.textContent === "base.common.edit"
      )
    ).toBe(false);
  });

  it("keeps the existing editing controls for managers", async () => {
    await renderEditor(true);

    expect(
      container?.querySelector('.tiptap[contenteditable="true"]')
    ).not.toBeNull();
    expect(
      container?.querySelector(".wk-group-announcement-editor__toolbar")
    ).not.toBeNull();
    expect(
      container?.querySelector(".wk-group-announcement-editor__actions")
    ).not.toBeNull();
  });

  it("always shows the current character count while editing", async () => {
    await renderEditor(true);

    expect(
      container?.querySelector(".wk-group-announcement-editor__count")
        ?.textContent
    ).toBe("16/400");
  });

  it("removes a list item when all of its text is selected and deleted", async () => {
    await renderEditor(true, {
      initialNotice: "First\nSecond\nThird",
      initialNoticeDoc: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "bulletList",
            content: ["First", "Second", "Third"].map((text) => ({
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text }],
                },
              ],
            })),
          },
        ],
      }),
    });

    const editorElement = container?.querySelector(
      '.tiptap[contenteditable="true"]'
    );
    const secondItemText = editorElement
      ?.querySelectorAll("li")[1]
      ?.querySelector("p")?.firstChild;

    expect(secondItemText?.textContent).toBe("Second");

    const selection = document.getSelection();
    const range = document.createRange();
    range.selectNodeContents(secondItemText as Node);
    Object.defineProperty(range, "getClientRects", {
      value: () => [],
    });
    Object.defineProperty(range, "getBoundingClientRect", {
      value: () => ({
        bottom: 0,
        height: 0,
        left: 0,
        right: 0,
        top: 0,
        width: 0,
      }),
    });
    (editorElement as HTMLElement).focus();
    selection?.removeAllRanges();
    selection?.addRange(range);
    document.dispatchEvent(new Event("selectionchange"));
    await new Promise((resolve) => setTimeout(resolve, 0));

    editorElement?.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Backspace",
        bubbles: true,
        cancelable: true,
      })
    );
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(
      Array.from(editorElement?.querySelectorAll("li") ?? []).map((item) =>
        item.textContent?.trim()
      )
    ).toEqual(["First", "Third"]);
  });
});
