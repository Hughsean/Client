<template>
  <span :style="styleObj"><slot /></span>
</template>

<script setup lang="ts">
const props = defineProps({
  type: String,
  style: Object as unknown as Record<string, string>,
});
const styleObj = (props.style || {}) as Record<string, string>;
</script>
