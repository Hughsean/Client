<script setup lang="ts">
// import { defineProps, defineEmits } from 'vue'
import { formatToCN } from '../../utils/time'
import { roleCN } from '../../utils/risk'
import type { AdminConversationMessage, AdminRiskConversation, RiskLevel } from '../../server'

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

// 获取消息的风险等级
function getMessageRiskLevel(messageId?: number): RiskLevel | undefined {
  if (!messageId) return undefined
  const detections = props.conversation.detections || []
  const messageDets = detections.filter(d => Number(d.messageId) === Number(messageId))
  if (messageDets.length === 0) return undefined
  // 返回最高风险等级
  const levels: RiskLevel[] = ['CRISIS', 'HIGH', 'MEDIUM', 'LOW', 'NONE', 'UNKNOWN']
  for (const level of levels) {
    if (messageDets.some(d => d.riskLevel === level)) return level
  }
  return undefined
}

// 根据风险等级计算样式变量
function getRiskStyle(messageId?: number, role?: string) {
  if (String(role).toLowerCase() !== 'user') return {}
  
  const riskLevel = getMessageRiskLevel(messageId)
  if (!riskLevel || riskLevel === 'NONE') return {}
  
  const riskScore = getRiskScore(riskLevel)
  const hue = 120 - 120 * riskScore // green -> red
  
  return {
    '--message-risk-hue': hue.toString(),
    '--message-risk-score': riskScore.toString(),
  }
}

function getRiskScore(level?: RiskLevel): number {
  switch (level) {
    case 'NONE': return 0
    case 'LOW': return 0.25
    case 'MEDIUM': return 0.5
    case 'HIGH': return 0.75
    case 'CRISIS': return 1
    default: return 0
  }
}
</script>

<template>
  <ul class="msg-list" :style="props.maxHeight === undefined ? undefined : { maxHeight: typeof props.maxHeight === 'number' ? props.maxHeight + 'px' : String(props.maxHeight) }">
    <li
      v-for="m in messages"
      :key="m.id"
      :class="{ 
        active: isActive(m.id),
        'user-message': String(m.role).toLowerCase() === 'user',
        'has-risk': getMessageRiskLevel(m.id) && getMessageRiskLevel(m.id) !== 'NONE'
      }"
      :style="getRiskStyle(m.id, m.role)"
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
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  flex: 1;
  min-height: 0;
  max-height: 100%;
}

.msg-list::-webkit-scrollbar {
  width: 6px;
}

.msg-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-sm);
}

.msg-list::-webkit-scrollbar-thumb {
  background: rgba(100, 255, 218, 0.3);
  border-radius: var(--radius-sm);
  transition: background 0.2s ease;
}

.msg-list::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 255, 218, 0.5);
}

.msg-list li {
  display: grid;
  grid-template-columns: 70px 1fr auto;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: var(--radius-lg);
  background: rgba(28, 33, 40, 0.5);
  position: relative;
  overflow: hidden;
  align-items: start;
  flex-shrink: 0;
  min-height: fit-content;
}

/* 用户消息根据风险等级着色 */
.msg-list li.user-message.has-risk {
  background: hsla(var(--message-risk-hue, 120), 40%, 50%, 0.08);
  border-left: 3px solid hsla(var(--message-risk-hue, 120), 60%, 50%, 0.5);
}

.msg-list li.user-message.has-risk::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: hsla(var(--message-risk-hue, 120), 70%, 55%, 0.8);
  opacity: 1;
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
  transition: opacity 0.25s ease;
}

.msg-list li:hover {
  background: rgba(36, 41, 50, 0.7);
  border-color: rgba(100, 255, 218, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.msg-list li.user-message.has-risk:hover {
  background: hsla(var(--message-risk-hue, 120), 40%, 50%, 0.15);
  border-color: hsla(var(--message-risk-hue, 120), 60%, 50%, 0.6);
}

.msg-list li:hover::before {
  opacity: 0.6;
}

.msg-list li.active {
  background: rgba(36, 200, 219, 0.08);
  border-color: var(--primary-cyan);
  box-shadow: 0 0 0 1px var(--primary-cyan), 0 4px 16px rgba(100, 255, 218, 0.2);
}

.msg-list li.active::before {
  opacity: 1;
  box-shadow: 0 0 8px var(--primary-cyan-glow);
}

.msg-list .role {
  color: var(--primary-cyan);
  font-weight: 600;
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.9;
  white-space: nowrap;
  padding-top: 2px;
}

.msg-list .text {
  color: var(--text-primary);
  font-size: var(--font-size-base);
  line-height: 1.6;
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  font-weight: 400;
}

.msg-list .right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  justify-content: flex-end;
  flex-shrink: 0;
  padding-top: 2px;
}

.msg-list .time {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  min-width: 140px;
  text-align: right;
  white-space: nowrap;
  font-weight: 500;
}
</style>
