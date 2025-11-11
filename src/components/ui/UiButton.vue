<template>
  <button :disabled="loading || disabled" @click="$emit('click', $event)">
    <span v-if="loading" aria-hidden></span>
    <span><slot /></span>
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

<style scoped></style>
