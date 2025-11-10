// client/lib/src/apis/TestApi.ts

import { request } from '../http/httpClient';

export class TestApi {
  hello() {
    // /api/test/hello 返回纯文本
    return request<string>('GET', '/api/test/hello', {
      // 对于非 ApiResponse 包装的响应，禁用默认解包，直接返回文本
      unwrapHook: (r) => r as any
    });
  }
}
