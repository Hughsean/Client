<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { messageError } from "../utils/message";
import UiCard from "./ui/UiCard.vue";
import UiButton from "./ui/UiButton.vue";
import UiTag from "./ui/UiTag.vue";
import { UsersApi, AdminApi } from "../server";
import type { User, RiskLevel } from "../server";
import { riskLevelCN } from "../utils/risk";

const router = useRouter();

// emits
const emit = defineEmits<{
  (e: "select", user: User): void;
  (e: "refresh"): void;
}>();

const loading = ref(false);
const users = ref<User[]>([]);
const selectedId = ref<number | null>(null);

const api = new UsersApi();
const adminApi = new AdminApi();

// 以 userId 为 key 的风险缓存
const riskCache = ref<Record<number, { level: RiskLevel; score: number }>>({});

async function fetchUsers() {
  loading.value = true;
  try {
    users.value = await api.getAll();
    // 并发限流加载风险信息，等待完成后按风险排序
    await enrichUsersRisk(users.value);
    sortUsersByRisk();
    emit("refresh");
  } catch (e: any) {
    messageError(e?.message || "加载用户列表失败");
  } finally {
    loading.value = false;
  }
}

function handleRowClick(row: User) {
  selectedId.value = (row.id as number) ?? null;
  emit("select", row);
}

// 将用户按风险分数（score）降序排列，未知风险视作 0
function sortUsersByRisk() {
  users.value.sort((a, b) => {
    const sa = a?.id && riskCache.value[a.id] ? riskCache.value[a.id].score : 0;
    const sb = b?.id && riskCache.value[b.id] ? riskCache.value[b.id].score : 0;
    return sb - sa;
  });
}

function openRiskDialog(row: User) {
  if (!row.id) return;
  router.push({
    name: "UserConversations",
    params: { userId: row.id },
    query: { 
      username: row.nickname || row.username || `用户 #${row.id}`
    }
  });
}

// 并发限流加载每个用户的风险（取最高级别）
async function enrichUsersRisk(list: User[], concurrency = 4) {
  const queue = [...list];
  const workers: Promise<void>[] = [];
  for (let i = 0; i < concurrency; i++) {
    workers.push(
      (async () => {
        while (queue.length) {
          const u = queue.shift();
          const id = (u?.id as number) ?? null;
          if (!id) continue;
          try {
            await loadRiskForUser(id);
          } catch {
            /* ignore */
          }
        }
      })()
    );
  }
  await Promise.all(workers);
}

async function loadRiskForUser(userId: number) {
  if (riskCache.value[userId]) return;
  const convos = await adminApi.getRiskConversations(userId).catch(() => []);
  let top: RiskLevel | undefined = undefined;
  for (const c of convos as any[]) {
    const lvl: RiskLevel | undefined = c?.aggregatedRiskLevel;
    top = maxRiskLevel(top, lvl);
  }
  const level = top ?? "UNKNOWN";
  riskCache.value[userId] = { level, score: riskLevelToScore(level) };
}

function riskLevelToScore(level: RiskLevel | undefined): number {
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
      return 0.5; // UNKNOWN
  }
}

function maxRiskLevel(a?: RiskLevel, b?: RiskLevel): RiskLevel | undefined {
  if (!a) return b;
  if (!b) return a;
  const sa = riskLevelToScore(a);
  const sb = riskLevelToScore(b);
  return sa >= sb ? a : b;
}

// 暴露刷新方法
defineExpose({
  refresh: fetchUsers
});

onMounted(fetchUsers);
</script>

<template>
  <UiCard :shadow="true">
    <div class="user-list-body">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载用户数据中...</p>
      </div>
      <div v-else class="user-grid">
        <div
          v-for="user in users"
          :key="user.id"
          class="user-card"
          @click="handleRowClick(user)"
        >
          <div class="user-card__main">
            <div class="user-card__avatar">
              <div class="avatar-circle">
                {{ (user.nickname ?? user.username ?? "?")[0].toUpperCase() }}
              </div>
            </div>

            <div class="user-card__info">
              <div class="user-name">{{ user.nickname ?? user.username ?? "-" }}</div>
              <div class="user-details">
                <div class="detail-item">
                  <span class="detail-icon">📧</span>
                  <span class="detail-label">邮箱地址：</span>
                  <span class="detail-value">{{ user.email ?? "-" }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-icon">📱</span>
                  <span class="detail-label">手机号：</span>
                  <span class="detail-value">{{ user.phone ?? "-" }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-icon">✓</span>
                  <span class="detail-label">账号状态：</span>
                  <UiTag
                    :type="
                      user.status === 1
                        ? 'success'
                        : user.status === 0
                        ? 'info'
                        : 'warning'
                    "
                  >
                    {{
                      user.status === 1
                        ? "正常"
                        : user.status === 0
                        ? "未激活"
                        : "异常"
                    }}
                  </UiTag>
                </div>
              </div>
            </div>
          </div>

          <div class="user-card__actions">
            <div class="risk-badge">
              <template v-if="user.id && riskCache[user.id]">
                <UiTag
                  :class="`risk-tag risk-tag--${riskCache[user.id].level.toLowerCase()}`"
                  >{{ riskLevelCN(riskCache[user.id].level) }}</UiTag
                >
              </template>
              <template v-else>
                <UiTag type="info">风险未知</UiTag>
              </template>
            </div>
            <div class="action-buttons">
              <UiButton
                type="primary"
                size="small"
                @click.stop="openRiskDialog(user)"
                >查看对话</UiButton
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </UiCard>
</template>

<style scoped>
.user-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.user-list-body {
  min-height: 400px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: var(--spacing-md);
  color: var(--text-secondary);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--surface-1);
  border-top-color: var(--primary-cyan);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: var(--spacing-lg);
  animation: fadeIn 0.5s ease-out;
}

.user-card {
  background: rgba(22, 27, 34, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(100, 255, 218, 0.15);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.user-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--primary-cyan);
  opacity: 0;
  transition: opacity var(--transition-base);
  box-shadow: 0 0 10px var(--primary-cyan-glow);
}

.user-card:hover {
  /* transform: translateY(-4px); */
  background: rgba(22, 27, 34, 0.85);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 15px rgba(100, 255, 218, 0.2);
  border-color: rgba(100, 255, 218, 0.4);
}

.user-card:hover::before {
  opacity: 1;
}

.user-card__main {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.user-card__avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 193, 49, 0.8) 0%, rgba(100, 255, 218, 0.6) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: #0d1117;
  box-shadow: 0 4px 12px rgba(100, 255, 218, 0.15);
  border: 2px solid rgba(100, 255, 218, 0.2);
}

.user-card__info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: #e6edf3;
  margin-bottom: var(--spacing-sm);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-base);
  color: #8b949e;
  line-height: 1.6;
}

.detail-icon {
  font-size: var(--font-size-lg);
  flex-shrink: 0;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-label {
  font-weight: 500;
  color: #8b949e;
  min-width: 80px;
  flex-shrink: 0;
}

.detail-value {
  color: #e6edf3;
  font-weight: 400;
  flex: 1;
}

.user-card__actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border);
}

.risk-badge {
  flex: 1;
}

.risk-tag {
  font-weight: 700;
  font-size: var(--font-size-sm);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  border: 1px solid;
}

.risk-tag--none {
  background-color: rgba(63, 185, 80, 0.15);
  color: #4ade80;
  border-color: rgba(63, 185, 80, 0.4);
}

.risk-tag--low {
  background-color: rgba(139, 195, 74, 0.15);
  color: #a4d65e;
  border-color: rgba(139, 195, 74, 0.4);
}

.risk-tag--medium {
  background-color: rgba(255, 193, 49, 0.15);
  color: #ffc131;
  border-color: rgba(255, 193, 49, 0.4);
}

.risk-tag--high {
  background-color: rgba(255, 152, 0, 0.15);
  color: #ff9800;
  border-color: rgba(255, 152, 0, 0.4);
}

.risk-tag--crisis {
  background-color: rgba(248, 81, 73, 0.15);
  color: #ff6b6b;
  border-color: rgba(248, 81, 73, 0.4);
  box-shadow: 0 0 12px rgba(248, 81, 73, 0.3);
}

.risk-tag--unknown {
  background-color: rgba(100, 255, 218, 0.1);
  color: #64ffda;
  border-color: rgba(100, 255, 218, 0.3);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

@media (max-width: 768px) {
  .user-grid {
    grid-template-columns: 1fr;
  }
  
  .user-card__main {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .user-card__actions {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }
}
</style>
