<template>
  <div>
    <div>—</div>
    <div>{{ description }}</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  description: { type: String, default: "暂无数据" },
});
</script>
