<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1 class="error-title">页面未找到</h1>
      <p class="error-description">功能还在开发呦~</p>
      
      <RouterLink to="/" class="back-button">
        返回首页
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.not-found-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 140px);
  padding: 20px;
}

.not-found-content {
  text-align: center;
}

.error-code {
  font-size: 120px;
  font-weight: 900;
  background: linear-gradient(135deg, var(--bg-accent-from), var(--bg-accent-to));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
  letter-spacing: -2px;
}

.error-title {
  margin: 0 0 12px;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-on-bg);
  letter-spacing: -0.5px;
}

.error-description {
  margin: 0 0 32px;
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.back-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 24px;
  background: linear-gradient(135deg, var(--bg-accent-from), var(--bg-accent-to));
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 8px 24px rgba(109, 40, 217, 0.4);
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(109, 40, 217, 0.5);
}

.back-button:active {
  transform: translateY(0);
}
</style>
