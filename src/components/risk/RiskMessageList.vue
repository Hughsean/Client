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
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.msg-list li {
  display: grid;
  grid-template-columns: 76px 1fr 220px;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-subtle);
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 6px;
  margin: 2px 0;
}

.msg-list li:hover {
  background: rgba(100, 255, 218, 0.08);
  border-color: var(--accent);
}

.msg-list li.active {
  background: rgba(100, 255, 218, 0.15);
  border-color: var(--accent);
  box-shadow: inset 0 0 12px rgba(100, 255, 218, 0.1);
}

.msg-list .role {
  color: var(--accent);
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.msg-list .text {
  color: var(--text-on-bg);
  font-size: 13px;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.msg-list .right {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
}

.msg-list .time {
  color: var(--text-tertiary);
  font-size: 12px;
  min-width: 140px;
  text-align: right;
  white-space: nowrap;
}

/* 滚动条美化 */
.msg-list::-webkit-scrollbar {
  width: 6px;
}

.msg-list::-webkit-scrollbar-track {
  background: transparent;
}

.msg-list::-webkit-scrollbar-thumb {
  background-color: rgba(100, 255, 218, 0.2);
  border-radius: 3px;
}

.msg-list::-webkit-scrollbar-thumb:hover {
  background-color: rgba(100, 255, 218, 0.4);
}
</style>
