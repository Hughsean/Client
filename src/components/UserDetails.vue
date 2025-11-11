<script setup lang="ts">
import { ref, watch } from "vue";
import { messageError, messageInfo } from "../utils/message";
import UiDrawer from "./ui/UiDrawer.vue";
import UiSkeleton from "./ui/UiSkeleton.vue";
import UiButton from "./ui/UiButton.vue";
import { ProfilesApi } from "../server";
import type { User, UserProfileDto, UserProfileSave } from "../server";

const props = defineProps<{
  userId: number | null;
  user: User | null;
  visible: boolean;
}>();
const emit = defineEmits<{ (e: "close"): void; (e: "saved"): void }>();

const profilesApi = new ProfilesApi();

const loading = ref(false);
const saving = ref(false);
const localVisible = ref(false);

// Profile 各分类以字符串数组形式编辑（SDK 已将响应对齐为 string[]）
const interests = ref<string[]>([]);
const traits = ref<string[]>([]);
const preferences = ref<string[]>([]);
const emotions = ref<string[]>([]);
const learnings = ref<string[]>([]);

async function loadProfile(id: number) {
  loading.value = true;
  try {
    const p: UserProfileDto | null = await profilesApi
      .get(id)
      .catch(() => null);
    interests.value = p?.interests ?? [];
    traits.value = p?.personalityTraits ?? [];
    preferences.value = p?.interactionPreferences ?? [];
    emotions.value = p?.emotionalTendency ?? [];
    learnings.value = p?.learningRecords ?? [];
  } catch (e: any) {
    messageError(e?.message || "加载 Profile 失败");
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.visible,
  (v) => (localVisible.value = v),
  { immediate: true }
);
// 当抽屉打开或 userId 变化时加载
watch([() => props.visible, () => props.userId], ([v, id]) => {
  if (v && id) loadProfile(id);
});

function closeDrawer() {
  emit("close");
}

function addItem(list: string[]) {
  list.push("");
}
function removeItem(list: string[], index: number) {
  list.splice(index, 1);
}

async function onSave() {
  if (!props.userId) return;
  saving.value = true;
  try {
    const payload: UserProfileSave = {
      userId: props.userId,
      interests: interests.value,
      personalityTraits: traits.value,
      interactionPreferences: preferences.value,
      emotionalTendency: emotions.value,
      learningRecords: learnings.value,
    };
    await profilesApi.save(payload);
    messageInfo("已保存 Profile");
    emit("saved");
  } catch (e: any) {
    messageError(e?.message || "保存失败");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <UiDrawer
    v-model="localVisible"
    :with-header="false"
    size="50%"
    @close="closeDrawer"
  >
    <div class="user-details">
      <div class="user-details__header">
        <div class="header-title">
          <span class="header-icon">👤</span>
          <span class="header-text">{{
            props.user?.nickname ||
            props.user?.username ||
            "用户 #" + props.userId
          }}</span>
        </div>
        <div class="header-actions">
          <UiButton @click="closeDrawer">关闭</UiButton>
          <UiButton
            type="primary"
            :loading="saving"
            :disabled="!userId"
            @click="onSave"
            >保存</UiButton
          >
        </div>
      </div>
      <UiSkeleton :loading="loading" :rows="6">
        <template #default>
          <!-- 兴趣 -->
          <section class="profile-section">
            <div class="section-header">
              <h3 class="section-title">💡 兴趣爱好</h3>
              <UiButton type="primary" size="small" @click="addItem(interests)"
                >+ 新增</UiButton
              >
            </div>
            <div class="section-content">
              <table class="profile-table">
                <thead>
                  <tr>
                    <th width="60">#</th>
                    <th>内容</th>
                    <th width="100">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(_, idx) in interests" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td>
                      <input
                        v-model="interests[idx]"
                        class="profile-input"
                        placeholder="输入兴趣条目"
                      />
                    </td>
                    <td>
                      <UiButton size="small" @click="removeItem(interests, idx)"
                        >删除</UiButton
                      >
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- 性格特征 -->
          <section class="profile-section">
            <div class="section-header">
              <h3 class="section-title">🎭 性格特征</h3>
              <UiButton type="primary" size="small" @click="addItem(traits)"
                >+ 新增</UiButton
              >
            </div>
            <div class="section-content">
              <table class="profile-table">
                <thead>
                  <tr>
                    <th width="60">#</th>
                    <th>内容</th>
                    <th width="100">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(_, idx) in traits" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td>
                      <input
                        v-model="traits[idx]"
                        class="profile-input"
                        placeholder="输入特征"
                      />
                    </td>
                    <td>
                      <UiButton size="small" @click="removeItem(traits, idx)">删除</UiButton>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- 互动偏好 -->
          <section class="profile-section">
            <div class="section-header">
              <h3 class="section-title">💬 互动偏好</h3>
              <UiButton type="primary" size="small" @click="addItem(preferences)"
                >+ 新增</UiButton
              >
            </div>
            <div class="section-content">
              <table class="profile-table">
                <thead>
                  <tr>
                    <th width="60">#</th>
                    <th>内容</th>
                    <th width="100">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(_, idx) in preferences" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td>
                      <input
                        v-model="preferences[idx]"
                        class="profile-input"
                        placeholder="输入偏好"
                      />
                    </td>
                    <td>
                      <UiButton size="small" @click="removeItem(preferences, idx)"
                        >删除</UiButton
                      >
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- 情绪倾向 -->
          <section class="profile-section">
            <div class="section-header">
              <h3 class="section-title">😊 情绪倾向</h3>
              <UiButton type="primary" size="small" @click="addItem(emotions)"
                >+ 新增</UiButton
              >
            </div>
            <div class="section-content">
              <table class="profile-table">
                <thead>
                  <tr>
                    <th width="60">#</th>
                    <th>内容</th>
                    <th width="100">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(_, idx) in emotions" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td>
                      <input
                        v-model="emotions[idx]"
                        class="profile-input"
                        placeholder="输入情绪倾向"
                      />
                    </td>
                    <td>
                      <UiButton size="small" @click="removeItem(emotions, idx)"
                        >删除</UiButton
                      >
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- 学习记录 -->
          <section class="profile-section">
            <div class="section-header">
              <h3 class="section-title">📚 学习记录</h3>
            </div>
            <div class="section-content">
              <table class="profile-table">
                <thead>
                  <tr>
                    <th width="60">#</th>
                    <th>内容</th>
                    <th width="100">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(_, idx) in learnings" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td>
                      <input
                        v-model="learnings[idx]"
                        class="profile-input"
                        placeholder="输入学习记录"
                      />
                    </td>
                    <td>
                      <UiButton size="small" @click="removeItem(learnings, idx)"
                        >删除</UiButton
                      >
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </template>
      </UiSkeleton>
    </div>
  </UiDrawer>
</template>

<style scoped>
.user-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.user-details__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--border);
  position: sticky;
  top: 0;
  background: rgba(22, 27, 34, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 10;
}

.header-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.header-icon {
  font-size: var(--font-size-3xl);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #64ffda 0%, #ffc131 100%);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 12px var(--primary-cyan-glow);
  border: 2px solid rgba(100, 255, 218, 0.3);
}

.header-text {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.profile-section {
  background: rgba(28, 33, 40, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  animation: slideInFromRight 0.3s ease-out;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.section-content {
  overflow-x: auto;
}

.profile-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: rgba(22, 27, 34, 0.4);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.profile-table thead {
  background: rgba(28, 33, 40, 0.6);
}

.profile-table th {
  padding: var(--spacing-md);
  font-weight: 600;
  text-align: left;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border);
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.profile-table tbody tr {
  transition: background var(--transition-fast);
}

.profile-table tbody tr:hover {
  background: var(--surface-hover);
}

.profile-table td {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border);
  color: var(--text-secondary);
}

.profile-table tbody tr:last-child td {
  border-bottom: none;
}

.profile-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
  outline: none;
}

.profile-input:focus {
  border-color: var(--primary-cyan);
  background: var(--bg-dark-3);
  box-shadow: 0 0 0 3px var(--primary-cyan-glow);
}

.profile-input::placeholder {
  color: var(--text-muted);
}

@keyframes slideInFromRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>


