// client/lib/src/types/session.ts

export interface SessionCreateRequest {
  userId: number;
  dialogueId?: number;
  // TODO: 其他创建会话需要的参数（后端暂未展示）
  [key: string]: unknown;
}

export interface SessionCreateResponse {
  sessionId: string;
  prompt?: string | null;
  clientIp?: string | null;
  location?: Record<string, unknown> | null;
  userProfile?: Record<string, unknown> | null;
  timeoutSeconds?: number;
  dialogueId?: number | null;
}

export interface MessageRequest {
  text: string;
  emotion?: string | null;
}

export interface MessageResponse {
  sessionId: string;
  reply?: string | null;
  toolCalls?: Array<Record<string, unknown>> | null;
  sessionClosed?: boolean;
  dialogueId?: number | null;
  title?: string | null;
}

export interface SessionStatusResponse {
  sessionId: string;
  userId?: number | null;
  dialogueId?: number | null;
  lastActive?: string | null; // ISO timestamp
  location?: Record<string, unknown> | null;
  timeoutSeconds?: number;
}

export interface CloseSessionResponse {
  sessionId: string;
  saved: boolean;
  message?: string;
}
