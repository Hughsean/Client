<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { UsersApi, AdminApi } from "../server";
import type { User, RiskLevel } from "../server";
import { riskLevelCN } from "../utils/risk";
// emits
const emit = defineEmits<{
  (e: "select", user: User): void;
  (e: "refresh"): void;
  (e: "view-risk", user: User): void;
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
    ElMessage.error(e?.message || "加载用户列表失败");
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
    const sa = (a?.id && riskCache.value[a.id]) ? riskCache.value[a.id].score : 0;
    const sb = (b?.id && riskCache.value[b.id]) ? riskCache.value[b.id].score : 0;
    return sb - sa;
  });
}

function openRiskDialog(row: User) {
  emit("view-risk", row);
}

// 卡片样式：根据风险分数从绿到红渐变
function computeCardStyle(u: User) {
  const id = (u?.id as number) ?? null;
  if (!id || !riskCache.value[id]) return {};
  const score = riskCache.value[id].score; // 0(安全)~1(危险)
  const hue = 120 - 120 * score; // 120 绿 -> 0 红
  const bg = `linear-gradient(180deg, hsla(${hue}, 85%, 98%, 1), hsla(${hue}, 85%, 94%, 1))`;
  const border = `hsl(${hue}, 85%, 55%)`;
  return {
    background: bg,
    border: `1px solid ${border}`,
  } as Record<string, string>;
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

onMounted(fetchUsers);
</script>

<template>
  <el-card shadow="hover" class="user-list-card">
    <template #header>
      <div class="card-header">
        <span>用户列表</span>
        <div class="actions">
          <el-button size="small" @click="fetchUsers" :loading="loading"
            >刷新</el-button
          >
        </div>
      </div>
    </template>

    <div v-loading="loading" class="user-grid" style="min-height: calc(100vh - 220px);">
      <div
        v-for="user in users"
        :key="user.id"
        class="user-card"
        :class="{ 'is-active': user.id === selectedId }"
        :style="computeCardStyle(user)"
        @click="handleRowClick(user)"
      >
        <div class="card-main">
          <div class="card-title">
            <!-- <div class="username">{{ user.username }}</div> -->
            <div class="nickname">{{ user.nickname ?? '-' }}</div>
          </div>

          <div class="card-body">
            <div class="meta"><strong>监护人邮箱：</strong>{{ user.email ?? '-' }}</div>
            <div class="meta"><strong>监护人电话：</strong>{{ user.phone ?? '-' }}</div>
            <div class="meta"><strong>监护人状态：</strong>
              <el-tag :type="user.status === 1 ? 'success' : user.status === 0 ? 'info' : 'warning'">
                {{ user.status === 1 ? '正常' : user.status === 0 ? '未激活' : '异常' }}
              </el-tag>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <div class="risk-tag">
            <template v-if="user.id && riskCache[user.id]">
              <el-tag :style="{
                backgroundColor: `hsla(${120 - 120 * riskCache[user.id].score}, 85%, 96%, 1)`,
                color: `hsl(${120 - 120 * riskCache[user.id].score}, 85%, 25%)`,
                borderColor: `hsl(${120 - 120 * riskCache[user.id].score}, 85%, 55%)`
              }">{{riskLevelCN(riskCache[user.id].level) }}</el-tag>
            </template>
            <template v-else>
                <el-tag type="info">-</el-tag>
            </template>
          </div>
          <div class="actions">
              <el-button type="primary" size="small" class="cta" @click.stop="openRiskDialog(user)">查看对话</el-button>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.user-list-card {
  width: 100%;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.actions {
  display: flex;
  gap: 8px;
}

.user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
  padding: 12px 0;
}

.user-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 140px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.user-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
}
.user-card.is-active {
  outline: 2px solid var(--el-color-primary);
}
.cta {
  /* 强制覆盖按钮主色为薄荷绿渐变 */
  background: linear-gradient(135deg, var(--accent-200), var(--accent-400)) !important;
  border-color: rgba(16,185,129,0.9) !important;
  color: white !important;
}
.card-main .card-title {
  display:flex;
  align-items: baseline;
  gap: 8px;
  font-size: large;
}
.username { font-weight: 600; font-size: 18px; }
.nickname { font-size: 20px; color: rgba(0,0,0,0.6); }
.card-body { margin-top: 8px; display:flex; flex-direction: column; gap:4px; font-size: 15px }
.card-footer { display:flex; justify-content: space-between; align-items:center; margin-top:12px }
.risk-tag { display:flex; align-items:center }

/* 让“查看对话”按钮更显眼：实色主按钮、加粗、圆角和阴影 */
.card-footer .actions .el-button.cta {
  font-weight: 700;
  box-shadow: 0 6px 18px rgba(16, 142, 233, 0.16);
  border-radius: 6px;
  padding: 6px 12px;
  /* 确保主色文字为白色（Element Plus 主色通常会处理），但显式指定以防主题不同 */
  color: #ffffff;
}

.card-footer .actions .el-button.cta:hover {
  transform: translateY(-1px);
}

</style>
