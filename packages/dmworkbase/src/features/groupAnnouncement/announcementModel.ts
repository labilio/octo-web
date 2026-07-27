export const GROUP_ANNOUNCEMENT_CONTENT_TYPE = 1005;
export const GROUP_ANNOUNCEMENT_MAX_CHARACTERS = 400;

export interface AnnouncementDocument {
  type: string;
  attrs?: Record<string, unknown>;
  content?: AnnouncementDocument[];
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  text?: string;
}

export interface GroupAnnouncementViewModel {
  notice: string;
  noticeDoc?: AnnouncementDocument;
  operatorUID: string;
  operatorName: string;
}

interface ResolveGroupAnnouncementInput {
  fromUID: string;
  systemUID: string;
  contentType: number;
  payload: unknown;
}

const allowedNodeTypes = new Set([
  "doc",
  "paragraph",
  "text",
  "hardBreak",
  "bulletList",
  "orderedList",
  "listItem",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isSupportedAnnouncementDocument(
  value: unknown
): value is AnnouncementDocument {
  if (!isRecord(value) || value.type !== "doc") {
    return false;
  }

  let nodeCount = 0;
  let textLength = 0;
  const visit = (
    node: unknown,
    depth: number
  ): node is AnnouncementDocument => {
    if (!isRecord(node) || typeof node.type !== "string") {
      return false;
    }
    if (!allowedNodeTypes.has(node.type) || depth > 12) {
      return false;
    }
    nodeCount += 1;
    if (nodeCount > 200) {
      return false;
    }
    if (node.type === "text") {
      if (typeof node.text !== "string") {
        return false;
      }
      textLength += Array.from(node.text).length;
      if (textLength > GROUP_ANNOUNCEMENT_MAX_CHARACTERS) {
        return false;
      }
    }
    if (node.marks !== undefined) {
      if (
        !Array.isArray(node.marks) ||
        node.marks.some(
          (mark) =>
            !isRecord(mark) ||
            mark.type !== "bold" ||
            (isRecord(mark.attrs) && Object.keys(mark.attrs).length > 0)
        )
      ) {
        return false;
      }
    }
    if (node.attrs !== undefined) {
      if (!isRecord(node.attrs) || node.type !== "orderedList") {
        return false;
      }
      if (
        Object.keys(node.attrs).some((key) => key !== "start" && key !== "type")
      ) {
        return false;
      }
    }
    if (node.content !== undefined) {
      if (!Array.isArray(node.content)) {
        return false;
      }
      return node.content.every((child) => visit(child, depth + 1));
    }
    return true;
  };

  return visit(value, 0);
}

export function parseAnnouncementDocument(
  value: unknown
): AnnouncementDocument | undefined {
  let parsed = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return undefined;
    }
  }
  return isSupportedAnnouncementDocument(parsed) ? parsed : undefined;
}

export function createAnnouncementDocumentFromPlainText(
  notice: string
): AnnouncementDocument {
  return {
    type: "doc",
    content: notice.split("\n").map((line) => ({
      type: "paragraph",
      content: line.length > 0 ? [{ type: "text", text: line }] : undefined,
    })),
  };
}

export function resolveGroupAnnouncement({
  fromUID,
  systemUID,
  contentType,
  payload,
}: ResolveGroupAnnouncementInput): GroupAnnouncementViewModel | null {
  if (
    fromUID !== systemUID ||
    contentType !== GROUP_ANNOUNCEMENT_CONTENT_TYPE ||
    !isRecord(payload) ||
    !isRecord(payload.data)
  ) {
    return null;
  }

  const notice = payload.data.notice;
  const operator = Array.isArray(payload.extra) ? payload.extra[0] : undefined;
  if (
    typeof notice !== "string" ||
    notice.length === 0 ||
    !isRecord(operator) ||
    typeof operator.uid !== "string" ||
    operator.uid.length === 0
  ) {
    return null;
  }

  return {
    notice,
    noticeDoc: parseAnnouncementDocument(payload.data.notice_doc),
    operatorUID: operator.uid,
    operatorName:
      typeof operator.name === "string" && operator.name.length > 0
        ? operator.name
        : operator.uid,
  };
}

export function formatGroupAnnouncementConversationDigest(
  announcement: GroupAnnouncementViewModel,
  title: string
): string {
  const compactNotice = announcement.notice.replace(/\s+/g, " ").trim();
  return `${announcement.operatorName}: ${title} ${compactNotice}`;
}

function inlineText(node: AnnouncementDocument): string {
  if (node.type === "text") {
    return node.text ?? "";
  }
  if (node.type === "hardBreak") {
    return "\n";
  }
  return (node.content ?? []).map(inlineText).join("");
}

function listItemText(node: AnnouncementDocument): string {
  return (node.content ?? [])
    .map((child) => serializeBlock(child))
    .filter((line) => line.length > 0)
    .join("\n");
}

function serializeBlock(node: AnnouncementDocument): string {
  switch (node.type) {
    case "paragraph":
      return inlineText(node);
    case "bulletList":
      return (node.content ?? [])
        .map((item) => `• ${listItemText(item)}`)
        .join("\n");
    case "orderedList": {
      const start =
        typeof node.attrs?.start === "number" ? node.attrs.start : 1;
      return (node.content ?? [])
        .map((item, index) => `${start + index}. ${listItemText(item)}`)
        .join("\n");
    }
    case "listItem":
      return listItemText(node);
    default:
      return inlineText(node);
  }
}

export function serializeAnnouncementPlainText(
  doc: AnnouncementDocument
): string {
  return (doc.content ?? []).map(serializeBlock).join("\n").trimEnd();
}
