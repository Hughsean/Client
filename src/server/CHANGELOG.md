# Changelog

All notable changes to this SDK will be documented in this file.

## 0.4.3 (2025-11-14)

### 🔧 增强请求控制

#### 新增特性

- **RequestOptions.direct**: 新增 `direct` 选项，支持跳过 JWT/Admin API Key 认证的直连模式
- **TestApi 增强**: `TestApi.hello()` 方法现在接受可选的 `RequestOptions` 参数
- **在线状态检测优化**: 优化健康检查逻辑，使用 `direct: true` 避免认证失败干扰

#### 使用示例

```typescript
import { TestApi } from './src';

const testApi = new TestApi();

// 直连调用健康检查，不携带认证信息
await testApi.hello({ 
  direct: true,
  retry: { retries: 0 },
  signal: controller.signal 
});
```

#### 迁移指引

- 无破坏性改动，所有现有代码保持兼容
- 推荐在调用公开接口或健康检查时使用 `direct: true`
- 优化前端在线状态检测，避免因认证过期导致误判离线

#### 文件变更

- 修改：`http/httpClient.ts` - 新增 `direct` 选项处理逻辑
- 修改：`apis/TestApi.ts` - 方法签名支持 `RequestOptions`
- 修改：前端组件 - 在线状态检测使用直连模式
- 更新：`README.md` - 添加直连模式文档
- 更新：`CHANGELOG.md` - 版本记录

---

## 0.4.2 (2025-11-13)

### 📓 新增：用户日记模块

#### 新增 API

- `DiariesApi.createDiary(data)` 创建日记并自动心情分析
- `DiariesApi.updateDiary(id,data)` 更新日记并重新分析心情
- `DiariesApi.deleteDiary(id)` 删除日记
- `DiariesApi.getDiary(id)` 获取单条日记
- `DiariesApi.listDiaries()` 获取用户全部日记

#### 类型新增

- `UserDiary` / `CreateDiaryRequest` / `UpdateDiaryRequest`

#### 说明

- 后端会调用 LLM 生成 `moodDescription`（失败回退为 `未能分析`）。
- 无破坏性改动，原有功能不受影响。

#### 文件变更

- 新增：`types/diary.ts`, `apis/DiariesApi.ts`
- 修改：`index.ts` 导出新增类型与 API
- 更新：`README.md`, `CHANGELOG.md`

---

## 0.4.1 (2025-11-13)

### 🩺 新增：风险检测处理接口

#### 新增 API (0.4.1)

- `AdminApi.processRiskDetection(detectionId, { processed, processNotes })` 标记风险检测结果处理状态并添加备注

#### 类型更新

- `AdminRiskMessageDetection` 增加 `processed`, `processNotes`
- 新增请求体类型 `ProcessRiskDetectionPayload`

#### 迁移指引 (0.4.1)

- 旧代码无需修改；未处理结果默认 `processed = false`
- 若前端需展示处理备注，请读取 `processNotes`，为空表示无备注

#### 文件变更 (0.4.1)

- 修改：`types/admin.ts` - 新增字段与请求体类型
- 修改：`apis/AdminApi.ts` - 新增处理方法
- 更新：`README.md` - 添加接口文档与示例

---

## 0.4.0 (2025-11-12)

### 🔐 新增功能：管理员 API Key 认证

#### 新增 API

- `setAdminApiKey(apiKey: string | null)` - 设置管理员 API Key
- `getAdminApiKey()` - 获取当前管理员 API Key

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
