<script setup lang="ts">
import RiskConversationsAside from '../components/risk/RiskConversationsAside.vue'
import UiButton from '../components/ui/UiButton.vue'
import type { User } from '../server'
defineProps<{ user: User | null; userId: number | null }>()
defineEmits<{ (e: 'back'): void }>()
</script>

<template>
  <div  >
    <div >
      <UiButton  @click="$emit('back')">返回</UiButton>
      <h2  >风险监测</h2>
      <div   />
    </div>
    <RiskConversationsAside :user="user" :user-id="userId" />
  </div>
</template>


