import { createApp } from "vue";
import App from "./App.vue";
// Element Plus 全量引入（简单直接）
import "element-plus/dist/index.css";
import { updateApiConfig } from "./server";
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';

// 仅在 Tauri 环境下使用 plugin-http 与直连后端；
// 浏览器开发环境走 Vite 代理（/api -> http://localhost:8080），避免 CORS。

updateApiConfig({
    baseURL: 'http://127.0.0.1:8080',
    timeoutMs: 10000,
    customFetch: tauriFetch
});

createApp(App).mount("#app");
