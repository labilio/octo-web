import { IconBold, IconList, IconOrderedList } from "@douyinfe/semi-icons";
import type { Editor } from "@tiptap/core";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useMemo, useState } from "react";

import WKButton from "../../Components/WKButton";
import RouteContext from "../../Service/Context";
import { useI18n } from "../../i18n";
import {
  AnnouncementDocument,
  createAnnouncementDocumentFromPlainText,
  GROUP_ANNOUNCEMENT_MAX_CHARACTERS,
  parseAnnouncementDocument,
  serializeAnnouncementPlainText,
} from "./announcementModel";
import { RemoveFullySelectedListItem } from "./removeFullySelectedListItem";
import "./GroupAnnouncementEditor.css";

interface GroupAnnouncementEditorProps {
  context: RouteContext<any>;
  initialNotice: string;
  initialNoticeDoc?: string;
  editable?: boolean;
  onPublish: (payload: { notice: string; noticeDoc: string }) => Promise<void>;
}

function normalizeInitialDocument(
  initialNotice: string,
  initialNoticeDoc?: string
): AnnouncementDocument {
  return (
    parseAnnouncementDocument(initialNoticeDoc) ??
    createAnnouncementDocumentFromPlainText(initialNotice)
  );
}

type AnnouncementListType = "bulletList" | "orderedList";

function toggleAnnouncementList(
  editor: Editor,
  targetListType: AnnouncementListType
) {
  const otherListType: AnnouncementListType =
    targetListType === "bulletList" ? "orderedList" : "bulletList";
  const chain = editor.chain().focus();

  if (editor.isActive(targetListType)) {
    return targetListType === "bulletList"
      ? chain.toggleBulletList().run()
      : chain.toggleOrderedList().run();
  }

  if (editor.isActive(otherListType)) {
    chain.liftListItem("listItem");
  }

  return targetListType === "bulletList"
    ? chain.toggleBulletList().run()
    : chain.toggleOrderedList().run();
}

export function GroupAnnouncementEditor({
  context,
  initialNotice,
  initialNoticeDoc,
  editable = true,
  onPublish,
}: GroupAnnouncementEditorProps) {
  const { t } = useI18n();
  const initialDocument = useMemo(
    () => normalizeInitialDocument(initialNotice, initialNoticeDoc),
    [initialNotice, initialNoticeDoc]
  );
  const initialSerialized = useMemo(
    () => JSON.stringify(initialDocument),
    [initialDocument]
  );
  const [notice, setNotice] = useState(() =>
    serializeAnnouncementPlainText(initialDocument)
  );
  const [serializedDocument, setSerializedDocument] =
    useState(initialSerialized);
  const [publishing, setPublishing] = useState(false);

  const editor = useEditor({
    editable,
    extensions: [
      RemoveFullySelectedListItem,
      StarterKit.configure({
        blockquote: false,
        code: false,
        codeBlock: false,
        heading: false,
        horizontalRule: false,
        italic: false,
        link: false,
        strike: false,
      }),
      Placeholder.configure({
        placeholder: t("base.groupAnnouncement.editor.placeholder"),
      }),
    ],
    content: initialDocument,
    onUpdate: ({ editor: currentEditor }) => {
      const document = currentEditor.getJSON() as AnnouncementDocument;
      setSerializedDocument(JSON.stringify(document));
      setNotice(serializeAnnouncementPlainText(document));
    },
  });

  const characterCount = Array.from(notice).length;
  const isOverLimit = characterCount > GROUP_ANNOUNCEMENT_MAX_CHARACTERS;
  const isChanged = serializedDocument !== initialSerialized;
  const canPublish = isChanged && !isOverLimit && !publishing;

  const handlePublish = async () => {
    if (!canPublish) {
      return;
    }
    setPublishing(true);
    try {
      await onPublish({
        notice,
        noticeDoc: notice.length > 0 ? serializedDocument : "",
      });
      context.pop();
    } catch {
      // The caller owns the user-facing error message; keep the editor open.
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div
      className={
        editable
          ? "wk-group-announcement-editor"
          : "wk-group-announcement-editor wk-group-announcement-editor--read-only"
      }
    >
      <div
        className={
          editable
            ? "wk-group-announcement-editor__canvas"
            : "wk-group-announcement-editor__canvas wk-group-announcement-editor__canvas--reading-card"
        }
      >
        {!editable && notice.length === 0 ? (
          <div className="wk-group-announcement-editor__empty">
            {t("base.groupAnnouncement.empty")}
          </div>
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>

      {editable && (
        <>
          <div className="wk-group-announcement-editor__toolbar">
            <div className="wk-group-announcement-editor__formatting">
              <WKButton
                aria-label={t("base.groupAnnouncement.editor.bold")}
                title={t("base.groupAnnouncement.editor.bold")}
                variant="ghost"
                size="sm"
                iconOnly
                className={
                  editor?.isActive("bold")
                    ? "wk-group-announcement-editor__tool--active"
                    : undefined
                }
                icon={<IconBold />}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => editor?.chain().focus().toggleBold().run()}
              />
              <WKButton
                aria-label={t("base.groupAnnouncement.editor.orderedList")}
                title={t("base.groupAnnouncement.editor.orderedList")}
                variant="ghost"
                size="sm"
                iconOnly
                className={
                  editor?.isActive("orderedList")
                    ? "wk-group-announcement-editor__tool--active"
                    : undefined
                }
                icon={<IconOrderedList />}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() =>
                  editor && toggleAnnouncementList(editor, "orderedList")
                }
              />
              <WKButton
                aria-label={t("base.groupAnnouncement.editor.bulletList")}
                title={t("base.groupAnnouncement.editor.bulletList")}
                variant="ghost"
                size="sm"
                iconOnly
                className={
                  editor?.isActive("bulletList")
                    ? "wk-group-announcement-editor__tool--active"
                    : undefined
                }
                icon={<IconList />}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() =>
                  editor && toggleAnnouncementList(editor, "bulletList")
                }
              />
            </div>
            <span
              className={
                isOverLimit
                  ? "wk-group-announcement-editor__count wk-group-announcement-editor__count--error"
                  : "wk-group-announcement-editor__count"
              }
            >
              {characterCount}/{GROUP_ANNOUNCEMENT_MAX_CHARACTERS}
            </span>
          </div>

          <div className="wk-group-announcement-editor__divider" />

          <div className="wk-group-announcement-editor__actions">
            <WKButton
              className="wk-group-announcement-editor__action"
              variant="primary"
              loading={publishing}
              disabled={!canPublish}
              onClick={handlePublish}
            >
              {t("base.groupAnnouncement.editor.publish")}
            </WKButton>
            <WKButton
              className="wk-group-announcement-editor__action"
              variant="secondary"
              disabled={publishing}
              onClick={() => context.pop()}
            >
              {t("base.common.cancel")}
            </WKButton>
          </div>
        </>
      )}
    </div>
  );
}
