import React from "react";
import ReactDOM from "react-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
  t: (key: string) => key,
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

import {
  GroupAnnouncementPage,
  GroupAnnouncementPageHandle,
} from "../GroupAnnouncementPage";

describe("GroupAnnouncementPage", () => {
  let container: HTMLDivElement | undefined;

  afterEach(() => {
    if (container) {
      ReactDOM.unmountComponentAtNode(container);
      container.remove();
      container = undefined;
    }
  });

  async function renderPage(canEdit: boolean) {
    const context = {
      push: vi.fn(),
      pop: vi.fn(),
    } as any;
    const onPublish = vi.fn().mockResolvedValue(undefined);
    const pageRef = React.createRef<GroupAnnouncementPageHandle>();
    container = document.createElement("div");
    document.body.appendChild(container);
    ReactDOM.render(
      <GroupAnnouncementPage
        ref={pageRef}
        context={context}
        initialNotice="Original announcement"
        canEdit={canEdit}
        onPublish={onPublish}
      />,
      container
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    return { context, onPublish, pageRef };
  }

  it("keeps the member detail read-only without an edit action", async () => {
    await renderPage(false);

    expect(
      container?.querySelector('.tiptap[contenteditable="false"]')?.textContent
    ).toContain("Original announcement");
    expect(
      Array.from(container?.querySelectorAll("button") ?? []).some(
        (button) => button.textContent === "base.common.edit"
      )
    ).toBe(false);
  });

  it("opens the existing editor from the manager detail", async () => {
    const { context, pageRef } = await renderPage(true);
    pageRef.current?.openEditor();

    expect(context.push).toHaveBeenCalledTimes(1);
    const editorPage = context.push.mock.calls[0][0];
    expect(editorPage.props.editable).toBe(true);
    expect(editorPage.props.initialNotice).toBe("Original announcement");
  });

  it("updates the detail content after a successful publish", async () => {
    const { context, onPublish, pageRef } = await renderPage(true);
    pageRef.current?.openEditor();
    const editorPage = context.push.mock.calls[0][0];

    await editorPage.props.onPublish({
      notice: "Updated announcement",
      noticeDoc: "",
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onPublish).toHaveBeenCalledWith({
      notice: "Updated announcement",
      noticeDoc: "",
    });
    expect(
      container?.querySelector('.tiptap[contenteditable="false"]')?.textContent
    ).toContain("Updated announcement");
  });

  it("does not open the editor through the page handle for members", async () => {
    const { context, pageRef } = await renderPage(false);

    pageRef.current?.openEditor();

    expect(context.push).not.toHaveBeenCalled();
  });
});
