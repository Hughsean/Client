// client/lib/src/apis/UsersApi.ts

import { request } from '../http/httpClient';
import type { User, LoginRequest, LoginResponse } from '../types/user';

export class UsersApi {
  getById(id: number) {
    return request<User>('GET', `/api/users/${id}`);
  }

  getAll() {
    return request<User[]>('GET', '/api/users');
  }

  register(user: User) {
    return request<void>('POST', '/api/users/register', { body: user });
  }

  update(id: number, user: User) {
    return request<void>('PUT', `/api/users/${id}`, { body: user });
  }

  delete(id: number) {
    return request<void>('DELETE', `/api/users/${id}`);
  }

  login(payload: LoginRequest) {
    return request<LoginResponse>('POST', '/api/users/login', { body: payload });
  }
}
