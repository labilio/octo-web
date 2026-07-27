import { describe, expect, it } from "vitest";
import {
  createAnnouncementDocumentFromPlainText,
  formatGroupAnnouncementConversationDigest,
  resolveGroupAnnouncement,
  serializeAnnouncementPlainText,
} from "../announcementModel";

const systemUID = "u_system";
const noticeDoc = JSON.stringify({
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [{ type: "text", marks: [{ type: "bold" }], text: "Important" }],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Bring a laptop" }],
            },
          ],
        },
      ],
    },
  ],
});

function announcementPayload(overrides: Record<string, unknown> = {}) {
  return {
    content: "{0}修改群公告",
    extra: [{ uid: "user-1", name: "余嘉伟" }],
    data: {
      notice: "Important\n• Bring a laptop",
      notice_doc: noticeDoc,
      notice_doc_version: "1",
    },
    type: 1005,
    ...overrides,
  };
}

describe("resolveGroupAnnouncement", () => {
  it("accepts a server-authored group announcement and preserves the operator", () => {
    expect(
      resolveGroupAnnouncement({
        fromUID: systemUID,
        systemUID,
        contentType: 1005,
        payload: announcementPayload(),
      })
    ).toEqual({
      notice: "Important\n• Bring a laptop",
      noticeDoc: JSON.parse(noticeDoc),
      operatorUID: "user-1",
      operatorName: "余嘉伟",
    });
  });

  it("rejects forged human messages and unrelated channel updates", () => {
    expect(
      resolveGroupAnnouncement({
        fromUID: "user-1",
        systemUID,
        contentType: 1005,
        payload: announcementPayload(),
      })
    ).toBeNull();

    expect(
      resolveGroupAnnouncement({
        fromUID: systemUID,
        systemUID,
        contentType: 1005,
        payload: announcementPayload({ data: { name: "研发群" } }),
      })
    ).toBeNull();
  });

  it("keeps legacy plain announcements and falls back safely from malformed documents", () => {
    expect(
      resolveGroupAnnouncement({
        fromUID: systemUID,
        systemUID,
        contentType: 1005,
        payload: announcementPayload({
          data: {
            notice: "Legacy announcement",
            notice_doc: "{broken",
          },
        }),
      })
    ).toEqual({
      notice: "Legacy announcement",
      noticeDoc: undefined,
      operatorUID: "user-1",
      operatorName: "余嘉伟",
    });
  });
});

describe("serializeAnnouncementPlainText", () => {
  it("round-trips legacy plain text without interpreting it as HTML", () => {
    const plain = "<b>not HTML</b>\nsecond line";
    expect(
      serializeAnnouncementPlainText(
        createAnnouncementDocumentFromPlainText(plain)
      )
    ).toBe(plain);
  });

  it("creates a readable fallback from the supported Tiptap nodes", () => {
    expect(serializeAnnouncementPlainText(JSON.parse(noticeDoc))).toBe(
      "Important\n• Bring a laptop"
    );
  });

  it("preserves ordered-list numbering", () => {
    expect(
      serializeAnnouncementPlainText({
        type: "doc",
        content: [
          {
            type: "orderedList",
            attrs: { start: 2 },
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Check in" }],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Take a seat" }],
                  },
                ],
              },
            ],
          },
        ],
      })
    ).toBe("2. Check in\n3. Take a seat");
  });
});

describe("formatGroupAnnouncementConversationDigest", () => {
  it("uses the human operator and compacts the announcement body", () => {
    expect(
      formatGroupAnnouncementConversationDigest(
        {
          notice: "Important notice\nBring a laptop",
          operatorUID: "user-1",
          operatorName: "Alice",
        },
        "Group announcement"
      )
    ).toBe("Alice: Group announcement Important notice Bring a laptop");
  });
});
