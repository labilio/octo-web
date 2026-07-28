import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import { ChannelTypePerson } from "wukongimjssdk";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type MockChannelInfo = {
  channel?: { channelID: string; channelType: number };
  online: boolean;
};

type MockChannelInfoListener = (channelInfo: MockChannelInfo) => void;

const channelRuntimeMocks = vi.hoisted(() => ({
  getImChannelInfo: vi.fn<
    (_sdk: unknown, _channel: unknown) => MockChannelInfo | undefined
  >(() => ({
    online: true,
  })),
  fetchImChannelInfo: vi.fn<
    (_sdk: unknown, _channel: unknown) => Promise<unknown>
  >(),
  addImChannelInfoListener: vi.fn<
    (_sdk: unknown, _listener: MockChannelInfoListener) => () => void
  >(() => () => {}),
}));

vi.mock("../../App", () => ({
  default: {
    config: { systemUID: "system" },
    loginInfo: { uid: "viewer" },
    shared: {
      avatarUser: () => "",
    },
  },
}));

vi.mock("../../ui/message/MessageRow", () => ({
  default: ({
    children,
    isOnline,
  }: {
    children: React.ReactNode;
    isOnline?: boolean;
  }) => (
    <div>
      {isOnline && <span className="wk-msg-avatar-online-dot" />}
      {children}
    </div>
  ),
}));

vi.mock("../../im-runtime/channelRuntime", () => channelRuntimeMocks);

vi.mock("../../i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../../Components/WKButton", () => ({
  default: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

import { GroupAnnouncementMessage } from ".";

describe("GroupAnnouncementMessage", () => {
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    channelRuntimeMocks.getImChannelInfo.mockReset();
    channelRuntimeMocks.getImChannelInfo.mockReturnValue({
      online: true,
    });
    channelRuntimeMocks.fetchImChannelInfo.mockReset();
    channelRuntimeMocks.addImChannelInfoListener.mockReset();
    channelRuntimeMocks.addImChannelInfoListener.mockImplementation(
      () => () => {}
    );
  });

  afterEach(() => {
    if (container) {
      ReactDOM.unmountComponentAtNode(container);
      container.remove();
      container = undefined;
    }
  });

  it("renders a type 1005 announcement through the shared card view", async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    ReactDOM.render(
      <GroupAnnouncementMessage
        message={{ timestamp: 1 } as any}
        context={
          {
            editOn: () => false,
            onTapAvatar: () => {},
            showUser: () => {},
          } as any
        }
        announcement={{
          notice: "Important\n• First\n• Second",
          noticeDoc: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Important" }],
              },
              {
                type: "bulletList",
                content: [
                  {
                    type: "listItem",
                    content: [
                      {
                        type: "paragraph",
                        content: [{ type: "text", text: "First" }],
                      },
                    ],
                  },
                  {
                    type: "listItem",
                    content: [
                      {
                        type: "paragraph",
                        content: [{ type: "text", text: "Second" }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          operatorUID: "alice",
          operatorName: "Alice",
        }}
      />,
      container
    );

    await new Promise((resolve) => setTimeout(resolve, 0));
    const card = container.querySelector(
      ".wk-interactive-card-sdk"
    ) as HTMLElement;
    expect(card).not.toBeNull();
    expect(card.hasAttribute("contenteditable")).toBe(false);
    expect(card.querySelector("ul")).not.toBeNull();
    expect(card.textContent).toContain("First");
    expect(card.textContent).toContain("Second");
  });

  it("shows the operator online indicator when the operator is online", async () => {
    container = document.createElement("div");
    document.body.appendChild(container);

    await act(async () => {
      ReactDOM.render(
        <GroupAnnouncementMessage
          message={{ timestamp: 1 } as any}
          context={
            {
              editOn: () => false,
              onTapAvatar: () => {},
              showUser: () => {},
            } as any
          }
          announcement={{
            notice: "Important",
            operatorUID: "alice",
            operatorName: "Alice",
          }}
        />,
        container
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(
      container.querySelector(".wk-msg-avatar-online-dot")
    ).not.toBeNull();
  });

  it("updates the operator online indicator when channel info changes", async () => {
    let channelInfoListener: MockChannelInfoListener | undefined;
    channelRuntimeMocks.getImChannelInfo.mockReturnValue({
      online: false,
    });
    channelRuntimeMocks.addImChannelInfoListener.mockImplementation(
      (_sdk, listener) => {
        channelInfoListener = listener;
        return () => {};
      }
    );
    container = document.createElement("div");
    document.body.appendChild(container);

    await act(async () => {
      ReactDOM.render(
        <GroupAnnouncementMessage
          message={{ timestamp: 1 } as any}
          context={
            {
              editOn: () => false,
              onTapAvatar: () => {},
              showUser: () => {},
            } as any
          }
          announcement={{
            notice: "Important",
            operatorUID: "alice",
            operatorName: "Alice",
          }}
        />,
        container
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(container.querySelector(".wk-msg-avatar-online-dot")).toBeNull();

    channelRuntimeMocks.getImChannelInfo.mockReturnValue({
      online: true,
    });
    act(() => {
      channelInfoListener?.({
        channel: {
          channelID: "alice",
          channelType: ChannelTypePerson,
        },
        online: true,
      });
    });

    expect(
      container.querySelector(".wk-msg-avatar-online-dot")
    ).not.toBeNull();
  });

  it("opens the full announcement instead of expanding the chat card", async () => {
    const scrollHeight = vi
      .spyOn(HTMLElement.prototype, "scrollHeight", "get")
      .mockReturnValue(500);
    const clientHeight = vi
      .spyOn(HTMLElement.prototype, "clientHeight", "get")
      .mockReturnValue(200);
    const openGroupAnnouncement = vi.fn();
    const announcement = {
      notice: "Long announcement",
      noticeDoc: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Long announcement" }],
          },
        ],
      },
      operatorUID: "alice",
      operatorName: "Alice",
    };

    container = document.createElement("div");
    document.body.appendChild(container);
    await act(async () => {
      ReactDOM.render(
        <GroupAnnouncementMessage
          message={{ timestamp: 1 } as any}
          context={
            {
              editOn: () => false,
              onTapAvatar: () => {},
              showUser: () => {},
              openGroupAnnouncement,
            } as any
          }
          announcement={announcement}
        />,
        container
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const button = container.querySelector("button") as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.textContent).toContain("base.groupAnnouncement.viewFull");

    act(() => button.click());

    expect(openGroupAnnouncement).toHaveBeenCalledWith(announcement);
    expect(
      container.querySelector(
        ".wk-group-announcement-card__viewport--expanded"
      )
    ).toBeNull();

    scrollHeight.mockRestore();
    clientHeight.mockRestore();
  });
});
