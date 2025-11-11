// client/lib/src/apis/AdminApi.ts

import { request } from '../http/httpClient';
import type { User } from '../types/user';
import type { AdminRiskConversation } from '../types/admin';

export class AdminApi {
  getAllUsers() {
    return request<User[]>('GET', '/api/admin/users');
  }

  /**
   * 获取指定用户的风险对话列表（包含对话元信息、消息、风险检测聚合）
   */
  getRiskConversations(userId: number) {
    return request<AdminRiskConversation[]>('GET', `/api/admin/users/${userId}/risk-conversations`);
  }
}
