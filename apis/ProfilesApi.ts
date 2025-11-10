// client/lib/src/apis/ProfilesApi.ts

import { request } from '../http/httpClient';
import type { UserProfile } from '../types/profile';

export class ProfilesApi {
  get(userId: number) {
    return request<UserProfile>('GET', `/api/profiles/${userId}`);
  }

  save(profile: UserProfile) {
    return request<UserProfile>('POST', '/api/profiles', { body: profile });
  }

  delete(userId: number) {
    return request<void>('DELETE', `/api/profiles/${userId}`);
  }
}
