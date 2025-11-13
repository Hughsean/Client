# x-app （HFUT A807 团队）

跨平台（Web + Tauri 桌面）风险监测与用户管理前端。基于 Vue 3 + TypeScript + Vite + Tauri 2（Rust）。

🧩 风险会话监控 · 👥 用户画像 · 📊 抑郁量表 / 评估 · 🔐 管理端快捷操作

---

## ✨ 核心特性

- 单代码仓同时支持浏览器与桌面（Tauri 静态资源 + Rust 宿主）
- 组件化布局：导航岛（Navbar Islands）、风险侧边消息、浮动卡片等
- 类型安全 API 层：`src/server/apis/*` + `src/server/types/*`
- 可切换的 HTTP 访问实现：浏览器下（可配代理）、Tauri 下使用 `@tauri-apps/plugin-http` 规避 CORS
- 路由动画与自适应全屏页面（如用户会话视图）
- 统一工具函数：时间格式化、消息处理、风险等级计算
- 构建前类型检查：`vue-tsc --noEmit`

## 🛠 技术栈

| 领域 | 技术 |
| ---- | ----- |
| 前端框架 | Vue 3 (Composition API) |
| 构建工具 | Vite 7 + esbuild |
| 语言 | TypeScript 5.9 |
| 路由 | vue-router 4 |
| 桌面容器 | Tauri 2 (Rust 2024 edition) |
| HTTP 插件 | `@tauri-apps/plugin-http` |
| 其它 | 自定义 API 封装、过渡动画、全局样式 |

## 📂 目录结构概览

```text
├── index.html
├── package.json
├── vite.config.ts            # Vite & Tauri 开发端口/别名
├── src
│  ├── main.ts                # 入口：注册路由 + API 配置
│  ├── App.vue                # 根布局（导航 + 主内容 + 消息容器）
│  ├── assets/styles/global.css
│  ├── components             # 通用业务组件
│  ├── views                  # 路由视图页（风险监测 / 用户 / Splash / 404）
│  ├── router/index.ts        # 路由定义
│  ├── server                 # API & 类型 & httpClient
│  │  ├── apis                # 具体接口封装 (Admin / Users / Conversations ...)
│  │  ├── types               # TS 类型定义
│  │  ├── http/httpClient.ts  # 可注入 fetch 实现
│  │  └── config/api.config.ts
│  ├── utils                  # 通用工具（消息/时间/风险计算）
│  └── ui                     # UI 基础组件（Button / Card / Dialog ...）
├── src-tauri                 # Tauri Rust 工程
│  ├── Cargo.toml             # Rust 依赖 & edition
│  ├── src/main.rs            # Tauri 主入口
│  └── tauri.conf.json        # Tauri 配置
└── public                    # 静态资源
```

## 🚀 快速开始

### 1. 环境要求

| 类别 | 版本建议 |
| ---- | -------- |
| Node.js | >= 18 LTS |
| 包管理器 | pnpm 8+ |
| Rust | 最新 stable（支持 2024 edition） |
| Tauri 依赖 | 参考 [Tauri 官方站点](https://tauri.app/)（系统级依赖，如 Windows VC++ 运行时） |

### 2. 安装依赖

```bash
pnpm install
```

### 3. 开发模式（纯 Web）

```bash
pnpm dev
```

访问默认端口（Vite 默认 5173；未显式设定）。

### 4. 桌面开发 (Tauri)

```bash
pnpm tauri dev
```

Tauri 使用 `vite.config.ts` 中固定端口 1420（HMR 1421）。

### 5. 构建

| 目标 | 命令 | 说明 |
| ---- | ---- | ---- |
| Web 生产包 | `pnpm build` | 生成 `dist/` 静态资源 |
| 桌面安装包 | `pnpm tauri build` | 生成平台安装/可执行文件 |

### 6. 预览 Web 构建结果

```bash
pnpm preview
```

## 🔌 API 配置说明

入口文件 `src/main.ts` 中：

```ts
updateApiConfig({
  baseURL: 'http://127.0.0.1:8080',
  timeoutMs: 10000,
  customFetch: tauriFetch,
  isAdminMode: true,
});
setAdminApiKey('ADMIN_KEY_...');
```

建议后续改为使用 `.env` / 安全注入方式，避免在仓库中硬编码密钥。

示例（创建 `.env`）：

```env
VITE_API_BASE=http://127.0.0.1:8080
VITE_ADMIN_KEY=xxxxxxxx
```

并在代码中读取：`import.meta.env.VITE_API_BASE`。

## 🔒 安全注意

- 管理端 API Key 不应提交至版本控制。
- 生产构建请确认未开启 `devtools`（当前 Tauri features 包含 `devtools`，正式发布时可去掉）。
- 若需要上行敏感数据（风险会话内容），请确保后端使用 HTTPS 并开启鉴权。

## 🧱 架构要点

1. UI 层：`views/` + `components/` + `ui/` 分离业务与基础组件。
2. API 层：`server/apis/*.ts` 只做请求与响应类型约束，避免混入视图逻辑。
3. 可插拔 Fetch：浏览器 -> 原生 fetch；Tauri -> `plugin-http`（绕过 CORS）。
4. 风险逻辑集中在 `utils/risk.ts` 与相关风险组件（`Risk*`）。
5. 通过路由 meta 控制布局（隐藏导航、全屏展示等）。
6. Server SDK（前端调用后端的可复用层）详见：[Server SDK 说明](./src/server/README.md)。

### Server SDK 快速概览

位于 `src/server/`，提供：

- 可配置 `updateApiConfig()`（支持 baseURL / 超时 / 自定义 fetch / 管理员模式）
- 自动 Token / Admin API Key / RSA 加密登录与注册密码
- 分模块 API 类：`UsersApi` / `AdminApi` / `LlmSessionsApi` / `ProfilesApi` / `ConversationsApi` 等
- `plugin-http` 注入以在 Tauri 中规避 CORS
- 可插拔请求 / 响应拦截器与重试策略
- 统一 `ApiError` 错误模型

更多用法与迁移指南请阅读：[src/server/README.md](./src/server/README.md)

## 📜 可用 NPM Scripts

| 脚本 | 作用 |
| ---- | ---- |
| `pnpm dev` | 启动 Vite 开发服务器 |
| `pnpm build` | 类型检查 + 构建生产静态文件 |
| `pnpm preview` | 本地预览生产构建结果 |
| `pnpm tauri dev` | 启动 Tauri 桌面调试（等价执行 `tauri dev`） |
| `pnpm tauri build` | 构建桌面发行包 |

## 🧪 建议的后续测试策略 (TODO)

- 单元测试：针对 `utils`（时间 / 风险计算 / 消息处理）
- 端到端（E2E）：关键会话流与风险标记
- API Mock：使用 MSW 或自建 mock server

## 🧹 代码规范 & 建议

- 推荐安装 ESLint + Prettier（当前仓库尚未配置，可后续补充）
- 组件命名：业务组件 `FeatureThing.vue`，基础复用组件放 `ui/`
- 避免直接在组件中写死字符串常量（可集中 i18n / constants）
- 风险、会话等枚举/类型集中放置在 `server/types/`

## 🤝 贡献指南

1. Fork & 创建分支：`feat/xxx` / `fix/xxx`
2. 保持提交信息清晰（动词开头，如 `feat: 添加风险等级展示`）
3. 提交前本地构建：`pnpm build`
4. 发起 PR 并 @ HFUT A807 审阅人

## 📅 路线图 (Roadmap 方向性草案)

- [ ] 抽离环境配置（API Key / BaseURL）至 `.env`
- [ ] 添加 ESLint + Prettier + Husky pre-commit
- [ ] 引入 Vitest & MSW 做 API 单测
- [ ] 增加 i18n（多语言切换）
- [ ] 风险会话实时推送（WebSocket / SSE）
- [ ] 暗色模式支持

## 👥 团队

HFUT A807 团队（合肥工业大学）

> 欢迎 Issue / PR / 需求讨论。

## 📄 许可

本项目使用 [MIT License](./LICENSE)。

简述：允许商用 / 修改 / 分发 / 私用，需保留版权与许可声明；不提供任何担保或责任承担。

## 🐞 问题反馈

请附：

- 描述（期望 vs 实际）
- 复现步骤 / 截图 / 日志
- 运行环境（OS / Node / 桌面 or Web）

## 🙌 致谢

感谢开源生态（Vue / Vite / Tauri / TypeScript）。

---

若需英文版 README，可提 Issue 后续补充。
