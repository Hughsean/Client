<template>
  <div v-if="modelValue" @click.self="close">
    <div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
// import { defineEmits, defineProps } from 'vue'
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
