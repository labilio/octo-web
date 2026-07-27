import { SystemContent } from "wukongimjssdk";
import React from "react";

import WKApp from "../../App";
import { resolveGroupAnnouncement } from "../../features/groupAnnouncement/announcementModel";
import { GroupAnnouncementMessage } from "../GroupAnnouncement";
import { MessageCell } from "../MessageCell";
import "./index.css";

export class SystemCell extends MessageCell {
  render() {
    const { message, context } = this.props;
    const content = message.content as SystemContent;
    const announcement = resolveGroupAnnouncement({
      fromUID: message.fromUID,
      systemUID: WKApp.config.systemUID,
      contentType: message.contentType,
      payload: content.content,
    });
    if (announcement) {
      return (
        <GroupAnnouncementMessage
          message={message}
          context={context}
          announcement={announcement}
        />
      );
    }
    return <div className="wk-message-system">{content.displayText}</div>;
  }
}
