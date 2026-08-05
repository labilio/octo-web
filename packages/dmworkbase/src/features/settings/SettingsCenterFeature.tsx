import React from "react";
import { Progress, Select, Spin, Switch, Tag, Toast } from "@douyinfe/semi-ui";
import { Bell, Info, Palette, Sparkles, UserRound } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import WKApp from "../../App";
import { MeInfo } from "../../Components/MeInfo";
import ExperimentalFeatures from "../../Components/ExperimentalFeatures";
import ChangelogMarkdown from "../../Components/NavRail/ChangelogMarkdown";
import { VoiceSettingsContent } from "../../Components/NavRail/VoiceSettingsPanel";
import { SecretsSettingsContent } from "../../Components/SecretsSettings/SecretsSettingsPanel";
import WKButton from "../../Components/WKButton";
import WKModal from "../../Components/WKModal";
import RoutePage from "../../Components/RoutePage";
import RouteContext from "../../Service/Context";
import ClientDistributionService, {
  ClientPlatform,
} from "../../Service/ClientDistributionService";
import { updateUserLanguagePreference } from "../../Service/UserLanguageService";
import { checkVersionOnce } from "../../Utils/versionChecker";
import { Locale } from "../../i18n/types";
import { useI18n } from "../../i18n/useI18n";
import {
  SettingsCenterCategory,
  SettingsCenterView,
  SettingsPage,
  SettingsResourceCard,
  SettingsRow,
  SettingsSection,
} from "../../ui/SettingsCenter";
import { SETTINGS_CATEGORIES, SettingsCategoryId } from "./registry";
import "./settings-center-feature.css";

const CHANGELOG_URL = "https://im.deepminer.com.cn/changelog/";
const ANDROID_RELEASES_URL =
  "https://github.com/Mininglamp-OSS/octo-android/releases/latest";
const CHROME_EXTENSION_URL =
  "https://chromewebstore.google.com/detail/octo-%E6%8F%92%E4%BB%B6%E7%89%88/nemameogpfkponoomeblkjcnbidgmndk";
const OPENCLAW_CLAWHUB_URL = "https://clawhub.ai/caster-q/plugins/octo";
const OPENCLAW_SOURCE_URL =
  "https://github.com/Mininglamp-OSS/openclaw-channel-octo";
const OPENCLAW_GUIDE_URL =
  "https://github.com/Mininglamp-OSS/octo-adapters/blob/main/create-openclaw-octo/README.md";
const OCTO_SOURCE_URL = "https://github.com/Mininglamp-OSS/octo-web";
const OCTO_WEBSITE_URL = "https://www.mininglamp.com/octo/";
const MININGLAMP_OPEN_SOURCE_URL = "https://github.com/Mininglamp-OSS";

export interface OpenSecretsPayload {
  create?: boolean;
  name?: string;
  value?: string;
}

export interface SettingsCenterFeatureProps {
  visible: boolean;
  onOpen: () => void;
  onClose: () => void;
  canManageSpace?: boolean;
  onOpenOnboarding?: () => void;
  showAppVersion: boolean;
  showAppUpdate: boolean;
  appUpdateProgress: number;
  showAppUpdateOperation: boolean;
  lastVersionInfo?: { appVersion: string; updateDesc: string };
  onSetShowAppVersion: (visible: boolean) => void;
  onInstallUpdate: () => void;
  onNotifyListener: () => void;
}

function openExternal(url: string) {
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (opened) opened.opener = null;
}

function useClientDownloadUrl(platform: ClientPlatform) {
  const [state, setState] = React.useState<{
    status: "loading" | "ready" | "error";
    url?: string;
  }>({ status: "loading" });
  const requestIdRef = React.useRef(0);
  const load = React.useCallback(() => {
    const requestId = ++requestIdRef.current;
    setState({ status: "loading" });
    void ClientDistributionService.shared.getDownloadUrl(platform).then(
      (url) =>
        requestId === requestIdRef.current &&
        setState({ status: "ready", url }),
      () => requestId === requestIdRef.current && setState({ status: "error" })
    );
  }, [platform]);
  React.useEffect(() => {
    load();
    return () => {
      requestIdRef.current += 1;
    };
  }, [load]);
  return { ...state, retry: load };
}

function DownloadResource({
  platform,
  title,
  description,
  fallbackUrl,
}: {
  platform: ClientPlatform;
  title: string;
  description: string;
  fallbackUrl?: string;
}) {
  const { t } = useI18n();
  const download = useClientDownloadUrl(platform);
  const qr =
    download.status === "ready" && download.url ? (
      <div
        className="wk-settings-client__qr"
        role="img"
        aria-label={t("base.settingsCenter.clients.qrLabel", {
          values: { platform: title },
        })}
      >
        <QRCodeSVG size={88} value={download.url} />
      </div>
    ) : (
      <div
        className="wk-settings-client__qr wk-settings-client__qr--state"
        aria-busy={download.status === "loading"}
      >
        {download.status === "loading" ? (
          <Spin />
        ) : (
          t("base.settingsCenter.clients.unavailable")
        )}
      </div>
    );
  return (
    <SettingsResourceCard
      title={title}
      description={description}
      meta={qr}
      actions={
        <>
          {download.status === "ready" && download.url && (
            <WKButton
              size="sm"
              variant="primary"
              onClick={() => openExternal(download.url!)}
            >
              {t("base.settingsCenter.actions.download")}
            </WKButton>
          )}
          {download.status === "error" && (
            <WKButton size="sm" variant="secondary" onClick={download.retry}>
              {t("base.settingsCenter.actions.retry")}
            </WKButton>
          )}
          {fallbackUrl && (
            <WKButton
              size="sm"
              variant="ghost"
              onClick={() => openExternal(fallbackUrl)}
            >
              {t("base.settingsCenter.clients.githubFallback")}
            </WKButton>
          )}
        </>
      }
    />
  );
}

function ClientsAndExtensionsPage({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  return (
    <SettingsPage
      title={t("base.settingsCenter.clients.title")}
      description={t("base.settingsCenter.clients.description")}
    >
      <div className="wk-settings-detail-back">
        <WKButton size="sm" variant="ghost" onClick={onBack}>
          {t("base.settingsCenter.actions.back")}
        </WKButton>
      </div>
      <SettingsSection title={t("base.settingsCenter.clients.clientGroup")}>
        <SettingsResourceCard
          title="Web"
          description={t("base.settingsCenter.clients.webDescription")}
          meta={t("base.settingsCenter.clients.currentDevice")}
        />
        <DownloadResource
          platform="android"
          title="Android"
          description={t("base.settingsCenter.clients.androidDescription")}
          fallbackUrl={ANDROID_RELEASES_URL}
        />
        <DownloadResource
          platform="ios"
          title="iOS"
          description={t("base.settingsCenter.clients.iosDescription")}
        />
      </SettingsSection>
      <SettingsSection title={t("base.settingsCenter.clients.extensionGroup")}>
        <SettingsResourceCard
          title={t("base.settingsCenter.clients.chromeTitle")}
          description={t("base.settingsCenter.clients.chromeDescription")}
          actions={
            <WKButton
              size="sm"
              variant="secondary"
              onClick={() => openExternal(CHROME_EXTENSION_URL)}
            >
              {t("base.settingsCenter.actions.open")}
            </WKButton>
          }
        />
        <SettingsResourceCard
          title="OpenClaw Plugin"
          description={t("base.settingsCenter.clients.openClawDescription")}
          meta={t("base.settingsCenter.clients.openClawTrust")}
          actions={
            <>
              <WKButton
                size="sm"
                variant="primary"
                onClick={() => openExternal(OPENCLAW_GUIDE_URL)}
              >
                {t("base.settingsCenter.clients.installGuide")}
              </WKButton>
              <WKButton
                size="sm"
                variant="secondary"
                onClick={() => openExternal(OPENCLAW_CLAWHUB_URL)}
              >
                ClawHub
              </WKButton>
              <WKButton
                size="sm"
                variant="ghost"
                onClick={() => openExternal(OPENCLAW_SOURCE_URL)}
              >
                GitHub
              </WKButton>
            </>
          }
        />
      </SettingsSection>
    </SettingsPage>
  );
}

export default function SettingsCenterFeature(
  props: SettingsCenterFeatureProps
) {
  const { t, locale, setLocale } = useI18n();
  const [activeKey, setActiveKey] =
    React.useState<SettingsCategoryId>("account");
  const [detail, setDetail] = React.useState<"clients" | null>(null);
  const [notificationEnabled, setNotificationEnabled] = React.useState(
    !WKApp.shared.notificationIsClose
  );
  const [notificationPermission, setNotificationPermission] =
    React.useState<string>(() =>
      typeof Notification === "undefined"
        ? "unsupported"
        : Notification.permission
    );
  const [labEnabled, setLabEnabled] = React.useState(() => {
    try {
      return window.localStorage.getItem("lab_mode_enabled") === "1";
    } catch {
      return false;
    }
  });
  const [secretPayload, setSecretPayload] = React.useState<OpenSecretsPayload>(
    {}
  );
  const [secretSeq, setSecretSeq] = React.useState(0);
  const [webVersionAvailable, setWebVersionAvailable] = React.useState<
    string | null
  >(null);
  const [checkingVersion, setCheckingVersion] = React.useState(false);
  const [showExperimental, setShowExperimental] = React.useState(false);

  React.useEffect(() => {
    const openSettings = (payload?: { category?: SettingsCategoryId }) => {
      setActiveKey(payload?.category ?? "account");
      setDetail(null);
      props.onOpen();
    };
    const openSecrets = (payload?: OpenSecretsPayload) => {
      setActiveKey("ai-input");
      setDetail(null);
      setSecretPayload(payload ?? {});
      setSecretSeq((value) => value + 1);
      props.onOpen();
    };
    WKApp.mittBus.on("wk:open-settings", openSettings);
    WKApp.mittBus.on("wk:open-secrets", openSecrets);
    return () => {
      WKApp.mittBus.off("wk:open-settings", openSettings);
      WKApp.mittBus.off("wk:open-secrets", openSecrets);
    };
  }, [props.onOpen]);

  React.useEffect(() => {
    if (!props.visible) {
      setSecretPayload({});
      setDetail(null);
    }
  }, [props.visible]);

  const categories: SettingsCenterCategory[] = SETTINGS_CATEGORIES.map(
    (category) => {
      const iconProps = {
        size: 18,
        strokeWidth: 1.8,
        "aria-hidden": true as const,
      };
      const icons = {
        user: <UserRound {...iconProps} />,
        bell: <Bell {...iconProps} />,
        palette: <Palette {...iconProps} />,
        sparkles: <Sparkles {...iconProps} />,
        info: <Info {...iconProps} />,
      };
      return {
        id: category.id,
        label: t(category.titleKey),
        icon: icons[category.icon],
      };
    }
  );

  const providerId = WKApp.loginInfo.loginProvider;
  const accountCenterUrl = providerId
    ? WKApp.remoteConfig.oidcProviders.find(
        (provider) => provider.id === providerId
      )?.accountUrl
    : undefined;
  const showAccountCenter =
    !!providerId && providerId !== "local" && !!accountCenterUrl;

  const changeLocale = (next: Locale) => {
    if (next === locale) return;
    setLocale(next);
    if (WKApp.shared.isLogined()) {
      void updateUserLanguagePreference(next).catch(() =>
        console.warn("[i18n] failed to sync user language preference")
      );
    }
  };

  const requestNotificationPermission = async () => {
    if (typeof Notification === "undefined") return;
    try {
      setNotificationPermission(await Notification.requestPermission());
    } catch {
      Toast.error(t("base.settingsCenter.notifications.permissionFailed"));
    }
  };

  const checkUpdates = async () => {
    if (props.lastVersionInfo) {
      props.onSetShowAppVersion(true);
      return;
    }
    if (checkingVersion) return;
    setCheckingVersion(true);
    const next = await checkVersionOnce();
    setCheckingVersion(false);
    setWebVersionAvailable(next);
    if (!next) Toast.success(t("base.settingsCenter.about.latestVersion"));
  };

  const permissionLabel =
    notificationPermission === "granted"
      ? t("base.settingsCenter.notifications.permissionGranted")
      : notificationPermission === "denied"
      ? t("base.settingsCenter.notifications.permissionDenied")
      : notificationPermission === "default"
      ? t("base.settingsCenter.notifications.permissionNotAsked")
      : t("base.settingsCenter.notifications.permissionUnsupported");

  const content =
    detail === "clients" ? (
      <ClientsAndExtensionsPage onBack={() => setDetail(null)} />
    ) : (
      (() => {
        switch (activeKey) {
          case "account":
            return (
              <SettingsPage
                title={t("base.settingsCenter.categories.account")}
                description={t("base.settingsCenter.account.description")}
              >
                {showAccountCenter && (
                  <SettingsSection
                    title={t("base.settingsCenter.account.securityGroup")}
                  >
                    <SettingsRow
                      title={t("base.settingsCenter.items.accountCenter")}
                      description={t(
                        "base.settingsCenter.account.accountCenterDescription"
                      )}
                      actionLabel={t("base.settingsCenter.actions.open")}
                      onClick={() => openExternal(accountCenterUrl!)}
                    />
                  </SettingsSection>
                )}
                <MeInfo
                  embedded
                  onClose={() => undefined}
                  onLabModeEnabled={() => setLabEnabled(true)}
                />
              </SettingsPage>
            );
          case "notifications":
            return (
              <SettingsPage
                title={t("base.settingsCenter.categories.notifications")}
                description={t("base.settingsCenter.notifications.description")}
              >
                <SettingsSection
                  title={t("base.settingsCenter.notifications.desktopGroup")}
                >
                  <SettingsRow
                    title={t("base.settingsCenter.items.desktopNotifications")}
                    description={t(
                      "base.settingsCenter.notifications.desktopDescription"
                    )}
                    trailing={
                      <Switch
                        size="small"
                        checked={notificationEnabled}
                        onChange={(checked) => {
                          setNotificationEnabled(checked);
                          WKApp.shared.notificationIsClose = !checked;
                        }}
                      />
                    }
                  />
                  <SettingsRow
                    title={t("base.settingsCenter.items.systemPermission")}
                    description={t(
                      "base.settingsCenter.notifications.permissionDescription"
                    )}
                    value={permissionLabel}
                    actionLabel={t(
                      "base.settingsCenter.notifications.requestPermission"
                    )}
                    onClick={
                      notificationPermission === "default"
                        ? requestNotificationPermission
                        : undefined
                    }
                  />
                </SettingsSection>
              </SettingsPage>
            );
          case "appearance":
            return (
              <SettingsPage
                title={t("base.settingsCenter.categories.appearance")}
                description={t("base.settingsCenter.appearance.description")}
              >
                <SettingsSection
                  title={t("base.settingsCenter.appearance.displayGroup")}
                >
                  <SettingsRow
                    title={t("base.settingsCenter.items.language")}
                    description={t(
                      "base.settingsCenter.appearance.languageDescription"
                    )}
                    trailing={
                      <Select
                        value={locale}
                        onChange={(value) => changeLocale(value as Locale)}
                        optionList={[
                          {
                            value: "zh-CN",
                            label: t("base.navRail.language.name.zh"),
                          },
                          {
                            value: "en-US",
                            label: t("base.navRail.language.name.en"),
                          },
                        ]}
                      />
                    }
                  />
                  <SettingsRow
                    title={t("base.settingsCenter.items.theme")}
                    description={t(
                      "base.settingsCenter.appearance.themeDescription"
                    )}
                    trailing={<Tag>{t("base.settingsCenter.comingSoon")}</Tag>}
                  />
                </SettingsSection>
              </SettingsPage>
            );
          case "ai-input":
            return (
              <SettingsPage
                title={t("base.settingsCenter.categories.aiInput")}
                description={t("base.settingsCenter.aiInput.description")}
              >
                <SettingsSection title={t("base.settingsCenter.items.voice")}>
                  <VoiceSettingsContent />
                </SettingsSection>
                <SettingsSection unframed>
                  <SecretsSettingsContent
                    key={secretSeq}
                    initialCreate={secretPayload.create}
                    prefillName={secretPayload.name}
                    prefillValue={secretPayload.value}
                  />
                </SettingsSection>
              </SettingsPage>
            );
          case "about":
          default:
            return (
              <SettingsPage
                title={t("base.settingsCenter.categories.about")}
                description={t("base.settingsCenter.about.description")}
              >
                <SettingsSection
                  title={t("base.settingsCenter.about.helpGroup")}
                >
                  {props.onOpenOnboarding && (
                    <SettingsRow
                      title={t("base.settingsCenter.items.onboarding")}
                      description={t(
                        "base.settingsCenter.about.onboardingDescription"
                      )}
                      actionLabel={t("base.settingsCenter.actions.open")}
                      onClick={() => {
                        props.onClose();
                        props.onOpenOnboarding?.();
                      }}
                    />
                  )}
                  <SettingsRow
                    title={t("base.settingsCenter.items.changelog")}
                    description={t(
                      "base.settingsCenter.about.changelogDescription"
                    )}
                    actionLabel={t("base.settingsCenter.actions.open")}
                    onClick={() => openExternal(CHANGELOG_URL)}
                  />
                  <SettingsRow
                    title={t("base.settingsCenter.items.clientsAndExtensions")}
                    description={t(
                      "base.settingsCenter.about.clientsDescription"
                    )}
                    actionLabel={t("base.settingsCenter.actions.open")}
                    onClick={() => setDetail("clients")}
                  />
                </SettingsSection>
                <SettingsSection
                  title={t("base.settingsCenter.about.versionGroup")}
                >
                  <SettingsRow
                    title={t("base.settingsCenter.items.version")}
                    description={`${t(
                      "base.settingsCenter.about.currentVersion"
                    )}: ${WKApp.config.appVersion || t("base.common.unknown")}`}
                    value={
                      webVersionAvailable
                        ? t("base.settingsCenter.about.versionAvailable", {
                            values: { version: webVersionAvailable },
                          })
                        : undefined
                    }
                    trailing={
                      <WKButton
                        size="sm"
                        variant="secondary"
                        loading={checkingVersion}
                        onClick={checkUpdates}
                      >
                        {t("base.settingsCenter.about.checkUpdates")}
                      </WKButton>
                    }
                  />
                  {webVersionAvailable && (
                    <SettingsRow
                      title={t("base.settingsCenter.about.refreshTitle")}
                      description={t(
                        "base.settingsCenter.about.refreshDescription"
                      )}
                      trailing={
                        <WKButton
                          size="sm"
                          variant="primary"
                          onClick={() => window.location.reload()}
                        >
                          {t("base.settingsCenter.about.refreshNow")}
                        </WKButton>
                      }
                    />
                  )}
                  {labEnabled && (
                    <SettingsRow
                      title={t("base.settingsCenter.items.experimental")}
                      description={t(
                        "base.settingsCenter.about.experimentalDescription"
                      )}
                      actionLabel={t("base.settingsCenter.actions.open")}
                      onClick={() => setShowExperimental(true)}
                    />
                  )}
                </SettingsSection>
                <SettingsSection
                  title={t("base.settingsCenter.about.projectGroup")}
                >
                  <SettingsRow
                    title={t("base.settingsCenter.about.octoWebsite")}
                    description={t(
                      "base.settingsCenter.about.octoWebsiteDescription"
                    )}
                    actionLabel={t("base.settingsCenter.actions.open")}
                    onClick={() => openExternal(OCTO_WEBSITE_URL)}
                  />
                  <SettingsRow
                    title={t("base.settingsCenter.about.sourceCode")}
                    description={t(
                      "base.settingsCenter.about.sourceCodeDescription"
                    )}
                    actionLabel={t("base.settingsCenter.actions.open")}
                    onClick={() => openExternal(OCTO_SOURCE_URL)}
                  />
                  <SettingsRow
                    title={t("base.settingsCenter.about.mininglamp")}
                    description={t(
                      "base.settingsCenter.about.mininglampDescription"
                    )}
                    actionLabel={t("base.settingsCenter.actions.open")}
                    onClick={() =>
                      openExternal(
                        locale === "en-US"
                          ? "https://www.mininglamp.com/en/about/"
                          : "https://www.mininglamp.com/about/"
                      )
                    }
                  />
                  <SettingsRow
                    title={t("base.settingsCenter.about.mininglampOpenSource")}
                    description={t(
                      "base.settingsCenter.about.mininglampOpenSourceDescription"
                    )}
                    actionLabel={t("base.settingsCenter.actions.open")}
                    onClick={() => openExternal(MININGLAMP_OPEN_SOURCE_URL)}
                  />
                </SettingsSection>
                <SettingsSection
                  title={t("base.settingsCenter.about.enterpriseGroup")}
                >
                  <SettingsRow
                    title={t("base.settingsCenter.about.enterpriseSupport")}
                    description={t(
                      "base.settingsCenter.about.enterpriseSupportDescription"
                    )}
                    actionLabel={t("base.settingsCenter.actions.open")}
                    onClick={() =>
                      openExternal(
                        locale === "en-US"
                          ? "https://www.mininglamp.com/en/contact/"
                          : "https://www.mininglamp.com/contact/"
                      )
                    }
                  />
                </SettingsSection>
              </SettingsPage>
            );
        }
      })()
    );

  return (
    <>
      <SettingsCenterView
        visible={props.visible}
        title={t("base.settingsCenter.title")}
        closeLabel={t("base.settingsCenter.close")}
        activeKey={activeKey}
        categories={categories}
        onActiveKeyChange={(key) => {
          setActiveKey(key as SettingsCategoryId);
          setDetail(null);
        }}
        onClose={props.onClose}
        footer={
          <>
            {props.canManageSpace && (
              <button
                type="button"
                onClick={() => {
                  props.onClose();
                  window.location.href = "/space";
                }}
              >
                {t("base.navRail.settingsPanel.spaceManagement")}
              </button>
            )}
            <button
              type="button"
              className="wk-settings-center__logout"
              onClick={() => {
                props.onClose();
                void WKApp.shared.logoutUserInitiated();
              }}
            >
              {t("base.navRail.settingsPanel.logout")}
            </button>
          </>
        }
      >
        {content}
      </SettingsCenterView>

      <WKModal
        title={t("base.navRail.settingsPanel.updateCheckTitle")}
        visible={props.showAppVersion}
        options={{ maskClosable: false, closeOnEsc: false }}
        onCancel={() => {
          props.onSetShowAppVersion(false);
          props.onNotifyListener();
        }}
        footer={
          props.showAppUpdateOperation ? (
            <>
              <WKButton
                variant="secondary"
                onClick={() => {
                  props.onSetShowAppVersion(false);
                  props.onNotifyListener();
                }}
              >
                {t("base.common.cancel")}
              </WKButton>
              <WKButton variant="primary" onClick={props.onInstallUpdate}>
                {t("base.common.update")}
              </WKButton>
            </>
          ) : undefined
        }
      >
        {props.lastVersionInfo && (
          <div className="wk-settings-update-info">
            <p>
              {t("base.navRail.settingsPanel.currentVersion")}:{" "}
              {WKApp.config.appVersion} ·{" "}
              {t("base.navRail.settingsPanel.targetVersion")}:{" "}
              {props.lastVersionInfo.appVersion}
            </p>
            <ChangelogMarkdown content={props.lastVersionInfo.updateDesc} />
          </div>
        )}
        {props.showAppUpdate && (
          <Progress
            percent={props.appUpdateProgress}
            showInfo
            aria-label="update progress"
          />
        )}
      </WKModal>

      <WKModal
        visible={showExperimental}
        onCancel={() => setShowExperimental(false)}
        title={null}
        size="lg"
        options={{ closable: false }}
      >
        <RoutePage
          title={t("base.settingsCenter.items.experimental")}
          onClose={() => setShowExperimental(false)}
          render={(context: RouteContext<any>) => (
            <ExperimentalFeatures routeContext={context} />
          )}
        />
      </WKModal>
    </>
  );
}
