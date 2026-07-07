export const ONBOARDING_STORAGE_VERSION = "v2";

const workspaceMapImage = new URL("./assets/onboarding-workspace-map.png", import.meta.url).href;
const subspacesImage = new URL("./assets/onboarding-subspaces.png", import.meta.url).href;
const favoritesImage = new URL("./assets/onboarding-favorites.png", import.meta.url).href;
const groupMdImage = new URL("./assets/onboarding-group-md.png", import.meta.url).href;
const smartSummaryImage = new URL("./assets/onboarding-smart-summary.png", import.meta.url).href;
const browserExtensionImage = new URL("./assets/onboarding-browser-extension.png", import.meta.url).href;
const webhookImage = new URL("./assets/onboarding-webhook.png", import.meta.url).href;

export type OnboardingSection = {
    id:
        | "workspace-map"
        | "subspaces"
        | "favorites"
        | "group-md"
        | "smart-summary"
        | "webhook"
        | "browser-extension";
    label: string;
    title: string;
    description: string;
    visualTitle: string;
    imageSrc: string;
};

export const onboardingSections: OnboardingSection[] = [
    {
        id: "workspace-map",
        label: "工作空间",
        title: "先看 Octo 如何组织工作",
        description:
            "Octo 保留你熟悉的私聊和群聊，也把长期工作沉淀成可持续的上下文。群聊负责日常沟通，子区承接项目和任务，GROUP.md 记录团队规则，AI 分身在这些上下文里协助整理、分析和推进。",
        visualTitle: "Octo 工作空间结构图",
        imageSrc: workspaceMapImage,
    },
    {
        id: "subspaces",
        label: "子区",
        title: "把具体任务拆出来，放进子区",
        description:
            "当群里的讨论变多时，可以为一个项目、客户或任务创建子区。相关消息、资料、判断和后续行动会聚在同一个地方，团队不用在消息流里反复翻找上下文。",
        visualTitle: "子区结构说明图",
        imageSrc: subspacesImage,
    },
    {
        id: "favorites",
        label: "关注",
        title: "把高频重要的工作，放进关注",
        description:
            "群聊、子区和 AI 分身都可以被关注。重要客户、长期项目和正在推进的任务不会被消息流冲走，你可以从关注里快速回到关键工作现场。",
        visualTitle: "关注入口说明图",
        imageSrc: favoritesImage,
    },
    {
        id: "group-md",
        label: "GROUP.md",
        title: "用 GROUP.md 写下群的协作规则",
        description:
            "GROUP.md 是群的长期说明书。群的目标、资料入口、协作规则、AI 分身该如何工作，都可以写进去，让新成员和 AI 都能先理解这个群的工作方式。",
        visualTitle: "GROUP.md 群说明书结构图",
        imageSrc: groupMdImage,
    },
    {
        id: "smart-summary",
        label: "智能总结",
        title: "让上下文重新变得清晰",
        description:
            "当讨论变长、信息变散，智能总结会把关键结论、分歧、待确认事项和下一步行动重新组织起来。它不替你做决定，而是让人更快回到判断现场。",
        visualTitle: "智能总结结构图",
        imageSrc: smartSummaryImage,
    },
    {
        id: "webhook",
        label: "Webhook",
        title: "让系统事件进入团队上下文",
        description:
            "CI 通知、告警、GitHub 事件和客户系统消息，可以通过 Webhook 进入对应群聊。团队能看到，AI 分身也能看到，外部事件会成为协作上下文的一部分。",
        visualTitle: "Webhook 外部系统事件接入说明图",
        imageSrc: webhookImage,
    },
    {
        id: "browser-extension",
        label: "浏览器插件",
        title: "把网页资料带回 Octo",
        description:
            "浏览网页、文档或客户资料时，可以用 Octo 浏览器插件把有价值的信息带回团队上下文，避免资料散落在每个人自己的浏览器里。",
        visualTitle: "浏览器插件带回上下文说明图",
        imageSrc: browserExtensionImage,
    },
];
