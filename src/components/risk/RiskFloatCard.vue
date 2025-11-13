<script setup lang="ts">
import {
//   defineProps,
//   defineEmits,
  computed,
  ref,
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
import { AdminApi } from "../../server";

const props = defineProps<{
  visible: boolean;
  detections: AdminRiskMessageDetection[];
  conversationId?: number;
  messageId?: number;
}>();

const emit = defineEmits<{ 
  (e: "close"): void;
  (e: "refresh"): void;
}>();

const first = computed(() => props.detections?.[0]);
const adminApi = new AdminApi();

// 处理相关状态
const processingDetectionId = ref<number | null>(null);
const showProcessDialog = ref(false);
const processForm = ref({
  detectionId: 0,
  processed: true,
  processNotes: '',
});

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    if (showProcessDialog.value) {
      showProcessDialog.value = false;
    } else {
      emit("close");
    }
  }
}

// 打开处理对话框
function openProcessDialog(detection: AdminRiskMessageDetection) {
  if (!detection.id) {
    alert('检测结果ID不存在，无法处理');
    return;
  }
  processForm.value = {
    detectionId: detection.id,
    processed: !detection.processed, // 切换处理状态
    processNotes: detection.processNotes || '',
  };
  showProcessDialog.value = true;
}

// 提交处理
async function submitProcess() {
  if (processingDetectionId.value) return;
  
  processingDetectionId.value = processForm.value.detectionId;
  try {
    await adminApi.processRiskDetection(processForm.value.detectionId, {
      processed: processForm.value.processed,
      processNotes: processForm.value.processNotes || null,
    });
    showProcessDialog.value = false;
    emit('refresh'); // 通知父组件刷新数据
  } catch (error) {
    console.error('处理风险检测失败:', error);
    alert('处理失败: ' + (error instanceof Error ? error.message : String(error)));
  } finally {
    processingDetectionId.value = null;
  }
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
                  <span class="d-index">#{{ d.id }}</span>
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
                  <div class="d-row">
                    <strong>处理状态：</strong>
                    <span :class="['status-badge', d.processed ? 'processed' : 'unprocessed']">
                      {{ d.processed ? '已处理' : '未处理' }}
                    </span>
                  </div>
                  <div v-if="d.processNotes" class="d-notes">
                    <strong>处理备注：</strong>
                    <div class="notes-content">{{ d.processNotes }}</div>
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
                  <!-- 处理操作按钮 -->
                  <div v-if="d.id" class="d-actions">
                    <button 
                      class="process-button"
                      @click="openProcessDialog(d)"
                      :disabled="processingDetectionId === d.id"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      {{ d.processed ? '更新处理' : '标记处理' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <UiEmpty v-else description="暂无评测" />
        </div>
      </div>
      
      <!-- 处理对话框 -->
      <div v-if="showProcessDialog" class="process-dialog" @click.self="showProcessDialog = false">
        <div class="dialog-content">
          <div class="dialog-header">
            <h3>处理风险检测</h3>
            <button class="close-btn" @click="showProcessDialog = false">✕</button>
          </div>
          <div class="dialog-body">
            <div class="form-group">
              <label>
                <input type="checkbox" v-model="processForm.processed" />
                标记为已处理
              </label>
            </div>
            <div class="form-group">
              <label>处理备注：</label>
              <textarea 
                v-model="processForm.processNotes" 
                placeholder="请输入处理备注..."
                rows="4"
              ></textarea>
            </div>
          </div>
          <div class="dialog-footer">
            <button class="cancel-btn" @click="showProcessDialog = false">取消</button>
            <button 
              class="submit-btn" 
              @click="submitProcess"
              :disabled="!!processingDetectionId"
            >
              {{ processingDetectionId ? '处理中...' : '确认' }}
            </button>
          </div>
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
  color: var(--text-primary);
  font-size: var(--font-size-base);
  white-space: nowrap;
  font-weight: 600;
}

.d-row {
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-base);
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
  font-size: var(--font-size-base);
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

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: 600;
  border: 1px solid;
  transition: all var(--transition-base);
}

.status-badge.processed {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  border-color: rgba(34, 197, 94, 0.5);
}

.status-badge.unprocessed {
  background: rgba(251, 146, 60, 0.15);
  color: #fb923c;
  border-color: rgba(251, 146, 60, 0.5);
}

.d-notes {
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border);
}

.d-notes strong {
  color: var(--primary-cyan);
  font-weight: 600;
  display: block;
  margin-bottom: var(--spacing-xs);
}

.notes-content {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  line-height: 1.6;
  padding: var(--spacing-sm);
  background: rgba(100, 255, 218, 0.05);
  border-left: 3px solid var(--primary-cyan);
  border-radius: var(--radius-sm);
  white-space: pre-wrap;
  word-break: break-word;
}

.note {
  margin-top: var(--spacing-sm);
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
  font-style: italic;
}

.d-actions {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
}

.process-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  background: rgba(100, 255, 218, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: var(--radius-md);
  border: 1px solid var(--primary-cyan);
  color: var(--primary-cyan);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.process-button:hover:not(:disabled) {
  background: rgba(100, 255, 218, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--primary-cyan-glow);
}

.process-button:active:not(:disabled) {
  transform: translateY(0);
}

.process-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 处理对话框 */
.process-dialog {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: calc(var(--z-popover) + 1);
  animation: fadeIn 0.2s ease;
}

.dialog-content {
  width: 500px;
  max-width: 90vw;
  background: rgba(22, 27, 34, 0.98);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
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
}

.dialog-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--text-primary);
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.dialog-body {
  padding: var(--spacing-xl);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  color: var(--text-primary);
  font-size: var(--font-size-base);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.form-group label input[type="checkbox"] {
  margin-right: var(--spacing-xs);
  cursor: pointer;
}

.form-group textarea {
  width: 100%;
  padding: var(--spacing-md);
  background: rgba(28, 33, 40, 0.6);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;
}

.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-cyan);
  box-shadow: 0 0 0 3px rgba(100, 255, 218, 0.1);
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--border);
}

.cancel-btn,
.submit-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.cancel-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--text-secondary);
}

.submit-btn {
  background: var(--primary-cyan);
  border: 1px solid var(--primary-cyan);
  color: #0d1117;
}

.submit-btn:hover:not(:disabled) {
  background: var(--primary-cyan-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--primary-cyan-glow);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
