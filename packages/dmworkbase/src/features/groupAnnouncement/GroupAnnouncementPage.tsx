import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from "react";

import RouteContext, { RouteContextConfig } from "../../Service/Context";
import { t } from "../../i18n";
import { GroupAnnouncementEditor } from "./GroupAnnouncementEditor";

interface GroupAnnouncementPayload {
  notice: string;
  noticeDoc: string;
}

interface GroupAnnouncementPageProps {
  context: RouteContext<any>;
  initialNotice: string;
  initialNoticeDoc?: string;
  canEdit: boolean;
  onPublish: (payload: GroupAnnouncementPayload) => Promise<void>;
}

export interface GroupAnnouncementPageHandle {
  openEditor: () => void;
}

export const GroupAnnouncementPage = forwardRef<
  GroupAnnouncementPageHandle,
  GroupAnnouncementPageProps
>(function GroupAnnouncementPage(
  { context, initialNotice, initialNoticeDoc, canEdit, onPublish },
  ref
) {
  const [announcement, setAnnouncement] = useState({
    notice: initialNotice,
    noticeDoc: initialNoticeDoc,
  });

  const openEditor = useCallback(() => {
    if (!canEdit) {
      return;
    }

    context.push(
      <GroupAnnouncementEditor
        context={context}
        initialNotice={announcement.notice}
        initialNoticeDoc={announcement.noticeDoc}
        editable
        onPublish={async (payload) => {
          await onPublish(payload);
          setAnnouncement(payload);
        }}
      />,
      new RouteContextConfig({
        title: t("base.groupAnnouncement.editor.title"),
      })
    );
  }, [
    announcement.notice,
    announcement.noticeDoc,
    canEdit,
    context,
    onPublish,
  ]);

  useImperativeHandle(ref, () => ({ openEditor }), [openEditor]);

  return (
    <GroupAnnouncementEditor
      key={`${announcement.notice}\u0000${announcement.noticeDoc || ""}`}
      context={context}
      initialNotice={announcement.notice}
      initialNoticeDoc={announcement.noticeDoc}
      editable={false}
      onPublish={async () => {}}
    />
  );
});
