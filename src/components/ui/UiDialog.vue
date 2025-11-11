<template>
  <Teleport to="body">
    <Transition name="dialog-backdrop">
      <div 
        v-if="modelValue" 
        class="ui-dialog__backdrop" 
        @click.self="close"
      >
        <Transition name="dialog-scale">
          <div 
            v-if="modelValue"
            :class="['ui-dialog__panel', { 'ui-dialog__panel--fullscreen': fullscreen }]"
          >
            <button class="ui-dialog__close" @click="close">
              <span>✕</span>
            </button>
            <div class="ui-dialog__content">
              <slot />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  fullscreen: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue", "close"]);
function close() {
  emit("update:modelValue", false);
  emit("close");
}
</script>

<style scoped>
.ui-dialog__backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
}

.ui-dialog__panel {
  position: relative;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  background: rgba(22, 27, 34, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.ui-dialog__panel--fullscreen {
  max-width: none;
  max-height: none;
  width: 100%;
  height: 100%;
  border-radius: 0;
}

.ui-dialog__close {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  z-index: 10;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
  font-size: var(--font-size-xl);
}

.ui-dialog__close:hover {
  background: var(--error);
  color: white;
  border-color: var(--error);
  transform: rotate(90deg);
}

.ui-dialog__content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-xl);
}

/* Transitions */
.dialog-backdrop-enter-active,
.dialog-backdrop-leave-active {
  transition: opacity var(--transition-base);
}

.dialog-backdrop-enter-from,
.dialog-backdrop-leave-to {
  opacity: 0;
}

.dialog-scale-enter-active,
.dialog-scale-leave-active {
  transition: all var(--transition-base);
}

.dialog-scale-enter-from,
.dialog-scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
