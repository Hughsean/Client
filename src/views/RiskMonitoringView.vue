<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import RiskConversationsAside from '../components/risk/RiskConversationsAside.vue'
import RiskIslandContent from '../components/navbar/RiskIslandContent.vue'
import { useNavbarIsland } from '../composables/useNavbarIsland'

const route = useRoute()
const { setIslandContent, clearIslandContent } = useNavbarIsland()

// 从路由参数获取 userId
const userId = computed(() => {
  const id = route.params.userId
  return id ? Number(id) : null
})

// 从查询参数获取用户名（可选）
const username = computed(() => {
  return (route.query.username as string) || `用户 #${userId.value}`
})

// 设置灵动岛内容
onMounted(() => {
  setIslandContent({
    component: RiskIslandContent,
    props: {
      username: username.value,
      userId: userId.value
    }
  })
})

// 清理灵动岛内容
onUnmounted(() => {
  clearIslandContent()
})
</script>

<template>
  <div class="risk-monitoring-view">
    <RiskConversationsAside :user="null" :user-id="userId" />
  </div>
</template>

<style scoped>
.risk-monitoring-view {
  height: 100%;
  width: 100%;
  background: var(--bg-gradient-main);
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: var(--spacing-lg);
  display: flex;
}
</style>


