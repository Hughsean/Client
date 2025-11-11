<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
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
    ElMessage.error(e?.message || "加载 Profile 失败");
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
    ElMessage.success("已保存 Profile");
    emit("saved");
  } catch (e: any) {
    ElMessage.error(e?.message || "保存失败");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <el-drawer
    v-model="localVisible"
    :with-header="false"
    size="50%"
    @close="closeDrawer"
  >
    <div class="drawer-wrap">
      <div class="drawer-header">
        <div class="title">
          <el-icon style="margin-right: 6px"
            ><i class="el-icon-user"
          /></el-icon>
          <span>{{
            props.user?.nickname ||
            props.user?.username ||
            "用户 #" + props.userId
          }}</span>
        </div>
        <div class="actions">
          <el-button @click="closeDrawer">关闭</el-button>
          <el-button
            type="primary"
            :loading="saving"
            :disabled="!userId"
            @click="onSave"
            >保存</el-button
          >
        </div>
      </div>

      <el-skeleton :loading="loading" animated :rows="6">
        <template #default>
          <!-- 兴趣 -->
          <section class="section section-interests">
            <div class="section-bar">
              <h3>兴趣</h3>
              <el-button link type="primary" @click="addItem(interests)"
                >新增一项</el-button
              >
            </div>
            <el-table
              :data="interests"
              border
              size="small"
              class="profile-table profile-table--interests"
            >
              <el-table-column type="index" label="#" width="60" />
              <el-table-column label="内容" min-width="240">
                <template #default="{ $index }">
                  <el-input
                    v-model="interests[$index]"
                    placeholder="输入兴趣条目"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="{ $index }">
                  <el-button
                    type="danger"
                    link
                    @click="removeItem(interests, $index)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </section>

          <!-- 性格特征 -->
          <section class="section section-traits">
            <div class="section-bar">
              <h3>性格特征</h3>
              <el-button link type="primary" @click="addItem(traits)"
                >新增一项</el-button
              >
            </div>
            <el-table
              :data="traits"
              border
              size="small"
              class="profile-table profile-table--traits"
            >
              <el-table-column type="index" label="#" width="60" />
              <el-table-column label="内容" min-width="240">
                <template #default="{ $index }">
                  <el-input v-model="traits[$index]" placeholder="输入特征" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="{ $index }">
                  <el-button
                    type="danger"
                    link
                    @click="removeItem(traits, $index)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </section>

          <!-- 互动偏好 -->
          <section class="section section-preferences">
            <div class="section-bar">
              <h3>互动偏好</h3>
              <el-button link type="primary" @click="addItem(preferences)"
                >新增一项</el-button
              >
            </div>
            <el-table
              :data="preferences"
              border
              size="small"
              class="profile-table profile-table--preferences"
            >
              <el-table-column type="index" label="#" width="60" />
              <el-table-column label="内容" min-width="240">
                <template #default="{ $index }">
                  <el-input
                    v-model="preferences[$index]"
                    placeholder="输入偏好"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="{ $index }">
                  <el-button
                    type="danger"
                    link
                    @click="removeItem(preferences, $index)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </section>

          <!-- 情绪倾向 -->
          <section class="section section-emotions">
            <div class="section-bar">
              <h3>情绪倾向</h3>
              <el-button link type="primary" @click="addItem(emotions)"
                >新增一项</el-button
              >
            </div>
            <el-table
              :data="emotions"
              border
              size="small"
              class="profile-table profile-table--emotions"
            >
              <el-table-column type="index" label="#" width="60" />
              <el-table-column label="内容" min-width="240">
                <template #default="{ $index }">
                  <el-input
                    v-model="emotions[$index]"
                    placeholder="输入情绪倾向"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="{ $index }">
                  <el-button
                    type="danger"
                    link
                    @click="removeItem(emotions, $index)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </section>

          <!-- 学习记录 -->
          <section class="section section-learnings">
            <div class="section-bar">
              <h3>学习记录</h3>
              <!-- <el-button link type="primary" @click="addItem(learnings)">新增一项</el-button> -->
            </div>
            <el-table
              :data="learnings"
              border
              size="small"
              class="profile-table profile-table--learnings"
            >
              <el-table-column type="index" label="#" width="60" />
              <el-table-column label="内容" min-width="240">
                <template #default="{ $index }">
                  <el-input
                    v-model="learnings[$index]"
                    placeholder="输入学习记录"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="{ $index }">
                  <el-button
                    type="danger"
                    link
                    @click="removeItem(learnings, $index)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </section>
        </template>
      </el-skeleton>
    </div>
  </el-drawer>
</template>

<style scoped>
.drawer-wrap {
  padding: 16px;
  /* 放大此区域内的基础字号（影响 Element Plus 组件） */
  /* --el-font-size-base: 18px; */
  font-size: 18px;
}
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.title {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 18px;
}
.actions {
  display: flex;
  gap: 8px;
}
.section {
  margin-bottom: 16px;
}
.section-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.section-bar h3 {
  font-size: 18px;
  margin: 0;
}
/* 统一放大 Profile 表格中的输入框字体 */
.profile-table :deep(.el-input__wrapper),
.profile-table :deep(.el-input__inner),
.profile-table :deep(.el-textarea__inner) {
  font-size: 18px;
}
/* 统一为薄荷绿主题（各小模块使用同一主色的不同深浅） */
.section-interests {
  --sec-color: var(--accent-600);
}
.section-traits {
  --sec-color: var(--accent-400);
}
.section-preferences {
  --sec-color: var(--accent-600);
}
.section-emotions {
  --sec-color: #2dd4bf; /* mint-variant */
}
.section-learnings {
  --sec-color: var(--accent-200);
}

.section-interests .section-bar h3 {
  color: var(--sec-color);
}
.section-traits .section-bar h3 {
  color: var(--sec-color);
}
.section-preferences .section-bar h3 {
  color: var(--sec-color);
}
.section-emotions .section-bar h3 {
  color: var(--sec-color);
}
.section-learnings .section-bar h3 {
  color: var(--sec-color);
}

/* 表格顶部加一条浅色渐变边框，行 hover 使用对应主题淡色 */
.profile-table {
  border-radius: 6px;
  overflow: hidden;
}
.profile-table--interests :deep(.el-table__inner-wrapper) {
  border-top: 3px solid rgba(16,185,129,0.2);
}
.profile-table--traits :deep(.el-table__inner-wrapper) {
  border-top: 3px solid rgba(52,211,153,0.15);
}
.profile-table--preferences :deep(.el-table__inner-wrapper) {
  border-top: 3px solid rgba(16,185,129,0.18);
}
.profile-table--emotions :deep(.el-table__inner-wrapper) {
  border-top: 3px solid rgba(45,212,191,0.15);
}
.profile-table--learnings :deep(.el-table__inner-wrapper) {
  border-top: 3px solid rgba(187,247,228,0.18);
}

.profile-table--interests :deep(.el-table__body tr:hover > td) {
  background: rgba(136,246,220,0.45) !important;
}
.profile-table--traits :deep(.el-table__body tr:hover > td) {
  background: rgba(136,246,220,0.28) !important;
}
.profile-table--preferences :deep(.el-table__body tr:hover > td) {
  background: rgba(187,247,228,0.45) !important;
}
.profile-table--emotions :deep(.el-table__body tr:hover > td) {
  background: rgba(187,247,228,0.36) !important;
}
.profile-table--learnings :deep(.el-table__body tr:hover > td) {
  background: rgba(219,255,246,0.45) !important;
}

/* 输入框获得焦点时加主题色描边 */
.profile-table--interests :deep(.is-focus) {
  box-shadow: 0 0 0 2px rgba(16,185,129,0.18) inset;
}
.profile-table--traits :deep(.is-focus) {
  box-shadow: 0 0 0 2px rgba(52,211,153,0.14) inset;
}
.profile-table--preferences :deep(.is-focus) {
  box-shadow: 0 0 0 2px rgba(16,185,129,0.18) inset;
}
.profile-table--emotions :deep(.is-focus) {
  box-shadow: 0 0 0 2px rgba(45,212,191,0.16) inset;
}
.profile-table--learnings :deep(.is-focus) {
  box-shadow: 0 0 0 2px rgba(187,247,228,0.16) inset;
}

/* 删除按钮用对应主题的更柔和色 */
.profile-table--interests :deep(.el-button--danger) {
  color: #f97316;
}
.profile-table--traits :deep(.el-button--danger) {
  color: #ef4444;
}
.profile-table--preferences :deep(.el-button--danger) {
  color: #059669;
}
.profile-table--emotions :deep(.el-button--danger) {
  color: #ef4444;
}
.profile-table--learnings :deep(.el-button--danger) {
  color: #0284c7;
}
</style>
