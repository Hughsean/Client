# Changelog

All notable changes to this SDK will be documented in this file.

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
