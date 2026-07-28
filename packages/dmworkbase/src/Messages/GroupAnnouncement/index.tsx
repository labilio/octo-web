import { IconChevronRight } from "@douyinfe/semi-icons";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import WKSDK, {
  Channel,
  ChannelInfo,
  ChannelInfoListener,
  ChannelTypePerson,
} from "wukongimjssdk";

import WKApp from "../../App";
import WKButton from "../../Components/WKButton";
import ConversationContext from "../../Components/Conversation/context";
import { MessageWrap } from "../../Service/Model";
import { formatMessageTimestamp } from "../../Utils/time";
import { GroupAnnouncementViewModel } from "../../features/groupAnnouncement/announcementModel";
import { buildGroupAnnouncementCard } from "../../features/groupAnnouncement/announcementCard";
import { useI18n } from "../../i18n";
import {
  addImChannelInfoListener,
  fetchImChannelInfo,
  getImChannelInfo,
} from "../../im-runtime/channelRuntime";
import MessageRow from "../../ui/message/MessageRow";
import { OctoCardView } from "../InteractiveCard";
import "./index.css";

interface GroupAnnouncementMessageProps {
  message: MessageWrap;
  context: ConversationContext;
  announcement: GroupAnnouncementViewModel;
}

function useOperatorOnlineStatus(operatorUID: string): boolean {
  const [, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  const operatorChannel = useMemo(
    () => new Channel(operatorUID, ChannelTypePerson),
    [operatorUID]
  );

  useEffect(() => {
    const sdk = WKSDK.shared();
    if (!getImChannelInfo(sdk, operatorChannel)) {
      void fetchImChannelInfo(sdk, operatorChannel);
    }

    const listener: ChannelInfoListener = (channelInfo: ChannelInfo) => {
      const channel = channelInfo?.channel;
      if (
        channel?.channelID === operatorChannel.channelID &&
        channel.channelType === operatorChannel.channelType
      ) {
        refresh();
      }
    };
    return addImChannelInfoListener(sdk, listener);
  }, [operatorChannel, refresh]);

  return getImChannelInfo(WKSDK.shared(), operatorChannel)?.online === true;
}

function GroupAnnouncementBody({
  announcement,
  onViewFull,
}: {
  announcement: GroupAnnouncementViewModel;
  onViewFull?: (announcement: GroupAnnouncementViewModel) => void;
}) {
  const { t } = useI18n();
  const [overflowing, setOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const title = t("base.module.channelSettings.groupNotice");
  const card = useMemo(
    () =>
      buildGroupAnnouncementCard({
        title,
        notice: announcement.notice,
        noticeDoc: announcement.noticeDoc,
      }),
    [announcement.notice, announcement.noticeDoc, title]
  );

  useLayoutEffect(() => {
    const element = contentRef.current;
    if (!element) {
      return;
    }
    const measure = () => {
      setOverflowing(element.scrollHeight > element.clientHeight);
    };
    measure();
    if (typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [card]);

  return (
    <article
      className={
        overflowing
          ? "wk-group-announcement-card wk-group-announcement-card--overflowing"
          : "wk-group-announcement-card"
      }
    >
      <div ref={contentRef} className="wk-group-announcement-card__viewport">
        <OctoCardView card={card} fallbackText={announcement.notice} />
      </div>
      {overflowing && (
        <div className="wk-group-announcement-card__more">
          <WKButton
            variant="ghost"
            size="sm"
            className="wk-group-announcement-card__more-button"
            icon={<IconChevronRight />}
            onClick={() => onViewFull?.(announcement)}
          >
            {t("base.groupAnnouncement.viewFull")}
          </WKButton>
        </div>
      )}
    </article>
  );
}

export function GroupAnnouncementMessage({
  message,
  context,
  announcement,
}: GroupAnnouncementMessageProps) {
  const actorUID = announcement.operatorUID;
  const isOperatorOnline = useOperatorOnlineStatus(actorUID);
  return (
    <MessageRow
      isSend={actorUID === WKApp.loginInfo.uid}
      isContinue={false}
      isSelected={false}
      showAvatar
      avatarUrl={WKApp.shared.avatarUser(actorUID)}
      senderName={announcement.operatorName}
      timestamp={formatMessageTimestamp(message.timestamp)}
      isOnline={isOperatorOnline}
      selectionMode={context.editOn()}
      onAvatarClick={(event) => context.onTapAvatar(actorUID, event)}
      onSenderNameClick={() => context.showUser(actorUID)}
    >
      <GroupAnnouncementBody
        announcement={announcement}
        onViewFull={context.openGroupAnnouncement?.bind(context)}
      />
    </MessageRow>
  );
}
