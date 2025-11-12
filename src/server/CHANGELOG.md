# Changelog

All notable changes to this SDK will be documented in this file.

## 0.4.0 (2025-11-12)

### 🔐 新增功能：管理员 API Key 认证

#### 新增 API

- `setAdminApiKey(apiKey: string | null)` - 设置管理员 API Key
- `getAdminApiKey()` - 获取当前管理员 API Key
- `AdminApi.requestAs(method, path, options?)` - 管理员访问任意接口

#### 核心变更

1. **HTTP 客户端优先级调整**
   - 如果设置了 Admin API Key，将使用 `X-Admin-API-Key` 请求头
   - Admin API Key 优先于 JWT Token
   - 两种认证方式互斥

2. **AdminApi 增强**
   - 添加详细的 JSDoc 注释
   - 新增 `requestAs()` 方法，允许管理员访问系统中的任意接口
   - 完善类型定义

3. **文档更新**
   - README.md 添加管理员认证完整使用指南
   - 新增 `examples/admin-api.example.ts` 示例文件

#### 使用示例

```typescript
import { setAdminApiKey, AdminApi } from './client';

// 设置管理员 API Key
setAdminApiKey('ADMIN_KEY_your_key_here');

const admin = new AdminApi();

// 访问管理员专用接口
const users = await admin.getAllUsers();
const risks = await admin.getRiskConversations(1);

// 管理员访问任意接口
const conversations = await admin.requestAs('GET', '/api/conversations/123');
```

#### 迁移指引

- 管理员认证与普通用户认证互斥
- 设置 Admin API Key 后，所有请求将忽略 JWT Token
- 需要切换回普通用户时，调用 `setAdminApiKey(null)`

#### 文件变更

- 修改：`config/api.config.ts` - 添加 Admin API Key 管理
- 修改：`http/httpClient.ts` - 支持 Admin API Key 请求头
- 修改：`index.ts` - 导出新的管理员认证函数
- 增强：`apis/AdminApi.ts` - 添加 `requestAs()` 方法
- 新增：`examples/admin-api.example.ts` - 完整使用示例
- 更新：`README.md` - 添加管理员认证章节

---

## 0.3.0 (2025-11-11)

### Breaking

- ProfilesApi
  - GET/POST 与服务端 DTO 对齐：响应改为 `UserProfileDto`，其中 JSON
    字段（interests 等）为 `string[]`。
  - `save` 方法入参改为 `UserProfileSave`，可传 `string[]` 或 JSON 字符串；
    SDK 会自动将数组序列化为 JSON 字符串以兼容后端实体入参。
- LlmSessionsApi
  - `SessionCreateResponse.userProfile` 类型从 `Record<string, unknown>` 调整为 `UserProfileDto`。

### Migration

- 若代码中将 `resp.userProfile.interests` 当作字符串使用，请改为数组处理。
- 保存画像时，直接传 `string[]`，SDK 会负责序列化。

### Notes

- 本次改动仅同步类型与序列化策略，不改变后端数据库表结构。
