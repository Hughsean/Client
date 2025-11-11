<script setup lang="ts">
import RiskConversationsAside from '../components/risk/RiskConversationsAside.vue'
import type { User } from '../server'
defineProps<{ user: User | null; userId: number | null }>()
defineEmits<{ (e: 'back'): void }>()
</script>

<template>
  <div class="risk-monitor-view">
    <div class="top-bar">
      <el-button type="primary" link @click="$emit('back')">返回</el-button>
      <h2 class="title">风险监测</h2>
      <div class="spacer" />
    </div>
    <RiskConversationsAside :user="user" :user-id="userId" />
  </div>
</template>

<style scoped>
.risk-monitor-view { padding: 16px; }
.top-bar { display:flex; align-items:center; gap:16px; margin-bottom:12px; }
.top-bar .spacer { flex:1; }
.title { margin:0; font-size:20px; }
</style>
