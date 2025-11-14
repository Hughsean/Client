# AI-Admin

跨平台风险监测与用户管理前端（Web + Tauri 桌面）。基于 Vue 3 · TypeScript · Vite · Rust。

![Vue 3.5.x](https://img.shields.io/badge/Vue-3.5.x-42b883)
![Vite 7.x](https://img.shields.io/badge/Vite-7.x-646CFF)
![TypeScript 5.9](https://img.shields.io/badge/TypeScript-5.9-3178C6)
![Tauri 2.x](https://img.shields.io/badge/Tauri-2.x-FFC131)
![License MIT](https://img.shields.io/badge/License-MIT-green)

> 🧩 风险会话监控 · 👥 用户画像 · 📊 抑郁量表 / 评估 · 🔐 管理端操作

---

## ✨ 特性概览

- 单仓双端：同一代码同时服务浏览器与 Tauri 桌面（`dist` 进入 Tauri bundle）
- 组合式架构：导航岛、风险侧边会话、浮动风险卡片等组件化区域
- 类型完备 API 层：`src/server/apis/*` + `src/server/types/*` + 可插拔 `customFetch`
- 自适应视图与路由动画：支持全屏会话/监控视图
- 多环境 HTTP：浏览器原生 `fetch` / 桌面注入 `@tauri-apps/plugin-http` 规避 CORS
- 安全增强：RSA 加密登录密码、可选管理员模式 API Key、统一错误模型
- 工具集合：时间格式化、消息归类、风险等级计算
- 构建前类型检查：`vue-tsc --noEmit` 保证 TS / 组件类型安全

## 🛠 技术栈

| 类别 | 技术 | 说明 |
| ---- | ---- | ---- |
| 前端框架 | Vue 3 | Composition API + 单文件组件 |
| 构建工具 | Vite 7 | 快速 HMR 与多目标构建 |
| 语言 | TypeScript 5.9 | 严格类型 + IDE 智能提示 |
| 路由 | vue-router 4 | 动态路由 + 元信息布局控制 |
| 桌面容器 | Tauri 2 | Rust 2024 edition，轻量桌面分发 |
| HTTP | `@tauri-apps/plugin-http` | 绕过 CORS，统一接口封装 |
| 工具 | 自定义 SDK | 可配置 `updateApiConfig` / 拦截器 |

## 📐 结构示意

```txt
src/
  App.vue            # 根布局：导航 + 主内容 + 消息容器
  main.ts            # 入口：路由注册 + API 配置
  components/        # 业务复用组件
  views/             # 路由视图（风险监测 / 用户 / Splash / 404）
  router/            # 路由定义与元信息
  server/            # API SDK / 类型 / httpClient / config
    apis/            # 各模块 API 类
    types/           # 类型定义
    http/httpClient.ts
    config/api.config.ts
  ui/                # UI 基础组件(Button/Card/Dialog/...)
  utils/             # 通用工具（时间/风险/消息）
src-tauri/           # Tauri Rust 工程 (入口 / 配置 / capabilities)
```

## 🧭 架构要点

| 层 | 说明 | 设计原则 |
| --- | --- | --- |
| UI / 视图 | `views/*` + `components/*` + `ui/*` | 分离业务组件与基础组件 |
| 路由 | `router/index.ts` | meta 控制布局 / 全屏 / 隐藏导航 |
| API SDK | `server/apis/*` | 只做 IO 与类型，不混视图逻辑 |
| 类型中心 | `server/types/*` | 统一枚举 / 接口 / 请求响应模型 |
| 安全 | `utils/crypto.ts` | RSA 加密 & Token/Admin Key 注入 |
| 风险逻辑 | `utils/risk.ts` + `Risk*` 组件 | 集中评分、等级与展示 |

## 🚀 快速开始

### 环境要求

| 项目 | 建议版本 |
| ---- | -------- |
| Node.js | ≥ 18 LTS |
| 包管理器 | pnpm 8+ |
| Rust | 最新 stable (2024 edition 支持) |
| Tauri 依赖 | 参考官方文档（Windows 需 VC++ 运行时） |

### 克隆与安装

```bash
git clone https://github.com/your-org/AI-Admin.git
cd AI-Admin
pnpm install
```

### Web 开发

```bash
pnpm dev
```

默认端口：`5173`（或见 `vite.config.ts`）。

### 桌面开发 (Tauri)

```bash
pnpm tauri dev
```

开发端口固定为 `1420`，HMR 使用 `1421`。

### 构建产物

| 目标 | 命令 | 输出 |
| ---- | ---- | ---- |
| Web | `pnpm build` | `dist/` 静态资源 |
| 桌面 | `pnpm tauri build` | 安装包 / 可执行文件 |

### 预览 Web 生产包

```bash
pnpm preview
```

## 🌱 环境变量配置

在根目录创建 `.env`（本仓库不提交敏感值）：

```env
VITE_API_BASE=http://127.0.0.1:8080
VITE_ADMIN_KEY=your_admin_key_here
VITE_TIMEOUT_MS=10000
```

在 `main.ts` 中：

```ts
updateApiConfig({
  baseURL: import.meta.env.VITE_API_BASE,
  timeoutMs: Number(import.meta.env.VITE_TIMEOUT_MS) || 10000,
  customFetch: tauriFetch, // 桌面环境自动注入；浏览器下可忽略
  isAdminMode: !!import.meta.env.VITE_ADMIN_KEY,
});
setAdminApiKey(import.meta.env.VITE_ADMIN_KEY);
```

> 切勿在仓库中硬编码管理员密钥或用户敏感 Token。

## 🔌 API SDK 概览

- 统一入口：`updateApiConfig()` / `setAdminApiKey()`
- 可插拔 `customFetch`（浏览器原生 & Tauri plugin-http）
- 模块化类：`UsersApi` / `AdminApi` / `ConversationsApi` / `ProfilesApi` / `LlmSessionsApi` 等
- 自动错误包装：统一 `ApiError`
- 预留拦截器与重试策略扩展点

更多细节：见 [`src/server/README.md`](./src/server/README.md)。

## 🔒 安全与合规

- 不提交真实管理端 API Key / 用户私密数据
- 发布桌面版本前关闭不必要 devtools 特性
- 后端需启用 HTTPS 与鉴权（特别是风险会话内容）
- 建议后续加入内容访问审计与最小权限策略

## 🧪 测试规划

| 范围 | 方式 | 说明 |
| ---- | ---- | ---- |
| 单元 | Vitest | `utils` / 风险计算 / 时间格式化 |
| 接口 Mock | MSW | 断言请求/响应与错误路径 |
| E2E | Playwright / Webdriver | 核心会话标注 & 风险上报流程 |
| 安全 | 自检脚本 | 构建产物审查密钥泄露 |

## 📜 NPM Scripts

| 脚本 | 用途 |
| ---- | ---- |
| `pnpm dev` | Web 开发服务器 |
| `pnpm build` | 类型检查 + 生产构建 |
| `pnpm preview` | 预览生产构建 |
| `pnpm tauri dev` | 桌面调试 |
| `pnpm tauri build` | 桌面发行包构建 |

## 🧹 代码规范建议

- 后续加入：ESLint + Prettier + Husky pre-commit（禁止脏格式提交）
- 组件分层：业务组件命名遵循 `FeatureXxx.vue`，基础组件集中 `ui/`
- 常量与枚举集中：避免魔法字符串散落各处
- 计划引入 i18n（默认中文，可扩展英文）

## 🗺️ Roadmap

- [ ] 环境变量完善（多环境 `.env.*`）
- [ ] ESLint + Prettier + Husky + Commitlint
- [ ] Vitest 单元测试 / MSW 接口 Mock
- [ ] i18n 支持（zh-CN / en-US）
- [ ] 风险会话实时推送（WebSocket / SSE）
- [ ] 暗色主题切换
- [ ] 可视化风险趋势图表
- [ ] Release 自动化（GitHub Actions + 签名包）

## 🤝 贡献指南

1. Fork 仓库并创建分支：`feat/xxx` / `fix/xxx`
2. 保持提交信息动词前缀：`feat:` / `fix:` / `chore:` / `refactor:`
3. 修改后运行：`pnpm build` 确认通过
4. 发起 PR，说明动机与测试结果
5. 等待审核（欢迎讨论：性能 / 安全 / DX）

## 🐞 Issue 反馈格式

```text
期望行为：
实际行为：
复现步骤：
日志 / 截图：
环境：OS / Node / Web 或 Desktop / 后端版本
```

## 📸 截图 / Demo

> 占位：欢迎贡献实际界面截图（风险监测面板 / 用户画像 / 浮动风险卡）。

## 🙌 致谢

感谢开源生态（Vue / Vite / Tauri / TypeScript）以及社区贡献者。

## 📄 License

MIT License © HFUT A807

## 🗣 English Summary (Short)

AI-Admin is a cross‑platform (Web + Tauri desktop) frontend for risk conversation monitoring and user management. Built with Vue 3, TypeScript, Vite, and Tauri (Rust). It provides a typed API SDK, pluggable HTTP strategies (browser fetch vs. Tauri plugin-http), risk scoring utilities, and modular UI components. See source for details; full English README can be added upon request.

---

若需要更完整英文版或架构图 SVG，欢迎提交 Issue。
