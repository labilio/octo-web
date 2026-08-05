import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import WKApp from "../../App";
import SettingsCenterFeature from "./SettingsCenterFeature";

const meta = {
  title: "Features/SettingsCenter",
  component: SettingsCenterFeature,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SettingsCenterFeature>;

export default meta;
type Story = StoryObj<typeof meta>;

function HelpAndAboutPreview() {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    WKApp.mittBus.emit("wk:open-settings", { category: "about" });
  }, []);

  return (
    <SettingsCenterFeature
      visible={visible}
      onOpen={() => setVisible(true)}
      onClose={() => setVisible(false)}
      showAppVersion={false}
      showAppUpdate={false}
      appUpdateProgress={0}
      showAppUpdateOperation={false}
      onSetShowAppVersion={() => undefined}
      onInstallUpdate={() => undefined}
      onNotifyListener={() => undefined}
      onOpenOnboarding={() => undefined}
    />
  );
}

export const HelpAndAbout: Story = {
  render: () => <HelpAndAboutPreview />,
};
