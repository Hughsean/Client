# TypeScript SDK for Spring Boot Service

轻量 TypeScript 前端调用库，Browser/Node/Tauri 通用，按控制器分模块导出 API，内置超时、重试、拦截器、错误统一与 ApiResponse 自动解包。

## 安装

> 该 SDK 为源码形式放置于 `client/lib` 下，建议在你的前端项目中通过 tsconfig paths 或本地包引用使用。

在 Node 环境下建议安装 fetch 兼容层（可选）：

```bash
pnpm add cross-fetch
```

在 Tauri 环境可选使用 HTTP 插件以规避 CORS（可选）：

```bash
pnpm add @tauri-apps/plugin-http
```

## 快速开始

```ts
import {
  updateApiConfig,
  setBearerToken,
  UsersApi,
  AdminApi,
  LlmSessionsApi,
} from './src';

// 1) 基础配置
updateApiConfig({
  baseURL: 'http://localhost:8080',
  timeoutMs: 15000,
  // 如果在 Node，请注入 cross-fetch：
  // customFetch: (await import('cross-fetch')).fetch as any,
});

// 2) 登录 -> 设置 Token -> 调用受保护接口
const users = new UsersApi();
const loginResp = await users.login({ username: 'demo', password: '***' });
if (loginResp?.token) {
  setBearerToken(loginResp.token);
}

// 之后所有请求会自动携带 Authorization: Bearer <token>
const me = await users.getById(1);

// 管理员接口
const admin = new AdminApi();
const allUsers = await admin.getAllUsers();
```

## LLM 会话最小示例（含 Abort、重试）

```ts
import { LlmSessionsApi, updateApiConfig } from './src';

// 配置重试策略（幂等方法默认自动重试，POST 仍可手动开启）
updateApiConfig({
  retry: { retries: 2, initialDelayMs: 300, backoffFactor: 2, maxDelayMs: 4000, retryMethods: ['GET','PUT','DELETE','HEAD','OPTIONS'] }
});

const api = new LlmSessionsApi();

// Abort 用法
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 5000);

try {
  const session = await api.createSession({ userId: 1 });
  const msg = await api.postMessage(session.id, { role: 'user', content: '你好' });
  console.log('assistant:', msg);
} finally {
  clearTimeout(timer);
}
```

## 错误模型

- 业务错误（ApiResponse.success=false）会抛出 `ApiError`：
  - `status`: HTTP 状态码
  - `code`: 业务/客户端错误码
  - `message`: 错误消息
  - `details`: 原始响应体或上下文
- 网络/超时/解析错误也统一封装为 `ApiError`，`code` 分别为 `NETWORK_ERROR` / `TIMEOUT_ABORT` / `JSON_PARSE_ERROR`。

捕获示例：

```ts
import { ApiError } from './src';

try {
  const users = await new UsersApi().getAll();
} catch (e) {
  if (e instanceof ApiError) {
    console.error(e.status, e.code, e.message, e.details);
  }
}
```

## 浏览器 / Node / Tauri

- 浏览器：无需额外配置，使用原生 `fetch`。
- Node：注入 `customFetch`。
  ```ts
  updateApiConfig({ customFetch: (await import('cross-fetch')).fetch as any });
  ```
- Tauri：可注入 `@tauri-apps/plugin-http` 的 `fetch`。
  ```ts
  import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
  updateApiConfig({ customFetch: tauriFetch as any });
  ```

## API 模块一览

- `UsersApi`: 用户 CRUD、登录
- `AdminApi`: 管理端用户列表
- `ProfilesApi`: 用户画像 CRUD
- `SignatureApi`: 签名创建/校验
- `LlmSessionsApi`: LLM 会话管理与消息
- `CommunityApi`: 帖子/评论/点赞
- `ConversationsApi`: 会话列表（新增：按会话 ID 查询会话消息内容，仅返回用户/助手消息）
- `DepressionScaleApi`: 量表列表
- `DepressionAssessmentApi`: 评估 CRUD
- `TestApi`: 健康检查/示例

## 自定义拦截器

```ts
import { addRequestInterceptor, addResponseInterceptor } from './src';

addRequestInterceptor(async (ctx) => {
  // 追加全局查询参数或头
  ctx.headers['X-Client'] = 'sdk';
  return ctx;
});

addResponseInterceptor(async (ctx) => {
  console.log(ctx.method, ctx.url, ctx.response.status);
  return ctx;
});
```

## ConversationsApi - 新增接口

`ConversationsApi` 新增了一个方法 `getContents(convId: number)`，用于按会话 ID 拉取该会话的消息历史，并且只返回 `senderRole` 为 `user` 或 `assistant` 的消息（服务端已做过滤）。

示例：

```ts
import { ConversationsApi } from './src';

const conv = new ConversationsApi();
const msgs = await conv.getContents(123);
console.log(msgs);
// msgs 为 ConversationMessage[]，每个元素包含 senderRole, content, createdAt 等字段
```

如果后端也支持 `assistance` 这种变体，可以在 SDK 层额外做兼容，但目前服务端实现使用 `assistant`。

## 测试与覆盖点

已提供可选的 `vitest + msw` 示例用例：
- `httpClient.spec.ts`: 重试与超时、业务错误解包
- `usersApi.spec.ts`: 登录后携带 token、获取用户

运行（示例）：
```bash
pnpm add -D vitest msw @types/node
pnpm vitest
```

## LLM 会话 API 参考

下面是 SDK 中 LLM 会话相关方法的快速参考（类型已与服务端 DTO 对齐）：

- createSession(payload: SessionCreateRequest) -> SessionCreateResponse
  - POST /api/llm/sessions
  - Request 示例:

```ts
import { LlmSessionsApi } from './src';

const api = new LlmSessionsApi();
const resp = await api.createSession({ userId: 1, dialogueId: undefined });
// resp.sessionId, resp.prompt, resp.clientIp, resp.location, resp.userProfile, resp.timeoutSeconds
```

- getSessionStatus(sessionId: string) -> SessionStatusResponse
  - GET /api/llm/sessions/{sessionId}
  - 返回会话状态与最后活跃时间（ISO 字符串）

```ts
const status = await api.getSessionStatus(resp.sessionId);
// status.sessionId, status.userId, status.dialogueId, status.lastActive, status.timeoutSeconds
```

- postMessage(sessionId: string, payload: MessageRequest) -> MessageResponse
  - POST /api/llm/sessions/{sessionId}/messages
  - Request 示例（与后端保持一致）:

```ts
const msgResp = await api.postMessage(resp.sessionId, { text: '你好', emotion: 'neutral' });
// msgResp.reply, msgResp.toolCalls, msgResp.sessionClosed, msgResp.dialogueId, msgResp.title
```

- closeSession(sessionId: string) -> CloseSessionResponse
  - POST /api/llm/sessions/{sessionId}/close
  - 后端当前返回 { sessionId, saved, message }

错误处理说明

- SDK 的 `httpClient` 会对非 2xx 响应抛出 `ApiError`，包含 `status`, `code`, `message`, `details` 字段。
- 注意：目前后端在一些错误路径返回的是带有 HTTP 状态码但空 body 的响应（例如 404 + null body）。如果希望客户端从响应体读取 `detail` 字段，请在后端实现统一异常映射（`@ControllerAdvice`）以返回标准错误 JSON；或者我可以在 SDK 层做更宽容的解析以兼容现有行为。
