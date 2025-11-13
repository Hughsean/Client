<template>
  <span 
    :class="['ui-tag', `ui-tag--${type}`]"
    :style="styleObj"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
const props = defineProps({
  type: { type: String, default: 'default' },
  style: Object as unknown as Record<string, string>,
});
const styleObj = (props.style || {}) as Record<string, string>;
</script>

<style scoped>
.ui-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  border-radius: var(--radius-full);
  border: 1px solid transparent;
  white-space: nowrap;
  transition: all var(--transition-base);
  min-width: 85px;
  text-align: center;
}

.ui-tag--default {
  background: var(--surface-2);
  color: var(--text-secondary);
  border-color: var(--border);
}

.ui-tag--primary {
  background: rgba(36, 200, 219, 0.15);
  color: var(--primary-cyan-light);
  border-color: var(--primary-cyan);
}

.ui-tag--success {
  background: rgba(63, 185, 80, 0.15);
  color: #4ade80;
  border-color: var(--success);
}

.ui-tag--warning {
  background: rgba(255, 193, 49, 0.15);
  color: var(--secondary-orange-light);
  border-color: var(--secondary-orange);
}

.ui-tag--danger {
  background: rgba(248, 81, 73, 0.15);
  color: #ff8080;
  border-color: var(--error);
}

.ui-tag--info {
  background: rgba(36, 200, 219, 0.15);
  color: var(--primary-cyan-light);
  border-color: var(--primary-cyan);
}

/* Glow effect on hover */
.ui-tag:hover {
  transform: translateY(-1px);
}

.ui-tag--primary:hover {
  box-shadow: 0 0 12px var(--primary-cyan-glow);
}

.ui-tag--warning:hover {
  box-shadow: 0 0 12px var(--secondary-orange-glow);
}

.ui-tag--danger:hover {
  box-shadow: 0 0 12px var(--error-glow);
}

.ui-tag--success:hover {
  box-shadow: 0 0 12px var(--success-glow);
}
</style>
