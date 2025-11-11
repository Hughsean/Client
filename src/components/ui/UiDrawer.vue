<template>
  <div v-if="modelValue" @click.self="close">
    <div>
      <div v-if="!withHeader" />
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
// import { defineEmits, defineProps } from 'vue'
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
