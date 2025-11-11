// client/lib/src/config/api.config.ts
// API 配置与默认值

export interface RetryConfig {
  retries: number; // 最大重试次数
  initialDelayMs: number; // 初始退避时间
  maxDelayMs: number; // 最大退避
  backoffFactor: number; // 指数因子
  retryMethods: string[]; // 允许自动重试的 HTTP 方法
}

export interface ApiConfig {
  baseURL: string;
  timeoutMs: number;
  withCredentials?: boolean; // 仅在浏览器
  defaultHeaders: Record<string, string>;
  retry: RetryConfig;
  // 是否在业务成功时解包 ApiResponse.data
  autoUnwrap: boolean;
  // 自定义解包钩子（覆盖默认）
  unwrapHook?: <T>(resp: any) => T;
  // 可注入自定义 fetch（如 @tauri-apps/plugin-http 的 fetch 或 cross-fetch）
  customFetch?: typeof fetch;
}

export const defaultApiConfig: ApiConfig = {
  baseURL: 'http://localhost:8080',
  timeoutMs: 15000,
  withCredentials: false,
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  retry: {
    retries: 3,
    initialDelayMs: 300,
    maxDelayMs: 4000,
    backoffFactor: 2,
    retryMethods: ['GET', 'PUT', 'DELETE', 'HEAD', 'OPTIONS']
  },
  autoUnwrap: true
};

// 允许动态覆盖配置
let activeConfig: ApiConfig = { ...defaultApiConfig };

export function getApiConfig(): ApiConfig {
  return activeConfig;
}

export function updateApiConfig(patch: Partial<ApiConfig>) {
  activeConfig = { ...activeConfig, ...patch, retry: { ...activeConfig.retry, ...(patch.retry || {}) } };
}

// 简单的 token 管理（例：登录后设置）
let bearerToken: string | null = null;
export function setBearerToken(token: string | null) {
  bearerToken = token;
}
export function getBearerToken() {
  return bearerToken;
}
