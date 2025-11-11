import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
// 全局样式：放大基础字体和 Element Plus 基础字号
import "./assets/styles/global.css";
import { updateApiConfig } from "./server";
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';

// 仅在 Tauri 环境下使用 plugin-http 与直连后端；
// 浏览器开发环境走 Vite 代理（/api -> http://localhost:8080），避免 CORS。

updateApiConfig({
    baseURL: 'http://127.0.0.1:8080',
    timeoutMs: 10000,
    customFetch: tauriFetch
});

const app = createApp(App);
app.use(router);
app.mount("#app");
