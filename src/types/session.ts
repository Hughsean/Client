// client/lib/src/types/session.ts

export interface SessionCreateRequest {
  userId: number;
  dialogueId?: number;
  // TODO: 其他创建会话需要的参数（后端暂未展示）
  [key: string]: unknown;
}

export interface SessionCreateResponse {
  id: string; // sessionId
  prompt?: string | null;
  clientIp?: string;
  location?: Record<string, unknown> | null;
  userProfileMap?: Record<string, unknown> | null;
  timeoutSeconds?: number;
  dialogueId?: number | null;
  // TODO: 其他字段
  [key: string]: unknown;
}

export interface MessageRequest {
  role: string; // user / system / assistant
  content: string;
  // TODO: 其他消息元数据
  [key: string]: unknown;
}

export interface MessageResponse {
  id?: string;
  content?: string;
  // TODO: 根据后端返回补充
  [key: string]: unknown;
}
