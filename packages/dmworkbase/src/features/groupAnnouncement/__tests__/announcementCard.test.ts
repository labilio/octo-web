import { describe, expect, it } from "vitest";
import {
  buildGroupAnnouncementCard,
  serializeAnnouncementMarkdown,
} from "../announcementCard";

describe("serializeAnnouncementMarkdown", () => {
  it("maps the supported editor document to the shared card markdown subset", () => {
    expect(
      serializeAnnouncementMarkdown({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                marks: [{ type: "bold" }],
                text: "Important",
              },
              { type: "text", text: " notice" },
            ],
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
            ],
          },
        ],
      })
    ).toBe("**Important** notice\n\n- Bring a laptop\n\n2. Check in");
  });

  it("escapes user-authored markdown control characters", () => {
    expect(
      serializeAnnouncementMarkdown({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "*not bold* [not a link]" }],
          },
        ],
      })
    ).toBe("\\*not bold\\* \\[not a link\\]");
  });
});

describe("buildGroupAnnouncementCard", () => {
  it("creates a display-only Adaptive Card for the shared type 17 renderer", () => {
    expect(
      buildGroupAnnouncementCard({
        title: "Group announcement",
        notice: "Legacy announcement",
      })
    ).toEqual({
      type: "AdaptiveCard",
      version: "1.5",
      body: [
        {
          type: "TextBlock",
          text: "Group announcement",
          size: "Large",
          weight: "Bolder",
          wrap: true,
        },
        {
          type: "Container",
          separator: true,
          spacing: "Medium",
          items: [
            {
              type: "TextBlock",
              text: "Legacy announcement",
              wrap: true,
              spacing: "None",
            },
          ],
        },
      ],
    });
  });
});
