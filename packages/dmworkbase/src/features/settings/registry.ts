export type SettingsCategoryId =
  | "account"
  | "notifications"
  | "appearance"
  | "ai-input"
  | "about";

export interface SettingsCategoryDefinition {
  id: SettingsCategoryId;
  titleKey: string;
  icon: "user" | "bell" | "palette" | "sparkles" | "info";
}

export interface SettingsItemDefinition {
  id: string;
  categoryId: SettingsCategoryId;
  titleKey: string;
  descriptionKey?: string;
  route: string;
  status: "available" | "coming-soon";
  searchTerms: { zhCN: string[]; enUS: string[] };
}

export const SETTINGS_CATEGORIES: SettingsCategoryDefinition[] = [
  {
    id: "account",
    titleKey: "base.settingsCenter.categories.account",
    icon: "user",
  },
  {
    id: "notifications",
    titleKey: "base.settingsCenter.categories.notifications",
    icon: "bell",
  },
  {
    id: "appearance",
    titleKey: "base.settingsCenter.categories.appearance",
    icon: "palette",
  },
  {
    id: "ai-input",
    titleKey: "base.settingsCenter.categories.aiInput",
    icon: "sparkles",
  },
  {
    id: "about",
    titleKey: "base.settingsCenter.categories.about",
    icon: "info",
  },
];

export const SETTINGS_ITEMS: SettingsItemDefinition[] = [
  {
    id: "profile",
    categoryId: "account",
    titleKey: "base.settingsCenter.items.profile",
    route: "/account/profile",
    status: "available",
    searchTerms: {
      zhCN: ["头像", "名字", "个人资料"],
      enUS: ["avatar", "name", "profile"],
    },
  },
  {
    id: "account-center",
    categoryId: "account",
    titleKey: "base.settingsCenter.items.accountCenter",
    route: "/account/security",
    status: "available",
    searchTerms: {
      zhCN: ["账号", "安全", "认证"],
      enUS: ["account", "security", "verification"],
    },
  },
  {
    id: "desktop-notifications",
    categoryId: "notifications",
    titleKey: "base.settingsCenter.items.desktopNotifications",
    route: "/notifications/desktop",
    status: "available",
    searchTerms: {
      zhCN: ["桌面通知", "提醒", "消息"],
      enUS: ["desktop", "notification", "message"],
    },
  },
  {
    id: "system-permission",
    categoryId: "notifications",
    titleKey: "base.settingsCenter.items.systemPermission",
    route: "/notifications/system-permission",
    status: "available",
    searchTerms: {
      zhCN: ["系统权限", "浏览器权限"],
      enUS: ["system permission", "browser permission"],
    },
  },
  {
    id: "language",
    categoryId: "appearance",
    titleKey: "base.settingsCenter.items.language",
    route: "/appearance/language",
    status: "available",
    searchTerms: {
      zhCN: ["语言", "中文", "英文"],
      enUS: ["language", "chinese", "english", "locale"],
    },
  },
  {
    id: "theme",
    categoryId: "appearance",
    titleKey: "base.settingsCenter.items.theme",
    route: "/appearance/theme",
    status: "coming-soon",
    searchTerms: {
      zhCN: ["深色", "暗色", "主题"],
      enUS: ["dark mode", "theme", "appearance"],
    },
  },
  {
    id: "voice",
    categoryId: "ai-input",
    titleKey: "base.settingsCenter.items.voice",
    route: "/ai-input/voice",
    status: "available",
    searchTerms: {
      zhCN: ["语音", "转写", "输入"],
      enUS: ["voice", "transcription", "input"],
    },
  },
  {
    id: "secrets",
    categoryId: "ai-input",
    titleKey: "base.settingsCenter.items.secrets",
    route: "/ai-input/secrets",
    status: "available",
    searchTerms: {
      zhCN: ["密钥", "密码", "API Key"],
      enUS: ["secret", "api key", "credential"],
    },
  },
  {
    id: "onboarding",
    categoryId: "about",
    titleKey: "base.settingsCenter.items.onboarding",
    route: "/about/onboarding",
    status: "available",
    searchTerms: {
      zhCN: ["欢迎", "引导", "新手"],
      enUS: ["welcome", "onboarding", "tutorial"],
    },
  },
  {
    id: "changelog",
    categoryId: "about",
    titleKey: "base.settingsCenter.items.changelog",
    route: "/about/changelog",
    status: "available",
    searchTerms: {
      zhCN: ["更新日志", "版本", "新功能"],
      enUS: ["changelog", "release", "what's new"],
    },
  },
  {
    id: "clients-and-extensions",
    categoryId: "about",
    titleKey: "base.settingsCenter.items.clientsAndExtensions",
    route: "/about/clients-and-extensions",
    status: "available",
    searchTerms: {
      zhCN: ["下载", "客户端", "安卓", "iOS", "浏览器扩展", "OpenClaw"],
      enUS: ["download", "client", "android", "ios", "chrome", "openclaw"],
    },
  },
  {
    id: "version",
    categoryId: "about",
    titleKey: "base.settingsCenter.items.version",
    route: "/about/version",
    status: "available",
    searchTerms: {
      zhCN: ["当前版本", "检查更新"],
      enUS: ["version", "check update"],
    },
  },
  {
    id: "experimental",
    categoryId: "about",
    titleKey: "base.settingsCenter.items.experimental",
    route: "/about/experimental",
    status: "available",
    searchTerms: {
      zhCN: ["实验功能", "实验室"],
      enUS: ["experimental", "labs"],
    },
  },
  {
    id: "octo-website",
    categoryId: "about",
    titleKey: "base.settingsCenter.about.octoWebsite",
    route: "/about/octo-website",
    status: "available",
    searchTerms: {
      zhCN: ["Octo 官网", "产品介绍", "章鱼"],
      enUS: ["octo website", "product", "official site"],
    },
  },
  {
    id: "octo-source",
    categoryId: "about",
    titleKey: "base.settingsCenter.about.sourceCode",
    route: "/about/octo-source",
    status: "available",
    searchTerms: {
      zhCN: ["Octo 源码", "开源", "GitHub"],
      enUS: ["octo source", "open source", "github"],
    },
  },
  {
    id: "about-mininglamp",
    categoryId: "about",
    titleKey: "base.settingsCenter.about.mininglamp",
    route: "/about/mininglamp",
    status: "available",
    searchTerms: {
      zhCN: ["明略", "公司", "关于明略"],
      enUS: ["mininglamp", "company", "about mininglamp"],
    },
  },
  {
    id: "mininglamp-open-source",
    categoryId: "about",
    titleKey: "base.settingsCenter.about.mininglampOpenSource",
    route: "/about/mininglamp-open-source",
    status: "available",
    searchTerms: {
      zhCN: ["明略", "开源", "GitHub"],
      enUS: ["mininglamp", "open source", "github"],
    },
  },
  {
    id: "enterprise-support",
    categoryId: "about",
    titleKey: "base.settingsCenter.about.enterpriseSupport",
    route: "/about/enterprise-support",
    status: "available",
    searchTerms: {
      zhCN: ["销售", "咨询", "企业服务", "联系我们"],
      enUS: ["sales", "contact", "enterprise support"],
    },
  },
];
