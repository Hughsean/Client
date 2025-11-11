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
  intentCN,
  targetCN,
  polarityCN,
} from "../../utils/risk";
import RiskMessageList from "./RiskMessageList.vue";
import RiskFloatCard from "./RiskFloatCard.vue";
import UiSkeleton from '../ui/UiSkeleton.vue'
import UiEmpty from '../ui/UiEmpty.vue'
import UiTag from '../ui/UiTag.vue'
import UiTooltip from '../ui/UiTooltip.vue'
import { formatToCN } from "../../utils/time";

const props = defineProps<{ userId: number | null; user: User | null }>();

const adminApi = new AdminApi();
const convApi = new ConversationsApi();
const loading = ref(false);
const convos = ref<AdminRiskConversation[]>([]);
const selectedConvId = ref<number | null>(null);
const selectedMessageId = ref<number | undefined>(undefined);
const floatCard = ref<{
  visible: boolean;
  convId?: number;
  messageId?: number;
}>({ visible: false });

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
    // 默认选择第一条
    if (merged.length) {
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
  floatCard.value.visible = false;
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

function getCurrentConversation(): AdminRiskConversation | undefined {
  return convos.value.find((c) => c.conversationId === selectedConvId.value);
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
) {
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

function openDetectionCard(convId: number, messageId?: number) {
  floatCard.value = { visible: true, convId, messageId };
}
function closeDetectionCard() {
  floatCard.value.visible = false;
}

function onSelectMessage(mid: number) {
  selectedMessageId.value = mid;
  const conv = getCurrentConversation();
  const msg = conv?.messages.find((m) => Number(m.id) === Number(mid));
  if (!msg || String(msg.role).toLowerCase() !== "user") closeDetectionCard();
}

function getDetectionsForCard(): AdminRiskMessageDetection[] {
  const conv = getCurrentConversation();
  if (!conv) return [];
  const list = (conv.detections || []).filter(
    (d) =>
      !floatCard.value.messageId ||
      Number(d.messageId) === Number(floatCard.value.messageId)
  );
  if (list.length) return list;
  if (floatCard.value.messageId)
    return [
      {
        messageId: floatCard.value.messageId,
        riskLevel: "NONE",
      } as AdminRiskMessageDetection,
    ];
  return [];
}

function riskItemStyle(level?: RiskLevel) {
  const score = riskScore(level);
  const hue = 120 - 120 * score; // green -> red
  return {
    background: `linear-gradient(90deg, hsla(${hue},80%,96%,1) 0%, hsla(${hue},80%,98%,1) 100%)`,
    borderColor: `hsla(${hue},80%,60%,0.55)`,
  };
}
</script>

<template>
  <div class="risk-aside-layout">
    <aside class="aside">
      <h3 class="aside-title">风险对话 - {{ title }}</h3>
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
                <UiTag :style="tagStyle(c.aggregatedRiskLevel)">{{
                  riskLevelCN(c.aggregatedRiskLevel)
                }}</UiTag>
              </div>
            </li>
          </ul>
        </template>
      </UiSkeleton>
    </aside>
    <main class="main" v-if="currentConv">
      <div class="main-header">
        <h3 class="conv-title">
          会话 #{{ currentConv?.conversationId }} &nbsp;
          <small>{{ currentConv?.title || "（无标题）" }}</small>
        </h3>
        <div class="meta">
          <UiTag :style="tagStyle(currentConv?.aggregatedRiskLevel)">聚合：{{ riskLevelCN(currentConv?.aggregatedRiskLevel) }}</UiTag>
          <span class="time">{{ formatToCN(currentConv?.createdAt) }}</span>
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
          @open-card="(mid:number)=> currentConv && openDetectionCard(currentConv.conversationId, mid)"
        >
          <template #indicator="{ message }">
            <template v-if="String(message.role).toLowerCase() === 'user'">
              <UiTooltip>
                <template #content>
                  <div class="tt">
                    <div>
                      <label>风险</label
                      ><span>{{
                        riskLevelCN(
                          getFirstDetectionOrNone(
                            currentConv,
                            message.id as number
                          )?.riskLevel
                        )
                      }}</span>
                    </div>
                    <div
                      v-if="getFirstDetectionOrNone(currentConv, message.id as number)?.confidence != null"
                    >
                      <label>置信度</label
                      ><span>{{
                        getFirstDetectionOrNone(
                          currentConv,
                          message.id as number
                        )?.confidence
                      }}</span>
                    </div>
                    <div
                      v-if="getFirstDetectionOrNone(currentConv, message.id as number)?.intent"
                    >
                      <label>意图</label
                      ><span>{{
                        intentCN(
                          getFirstDetectionOrNone(
                            currentConv,
                            message.id as number
                          )?.intent
                        )
                      }}</span>
                    </div>
                    <div
                      v-if="getFirstDetectionOrNone(currentConv, message.id as number)?.target"
                    >
                      <label>对象</label
                      ><span>{{
                        targetCN(
                          getFirstDetectionOrNone(
                            currentConv,
                            message.id as number
                          )?.target
                        )
                      }}</span>
                    </div>
                    <div
                      v-if="getFirstDetectionOrNone(currentConv, message.id as number)?.polarity"
                    >
                      <label>情感</label
                      ><span>{{
                        polarityCN(
                          getFirstDetectionOrNone(
                            currentConv,
                            message.id as number
                          )?.polarity
                        )
                      }}</span>
                    </div>
                    <div
                      v-if="!(getDetectionsForMessage(currentConv, message.id as number)?.length)"
                    >
                      <em>暂无真实检测记录，展示默认 NONE</em>
                    </div>
                  </div>
                </template>
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
              </UiTooltip>
            </template>
          </template>
        </RiskMessageList>
        <UiEmpty v-else description="未选中会话" />
      </div>
    </main>

    <RiskFloatCard
      :visible="floatCard.visible"
      :conversation-id="floatCard.convId"
      :message-id="floatCard.messageId"
      :detections="getDetectionsForCard()"
      @close="closeDetectionCard"
    />
  </div>
</template>

<style scoped>
.risk-aside-layout {
  display: flex;
  height: calc(100vh - 140px);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  font-size: 14px;
  background: var(--surface);
  box-shadow: var(--shadow-1);
}

.aside {
  width: 310px;
  border-right: 1px solid var(--border-subtle);
  background: linear-gradient(135deg, rgba(109, 40, 217, 0.03), rgba(6, 182, 212, 0.03));
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(5px);
}

.aside-title {
  margin: 0;
  padding: 16px 16px 12px;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-on-bg);
  letter-spacing: -0.3px;
  border-bottom: 1px solid var(--border-subtle);
}

.conv-list {
  list-style: none;
  margin: 0;
  padding: 10px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.conv-list .risk-item {
  padding: 12px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
  font-size: 13px;
  background: var(--surface-2);
}

.conv-list .risk-item:hover {
  border-color: var(--accent);
  background: var(--surface-3);
  box-shadow: 0 0 12px rgba(100, 255, 218, 0.1);
}

.conv-list .risk-item.active {
  border-color: var(--accent);
  background: rgba(100, 255, 218, 0.1);
  box-shadow: inset 0 0 12px rgba(100, 255, 218, 0.08);
}

.conv-list .line-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.conv-list .cid-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.conv-list .cid {
  font-weight: 700;
  color: var(--accent);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.conv-list .title {
  font-size: 13px;
  color: var(--text-on-bg);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 20px;
  overflow: hidden;
  font-size: 14px;
  background: linear-gradient(135deg, rgba(109, 40, 217, 0.02), rgba(6, 182, 212, 0.02));
}

.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 12px;
  margin-bottom: 12px;
}

.conv-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-on-bg);
  letter-spacing: -0.3px;
}

.conv-title small {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
  margin-left: 4px;
}

.meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
}

.meta .time {
  color: var(--text-tertiary);
  white-space: nowrap;
}

.messages-block {
  flex: 1;
  overflow: auto;
  padding-right: 6px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--surface-2);
  padding: 8px;
}

.tt {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 6px 10px;
  max-width: 380px;
  font-size: 12px;
}

.tt label {
  color: var(--accent);
  font-weight: 600;
}

.tt span {
  color: var(--text-secondary);
}

.tt em {
  color: var(--text-tertiary);
  font-style: normal;
  grid-column: 1 / -1;
  font-size: 11px;
}

/* 滚动条美化 */
.conv-list::-webkit-scrollbar,
.messages-block::-webkit-scrollbar {
  width: 6px;
}

.conv-list::-webkit-scrollbar-track,
.messages-block::-webkit-scrollbar-track {
  background: transparent;
}

.conv-list::-webkit-scrollbar-thumb,
.messages-block::-webkit-scrollbar-thumb {
  background-color: rgba(100, 255, 218, 0.2);
  border-radius: 3px;
}

.conv-list::-webkit-scrollbar-thumb:hover,
.messages-block::-webkit-scrollbar-thumb:hover {
  background-color: rgba(100, 255, 218, 0.4);
}
</style>
