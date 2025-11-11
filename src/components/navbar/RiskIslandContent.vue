<script setup lang="ts">
import { RouterLink } from 'vue-router'

interface Props {
  username?: string
  userId?: number | null
}

defineProps<Props>()
</script>

<template>
  <div class="risk-island-content">
    <RouterLink to="/users" class="back-button">
      <span class="back-icon">⬅️</span>
      <span class="back-text">返回</span>
    </RouterLink>
    
    <div class="divider"></div>
    
    <div class="user-info">
      <span class="user-icon">👤</span>
      <span class="user-name">{{ username || `用户 #${userId}` }}</span>
    </div>
    
    <div class="divider"></div>
    
    <div class="conversation-badge">
      <span class="badge-icon">💬</span>
      <span class="badge-text">对话监控</span>
    </div>
  </div>
</template>

<style scoped>
.risk-island-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: 0;
  height: 44px;
}

.back-button {
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
  text-decoration: none;
  font-weight: 600;
  font-size: var(--font-size-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 32px;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(100, 255, 218, 0.1) inset;
}

.back-button:hover {
  background: rgba(36, 200, 219, 0.15);
  border-color: rgba(100, 255, 218, 0.3);
  box-shadow: 
    0 4px 12px rgba(36, 200, 219, 0.2),
    0 0 0 1px rgba(100, 255, 218, 0.15) inset;
  transform: translateX(-2px);
}

.back-icon {
  font-size: var(--font-size-base);
  display: flex;
  align-items: center;
}

.back-text {
  font-size: var(--font-size-sm);
  white-space: nowrap;
}

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

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 6px 14px;
  background: rgba(30, 35, 45, 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 193, 49, 0.25);
  border-radius: var(--radius-full);
  height: 32px;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 193, 49, 0.1) inset;
}

.user-icon {
  font-size: var(--font-size-base);
  line-height: 1;
}

.user-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--secondary-orange);
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1;
}

.conversation-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 6px 14px;
  background: rgba(30, 35, 45, 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(139, 92, 246, 0.25);
  height: 32px;
  border-radius: var(--radius-full);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(139, 92, 246, 0.1) inset;
}

.badge-icon {
  font-size: var(--font-size-base);
  line-height: 1;
}

.badge-text {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: #a78bfa;
  line-height: 1;  white-space: nowrap;

}

.back-icon,
.back-text {
  line-height: 1;
}

@media (max-width: 768px) {
  .back-text,
  .badge-text,
  .user-name {
    display: none;
  }
  
  .risk-island-content {
    gap: var(--spacing-sm);
    height: 36px;
    padding: 0;
  }
  
  .divider {
    display: none;
  }
  
  .back-button,
  .user-info,
  .conversation-badge {
    height: 28px;
    padding: 4px 10px;
  }
}
</style>
