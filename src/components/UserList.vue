<script setup lang="ts">
import { ref, onMounted } from "vue";
import { messageError } from "../utils/message";
import UiCard from "./ui/UiCard.vue";
import UiButton from "./ui/UiButton.vue";
import UiTag from "./ui/UiTag.vue";
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
  emit("view-risk", row);
}

// 卡片样式：根据风险分数从绿到红渐变
function computeCardStyle(u: User) {
  const id = (u?.id as number) ?? null;
  if (!id || !riskCache.value[id]) {
    // 默认样式：未知风险
    return {
      background: "var(--surface-2)",
      border: "1.5px solid var(--border)",
    } as Record<string, string>;
  }
  const score = riskCache.value[id].score; // 0(安全)~1(危险)
  const hue = 120 - 120 * score; // 120 绿 -> 0 红
  const bg = `linear-gradient(180deg, hsla(${hue}, 85%, 98%, 1), hsla(${hue}, 85%, 94%, 1))`;
  const borderColor = `hsl(${hue}, 85%, 55%)`;
  return {
    background: bg,
    border: `1.5px solid ${borderColor}`,
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
  <UiCard  :shadow="true">
    <template #header>
      <div  >
        <span>用户列表</span>
        <div  >
          <UiButton size="small" @click="fetchUsers" :loading="loading"
            >刷新</UiButton
          >
        </div>
      </div>
    </template>

    <div   >
      <div v-if="loading"  >
        <div   />
      </div>
      <div  >
        <div
          v-for="user in users"
          :key="user.id"
          :style="computeCardStyle(user)"
          @click="handleRowClick(user)"
        >
          <div>
            <div>
              <div>{{ user.nickname ?? "-" }}</div>
            </div>

            <div>
              <div><strong>监护人邮箱：</strong>{{ user.email ?? "-" }}</div>
              <div><strong>监护人电话：</strong>{{ user.phone ?? "-" }}</div>
              <div>
                <strong>监护人状态：</strong>
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

          <div>
            <div>
              <template v-if="user.id && riskCache[user.id]">
                <UiTag
                  :style="{
                    backgroundColor: `hsla(${
                      120 - 120 * riskCache[user.id].score
                    }, 85%, 96%, 1)`,
                    color: `hsl(${
                      120 - 120 * riskCache[user.id].score
                    }, 85%, 25%)`,
                    borderColor: `hsl(${
                      120 - 120 * riskCache[user.id].score
                    }, 85%, 55%)`,
                  }"
                  >{{ riskLevelCN(riskCache[user.id].level) }}</UiTag
                >
              </template>
              <template v-else>
                <UiTag type="info">-</UiTag>
              </template>
            </div>
            <div>
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
