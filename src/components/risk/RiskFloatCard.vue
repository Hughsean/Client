<script setup lang="ts">
import {
//   defineProps,
//   defineEmits,
  computed,
  onMounted,
  onBeforeUnmount,
} from "vue";
import UiEmpty from '@/ui/UiEmpty.vue'
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
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: var(--z-popover);
}

.float-card {
  width: 600px;
  max-width: 90vw;
  background: rgba(22, 27, 34, 0.95);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-xl);
  border-radius: var(--radius-xl);
  overflow: hidden;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  animation: slideUp var(--transition-base);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.float-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-xl);
  background: rgba(100, 255, 218, 0.08);
  border-bottom: 2px solid var(--border);
  font-weight: 700;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  letter-spacing: -0.3px;
}

.float-card-content {
  padding: var(--spacing-xl);
  max-height: 70vh;
  overflow: auto;
}

.summary {
  padding: var(--spacing-lg);
  background: rgba(100, 255, 218, 0.05);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--primary-cyan);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-lg);
  box-shadow: 0 0 20px var(--primary-cyan-glow);
}

.risk-pill {
  display: inline-block;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  border: 1px solid;
  font-weight: 700;
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-sm);
}

.meta {
  margin-top: var(--spacing-sm);
  color: var(--text-secondary);
  display: flex;
  gap: var(--spacing-md);
  font-size: var(--font-size-sm);
}

.chips {
  margin-top: var(--spacing-md);
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
  border: 1px solid;
  transition: all var(--transition-base);
}

.chip:hover {
  transform: translateY(-2px);
}

.chip-intent {
  background: rgba(109, 40, 217, 0.15);
  color: #a78bfa;
  border-color: rgba(109, 40, 217, 0.5);
}

.chip-target {
  background: rgba(36, 200, 219, 0.15);
  color: var(--primary-cyan-light);
  border-color: var(--primary-cyan);
}

.chip-polarity {
  background: rgba(255, 193, 49, 0.15);
  color: var(--secondary-orange-light);
  border-color: var(--secondary-orange);
}

.all-detections {
  margin-top: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.d-item {
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  background: rgba(28, 33, 40, 0.5);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid var(--border);
  transition: all var(--transition-base);
}

.d-item:hover {
  background: rgba(28, 33, 40, 0.7);
  border-color: var(--primary-cyan);
  box-shadow: 0 4px 12px var(--primary-cyan-glow);
}

.d-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border);
}

.d-index {
  color: var(--primary-cyan);
  font-weight: 700;
  font-size: var(--font-size-sm);
}

.d-pill {
  font-weight: 600;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  border: 1px solid;
  font-size: var(--font-size-sm);
}

.d-time {
  margin-left: auto;
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
  white-space: nowrap;
}

.d-row {
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
}

.d-row strong {
  color: var(--primary-cyan);
  font-weight: 600;
  margin-right: var(--spacing-xs);
}

.d-evidence {
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border);
}

.d-evidence strong {
  color: var(--primary-cyan);
  font-weight: 600;
}

.d-evidence ul {
  margin: var(--spacing-sm) 0 0 var(--spacing-lg);
  padding: 0;
  list-style: none;
}

.d-evidence li {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.6;
  padding: var(--spacing-xs) 0;
  position: relative;
  padding-left: var(--spacing-md);
}

.d-evidence li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--primary-cyan);
  font-weight: 700;
}

.note {
  margin-top: var(--spacing-sm);
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
  font-style: italic;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
