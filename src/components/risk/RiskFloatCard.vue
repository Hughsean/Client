<script setup lang="ts">
import {
//   defineProps,
//   defineEmits,
  computed,
  onMounted,
  onBeforeUnmount,
} from "vue";
import UiEmpty from '../ui/UiEmpty.vue'
import { formatToCN } from "../../utils/time";
import {
  tagStyle,
  riskLevelCN,
  intentCN,
  targetCN,
  polarityCN,
} from "../../utils/risk";
import type { AdminRiskMessageDetection } from "../../server";

const props = defineProps<{
  visible: boolean;
  detections: AdminRiskMessageDetection[];
  conversationId?: number;
  messageId?: number;
}>();

const emit = defineEmits<{ (e: "close"): void }>();

const first = computed(() => props.detections?.[0]);
function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") emit("close");
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <transition name="fade">
    <div v-if="visible" class="float-card-overlay" @click.self="$emit('close')">
      <div class="float-card">
        <div class="float-card-header">
          <span>风险评测</span>
        </div>
        <div class="float-card-content">
          <template v-if="detections && detections.length && first">
            <!-- 主要摘要（第一条检测） -->
            <div class="summary">
              <div class="risk-pill" :style="tagStyle(first?.riskLevel)">
                {{ riskLevelCN(first?.riskLevel) }}
              </div>
              <!-- <div class="meta">
                <span
                  >置信度：{{
                    first?.confidence != null
                      ? Number(first.confidence).toFixed(3)
                      : "-"
                  }}</span
                >
                <span
                  >时间：{{
                    formatToBeijing(first?.detectedAt, true) || "-"
                  }}</span
                >
              </div> -->
              <div class="chips">
                <span class="chip chip-intent">{{
                  intentCN(first?.intent)
                }}</span>
                <span class="chip chip-target">{{
                  targetCN(first?.target)
                }}</span>
                <span v-if="first?.polarity" class="chip chip-polarity">{{
                  polarityCN(first?.polarity)
                }}</span>
              </div>
              <div
                v-if="!first?.detectedAt && first?.confidence == null"
                class="note"
              >
                (默认合成：无真实检测记录，展示 NONE)
              </div>
            </div>

            <!-- 列出所有检测（若多条），每条展开更多细节 -->
            <div class="all-detections">
              <div v-for="(d, idx) in detections" :key="idx" class="d-item">
                <div class="d-head">
                  <span class="d-index">#{{ idx + 1 }}</span>
                  <!-- <span class="d-pill" :style="tagStyle(d.riskLevel)">{{
                    riskLevelCN(d.riskLevel)
                  }}</span> -->
                  <span class="d-time">{{
                    formatToCN(d.detectedAt, true) || "-"
                  }}</span>
                </div>
                <div class="d-body">
                  <div class="d-row">
                    <strong>置信度：</strong>
                    {{
                      d.confidence != null
                        ? Number(d.confidence).toFixed(3)
                        : "-"
                    }}
                  </div>
                  <div class="d-row">
                    <strong>意图：</strong> {{ intentCN(d.intent) }} &nbsp;
                    <strong>对象：</strong> {{ targetCN(d.target) }} &nbsp;
                    <strong>情感：</strong> {{ polarityCN(d.polarity) }}
                  </div>
                  <div
                    v-if="d.evidence && d.evidence.length"
                    class="d-evidence"
                  >
                    <strong>证据：</strong>
                    <ul>
                      <li v-for="(e, i) in d.evidence" :key="i">{{ e }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <UiEmpty v-else description="暂无评测" />
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.float-card-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9999;
}

.float-card {
  width: 520px;
  background: linear-gradient(135deg, rgba(15, 22, 40, 0.95), rgba(21, 31, 63, 0.95));
  border: 1px solid var(--border);
  box-shadow: var(--shadow-elevated);
  border-radius: 12px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  animation: slideUp 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.float-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(109, 40, 217, 0.2), rgba(6, 182, 212, 0.1));
  border-bottom: 1px solid var(--border);
  font-weight: 600;
  color: var(--text-on-bg);
  letter-spacing: 0.3px;
}

.float-card-content {
  padding: 16px;
  max-height: 70vh;
  overflow: auto;
}

.summary {
  padding: 12px;
  background: rgba(100, 255, 218, 0.05);
  border: 1px solid rgba(100, 255, 218, 0.2);
  border-radius: 8px;
  margin-bottom: 16px;
}

.risk-pill {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
}

.meta {
  margin-top: 10px;
  color: var(--text-secondary);
  display: flex;
  gap: 16px;
  font-size: 13px;
}

.chips {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid;
}

.chip-intent {
  background: rgba(109, 40, 217, 0.15);
  color: #a78bfa;
  border-color: rgba(109, 40, 217, 0.3);
}

.chip-target {
  background: rgba(6, 182, 212, 0.15);
  color: #64ffda;
  border-color: rgba(6, 182, 212, 0.3);
}

.chip-polarity {
  background: rgba(236, 72, 153, 0.15);
  color: #f472b6;
  border-color: rgba(236, 72, 153, 0.3);
}

.all-detections {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.d-item {
  padding: 12px;
  border-radius: 8px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  transition: all 200ms ease;
}

.d-item:hover {
  background: var(--surface-3);
  border-color: var(--accent);
  box-shadow: 0 0 12px rgba(100, 255, 218, 0.1);
}

.d-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-subtle);
}

.d-index {
  color: var(--accent);
  font-weight: 700;
  font-size: 12px;
}

.d-pill {
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid;
  font-size: 12px;
}

.d-time {
  margin-left: auto;
  color: var(--text-tertiary);
  font-size: 12px;
  white-space: nowrap;
}

.d-row {
  margin-bottom: 8px;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.5;
}

.d-row strong {
  color: var(--accent);
  font-weight: 600;
  margin-right: 4px;
}

.d-evidence {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--border-subtle);
}

.d-evidence strong {
  color: var(--accent);
  font-weight: 600;
}

.d-evidence ul {
  margin: 6px 0 0 18px;
  padding: 0;
  list-style: none;
}

.d-evidence li {
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.5;
  padding: 4px 0;
  position: relative;
  padding-left: 12px;
}

.d-evidence li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--accent);
}

.note {
  margin-top: 8px;
  color: var(--text-tertiary);
  font-size: 12px;
  font-style: italic;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滚动条美化 */
.float-card-content::-webkit-scrollbar {
  width: 6px;
}

.float-card-content::-webkit-scrollbar-track {
  background: transparent;
}

.float-card-content::-webkit-scrollbar-thumb {
  background-color: rgba(100, 255, 218, 0.2);
  border-radius: 3px;
}

.float-card-content::-webkit-scrollbar-thumb:hover {
  background-color: rgba(100, 255, 218, 0.4);
}
</style>
