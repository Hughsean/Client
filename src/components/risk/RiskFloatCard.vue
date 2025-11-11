<script setup lang="ts">
import {
//   defineProps,
//   defineEmits,
  computed,
  onMounted,
  onBeforeUnmount,
} from "vue";
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
          <el-empty v-else description="暂无评测" />
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
  background: rgba(0, 0, 0, 0.28);
  z-index: 9999;
}
.float-card {
  width: 520px;
  /* 采用薄荷浅色背景，保持卡片可读 */
  background: linear-gradient(135deg, var(--bg-grad-2), #ffffff);
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  overflow: hidden;
}
.float-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: linear-gradient(135deg, rgba(52,211,153,0.12), rgba(16,185,129,0.06));
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.float-card-content {
  padding: 12px;
  max-height: 70vh;
  overflow: auto;
}
.risk-pill {
  display: inline-block;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid currentColor;
  font-weight: 600;
}
.meta {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
  display: flex;
  gap: 12px;
}
.chips {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.chip {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  color: #fff;
}
.chip-intent {
  background: linear-gradient(135deg, var(--accent-200), var(--accent-400));
}
.chip-target {
  background: linear-gradient(135deg, #79f4d0, #34d399);
}
.chip-polarity {
  background: linear-gradient(135deg, #bff3e6, #10b981);
}

.all-detections {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.d-item {
  padding: 10px;
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(139,252,227,0.35), rgba(255,255,255,0.7));
  border: 1px solid rgba(16,185,129,0.12);
}
.d-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}
.d-index {
  color: var(--el-text-color-secondary);
  font-weight: 600;
}
.d-pill {
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid currentColor;
}
.d-time {
  margin-left: auto;
  color: var(--el-text-color-secondary);
}
.d-row {
  margin-bottom: 6px;
}
.d-evidence ul {
  margin: 4px 0 0 18px;
}
.note {
  margin-top: 6px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
