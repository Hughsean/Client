<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { ProfilesApi } from '../server'
import type { User, UserProfile } from '../server'

const props = defineProps<{
	userId: number | null
	user: User | null
	visible: boolean
}>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

const profilesApi = new ProfilesApi()

const loading = ref(false)
const saving = ref(false)
const localVisible = ref(false)

// Profile 各分类以字符串数组形式编辑
const interests = ref<string[]>([])
const traits = ref<string[]>([])
const preferences = ref<string[]>([])
const emotions = ref<string[]>([])
const learnings = ref<string[]>([])

function normalizeToStringArray(v: unknown): string[] {
	if (Array.isArray(v)) return v.map(x => typeof x === 'string' ? x : JSON.stringify(x))
	if (typeof v === 'string') return v ? [v] : []
	if (v && typeof v === 'object') return Object.entries(v as Record<string, any>).map(([k, val]) => `${k}: ${typeof val === 'string' ? val : JSON.stringify(val)}`)
	return []
}

async function loadProfile(id: number) {
	loading.value = true
	try {
		const p = await profilesApi.get(id).catch(() => null)
		interests.value = normalizeToStringArray(p?.interests)
		traits.value = normalizeToStringArray(p?.personalityTraits)
		preferences.value = normalizeToStringArray(p?.interactionPreferences)
		emotions.value = normalizeToStringArray(p?.emotionalTendency)
		learnings.value = normalizeToStringArray(p?.learningRecords)
	} catch (e: any) {
		ElMessage.error(e?.message || '加载 Profile 失败')
	} finally {
		loading.value = false
	}
}

watch(() => props.visible, v => (localVisible.value = v), { immediate: true })
watch(() => props.userId, (id) => { if (id && props.visible) loadProfile(id) })

function closeDrawer() {
	emit('close')
}

function addItem(list: string[]) { list.push('') }
function removeItem(list: string[], index: number) { list.splice(index, 1) }

async function onSave() {
	if (!props.userId) return
	saving.value = true
	try {
		const payload: UserProfile = {
			userId: props.userId,
			interests: interests.value,
			personalityTraits: traits.value,
			interactionPreferences: preferences.value,
			emotionalTendency: emotions.value,
			learningRecords: learnings.value,
		}
		await profilesApi.save(payload)
		ElMessage.success('已保存 Profile')
		emit('saved')
	} catch (e: any) {
		ElMessage.error(e?.message || '保存失败')
	} finally {
		saving.value = false
	}
}
</script>

<template>
	<el-drawer v-model="localVisible" :with-header="false" size="50%" @close="closeDrawer">
		<div class="drawer-wrap">
			<div class="drawer-header">
				<div class="title">
					<el-icon style="margin-right:6px"><i class="el-icon-user" /></el-icon>
					<span>{{ props.user?.nickname || props.user?.username || ('用户 #' + props.userId) }}</span>
				</div>
				<div class="actions">
					<el-button @click="closeDrawer">关闭</el-button>
					<el-button type="primary" :loading="saving" :disabled="!userId" @click="onSave">保存</el-button>
				</div>
			</div>

			<el-skeleton :loading="loading" animated :rows="6">
				<template #default>
					<!-- 兴趣 -->
					<section class="section">
						<div class="section-bar">
							<h3>兴趣</h3>
							<el-button link type="primary" @click="addItem(interests)">新增一项</el-button>
						</div>
						<el-table :data="interests" border size="small">
							<el-table-column type="index" label="#" width="60" />
							<el-table-column label="内容" min-width="240">
								<template #default="{ $index }">
									<el-input v-model="interests[$index]" placeholder="输入兴趣条目" />
								</template>
							</el-table-column>
							<el-table-column label="操作" width="100">
								<template #default="{ $index }">
									<el-button type="danger" link @click="removeItem(interests, $index)">删除</el-button>
								</template>
							</el-table-column>
						</el-table>
					</section>

					<!-- 性格特征 -->
					<section class="section">
						<div class="section-bar">
							<h3>性格特征</h3>
							<el-button link type="primary" @click="addItem(traits)">新增一项</el-button>
						</div>
						<el-table :data="traits" border size="small">
							<el-table-column type="index" label="#" width="60" />
							<el-table-column label="内容" min-width="240">
								<template #default="{ $index }">
									<el-input v-model="traits[$index]" placeholder="输入特征" />
								</template>
							</el-table-column>
							<el-table-column label="操作" width="100">
								<template #default="{ $index }">
									<el-button type="danger" link @click="removeItem(traits, $index)">删除</el-button>
								</template>
							</el-table-column>
						</el-table>
					</section>

					<!-- 互动偏好 -->
					<section class="section">
						<div class="section-bar">
							<h3>互动偏好</h3>
							<el-button link type="primary" @click="addItem(preferences)">新增一项</el-button>
						</div>
						<el-table :data="preferences" border size="small">
							<el-table-column type="index" label="#" width="60" />
							<el-table-column label="内容" min-width="240">
								<template #default="{ $index }">
									<el-input v-model="preferences[$index]" placeholder="输入偏好" />
								</template>
							</el-table-column>
							<el-table-column label="操作" width="100">
								<template #default="{ $index }">
									<el-button type="danger" link @click="removeItem(preferences, $index)">删除</el-button>
								</template>
							</el-table-column>
						</el-table>
					</section>

					<!-- 情绪倾向 -->
					<section class="section">
						<div class="section-bar">
							<h3>情绪倾向</h3>
							<el-button link type="primary" @click="addItem(emotions)">新增一项</el-button>
						</div>
						<el-table :data="emotions" border size="small">
							<el-table-column type="index" label="#" width="60" />
							<el-table-column label="内容" min-width="240">
								<template #default="{ $index }">
									<el-input v-model="emotions[$index]" placeholder="输入情绪倾向" />
								</template>
							</el-table-column>
							<el-table-column label="操作" width="100">
								<template #default="{ $index }">
									<el-button type="danger" link @click="removeItem(emotions, $index)">删除</el-button>
								</template>
							</el-table-column>
						</el-table>
					</section>

					<!-- 学习记录 -->
					<section class="section">
						<div class="section-bar">
							<h3>学习记录</h3>
							<el-button link type="primary" @click="addItem(learnings)">新增一项</el-button>
						</div>
						<el-table :data="learnings" border size="small">
							<el-table-column type="index" label="#" width="60" />
							<el-table-column label="内容" min-width="240">
								<template #default="{ $index }">
									<el-input v-model="learnings[$index]" placeholder="输入学习记录" />
								</template>
							</el-table-column>
							<el-table-column label="操作" width="100">
								<template #default="{ $index }">
									<el-button type="danger" link @click="removeItem(learnings, $index)">删除</el-button>
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
.drawer-wrap { padding: 16px; }
.drawer-header { display:flex; align-items:center; justify-content:space-between; margin-bottom: 12px; }
.title { display:flex; align-items:center; font-weight:600; font-size: 16px; }
.actions { display:flex; gap: 8px; }
.section { margin-bottom: 16px; }
.section-bar { display:flex; align-items:center; justify-content:space-between; margin-bottom: 8px; }
</style>
