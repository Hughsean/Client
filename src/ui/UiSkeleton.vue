<template>
  <div class="ui-skeleton">
    <div v-if="loading" class="ui-skeleton__wrapper">
      <div 
        v-for="n in rows" 
        :key="n"
        class="ui-skeleton__row"
      >
        <div :class="['ui-skeleton__line', { 'ui-skeleton__line--animated': animated }]" />
        <div :class="['ui-skeleton__line', 'ui-skeleton__line--short', { 'ui-skeleton__line--animated': animated }]" />
      </div>
    </div>
    <div v-else class="ui-skeleton__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  loading: { type: Boolean, default: false },
  rows: { type: Number, default: 3 },
  animated: { type: Boolean, default: true },
});
</script>

<style scoped>
.ui-skeleton__wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.ui-skeleton__row {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.ui-skeleton__line {
  height: 16px;
  background: linear-gradient(
    90deg,
    var(--surface-2) 0%,
    var(--surface-1) 50%,
    var(--surface-2) 100%
  );
  border-radius: var(--radius-sm);
}

.ui-skeleton__line--short {
  width: 60%;
}

.ui-skeleton__line--animated {
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.ui-skeleton__content {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
