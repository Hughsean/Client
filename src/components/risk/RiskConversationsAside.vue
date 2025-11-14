<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { messageError } from "../../utils/message";
import { AdminApi, ConversationsApi } from "../../server";
import type {
  User,
  AdminRiskConversation,
  RiskLevel,
  Conversation,
  ConversationMessage,
  AdminConversationMessage,
  AdminRiskMessageDetection,
} from "../../server";
import {
  tagStyle,
  riskLevelCN,
} from "../../utils/risk";
import RiskMessageList from "./RiskMessageList.vue";
import RiskFloatCard from "./RiskFloatCard.vue";
import UiSkeleton from '@/ui/UiSkeleton.vue'
import UiEmpty from '@/ui/UiEmpty.vue'
import UiTag from '@/ui/UiTag.vue'

const props = defineProps<{ userId: number | null; user?: User | null }>();

const adminApi = new AdminApi();
const convApi = new ConversationsApi();
const loading = ref(false);
const convos = ref<AdminRiskConversation[]>([]);
const selectedConvId = ref<number | null>(null);
const selectedMessageId = ref<number | undefined>(undefined);
const showFloatCard = ref(false);
const floatCardDetections = ref<AdminRiskMessageDetection[]>([]);
const batchProcessing = ref(false);
const showBatchProcessDialog = ref(false);
const batchProcessNotes = ref('');

const title = computed(
  () =>
    props.user?.nickname ||
    props.user?.username ||
    (props.userId ? `用户 #${props.userId}` : "用户")
);
const currentConv = computed<AdminRiskConversation | undefined>(() =>
  convos.value.find((c) => c.conversationId === selectedConvId.value)
);

watch(
  () => props.userId,
  (id) => {
    if (id) load(id);
  },
  { immediate: true }
);

async function load(userId: number) {
  loading.value = true;
  try {
    const [allConvs, riskConvs] = await Promise.all([
      convApi.listByUser(userId).catch<Conversation[]>(() => []),
      adminApi
        .getRiskConversations(userId)
        .catch<AdminRiskConversation[]>(() => []),
    ]);
    // console.log(allConvs[0].createdAt);
    
    const map = new Map<number, AdminRiskConversation>();
    for (const c of allConvs) {
      if (!c.id) continue;
      map.set(c.id, {
        conversationId: c.id,
        userId: (c.userId as number) ?? userId,
        title: (c.title as string) ?? null,
        createdAt: c.createdAt,
        aggregatedRiskLevel: "NONE",
        detections: [],
        messages: [],
      });
    }
    for (const rc of riskConvs) {
      const existed = map.get(rc.conversationId);
      if (existed) map.set(rc.conversationId, { ...existed, ...rc });
      else map.set(rc.conversationId, rc);
    }
    const merged = Array.from(map.values());
    merged.sort(
      (a, b) =>
        riskScore(b.aggregatedRiskLevel) - riskScore(a.aggregatedRiskLevel) ||
        Date.parse(b.createdAt || "") - Date.parse(a.createdAt || "")
    );
    convos.value = merged;
    // 默认选择第一条（仅在没有当前选择时）
    if (merged.length && !selectedConvId.value) {
      selectConversation(merged[0].conversationId);
    }
  } catch (e: any) {
    messageError(e?.message || "加载对话失败");
  } finally {
    loading.value = false;
  }
}

function riskScore(level: RiskLevel | undefined) {
  switch (level) {
    case "NONE":
      return 0;
    case "LOW":
      return 0.25;
    case "MEDIUM":
      return 0.5;
    case "HIGH":
      return 0.75;
    case "CRISIS":
      return 1;
    default:
      return 0.5;
  }
}

function selectConversation(id: number) {
  if (selectedConvId.value === id) return;
  selectedConvId.value = id;
  selectedMessageId.value = undefined;
  loadMessages(id);
}

async function loadMessages(convId: number) {
  const conv = convos.value.find((c) => c.conversationId === convId);
  if (!conv || (conv.messages && conv.messages.length)) return;
  try {
    const msgs: ConversationMessage[] = await convApi.getContents(convId);
    conv.messages = (msgs || []).map((m) => ({
      id: m.id as number,
      role: (m.senderRole as string) ?? undefined,
      messageType: (m.messageType as string) ?? undefined,
      text: extractMessageText(m),
      createdAt: (m.createdAt as string) ?? undefined,
    })) as AdminConversationMessage[];
    pickInitialMessage(conv);
  } catch {
    messageError("加载消息失败");
  }
}

function extractMessageText(m: ConversationMessage): string | undefined {
  const c = m?.content;
  if (typeof c === "string") {
    try {
      const obj = JSON.parse(c);
      if (obj && typeof obj === "object") {
        if (typeof obj.text === "string") return obj.text;
        if (typeof obj.composed === "string") return obj.composed;
        if (Array.isArray(obj.segments)) {
          const joined = obj.segments
            .map((s: any) => (typeof s?.text === "string" ? s.text : ""))
            .filter(Boolean)
            .join(" ");
          if (joined) return joined;
        }
        const strings: string[] = [];
        for (const k of Object.keys(obj))
          if (typeof (obj as any)[k] === "string")
            strings.push((obj as any)[k]);
        if (strings.length) return strings.join(" ");
      }
    } catch {
      return c;
    }
    return c;
  }
  if (c && typeof (c as any).text === "string") return (c as any).text;
  return undefined;
}

function pickInitialMessage(conv: AdminRiskConversation) {
  const detIds = new Set(
    (conv.detections || []).map((d) => Number(d.messageId)).filter(Boolean)
  );
  const visible = (conv.messages || []).filter((m) =>
    ["user", "assistant"].includes(String(m.role).toLowerCase())
  );
  const found = visible.find(
    (m) => detIds.has(Number(m.id)) && String(m.role).toLowerCase() === "user"
  );
  const fallback =
    found ||
    visible.find((m) => detIds.has(Number(m.id))) ||
    visible.find((m) => String(m.role).toLowerCase() === "user") ||
    visible[0];
  selectedMessageId.value = fallback?.id;
}

function getVisibleMessages(conv?: AdminRiskConversation) {
  if (!conv) return [];
  return (conv.messages || []).filter((m) =>
    ["user", "assistant"].includes(String(m.role).toLowerCase())
  );
}

function getDetectionsForMessage(
  conv: AdminRiskConversation,
  messageId?: number
): AdminRiskMessageDetection[] {
  const list = conv?.detections || [];
  if (!messageId) return list;
  return list.filter((d) => Number(d.messageId) === Number(messageId));
}

function getFirstDetectionOrNone(
  conv: AdminRiskConversation,
  messageId?: number
): AdminRiskMessageDetection {
  const list = getDetectionsForMessage(conv, messageId);
  if (list.length) return list[0];
  return { messageId, riskLevel: "NONE" } as AdminRiskMessageDetection;
}

function onSelectMessage(mid: number) {
  selectedMessageId.value = mid;
  // 打开风险卡片
  if (currentConv.value) {
    const dets = getDetectionsForMessage(currentConv.value, mid);
    if (dets.length || String(currentConv.value.messages?.find(m => m.id === mid)?.role).toLowerCase() === 'user') {
      floatCardDetections.value = dets.length ? dets : [{ messageId: mid, riskLevel: "NONE" } as AdminRiskMessageDetection];
      showFloatCard.value = true;
    }
  }
}

function closeFloatCard() {
  showFloatCard.value = false;
}

async function handleRefresh() {
  // 刷新当前用户的风险对话数据
  if (props.userId) {
    const currentConvId = selectedConvId.value;
    const currentMsgId = selectedMessageId.value;
    
    await load(props.userId);
    
    // 恢复之前选中的会话和消息
    if (currentConvId) {
      selectedConvId.value = currentConvId;
      selectedMessageId.value = currentMsgId;
      
      // 重新打开当前消息的风险卡片
      if (currentConv.value && currentMsgId) {
        const dets = getDetectionsForMessage(currentConv.value, currentMsgId);
        floatCardDetections.value = dets.length ? dets : [{ messageId: currentMsgId, riskLevel: "NONE" } as AdminRiskMessageDetection];
      }
    }
  }
}

function riskItemStyle(level?: RiskLevel) {
  const score = riskScore(level);
  const hue = 120 - 120 * score; // green -> red
  return {
    '--risk-hue': hue.toString(),
    '--risk-score': score.toString(),
  };
}

// 检查会话中的检测是否全部已处理
function isConversationProcessed(conv: AdminRiskConversation): boolean {
  const detections = conv.detections || [];
  if (detections.length === 0) return false;
  return detections.every(d => d.processed === true);
}

// 获取会话的处理状态文本
function getProcessStatus(conv: AdminRiskConversation): string {
  const detections = conv.detections || [];
  if (detections.length === 0) return '';
  const processedCount = detections.filter(d => d.processed === true).length;
  const totalCount = detections.length;
  if (processedCount === 0) return '未处理';
  if (processedCount === totalCount) return '已处理';
  return `${processedCount}/${totalCount}`;
}

// 检查消息的所有检测是否都已处理
function isMessageProcessed(conv: AdminRiskConversation, messageId: number): boolean {
  const dets = getDetectionsForMessage(conv, messageId);
  if (dets.length === 0) return false;
  return dets.every(d => d.processed === true);
}

// 获取消息的处理状态（用于显示）
function getMessageProcessStatus(conv: AdminRiskConversation, messageId: number): string {
  const dets = getDetectionsForMessage(conv, messageId);
  if (dets.length === 0) return '';
  const processedCount = dets.filter(d => d.processed === true).length;
  const totalCount = dets.length;
  if (processedCount === 0) return '未处理';
  if (processedCount === totalCount) return '已处理';
  return `${processedCount}/${totalCount}`;
}

// 打开批量处理对话框
function markAllAsProcessed() {
  if (!currentConv.value || batchProcessing.value) return;
  
  const detections = currentConv.value.detections || [];
  const unprocessedDetections = detections.filter(d => !d.processed && d.id);
  
  if (unprocessedDetections.length === 0) {
    messageError('当前会话没有未处理的检测');
    return;
  }
  
  batchProcessNotes.value = '';
  showBatchProcessDialog.value = true;
}

// 执行批量处理
async function executeBatchProcess() {
  if (!currentConv.value || batchProcessing.value) return;
  
  const detections = currentConv.value.detections || [];
  const unprocessedDetections = detections.filter(d => !d.processed && d.id);
  
  if (unprocessedDetections.length === 0) {
    messageError('当前会话没有未处理的检测');
    return;
  }
  
  batchProcessing.value = true;
  let successCount = 0;
  let failCount = 0;
  
  try {
    // 并行处理所有检测
    const promises = unprocessedDetections.map(d => 
      adminApi.processRiskDetection(d.id!, {
        processed: true,
        processNotes: batchProcessNotes.value || '批量标记处理',
      })
        .then(() => { successCount++; })
        .catch((err) => { 
          failCount++;
          console.error(`处理检测 ${d.id} 失败:`, err);
        })
    );
    
    await Promise.all(promises);
    
    // 刷新数据
    await handleRefresh();
    
    showBatchProcessDialog.value = false;
    batchProcessNotes.value = '';
    
    if (failCount === 0) {
      messageError(`成功标记 ${successCount} 条检测为已处理`);
    } else {
      messageError(`处理完成：成功 ${successCount} 条，失败 ${failCount} 条`);
    }
  } catch (e: any) {
    messageError(e?.message || '批量处理失败');
  } finally {
    batchProcessing.value = false;
  }
}

// 关闭批量处理对话框
function closeBatchProcessDialog() {
  if (batchProcessing.value) return;
  showBatchProcessDialog.value = false;
  batchProcessNotes.value = '';
}
</script>

<template>
  <div class="risk-aside-layout">
    <aside class="aside">
      <h3 class="aside-title">风险对话 - {{ title }}</h3>
      <div class="aside-content">
        <UiSkeleton :loading="loading" :rows="6">
          <template #default>
            <UiEmpty v-if="!convos.length" description="暂无对话" />
            <ul v-else class="conv-list">
              <li
                v-for="c in convos"
                :key="c.conversationId"
                :class="[
                  'risk-item',
                  { active: c.conversationId === selectedConvId },
                ]"
                :style="riskItemStyle(c.aggregatedRiskLevel)"
                @click="selectConversation(c.conversationId)"
              >
                <div class="line-top">
                  <div class="cid-title">
                    <span class="cid">#{{ c.conversationId }}</span>
                    <span class="title" :title="c.title || '-'">{{
                      c.title || "（无标题）"
                    }}</span>
                  </div>
                  <div class="status-tags">
                    <UiTag :style="tagStyle(c.aggregatedRiskLevel)">{{
                      riskLevelCN(c.aggregatedRiskLevel)
                    }}</UiTag>
                    <span 
                      v-if="c.detections && c.detections.length > 0"
                      :class="['process-badge', { processed: isConversationProcessed(c) }]"
                    >
                      {{ getProcessStatus(c) }}
                    </span>
                  </div>
                </div>
              </li>
            </ul>
          </template>
        </UiSkeleton>
      </div>
    </aside>
    <main class="main" v-if="currentConv">
      <div class="main-header">
        <h3 class="conv-title">
          会话 #{{ currentConv?.conversationId }} &nbsp;
          <small>{{ currentConv?.title || "（无标题）" }}</small>
        </h3>
        <div class="meta">
          <button 
            class="batch-process-btn"
            @click="markAllAsProcessed"
            :disabled="batchProcessing || isConversationProcessed(currentConv)"
            :title="isConversationProcessed(currentConv) ? '所有检测已处理' : '一键标记所有检测为已处理'"
          >
            <svg v-if="!batchProcessing" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-if="batchProcessing" class="spinner"></span>
            {{ batchProcessing ? '处理中...' : '一键处理' }}
          </button>
          <UiTag :style="tagStyle(currentConv?.aggregatedRiskLevel)">总结：{{ riskLevelCN(currentConv?.aggregatedRiskLevel) }}</UiTag>
          <!-- <span class="time">{{ formatToCN(currentConv?.createdAt) }}</span> -->
        </div>
      </div>
      <div class="messages-block">
        <RiskMessageList
          v-if="currentConv"
          :conversation="currentConv"
          :messages="getVisibleMessages(currentConv)"
          :selected-message-id="selectedMessageId"
          :max-height="'none'"
          @select="onSelectMessage"
        >
          <template #indicator="{ message }">
            <template v-if="String(message.role).toLowerCase() === 'user'">
              <span 
                v-if="getDetectionsForMessage(currentConv, message.id as number).length > 0"
                :class="['message-process-badge', { processed: isMessageProcessed(currentConv, message.id as number) }]"
              >
                {{ getMessageProcessStatus(currentConv, message.id as number) }}
              </span>
              <UiTag
                class="risk-indicator"
                :style="tagStyle(getFirstDetectionOrNone(currentConv, message.id as number)?.riskLevel)"
              >
                {{
                  riskLevelCN(
                    getFirstDetectionOrNone(currentConv, message.id as number)
                      ?.riskLevel
                  )
                }}
              </UiTag>
            </template>
          </template>
        </RiskMessageList>
        <UiEmpty v-else description="未选中会话" />
      </div>
    </main>
    
    <!-- 批量处理对话框 -->
    <transition name="fade">
      <div v-if="showBatchProcessDialog" class="dialog-overlay" @click.self="closeBatchProcessDialog">
        <div class="dialog-box">
          <div class="dialog-header">
            <h3>批量标记处理</h3>
            <button class="close-btn" @click="closeBatchProcessDialog" :disabled="batchProcessing">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="dialog-content">
            <p class="dialog-info">
              将标记当前会话的 <strong>{{ currentConv?.detections?.filter(d => !d.processed && d.id).length || 0 }}</strong> 条未处理检测为已处理
            </p>
            <div class="form-group">
              <label for="batch-notes">处理备注（可选）</label>
              <textarea
                id="batch-notes"
                v-model="batchProcessNotes"
                placeholder="请输入处理备注，例如：已电话联系用户，情况稳定"
                rows="4"
                :disabled="batchProcessing"
              ></textarea>
            </div>
          </div>
          <div class="dialog-footer">
            <button class="btn-cancel" @click="closeBatchProcessDialog" :disabled="batchProcessing">
              取消
            </button>
            <button class="btn-confirm" @click="executeBatchProcess" :disabled="batchProcessing">
              <span v-if="batchProcessing" class="spinner"></span>
              {{ batchProcessing ? '处理中...' : '确认标记' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 风险详情卡片 -->
    <RiskFloatCard
      :visible="showFloatCard"
      :detections="floatCardDetections"
      :conversation-id="selectedConvId ?? undefined"
      :message-id="selectedMessageId"
      @close="closeFloatCard"
      @refresh="handleRefresh"
    />
  </div>
</template>

<style scoped>
.risk-aside-layout {
  display: flex;
  height: 100%;
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: rgba(22, 27, 34, 0.95);
  box-shadow: var(--shadow-lg);
  animation: fadeIn 0.4s ease-out;
}

.aside {
  width: 340px;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  background: rgba(16, 20, 26, 0.8);
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: 100%;
}

.aside-title {
  margin: 0;
  padding: var(--spacing-lg);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  border-bottom: 1px solid var(--border);
  background: rgba(28, 33, 40, 0.6);
  flex-shrink: 0;
  height: 64px;
  display: flex;
  align-items: center;
}

.aside-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.aside-content :deep(.ui-skeleton) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.aside-content :deep(.ui-skeleton__content) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.conv-list {
  list-style: none;
  margin: 0;
  padding: var(--spacing-md);
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  flex: 1;
  min-height: 0;
}

.conv-list::-webkit-scrollbar {
  width: 6px;
}

.conv-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-sm);
}

.conv-list::-webkit-scrollbar-thumb {
  background: rgba(100, 255, 218, 0.3);
  border-radius: var(--radius-sm);
  transition: background 0.2s ease;
}

.conv-list::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 255, 218, 0.5);
}

.conv-list .risk-item {
  padding: var(--spacing-md);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(28, 33, 40, 0.5);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  border-left: 3px solid hsla(var(--risk-hue, 120), 60%, 50%, 0.6);
}

.conv-list .risk-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: hsla(var(--risk-hue, 120), 40%, 50%, 0.04);
  opacity: 1;
  transition: opacity 0.25s ease;
  pointer-events: none;
}

.conv-list .risk-item:hover {
  border-color: hsla(var(--risk-hue, 120), 60%, 50%, 0.5);
  background: rgba(36, 41, 50, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.conv-list .risk-item:hover::before {
  opacity: 1;
  background: hsla(var(--risk-hue, 120), 40%, 50%, 0.08);
}

.conv-list .risk-item.active {
  border-color: hsla(var(--risk-hue, 120), 70%, 55%, 0.8);
  border-left-width: 4px;
  background: rgba(44, 51, 62, 0.9);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 
              inset 0 0 0 1px hsla(var(--risk-hue, 120), 60%, 50%, 0.2);
}

.conv-list .risk-item.active::before {
  opacity: 1;
  background: hsla(var(--risk-hue, 120), 50%, 50%, 0.12);
}

.conv-list .line-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  min-height: 48px;
}

.conv-list .cid-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
  justify-content: center;
}

.conv-list .cid {
  font-weight: 600;
  color: var(--primary-cyan);
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.9;
  line-height: 1.2;
}

.conv-list .title {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  line-height: 1.4;
}

.conv-list .status-tags {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.process-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 10px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
  background: rgba(251, 146, 60, 0.15);
  color: #fb923c;
  border: 1px solid rgba(251, 146, 60, 0.3);
  white-space: nowrap;
  min-width: 85px;
  height: 25px;
  line-height: 1;
}

.process-badge.processed {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  border-color: rgba(34, 197, 94, 0.3);
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  background: rgba(22, 27, 34, 0.6);
  min-height: 0;
  min-width: 0;
}

.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  border-bottom: 1px solid var(--border);
  padding: var(--spacing-lg) var(--spacing-xl);
  background: rgba(28, 33, 40, 0.6);
  flex-shrink: 0;
  height: 64px;
}

.conv-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.conv-title small {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  font-weight: 400;
  margin-left: var(--spacing-sm);
}

.meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--font-size-sm);
  flex-shrink: 0;
}

.meta .time {
  color: var(--text-tertiary);
  white-space: nowrap;
  font-size: var(--font-size-xs);
}

.messages-block {
  flex: 1;
  overflow: hidden;
  border: none;
  border-radius: 0;
  background: rgba(22, 27, 34, 0.4);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: 100%;
}

.messages-block :deep(.msg-list) {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  max-height: 100%;
}

.message-process-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 10px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
  background: rgba(251, 146, 60, 0.15);
  color: #fb923c;
  border: 1px solid rgba(251, 146, 60, 0.3);
  white-space: nowrap;
  min-width: 50px;
  height: 22px;
  line-height: 1;
}

.message-process-badge.processed {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  border-color: rgba(34, 197, 94, 0.3);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.batch-process-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid rgba(100, 255, 218, 0.3);
  border-radius: var(--radius-md);
  background: rgba(100, 255, 218, 0.1);
  color: var(--primary-cyan);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.batch-process-btn:hover:not(:disabled) {
  background: rgba(100, 255, 218, 0.2);
  border-color: rgba(100, 255, 218, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(100, 255, 218, 0.2);
}

.batch-process-btn:active:not(:disabled) {
  transform: translateY(0);
}

.batch-process-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.batch-process-btn svg {
  flex-shrink: 0;
}

.batch-process-btn .spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(100, 255, 218, 0.3);
  border-top-color: var(--primary-cyan);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: var(--spacing-xl);
}

.dialog-box {
  background: rgba(28, 33, 40, 0.98);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: var(--radius-xl);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  max-width: 500px;
  width: 100%;
  overflow: hidden;
  animation: dialogSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--border);
  background: rgba(36, 41, 50, 0.5);
}

.dialog-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dialog-content {
  padding: var(--spacing-xl);
}

.dialog-info {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: 1.6;
}

.dialog-info strong {
  color: var(--primary-cyan);
  font-weight: 600;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-group label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.form-group textarea {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  background: rgba(0, 0, 0, 0.3);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;
}

.form-group textarea:focus {
  outline: none;
  border-color: rgba(100, 255, 218, 0.5);
  background: rgba(0, 0, 0, 0.4);
  box-shadow: 0 0 0 3px rgba(100, 255, 218, 0.1);
}

.form-group textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-group textarea::placeholder {
  color: var(--text-tertiary);
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--border);
  background: rgba(36, 41, 50, 0.3);
}

.btn-cancel,
.btn-confirm {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 20px;
  border: 1px solid;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
}

.btn-cancel {
  border-color: rgba(255, 255, 255, 0.2);
  background: transparent;
  color: var(--text-secondary);
}

.btn-cancel:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.3);
  color: var(--text-primary);
}

.btn-confirm {
  border-color: rgba(100, 255, 218, 0.3);
  background: rgba(100, 255, 218, 0.15);
  color: var(--primary-cyan);
}

.btn-confirm:hover:not(:disabled) {
  background: rgba(100, 255, 218, 0.25);
  border-color: rgba(100, 255, 218, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(100, 255, 218, 0.2);
}

.btn-confirm:active:not(:disabled) {
  transform: translateY(0);
}

.btn-cancel:disabled,
.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-confirm .spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(100, 255, 218, 0.3);
  border-top-color: var(--primary-cyan);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active .dialog-box {
  animation: dialogSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-leave-active .dialog-box {
  animation: dialogSlideOut 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dialogSlideOut {
  to {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
  }
}
</style>
