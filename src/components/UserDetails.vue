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
    <div>
      <div>
        <div>
          <span>👤</span>
          <span>{{
            props.user?.nickname ||
            props.user?.username ||
            "用户 #" + props.userId
          }}</span>
        </div>
        <div>
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
          <section>
            <div>
              <h3>兴趣</h3>
              <UiButton type="primary" @click="addItem(interests)"
                >新增一项</UiButton
              >
            </div>
            <div>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>内容</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(_, idx) in interests" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td>
                      <input
                        v-model="interests[idx]"
                        placeholder="输入兴趣条目"
                      />
                    </td>
                    <td>
                      <UiButton type="" @click="removeItem(interests, idx)"
                        >删除</UiButton
                      >
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- 性格特征 -->
          <section>
            <div>
              <h3>性格特征</h3>
              <UiButton type="primary" @click="addItem(traits)"
                >新增一项</UiButton
              >
            </div>
            <div>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>内容</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(_, idx) in traits" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td>
                      <input
                        v-model="traits[idx]"
                        placeholder="输入特征"
                      />
                    </td>
                    <td>
                      <UiButton @click="removeItem(traits, idx)">删除</UiButton>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- 互动偏好 -->
          <section>
            <div>
              <h3>互动偏好</h3>
              <UiButton type="primary" @click="addItem(preferences)"
                >新增一项</UiButton
              >
            </div>
            <div>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>内容</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(_, idx) in preferences" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td>
                      <input
                        v-model="preferences[idx]"
                        placeholder="输入偏好"
                      />
                    </td>
                    <td>
                      <UiButton @click="removeItem(preferences, idx)"
                        >删除</UiButton
                      >
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- 情绪倾向 -->
          <section>
            <div>
              <h3>情绪倾向</h3>
              <UiButton type="primary" @click="addItem(emotions)"
                >新增一项</UiButton
              >
            </div>
            <div>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>内容</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(_, idx) in emotions" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td>
                      <input
                        v-model="emotions[idx]"
                        placeholder="输入情绪倾向"
                      />
                    </td>
                    <td>
                      <UiButton @click="removeItem(emotions, idx)"
                        >删除</UiButton
                      >
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- 学习记录 -->
          <section>
            <div>
              <h3>学习记录</h3>
              <!-- <el-button link type="primary" @click="addItem(learnings)">新增一项</el-button> -->
            </div>
            <div>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>内容</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(_, idx) in learnings" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td>
                      <input
                        v-model="learnings[idx]"
                        placeholder="输入学习记录"
                      />
                    </td>
                    <td>
                      <UiButton @click="removeItem(learnings, idx)"
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


