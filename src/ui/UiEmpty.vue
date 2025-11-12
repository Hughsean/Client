<template>
  <div class="ui-empty">
    <div class="ui-empty__icon">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="2" opacity="0.3"/>
        <path d="M20 32 L28 40 L44 24" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
      </svg>
    </div>
    <div class="ui-empty__description">{{ description }}</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  description: { type: String, default: "暂无数据" },
});
</script>

<style scoped>
.ui-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  color: var(--text-tertiary);
  text-align: center;
  min-height: 300px;
}

.ui-empty__icon {
  margin-bottom: var(--spacing-lg);
  color: var(--text-muted);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.ui-empty__description {
  font-size: var(--font-size-lg);
  font-weight: 500;
  color: var(--text-tertiary);
}
</style>
