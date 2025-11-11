<template>
  <div 
    :class="['ui-card', { 'ui-card--shadow': shadow, 'ui-card--hover': hover }]"
  >
    <div v-if="$slots.header" class="ui-card__header">
      <slot name="header" />
    </div>
    <div class="ui-card__body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="ui-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ 
  shadow?: boolean;
  hover?: boolean;
}>();
</script>

<style scoped>
.ui-card {
  position: relative;
  background: rgba(22, 27, 34, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-base);
}

.ui-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--primary-cyan);
  opacity: 0;
  transition: opacity var(--transition-base);
  box-shadow: 0 0 10px var(--primary-cyan-glow);
}

.ui-card:hover::before {
  opacity: 1;
}

.ui-card--shadow {
  box-shadow: var(--shadow-md);
}

.ui-card--hover {
  cursor: pointer;
}

.ui-card--hover:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-cyan);
}

.ui-card__header {
  padding: var(--spacing-lg) var(--spacing-xl);
  background: rgba(28, 33, 40, 0.6);
  border-bottom: 1px solid var(--border);
  font-weight: 600;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

.ui-card__body {
  padding: var(--spacing-xl);
}

.ui-card__footer {
  padding: var(--spacing-lg) var(--spacing-xl);
  background: var(--surface-3);
  border-top: 1px solid var(--border);
}

/* Glass morphism variant */
.ui-card.glass {
  background: rgba(26, 31, 41, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Glow effect variant */
.ui-card.glow {
  box-shadow: 0 0 20px var(--primary-cyan-glow);
}

.ui-card.glow:hover {
  box-shadow: 0 0 30px var(--primary-cyan-glow),
              0 8px 32px rgba(0, 0, 0, 0.3);
}
</style>
