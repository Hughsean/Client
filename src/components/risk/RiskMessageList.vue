<script setup lang="ts">
// import { defineProps, defineEmits } from 'vue'
import { formatToCN } from '../../utils/time'
import { roleCN } from '../../utils/risk'
import type { AdminConversationMessage, AdminRiskConversation } from '../../server'

const props = defineProps<{
  conversation: AdminRiskConversation
  messages: AdminConversationMessage[]
  selectedMessageId?: number
  maxHeight?: number | string
}>()

const emit = defineEmits<{
  (e: 'select', messageId: number): void
  (e: 'open-card', messageId: number): void
}>()

function onClick(m: AdminConversationMessage) {
  if (!m?.id) return
  emit('select', m.id)
  if (String(m.role).toLowerCase() === 'user') emit('open-card', m.id)
}

function isActive(id?: number) {
  return Number(id) === Number(props.selectedMessageId)
}
</script>

<template>
  <ul class="msg-list" :style="props.maxHeight === undefined ? undefined : { maxHeight: typeof props.maxHeight === 'number' ? props.maxHeight + 'px' : String(props.maxHeight) }">
    <li
      v-for="m in messages"
      :key="m.id"
      :class="{ active: isActive(m.id) }"
      @click="onClick(m)"
    >
      <span class="role">{{ roleCN(m.role) }}</span>
      <span class="text">{{ m.text }}</span>
      <div class="right">
        <slot name="indicator" :message="m" />
        <span class="time">{{ formatToCN(m.createdAt, true) }}</span>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.msg-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 240px;
  overflow: auto;
}
.msg-list li {
  display: grid;
  grid-template-columns: 76px 1fr 220px;
  gap: 8px;
  padding: 6px 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  transition: background-color .15s;
}
.msg-list .role { color: var(--el-text-color-secondary); }
.msg-list .text { color: var(--el-text-color-primary); }
.msg-list .right { display:flex; align-items:center; gap:8px; }
.msg-list .time { color: var(--el-text-color-secondary); margin-left: auto; min-width: 140px; text-align: right; }
.msg-list li:hover { background: var(--el-color-primary-light-9); }
.msg-list li.active { background: var(--el-color-primary-light-8); }
</style>
