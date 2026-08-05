// @vitest-environment jsdom

import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import { describe, expect, it, vi } from "vitest";

vi.mock("@douyinfe/semi-ui", () => ({
  Tabs: ({ tabList, activeKey, onChange }: any) => {
    return (
      <div role="tablist">
        {tabList.map((item: any) => (
          <button
            key={item.itemKey}
            type="button"
            role="tab"
            aria-selected={item.itemKey === activeKey}
            onClick={() => onChange(item.itemKey)}
          >
            {item.tab}
          </button>
        ))}
      </div>
    );
  },
}));

vi.mock("../../../Components/WKModal", () => ({
  default: ({ visible, children }: any) =>
    visible ? <div role="dialog">{children}</div> : null,
}));

import { SettingsCenterView, SettingsPage } from "..";

describe("SettingsCenterView", () => {
  it("renders five categories and changes the active category", () => {
    const onChange = vi.fn();
    const container = document.createElement("div");
    act(() => {
      ReactDOM.render(
        <SettingsCenterView
          visible
          title="设置"
          closeLabel="关闭设置"
          activeKey="account"
          categories={[
            { id: "account", label: "账号与安全" },
            { id: "notifications", label: "通知" },
            { id: "appearance", label: "外观与语言" },
            { id: "ai-input", label: "AI 与输入" },
            { id: "about", label: "帮助与关于" },
          ]}
          onActiveKeyChange={onChange}
          onClose={() => undefined}
        >
          <SettingsPage title="账号与安全">content</SettingsPage>
        </SettingsCenterView>,
        container
      );
    });

    const tabs = Array.from(
      container.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    );
    expect(tabs).toHaveLength(5);
    act(() => tabs.find((tab) => tab.textContent === "通知")?.click());
    expect(onChange).toHaveBeenCalledWith("notifications");
    act(() => ReactDOM.unmountComponentAtNode(container));
  });

  it("exposes a named close control", () => {
    const onClose = vi.fn();
    const container = document.createElement("div");
    act(() => {
      ReactDOM.render(
        <SettingsCenterView
          visible
          title="设置"
          closeLabel="关闭设置"
          activeKey="account"
          categories={[{ id: "account", label: "账号与安全" }]}
          onActiveKeyChange={() => undefined}
          onClose={onClose}
        >
          content
        </SettingsCenterView>,
        container
      );
    });
    const close = container.querySelector<HTMLButtonElement>(
      'button[aria-label="关闭设置"]'
    );
    act(() => close?.click());
    expect(onClose).toHaveBeenCalledTimes(1);
    act(() => ReactDOM.unmountComponentAtNode(container));
  });
});
