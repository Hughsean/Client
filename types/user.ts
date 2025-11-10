// client/lib/src/types/user.ts

export interface User {
  id?: number;
  username?: string;
  nickname?: string;
  email?: string;
  phone?: string;
  status?: number;
  // TODO: 根据后端实体补全更多字段
  [key: string]: unknown;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  user?: User;
  expiresAt?: string; // ISO 时间
  // TODO: 其他登录返回字段
  [key: string]: unknown;
}
