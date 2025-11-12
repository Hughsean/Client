# TypeScript SDK for Spring Boot Service

轻量 TypeScript 前端调用库，Browser/Node/Tauri 通用，按控制器分模块导出 API，内置超时、重试、拦截器、错误统一与 ApiResponse 自动解包。

**版本：0.4.0**

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

// 2) 登录 -> Token 自动存储 -> 调用受保护接口
const users = new UsersApi();
const loginResp = await users.login({ username: 'demo', password: '***' });
// ✅ Token 已自动存储,无需手动调用 setBearerToken()!

// 之后所有请求会自动携带 Authorization: Bearer <token>
const me = await users.getById(1);

// 3) 登出时清除 Token
users.logout();

// 管理员接口（需要启用管理员模式并设置 API Key）
import { setAdminApiKey } from './src';
updateApiConfig({ isAdminMode: true }); // 启用管理员模式
setAdminApiKey('ADMIN_KEY_3f6e40cb43b742a0894754866c2e1abe');

const admin = new AdminApi();
const allUsers = await admin.getAllUsers();
```

## 密码安全传输

### RSA 加密

**注册**和**登录**时,密码都会自动使用 RSA-OAEP 加密传输,无需手动处理:

```ts
const users = new UsersApi();

// 注册 - 密码自动 RSA 加密
await users.register({
  username: 'newuser',
  password: 'mypassword',  // 明文密码,SDK 会自动加密
  email: 'user@example.com'
});

// 登录 - 密码自动 RSA 加密
await users.login({
  username: 'newuser',
  password: 'mypassword'  // 明文密码,SDK 会自动加密
});
```

## 管理员 API Key 认证

### 🔐 安全传输机制

管理员 API Key 使用 **RSA-OAEP 加密传输**，确保密钥在网络传输过程中的安全性：

- **前端**：使用服务器公钥加密 API Key
- **传输**：加密后的 Base64 字符串通过 `X-Admin-API-Key` 请求头发送
- **后端**：使用私钥解密并验证 API Key

整个过程自动完成，无需手动处理加密逻辑。

### 设置管理员模式

从 **v0.4.0** 开始，SDK 支持管理员 API Key 认证。需要通过配置明确指定是否以管理员身份运行：

```ts
import { updateApiConfig, setAdminApiKey, AdminApi } from './src';

// 方式 1: 推荐 - 通过配置启用管理员模式
updateApiConfig({
  isAdminMode: true  // 启用管理员模式
});

// 设置管理员 API Key
setAdminApiKey('ADMIN_KEY_3f6e40cb43b742a0894754866c2e1abe');

const admin = new AdminApi();

// 访问管理员专用接口
const allUsers = await admin.getAllUsers();
const riskConversations = await admin.getRiskConversations(1);

// 管理员访问任意普通用户接口（无需 JWT Token）
const conversations = await admin.requestAs('GET', '/api/conversations/123');
const profile = await admin.requestAs('GET', '/api/profiles/456');
```

### 认证模式说明

SDK 根据 `isAdminMode` 配置决定使用哪种认证方式：

| 配置 | 认证方式 | 请求头 | 适用场景 |
|------|---------|--------|---------|
| `isAdminMode: true` | 管理员 API Key | `X-Admin-API-Key` | 管理后台、运维工具 |
| `isAdminMode: false` | JWT Token | `Authorization: Bearer` | 普通用户应用 |

**重要**：
- `isAdminMode: true` 时，即使设置了 JWT Token 也会被忽略
- `isAdminMode: false` 时，即使设置了 Admin API Key 也会被忽略
- 两种模式互斥，需要明确配置

### 切换认证模式

```ts
import { updateApiConfig, setAdminApiKey, setBearerToken } from './src';

// 切换到管理员模式
updateApiConfig({ isAdminMode: true });
setAdminApiKey('ADMIN_KEY_xxx');

// 切换回普通用户模式
updateApiConfig({ isAdminMode: false });
setBearerToken('your-jwt-token');
```

### 管理员接口列表

| 方法 | 路径 | 说明 |
|------|------|------|
| `getAllUsers()` | `GET /api/admin/users` | 获取所有用户（密码已脱敏） |
| `getRiskConversations(userId)` | `GET /api/admin/users/{userId}/risk-conversations` | 获取用户风险对话 |
| `requestAs(method, path, options?)` | 任意路径 | 管理员访问任意接口 |

## Token 自动管理

### 自动存储与使用

从 **v0.3.0** 开始，登录成功后 **Token 会自动存储到全局**，无需手动调用 `setBearerToken()`：

```ts
const users = new UsersApi();

// 登录 - Token 自动存储
await users.login({ username: 'demo', password: 'pass' });

// 后续所有请求自动携带 Authorization: Bearer <token>
const profile = await users.getById(1);
const sessions = await new LlmSessionsApi().getAll();
```

### 登出清除 Token

```ts
// 清除全局 Token
users.logout();
```

### 持久化 Token（浏览器环境）

如果需要在刷新页面后保持登录状态，可以将 Token 持久化到 `localStorage`：

```ts
import { setBearerToken, getBearerToken } from './src';

// 应用启动时恢复 Token
const savedToken = localStorage.getItem('auth_token');
if (savedToken) {
  setBearerToken(savedToken);
}

// 登录后保存 Token
const loginResp = await users.login({ username, password });
localStorage.setItem('auth_token', loginResp.token);

// 登出时清除
users.logout();
localStorage.removeItem('auth_token');
```

### 手动管理 Token（高级）

```ts
import { setBearerToken, getBearerToken } from './src';

// 手动设置 Token
setBearerToken('your-jwt-token');

// 获取当前 Token
const currentToken = getBearerToken();

// 清除 Token
setBearerToken(null);
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
- `ProfilesApi`: 用户画像 CRUD（响应已对齐 DTO，JSON 字段为字符串数组）
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
// resp.userProfile 为 UserProfileDto，其中 JSON 字段为 string[]
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

## 变更日志（前端 SDK）

### 0.4.0 (2025-11-12)

**🔐 管理员 API Key 认证支持**

- 新增 `setAdminApiKey()` 和 `getAdminApiKey()` 函数
- HTTP 客户端优先使用 Admin API Key（`X-Admin-API-Key` 请求头）
- 如果设置了 Admin API Key，将不再发送 JWT Token
- `AdminApi` 新增 `requestAs()` 方法，允许管理员访问任意接口
- 更新 `AdminApi` 文档，添加详细注释和使用示例

**变更内容：**

```ts
// 新增管理员认证函数
import { setAdminApiKey, getAdminApiKey } from './src';

// 设置管理员 API Key
setAdminApiKey('ADMIN_KEY_your_key_here');

// AdminApi 新增方法
const admin = new AdminApi();
admin.requestAs('GET', '/api/conversations/123'); // 访问任意接口
```

**迁移指引：**

- 管理员认证与普通用户认证互斥
- 设置 Admin API Key 后，JWT Token 将被忽略
- 需要切换回普通用户认证时，调用 `setAdminApiKey(null)`

### 0.3.0

- Breaking: `ProfilesApi.get` 与 `ProfilesApi.save` 的类型对齐后端 DTO：
  - 响应类型改为 `UserProfileDto`（`interests` 等 JSON 字段为 `string[]`）。
  - `save` 入参新增 `UserProfileSave`，允许传 `string[]` 或 JSON 字符串；
    SDK 会自动将数组序列化为 JSON 字符串以兼容服务端实体入参（字符串字段）。
- `SessionCreateResponse.userProfile` 从 `Record<string, unknown>` 调整为 `UserProfileDto`。

迁移指引：

- 原先直接读取 `resp.userProfile.interests` 作为字符串的代码需改为数组处理。
- 保存画像时，推荐传 `string[]`，SDK 会自动转换，无需手动 JSON.stringify。

---

错误处理说明

- SDK 的 `httpClient` 会对非 2xx 响应抛出 `ApiError`，包含
  `status`, `code`, `message`, `details` 字段。
- 注意：部分错误路径当前仅返回 HTTP 状态码与空 body
  （如 404 + null）。如需标准错误 JSON（含 detail/code），
  可在后端添加 `@ControllerAdvice` 统一异常处理；或在
  SDK 层扩展宽容解析策略。
