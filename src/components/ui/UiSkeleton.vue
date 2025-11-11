<template>
  <div>
    <div v-if="loading">
      <div v-for="n in rows" :key="n">
        <div />
        <div />
      </div>
    </div>
    <div v-else>
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
