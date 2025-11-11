<script setup lang="ts">
const emit = defineEmits<{
  refresh: [];
}>();

const handleRefresh = () => {
  emit("refresh");
};
</script>

<template>
  <div class="users-island-content">
    <!-- 页面标识 -->
    <div class="page-badge">
      <span class="page-icon">👥</span>
      <span class="page-text">用户管理</span>
    </div>

    <div class="divider"></div>

    <!-- 刷新按钮 -->
    <button class="refresh-button" @click="handleRefresh" title="刷新用户列表">
      <span class="refresh-icon">🔄</span>
      <span class="refresh-text">刷新</span>
    </button>
  </div>
</template>

<style scoped>
.users-island-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: 0;
  height: 44px;
}

/* 页面标识 */
.page-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 6px 14px;
  background: rgba(30, 35, 45, 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(139, 92, 246, 0.25);
  border-radius: var(--radius-full);
  height: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(139, 92, 246, 0.1) inset;
}

.page-icon {
  font-size: var(--font-size-base);
  line-height: 1;
}

.page-text {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: #a78bfa;
  /* line-height: 1;   */
  white-space: nowrap;
}

/* 分隔线 */
.divider {
  width: 2px;
  height: 20px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(100, 255, 218, 0.3),
    transparent
  );
}

/* 刷新按钮 */
.refresh-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 6px 14px;
  background: rgba(30, 35, 45, 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(100, 255, 218, 0.15);
  border-radius: var(--radius-full);
  color: var(--primary-cyan);
  cursor: pointer;
  font-weight: 600;
  font-size: var(--font-size-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(100, 255, 218, 0.1) inset;
}

.refresh-button:hover {
  background: rgba(36, 200, 219, 0.15);
  border-color: rgba(100, 255, 218, 0.3);
  box-shadow: 0 4px 12px rgba(36, 200, 219, 0.2),
    0 0 0 1px rgba(100, 255, 218, 0.15) inset;
}

.refresh-button:active {
  transform: scale(0.95);
}

.refresh-icon {
  font-size: var(--font-size-base);
  transition: transform 0.3s ease;
  line-height: 1;
}

.refresh-button:hover .refresh-icon {
  transform: rotate(180deg);
}

.refresh-text {
  font-size: var(--font-size-sm);
  /* line-height: 1; */
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .users-island-content {
    gap: var(--spacing-sm);
    height: 36px;
    padding: 0;
  }

  .page-text,
  .refresh-text {
    display: none;
  }

  .refresh-button {
    width: 28px;
    height: 28px;
    padding: 0;
    justify-content: center;
    border-radius: 50%;
  }

  .page-badge {
    height: 28px;
    padding: 4px 10px;
  }
}

@media (max-width: 480px) {
  .divider {
    display: none;
  }
}
</style>
