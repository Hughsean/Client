<template>
  <Teleport to="body">
    <Transition name="drawer-backdrop">
      <div 
        v-if="modelValue" 
        class="ui-drawer__backdrop" 
        @click.self="close"
      >
        <Transition name="drawer-slide">
          <div 
            v-if="modelValue"
            class="ui-drawer__panel"
            :style="{ width: size }"
          >
            <div v-if="!withHeader" class="ui-drawer__close">
              <button class="close-button" @click="close">
                <span>✕</span>
              </button>
            </div>
            <div class="ui-drawer__content">
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
  withHeader: { type: Boolean, default: false },
  size: { type: String, default: "50%" },
});
const emit = defineEmits(["update:modelValue", "close"]);
function close() {
  emit("update:modelValue", false);
  emit("close");
}
</script>

<style scoped>
.ui-drawer__backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: var(--z-modal);
  display: flex;
  justify-content: flex-end;
}

.ui-drawer__panel {
  position: relative;
  height: 100%;
  background: rgba(22, 27, 34, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--border);
}

.ui-drawer__close {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  z-index: 10;
}

.close-button {
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

.close-button:hover {
  background: var(--error);
  color: white;
  border-color: var(--error);
  transform: rotate(90deg);
}

.ui-drawer__content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-xl);
}

/* Transitions */
.drawer-backdrop-enter-active,
.drawer-backdrop-leave-active {
  transition: opacity var(--transition-base);
}

.drawer-backdrop-enter-from,
.drawer-backdrop-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform var(--transition-base);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}
</style>
