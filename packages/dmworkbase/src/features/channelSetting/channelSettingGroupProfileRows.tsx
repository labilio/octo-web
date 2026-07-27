import { Tag, Toast } from "@douyinfe/semi-ui";
import { QrCode } from "lucide-react";
import React from "react";

import WKApp from "../../App";
import { ChannelAvatar } from "../../Components/ChannelAvatar";
import ChannelQRCode from "../../Components/ChannelQRCode";
import { ChannelSettingRouteData } from "../../Components/ChannelSetting/context";
import WKButton from "../../Components/WKButton";
import RouteContext, { RouteContextConfig } from "../../Service/Context";
import { ChannelField } from "../../Service/DataSource/DataSource";
import { updateGroupAnnouncement } from "../../Service/ChannelSettingService";
import { GROUP_NAME_MAX_LENGTH } from "../../Service/nameLimits";
import { Row } from "../../Service/Section";
import { updateChannelSettingField } from "../../bridge/channelSetting/channelSettingActions";
import { fetchCurrentImChannelInfo } from "../../im-runtime/currentChannelRuntime";
import { t } from "../../i18n";
import {
  ChannelSettingIconRow,
  ChannelSettingInfoRow,
  ChannelSettingInlineEditRow,
} from "../../ui/ChannelSettingRows";
import {
  GroupAnnouncementPage,
  GroupAnnouncementPageHandle,
} from "../groupAnnouncement/GroupAnnouncementPage";
import { ChannelSettingInputEditPush } from "./types";

interface BuildGroupProfileRowsOptions {
  context: RouteContext<ChannelSettingRouteData>;
  data: ChannelSettingRouteData;
  inputEditPush: ChannelSettingInputEditPush;
  disbanded: boolean;
}

export function buildGroupProfileRows({
  context,
  data,
  disbanded,
}: BuildGroupProfileRowsOptions): Row[] {
  if (disbanded) return [];

  const { channel, channelInfo } = data;
  const isExternalGroup = channelInfo?.orgData?.is_external_group === 1;
  const groupName = isExternalGroup ? (
    <span>
      {channelInfo?.title}
      <Tag color="orange" size="small" style={{ marginLeft: 6 }}>
        {t("base.module.channelSettings.externalGroup")}
      </Tag>
    </span>
  ) : (
    channelInfo?.title
  );

  return [
    new Row({
      cell: ChannelSettingInlineEditRow,
      properties: {
        title: t("base.module.channelSettings.groupName"),
        value: channelInfo?.title || "",
        displayValue: groupName,
        placeholder: t("base.module.channelSettings.groupNamePlaceholder"),
        maxCount: GROUP_NAME_MAX_LENGTH,
        onStartEdit: () => {
          if (!data.isManagerOrCreatorOfMe) {
            Toast.warning(
              t("base.module.channelSettings.groupNameOnlyManager")
            );
            return false;
          }
          return true;
        },
        onSave: (value: string) =>
          updateChannelSettingField({
            channel,
            field: ChannelField.channelName,
            value,
          }).catch((error) => {
            Toast.error(error.msg);
            return false;
          }),
      },
    }),
    new Row({
      cell: ChannelSettingIconRow,
      properties: {
        title: t("base.module.channelSettings.groupAvatar"),
        icon: (
          <img
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "var(--wk-avatar-radius, 50%)",
            }}
            src={WKApp.shared.avatarChannel(channel)}
            alt=""
          />
        ),
        onClick: () => {
          context.push(
            <ChannelAvatar
              showUpload={data.isManagerOrCreatorOfMe}
              channel={channel}
            />,
            { title: t("base.module.channelSettings.groupAvatar") }
          );
        },
      },
    }),
    new Row({
      cell: ChannelSettingIconRow,
      properties: {
        title: t("base.module.channelSettings.groupQrCode"),
        icon: <QrCode className="wk-channelsetting-qrcode-icon" aria-hidden />,
        onClick: () => {
          context.push(
            <ChannelQRCode channel={channel} />,
            new RouteContextConfig({
              title: t("base.module.channelSettings.groupQrCard"),
            })
          );
        },
      },
    }),
    new Row({
      cell: ChannelSettingInfoRow,
      properties: {
        title: t("base.module.channelSettings.groupNotice"),
        value: channelInfo?.orgData?.notice,
        multiline: true,
        truncate: true,
        onClick: () => {
          const announcementPageRef =
            React.createRef<GroupAnnouncementPageHandle>();
          context.push(
            <GroupAnnouncementPage
              ref={announcementPageRef}
              context={context}
              initialNotice={channelInfo?.orgData?.notice || ""}
              initialNoticeDoc={channelInfo?.orgData?.notice_doc}
              canEdit={data.isManagerOrCreatorOfMe}
              onPublish={async ({ notice, noticeDoc }) => {
                try {
                  await updateGroupAnnouncement(channel, {
                    notice,
                    noticeDoc,
                  });
                  await fetchCurrentImChannelInfo(channel);
                } catch (error: any) {
                  Toast.error(error?.msg || error?.message);
                  throw error;
                }
              }}
            />,
            new RouteContextConfig({
              title: t("base.module.channelSettings.groupNotice"),
              headerAction: data.isManagerOrCreatorOfMe ? (
                <WKButton
                  variant="ghost"
                  size="sm"
                  onClick={() => announcementPageRef.current?.openEditor()}
                >
                  {t("base.common.edit")}
                </WKButton>
              ) : undefined,
            })
          );
        },
      },
    }),
  ];
}
