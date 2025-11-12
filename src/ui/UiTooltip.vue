<template>
  <span @mouseenter="show = true" @mouseleave="show = false">
    <slot />
    <div v-if="show" :style="placementStyle">
      <slot name="content" />
    </div>
  </span>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
const props = defineProps({ placement: { type: String, default: "top" } });
const show = ref(false);
const placementStyle = computed(() => ({}));
</script>

<style scoped>

</style>
