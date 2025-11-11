<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- 左侧：品牌区域 -->
      <div class="navbar-brand">
        <div class="brand-logo">
          <svg width="32" height="32" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="35" r="15" fill="#FFC131"/>
            <circle cx="60" cy="85" r="15" fill="#24C8DB"/>
            <path d="M60 50 Q80 60, 60 70 Q40 60, 60 50" fill="url(#gradient1)"/>
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#FFC131;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#24C8DB;stop-opacity:1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 class="brand-title">情感陪护</h1>
      </div>

      <!-- 中间：灵动岛动态内容区域 -->
      <div class="navbar-island">
        <div class="island-wrapper">
          <transition name="island-content" mode="out-in">
            <div v-if="hasIslandContent" :key="route.name as string" class="island-content">
              <component 
                :is="navbarIslandContent!.component" 
                v-bind="navbarIslandContent!.props"
              />
            </div>
            <div v-else class="island-empty">
              <span class="island-page-title">{{ pageTitle }}</span>
            </div>
          </transition>
        </div>
      </div>

      <!-- 右侧：状态和操作区域 -->
      <div class="navbar-actions">
        <slot name="actions">
          <!-- 默认显示系统状态 -->
          <div class="status-indicator">
            <span class="status-dot"></span>
            <span class="status-text">在线</span>
          </div>
        </slot>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useNavbarIsland } from "../composables/useNavbarIsland";

const route = useRoute();
const { navbarIslandContent } = useNavbarIsland();

// 检查是否有灵动岛内容
const hasIslandContent = computed(() => !!navbarIslandContent.value);

// 页面标题映射
const pageTitleMap: Record<string, string> = {
  'Users': '👥 用户管理',
  'UserConversations': '💬 对话监控',
  'Splash': '欢迎',
};

const pageTitle = computed(() => {
  return pageTitleMap[route.name as string] || '管理系统';
});
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background: rgba(13, 17, 23, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
  animation: navbarSlideDown 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes navbarSlideDown {
  0% {
    opacity: 0;
    transform: translateY(-100%);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.navbar-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: var(--spacing-sm) var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
  min-height: 60px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  animation: brandFadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s backwards;
  flex-shrink: 0;
  min-width: 150px;
}

@keyframes brandFadeIn {
  0% {
    opacity: 0;
    transform: translateX(-30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 3s ease-in-out infinite, logoScale 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s backwards;
  flex-shrink: 0;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes logoScale {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-180deg);
  }
  70% {
    transform: scale(1.1) rotate(10deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.brand-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, var(--primary-cyan), var(--secondary-orange));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: titleSlide 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.5s backwards;
  white-space: nowrap;
}

@keyframes titleSlide {
  0% {
    opacity: 0;
    transform: translateX(-20px);
    letter-spacing: -2px;
  }
  100% {
    opacity: 1;
    transform: translateX(0);
    letter-spacing: normal;
  }
}

/* ============ 灵动岛中间区域 ============ */
.navbar-island {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 800px;
  animation: islandAppear 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s backwards;
  height: 60px;
}

@keyframes islandAppear {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 灵动岛包装器 - 保持固定高度 */
.island-wrapper {
  position: relative;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.island-content,
.island-empty {
  position: absolute;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
}

.island-empty {
  padding: 0;
}

.island-page-title {
  padding: 6px 20px;
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.5px;
  background: rgba(30, 35, 45, 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(100, 255, 218, 0.15);
  border-radius: var(--radius-full);
  height: 32px;
  display: flex;
  align-items: center;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(100, 255, 218, 0.1) inset;
}

/* 灵动岛内容过渡动画 */
.island-content-enter-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.island-content-leave-active {
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
}

.island-content-enter-from {
  opacity: 0;
}

.island-content-leave-to {
  opacity: 0;
}

/* ============ 右侧操作区域 ============ */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  animation: actionsFadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.6s backwards;
  flex-shrink: 0;
  min-width: 120px;
  justify-content: flex-end;
}

@keyframes actionsFadeIn {
  0% {
    opacity: 0;
    transform: translateX(30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  background: rgba(30, 35, 45, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: var(--radius-full);
  border: 1px solid rgba(100, 255, 218, 0.15);
  transition: all 0.3s ease;
  cursor: pointer;
}

.status-indicator:hover {
  background: rgba(30, 35, 45, 0.8);
  border-color: var(--success);
  transform: scale(1.05);
  box-shadow: 0 0 16px rgba(52, 211, 153, 0.3);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 8px var(--success-glow);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.status-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

/* ============ 响应式设计 ============ */
@media (max-width: 1024px) {
  .navbar-island {
    max-width: 600px;
  }
  
  .island-wrapper {
    height: 44px;
  }
}

@media (max-width: 768px) {
  .navbar-container {
    padding: var(--spacing-xs) var(--spacing-md);
    gap: var(--spacing-sm);
  }
  
  .brand-title {
    font-size: var(--font-size-base);
  }
  
  .navbar-island {
    max-width: 400px;
    height: 48px;
  }
  
  .island-wrapper {
    height: 36px;
  }
  
  .island-page-title {
    font-size: var(--font-size-sm);
    height: 28px;
    padding: 4px 12px;
  }
  
  .status-text {
    display: none;
  }
}

@media (max-width: 480px) {
  .brand-title {
    display: none;
  }
  
  .navbar-brand {
    min-width: auto;
  }
  
  .navbar-island {
    max-width: 250px;
  }
  
  .island-wrapper {
    height: 36px;
  }
}
</style>
