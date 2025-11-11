<template>
  <div>
    <div v-if="$slots.header">
      <slot name="header" />
    </div>
    <div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ shadow?: boolean }>();
</script>
