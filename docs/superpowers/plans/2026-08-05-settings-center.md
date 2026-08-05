# Octo 设置中心实施计划

日期：2026-08-05

分支：`codex/settings-center`

基线：`origin/main@464239212caff7b295b5adddefdc19dd517e0625`

## 目标

把分散在左侧底部菜单、`MeInfo`、语音和 Secrets 弹窗中的个人设置收拢为一个可扩展的设置中心。首版只实现桌面两栏，同时保持数据、内容与布局分离，为以后窄屏栈式布局和搜索留出稳定接口。

## 行为清单（Behavior List）

1. 点击齿轮直接打开设置中心；版本红点继续挂在齿轮上。
2. 点击头像打开同一个设置中心，并定位到「账号与安全」。
3. 左侧固定五个一级目录：账号与安全、通知、外观与语言、AI 与输入、帮助与关于。
4. 左侧灰、右侧白；选中项为白底，无选中边框、阴影或紫色竖线；右侧普通设置项不使用卡片底色和边框。
5. 语言入口从左侧栏移入「外观与语言」，继续执行本地切换和服务端偏好同步。
6. 深色模式只显示低强调的「即将上线」状态，不渲染不可用开关。
7. 桌面通知使用当前持久化能力；浏览器/系统通知权限单独说明和处理。
8. 语音设置和 Secrets 复用现有能力，但拆分弹窗外壳与可嵌入内容。
9. `wk:open-secrets` 深链仍能打开设置中心、定位到 AI 与输入并保留预填数据。
10. 账号资料复用 `MeInfo`；实验性功能继续通过 OCTO 号连续点击五次解锁，解锁后入口位于「帮助与关于」。
11. 首次登录欢迎引导不变；「重新查看欢迎引导」先关闭设置中心再启动现有引导。
12. 「更新日志」打开 `https://im.deepminer.com.cn/changelog/`，旧 Web-only 更新公告不再作为第二份内容源。
13. 「当前版本/检查更新」与更新日志分开，继续复用 Electron 现有更新能力。
14. 「客户端与扩展」是「帮助与关于」的二级页，不增加第六个一级目录；展示 Web、Android、iOS、Chrome 扩展和 OpenClaw Plugin。
15. Android/iOS 下载复用登录页相同的 updater 数据源；Android 保留 GitHub Releases 降级入口。
16. OpenClaw 项展示 ClawHub、GitHub 源码和安装/更新说明入口，不在 UI 中固化多条易漂移命令。
17. 账号中心仅在非 local 登录且存在 `accountUrl` 时出现。
18. 退出登录固定在左侧底部；Space 切换按钮位置和行为完全不改。管理员 Space 管理能力保留为个人目录之外的辅助入口。
19. 首版不展示搜索框，但所有设置项注册稳定 `id`、`titleKey`、中英文 `searchTerms`、路由/锚点与可见条件。
20. 窄屏首版只保证可用，不实现完整移动端产品形态；640px 以下切换为顶部目录/单列内容，避免桌面两栏溢出。

## 文件地图（File Map）

### 新增

- `packages/dmworkbase/src/features/settings/registry.ts`：目录、设置项、关键词、可见性和外部资源的声明式注册表。
- `packages/dmworkbase/src/features/settings/SettingsCenterFeature.tsx`：业务桥接、事件监听、目录状态和各内容页装配。
- `packages/dmworkbase/src/ui/SettingsCenter/SettingsCenter.stories.tsx`：设置中心外壳的视觉状态。
- `packages/dmworkbase/src/ui/SettingsCenter/*`：纯展示设置外壳、分组、行、资源卡和二级页。
- `packages/dmworkbase/src/Service/ClientDistributionService.ts`：Android/iOS updater 请求与 URL 校验。
- 对应 `__tests__`：注册表、服务、UI 和业务集成测试。

### 修改

- `packages/dmworkbase/src/Components/NavRail/index.tsx`：旧 flyout 改为设置中心，头像与齿轮共用入口。
- `packages/dmworkbase/src/Components/NavRail/NavBottom.tsx`：移除语言按钮，保留齿轮版本提示与 Space 切换原位。
- `packages/dmworkbase/src/Components/MeInfo/*`：支持嵌入模式与实验功能解锁回调。
- `packages/dmworkbase/src/Components/NavRail/VoiceSettingsPanel.tsx`：抽出可嵌入内容。
- `packages/dmworkbase/src/Components/SecretsSettings/SecretsSettingsPanel.tsx`：抽出可嵌入内容并保持编辑弹窗。
- `apps/web/src/Pages/Main/index.tsx`：移除独立 `MeInfo` 弹窗，头像打开设置中心。
- `packages/dmworkbase/src/i18n/locales/zh-CN.json`、`en-US.json`：设置中心完整双语文案与搜索词。
- `packages/dmworkbase/src/Components/NavRail/NavRail.stories.tsx` 及现有测试：更新交互契约。

### 退役

- 旧 `NavSettingsPanel` 用户可见入口和 Web-only changelog 内容拉取逻辑。
- 左侧独立语言按钮。
- `MeInfo` 的第二个用户可见入口。

## PR 边界（PR Scope）

### 本 PR 包含

- 设置中心外壳、五目录、二级「客户端与扩展」页。
- 现有个人设置能力迁移和唯一入口收敛。
- 复用现有 updater 接口获取下载地址，并补充外部产品资源链接。
- 双语、语义 token、暗色可适配结构、基础窄屏可用性。
- 组件故事、单元/集成测试、构建与浏览器验证。

### 本 PR 不包含

- 真正启用深色模式。
- 搜索框与搜索结果页。
- 完整移动 Web / Android / iOS 原生设置页。
- 新的账号、通知或跨端同步协议。
- 修改 Space 切换按钮。
- 将 changelog 内容嵌入 Web 或建设新的公开下载站。

## 实施步骤

1. 先新增失败测试：注册表完整性、稳定关键词、下载 URL 校验、设置中心导航与二级页。
2. 先写 Story：桌面五目录、帮助与关于、客户端与扩展、深色 token 场景和窄屏场景。
3. 实现纯 UI 组件，只接收 props；使用 Semi 公共 API、Lucide 图标与 Octo 语义 token。
4. 实现设置 registry 和 `SettingsCenterFeature`，把外部状态与 UI 隔离。
5. 抽取 Voice/Secrets/MeInfo 可嵌入内容，补迁移回归测试。
6. 接入 NavRail/Main，移除重复入口，保持版本提示、深链、欢迎引导、退出和 Space 管理行为。
7. 抽取设置中心下载 Service，接入客户端与扩展页，不改变登录页既有下载行为。
8. 补齐中英文、无障碍名称与键盘导航。
9. 审计 octo-server：确认是否存在新增接口或数据结构；无新增需求则不创建 server 改动。
10. 完成全量验证、浏览器截图审查、范围审计、提交并推送分支。

## 验证方案（Verification Plan）

### 自动化

- 新增/修改相关 Vitest 测试全部通过。
- `pnpm i18n:check` 通过。
- base/login/web 的 TypeScript 或仓库既定类型检查通过。
- `pnpm build` 或仓库等价 Web 构建通过。
- Storybook 静态构建或目标 stories 可加载。
- CSS 审计：无 `!important`、无 `.semi-*` 内部选择器、无硬编码颜色用于新增设置 UI。

### 本地交互

- 齿轮、头像分别打开正确目录。
- 五目录切换、左固定右滚动、关闭后状态符合预期。
- 语言切换并刷新后保留。
- 桌面通知关闭/开启及权限状态可理解。
- Voice、Secrets 嵌入内容工作；`wk:open-secrets` 可定位并预填。
- 欢迎引导可重播，设置中心先关闭。
- 更新日志、客户端下载、Chrome、ClawHub、GitHub 和安装说明链接目标正确。
- 版本红点、退出登录、管理员 Space 管理可用；Space 切换按钮未变化。
- 640px 以下无横向溢出，基础导航可用。
- 中文、英文各检查一次；浅色与暗色 token 场景各检查一次（暗色功能本身仍不上线）。

### 已知基线问题

全仓 Vitest 在最新 `origin/main` 上存在多个与本功能无关的历史失败，覆盖密码、邀请、机器人 mock 等路径。最终验证以新增/受影响路径、OIDC 接线、i18n、CSS 与 Web 生产构建为本次门槛，并单独记录全仓基线结果。
