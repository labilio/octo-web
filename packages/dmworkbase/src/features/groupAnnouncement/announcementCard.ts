import {
  AnnouncementDocument,
  createAnnouncementDocumentFromPlainText,
} from "./announcementModel";

function escapeMarkdownText(text: string): string {
  return text.replace(/([\\*_[\]])/g, "\\$1");
}

function serializeInline(node: AnnouncementDocument): string {
  if (node.type === "hardBreak") {
    return "  \n";
  }
  if (node.type === "text") {
    const text = escapeMarkdownText(node.text ?? "");
    return node.marks?.some((mark) => mark.type === "bold")
      ? `**${text}**`
      : text;
  }
  return (node.content ?? []).map(serializeInline).join("");
}

function serializeListItem(node: AnnouncementDocument): string {
  return (node.content ?? [])
    .map(serializeBlock)
    .filter((block) => block.length > 0)
    .join("\n");
}

function indentContinuation(text: string): string {
  return text.replace(/\n/g, "\n  ");
}

function serializeBlock(node: AnnouncementDocument): string {
  switch (node.type) {
    case "paragraph":
      return (node.content ?? []).map(serializeInline).join("");
    case "bulletList":
      return (node.content ?? [])
        .map((item) => `- ${indentContinuation(serializeListItem(item))}`)
        .join("\n");
    case "orderedList": {
      const start =
        typeof node.attrs?.start === "number" ? node.attrs.start : 1;
      return (node.content ?? [])
        .map(
          (item, index) =>
            `${start + index}. ${indentContinuation(serializeListItem(item))}`
        )
        .join("\n");
    }
    case "listItem":
      return serializeListItem(node);
    default:
      return serializeInline(node);
  }
}

export function serializeAnnouncementMarkdown(
  doc: AnnouncementDocument
): string {
  return (doc.content ?? [])
    .map(serializeBlock)
    .filter((block) => block.length > 0)
    .join("\n\n");
}

interface BuildGroupAnnouncementCardOptions {
  title: string;
  notice: string;
  noticeDoc?: AnnouncementDocument;
}

export function buildGroupAnnouncementCard({
  title,
  notice,
  noticeDoc,
}: BuildGroupAnnouncementCardOptions): Record<string, unknown> {
  const document = noticeDoc ?? createAnnouncementDocumentFromPlainText(notice);
  const markdown = serializeAnnouncementMarkdown(document);

  return {
    type: "AdaptiveCard",
    version: "1.5",
    body: [
      {
        type: "TextBlock",
        text: title,
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
            text: markdown,
            wrap: true,
            spacing: "None",
          },
        ],
      },
    ],
  };
}
