<script setup lang="ts">
import { ref, watch } from "vue";
import { messageError, messageInfo } from "../utils/message";
import UiDrawer from "@/ui/UiDrawer.vue";
import UiSkeleton from "@/ui/UiSkeleton.vue";
import UiButton from "@/ui/UiButton.vue";
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
const isEditing = ref(false);

// Profile 各分类以字符串数组形式编辑（SDK 已将响应对齐为 string[]）
const interests = ref<string[]>([]);
const traits = ref<string[]>([]);
const preferences = ref<string[]>([]);
const emotions = ref<string[]>([]);
const learnings = ref<string[]>([]);

// 备份数据用于取消编辑
const backupData = ref<{
  interests: string[];
  traits: string[];
  preferences: string[];
  emotions: string[];
}>({
  interests: [],
  traits: [],
  preferences: [],
  emotions: [],
});

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
    
    // 保存备份
    backupData.value = {
      interests: [...interests.value],
      traits: [...traits.value],
      preferences: [...preferences.value],
      emotions: [...emotions.value],
    };
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
  isEditing.value = false;
  emit("close");
}

function startEditing() {
  // 保存当前数据作为备份
  backupData.value = {
    interests: [...interests.value],
    traits: [...traits.value],
    preferences: [...preferences.value],
    emotions: [...emotions.value],
  };
  isEditing.value = true;
}

function cancelEditing() {
  // 恢复备份数据
  interests.value = [...backupData.value.interests];
  traits.value = [...backupData.value.traits];
  preferences.value = [...backupData.value.preferences];
  emotions.value = [...backupData.value.emotions];
  isEditing.value = false;
  messageInfo("已取消编辑");
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
    isEditing.value = false;
    
    // 更新备份数据
    backupData.value = {
      interests: [...interests.value],
      traits: [...traits.value],
      preferences: [...preferences.value],
      emotions: [...emotions.value],
    };
    
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
    :with-header="true"
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
          <template v-if="!isEditing">
            <UiButton
              type="primary"
              :disabled="!userId"
              @click="startEditing"
              >编辑</UiButton
            >
            <UiButton
              type="danger"
              @click="closeDrawer"
              >关闭</UiButton
            >
          </template>
          <template v-else>
            <UiButton @click="cancelEditing">取消</UiButton>
            <UiButton
              type="primary"
              :loading="saving"
              :disabled="!userId"
              @click="onSave"
              >保存</UiButton
            >
          </template>
        </div>
      </div>
      <UiSkeleton :loading="loading" :rows="6">
        <template #default>
          <!-- 兴趣 -->
          <section class="profile-section interests">
            <div class="section-header">
              <h3 class="section-title">💡 兴趣爱好</h3>
              <UiButton 
                v-if="isEditing"
                type="primary" 
                size="small" 
                @click="addItem(interests)"
                >+ 新增</UiButton
              >
            </div>
            <div class="section-content">
              <table class="profile-table">
                <thead>
                  <tr>
                    <th width="60">#</th>
                    <th>内容</th>
                    <th v-if="isEditing" width="100">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in interests" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td>
                      <input
                        v-if="isEditing"
                        v-model="interests[idx]"
                        class="profile-input"
                        placeholder="输入兴趣条目"
                      />
                      <span v-else class="readonly-content">{{ item || '(空)' }}</span>
                    </td>
                    <td v-if="isEditing">
                      <UiButton size="small" @click="removeItem(interests, idx)"
                        >删除</UiButton
                      >
                    </td>
                  </tr>
                  <tr v-if="!isEditing && interests.length === 0">
                    <td colspan="2" class="empty-state">暂无数据</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- 性格特征 -->
          <section class="profile-section traits">
            <div class="section-header">
              <h3 class="section-title">🎭 性格特征</h3>
              <UiButton 
                v-if="isEditing"
                type="primary" 
                size="small" 
                @click="addItem(traits)"
                >+ 新增</UiButton
              >
            </div>
            <div class="section-content">
              <table class="profile-table">
                <thead>
                  <tr>
                    <th width="60">#</th>
                    <th>内容</th>
                    <th v-if="isEditing" width="100">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in traits" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td>
                      <input
                        v-if="isEditing"
                        v-model="traits[idx]"
                        class="profile-input"
                        placeholder="输入特征"
                      />
                      <span v-else class="readonly-content">{{ item || '(空)' }}</span>
                    </td>
                    <td v-if="isEditing">
                      <UiButton size="small" @click="removeItem(traits, idx)">删除</UiButton>
                    </td>
                  </tr>
                  <tr v-if="!isEditing && traits.length === 0">
                    <td colspan="2" class="empty-state">暂无数据</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- 互动偏好 -->
          <section class="profile-section preferences">
            <div class="section-header">
              <h3 class="section-title">💬 互动偏好</h3>
              <UiButton 
                v-if="isEditing"
                type="primary" 
                size="small" 
                @click="addItem(preferences)"
                >+ 新增</UiButton
              >
            </div>
            <div class="section-content">
              <table class="profile-table">
                <thead>
                  <tr>
                    <th width="60">#</th>
                    <th>内容</th>
                    <th v-if="isEditing" width="100">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in preferences" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td>
                      <input
                        v-if="isEditing"
                        v-model="preferences[idx]"
                        class="profile-input"
                        placeholder="输入偏好"
                      />
                      <span v-else class="readonly-content">{{ item || '(空)' }}</span>
                    </td>
                    <td v-if="isEditing">
                      <UiButton size="small" @click="removeItem(preferences, idx)"
                        >删除</UiButton
                      >
                    </td>
                  </tr>
                  <tr v-if="!isEditing && preferences.length === 0">
                    <td colspan="2" class="empty-state">暂无数据</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- 情绪倾向 -->
          <section class="profile-section emotions">
            <div class="section-header">
              <h3 class="section-title">😊 情绪倾向</h3>
              <UiButton 
                v-if="isEditing"
                type="primary" 
                size="small" 
                @click="addItem(emotions)"
                >+ 新增</UiButton
              >
            </div>
            <div class="section-content">
              <table class="profile-table">
                <thead>
                  <tr>
                    <th width="60">#</th>
                    <th>内容</th>
                    <th v-if="isEditing" width="100">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in emotions" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td>
                      <input
                        v-if="isEditing"
                        v-model="emotions[idx]"
                        class="profile-input"
                        placeholder="输入情绪倾向"
                      />
                      <span v-else class="readonly-content">{{ item || '(空)' }}</span>
                    </td>
                    <td v-if="isEditing">
                      <UiButton size="small" @click="removeItem(emotions, idx)"
                        >删除</UiButton
                      >
                    </td>
                  </tr>
                  <tr v-if="!isEditing && emotions.length === 0">
                    <td colspan="2" class="empty-state">暂无数据</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- 学习记录 -->
          <section class="profile-section learnings">
            <div class="section-header">
              <h3 class="section-title">📚 学习记录</h3>
              <span class="readonly-badge">只读</span>
            </div>
            <div class="section-content">
              <table class="profile-table">
                <thead>
                  <tr>
                    <th width="60">#</th>
                    <th>内容</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in learnings" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td class="readonly-content">{{ item || '(空)' }}</td>
                  </tr>
                  <tr v-if="learnings.length === 0">
                    <td colspan="2" class="empty-state">暂无学习记录</td>
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
  gap: var(--spacing-2xl, 2rem);
  padding: var(--spacing-md);
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
  background: linear-gradient(135deg, rgba(28, 33, 40, 0.6) 0%, rgba(22, 27, 34, 0.8) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(100, 255, 218, 0.15);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl, 1.5rem);
  margin-bottom: var(--spacing-xl, 1.5rem);
  animation: slideInFromRight 0.3s ease-out;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  transition: all var(--transition-base);
}

.profile-section:hover {
  border-color: rgba(100, 255, 218, 0.3);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4), 0 0 20px rgba(100, 255, 218, 0.1);
  transform: translateY(-2px);
}

.profile-section:last-child {
  margin-bottom: 0;
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
  gap: var(--spacing-md);
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.section-content {
  overflow-x: auto;
}

.profile-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: rgba(22, 27, 34, 0.6);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2);
}

.profile-table thead {
  background: linear-gradient(135deg, rgba(28, 33, 40, 0.8) 0%, rgba(22, 27, 34, 0.9) 100%);
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
  background: rgba(100, 255, 218, 0.05);
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
  box-shadow: 0 0 0 3px var(--primary-cyan-glow), 0 4px 12px rgba(100, 255, 218, 0.15);
}

.profile-input::placeholder {
  color: var(--text-muted);
}

.readonly-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
  font-size: var(--font-size-xs, 0.75rem);
  font-weight: 600;
  color: var(--text-muted);
  background: rgba(100, 100, 100, 0.2);
  border: 1px solid rgba(100, 100, 100, 0.3);
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.readonly-content {
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  line-height: 1.5;
  padding: var(--spacing-md);
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
  font-style: italic;
  padding: var(--spacing-xl) var(--spacing-md);
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


