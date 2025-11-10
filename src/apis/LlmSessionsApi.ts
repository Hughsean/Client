// client/lib/src/apis/LlmSessionsApi.ts

import { request } from '../http/httpClient';
import type { SessionCreateRequest, SessionCreateResponse, MessageRequest, MessageResponse } from '../types/session';

export class LlmSessionsApi {
  health() {
    // 返回 { status: 'ok' }
    return request<{ status: string }>('GET', '/api/llm/health', { unwrapHook: (r) => r as any });
  }

  createSession(payload: SessionCreateRequest) {
    return request<SessionCreateResponse>('POST', '/api/llm/sessions', { body: payload });
  }

  getSession(sessionId: string) {
    return request<any>('GET', `/api/llm/sessions/${sessionId}`);
  }

  postMessage(sessionId: string, payload: MessageRequest) {
    return request<MessageResponse>('POST', `/api/llm/sessions/${sessionId}/messages`, { body: payload });
  }

  closeSession(sessionId: string) {
    return request<void>('POST', `/api/llm/sessions/${sessionId}/close`);
  }
}
