import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import NavRail from "./index";
import type { NavRailProps } from "./index";
import NavSpaceSwitcher from "./NavSpaceSwitcher";
import { Menus } from "../../Service/Menus";
import "../../theme/index.css";

const mockSpaces = [
    { space_id: "s1", name: "Demo Space", logo: "", member_count: 8, max_users: 50 },
    { space_id: "s2", name: "产品团队", logo: "", member_count: 3, max_users: 10 },
    { space_id: "s3", name: "研发中心", logo: "", member_count: 20, max_users: 0 },
] as any[];

function Icon({ label }: { label: string }) {
    return <span aria-hidden="true" style={{ fontSize: 16 }}>{label}</span>;
}

const messagesMenu = new Menus("messages", "/chat", "会话", <Icon label="💬" />, <Icon label="💬" />);
const contactsMenu = new Menus("contacts", "/contacts", "通讯录", <Icon label="👥" />, <Icon label="👥" />);

const defaultArgs: NavRailProps = {
    menusList: [messagesMenu, contactsMenu],
    currentMenus: messagesMenu,
    settingSelected: false,
    hasNewVersion: false,
    showAppVersion: false,
    showAppUpdate: false,
    appUpdateProgress: 0,
    showAppUpdateOperation: false,
    spaces: mockSpaces,
    currentSpaceId: "s1",
    onMenuClick: (menus) => console.log("nav menu clicked:", menus.id),
    onToggleSetting: () => console.log("settings toggled"),
    onSetShowAppVersion: (v) => console.log("show app version:", v),
    onInstallUpdate: () => console.log("install update"),
    onNotifyListener: () => console.log("notify listener"),
    onAvatarClick: () => console.log("avatar"),
    onSpaceSelect: (id) => console.log("space selected:", id),
    onJoinSpace: () => console.log("join space"),
    onCreateSpace: () => console.log("create space"),
};

const meta: Meta<typeof NavRail> = {
    title: "Navigation/NavRail",
    component: NavRail,
    parameters: {
        layout: "fullscreen",
        backgrounds: {
            default: "dark",
            values: [
                { name: "dark", value: "#111318" },
                { name: "light", value: "#f5f5f5" },
            ],
        },
    },
    decorators: [
        (Story) => (
            <div style={{ display: "flex", height: "100vh" }}>
                <Story />
                <div style={{ flex: 1, background: "var(--wk-bg-base, #171921)" }} />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof NavRail>;

export const Default: Story = {
    args: defaultArgs,
};

export const SettingsCenterOpen: Story = {
    name: "设置中心（真实组件）",
    args: { ...defaultArgs, settingSelected: true },
};

function SpaceOpen() {
    const containerRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        const button = containerRef.current?.querySelector<HTMLButtonElement>(".wk-navrail__space-icon-btn");
        button?.click();
    }, []);
    return (
        <div ref={containerRef} className="wk-navrail" style={{ height: 220, justifyContent: "flex-end" }}>
            <NavSpaceSwitcher
                spaces={mockSpaces as any[]}
                currentSpaceId="s1"
                onSpaceSelect={(id) => console.log("space selected:", id)}
                onJoinSpace={() => console.log("join space")}
                onCreateSpace={() => console.log("create space")}
            />
        </div>
    );
}

export const SpaceFlyoutOpen: StoryObj = {
    name: "Space 弹层（真实组件）",
    render: () => <SpaceOpen />,
};
