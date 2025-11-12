<template>
  <button 
    :class="['ui-button', `ui-button--${type}`, `ui-button--${size}`]"
    :disabled="loading || disabled" 
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="ui-button__spinner"></span>
    <span class="ui-button__content"><slot /></span>
  </button>
</template>

<script setup lang="ts">
const props = defineProps({
  type: { type: String, default: "default" },
  size: { type: String, default: "medium" },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});
defineEmits(["click"]);
</script>

<style scoped>
.ui-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: var(--font-size-base);
  line-height: 1.5;
  text-align: center;
  white-space: nowrap;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  user-select: none;
  transition: all var(--transition-base);
  overflow: hidden;
}

.ui-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.ui-button:active::before {
  width: 300px;
  height: 300px;
}

.ui-button__content {
  position: relative;
  z-index: 1;
}

.ui-button__spinner {
  position: relative;
  z-index: 1;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Button Types */
.ui-button--primary {
  background: linear-gradient(135deg, var(--primary-cyan), var(--primary-cyan-light));
  color: var(--bg-dark-1);
  border-color: var(--primary-cyan);
  box-shadow: 0 4px 12px var(--primary-cyan-glow);
}

.ui-button--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--primary-cyan-light), var(--primary-cyan));
  box-shadow: 0 6px 20px var(--primary-cyan-glow);
  transform: translateY(-2px);
}

.ui-button--primary:active:not(:disabled) {
  transform: translateY(0);
}

.ui-button--secondary {
  background: linear-gradient(135deg, var(--secondary-orange), var(--secondary-orange-light));
  color: var(--bg-dark-1);
  border-color: var(--secondary-orange);
  box-shadow: 0 4px 12px var(--secondary-orange-glow);
}

.ui-button--secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--secondary-orange-light), var(--secondary-orange));
  box-shadow: 0 6px 20px var(--secondary-orange-glow);
  transform: translateY(-2px);
}

.ui-button--default {
  background: var(--surface-2);
  color: var(--text-primary);
  border-color: var(--border);
}

.ui-button--default:hover:not(:disabled) {
  background: var(--surface-1);
  border-color: var(--border-hover);
  transform: translateY(-2px);
}

.ui-button--ghost {
  background: transparent;
  color: var(--text-primary);
  border-color: var(--border);
}

.ui-button--ghost:hover:not(:disabled) {
  background: var(--surface-hover);
  border-color: var(--primary-cyan);
  color: var(--primary-cyan);
}

.ui-button--danger {
  background: linear-gradient(135deg, var(--error), #ff6b6b);
  color: white;
  border-color: var(--error);
  box-shadow: 0 4px 12px var(--error-glow);
}

.ui-button--danger:hover:not(:disabled) {
  box-shadow: 0 6px 20px var(--error-glow);
  transform: translateY(-2px);
}

.ui-button--success {
  background: linear-gradient(135deg, var(--success), #4ade80);
  color: white;
  border-color: var(--success);
  box-shadow: 0 4px 12px var(--success-glow);
}

.ui-button--success:hover:not(:disabled) {
  box-shadow: 0 6px 20px var(--success-glow);
  transform: translateY(-2px);
}

/* Button Sizes */
.ui-button--small {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-sm);
  border-radius: var(--radius-sm);
}

.ui-button--medium {
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-base);
}

.ui-button--large {
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-lg);
  border-radius: var(--radius-lg);
}

/* Disabled State */
.ui-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.ui-button:disabled:hover {
  transform: none;
  box-shadow: none;
}
</style>
