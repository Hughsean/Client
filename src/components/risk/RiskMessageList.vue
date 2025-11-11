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
  gap: var(--spacing-xs);
}

.msg-list li {
  display: grid;
  grid-template-columns: 80px 1fr 220px;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all var(--transition-base);
  border-radius: var(--radius-md);
  background: rgba(22, 27, 34, 0.4);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  position: relative;
  overflow: hidden;
}

.msg-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--primary-cyan);
  opacity: 0;
  transition: opacity var(--transition-base);
}

.msg-list li:hover {
  background: var(--surface-hover);
  border-color: var(--primary-cyan);
  transform: translateX(4px);
}

.msg-list li:hover::before {
  opacity: 1;
}

.msg-list li.active {
  background: rgba(36, 200, 219, 0.1);
  border-color: var(--primary-cyan);
  box-shadow: 0 0 12px var(--primary-cyan-glow);
}

.msg-list li.active::before {
  opacity: 1;
  box-shadow: 0 0 8px var(--primary-cyan-glow);
}

.msg-list .role {
  color: var(--primary-cyan);
  font-weight: 700;
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.msg-list .text {
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.msg-list .right {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  justify-content: flex-end;
}

.msg-list .time {
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
  min-width: 140px;
  text-align: right;
  white-space: nowrap;
}
</style>
