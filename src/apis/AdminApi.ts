// client/lib/src/apis/AdminApi.ts

import { request } from '../http/httpClient';
import type { User } from '../types/user';

export class AdminApi {
  getAllUsers() {
    return request<User[]>('GET', '/api/admin/users');
  }
}
