import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Bell, Info, Palette, Sparkles, UserRound } from "lucide-react";
import { Tag } from "@douyinfe/semi-ui";
import {
  SettingsCenterView,
  SettingsPage,
  SettingsRow,
  SettingsSection,
  type SettingsCenterCategory,
} from ".";

const categories: SettingsCenterCategory[] = [
  { id: "account", label: "账号与安全", icon: <UserRound size={18} /> },
  { id: "notifications", label: "通知", icon: <Bell size={18} /> },
  { id: "appearance", label: "外观与语言", icon: <Palette size={18} /> },
  { id: "ai-input", label: "AI 与输入", icon: <Sparkles size={18} /> },
  { id: "about", label: "帮助与关于", icon: <Info size={18} /> },
];

const meta: Meta = {
  title: "UI/SettingsCenter",
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj;

function Preview() {
  const [activeKey, setActiveKey] = useState("appearance");
  return (
    <SettingsCenterView
      visible
      title="设置"
      closeLabel="关闭设置"
      activeKey={activeKey}
      categories={categories}
      onActiveKeyChange={setActiveKey}
      onClose={() => undefined}
      footer={<button type="button">退出登录</button>}
    >
      <SettingsPage
        title={
          categories.find((item) => item.id === activeKey)?.label ?? "设置"
        }
      >
        <SettingsSection title="显示">
          <SettingsRow
            title="界面语言"
            description="选择 Octo 的显示语言"
            value="简体中文"
            actionLabel="编辑"
          />
          <SettingsRow
            title="深色模式"
            description="在暗光环境下使用更舒适的配色"
            trailing={<Tag>即将上线</Tag>}
          />
        </SettingsSection>
      </SettingsPage>
    </SettingsCenterView>
  );
}

export const Desktop: Story = { render: () => <Preview /> };

export const DarkTokens: Story = {
  render: () => (
    <div theme-mode="dark">
      <Preview />
    </div>
  ),
};

export const Narrow: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => <Preview />,
};
