<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import UserList from "../components/UserList.vue";
import UserDetails from "../components/UserDetails.vue";
import UsersIslandContent from "../components/navbar/UsersIslandContent.vue";
import { useNavbarIsland } from "../composables/useNavbarIsland";
import type { User } from "../server";

const selectedUser = ref<User | null>(null);
const selectedId = ref<number | null>(null);
const drawerVisible = ref(false);
const userListRef = ref<InstanceType<typeof UserList>>();

const { setIslandContent, clearIslandContent } = useNavbarIsland();

function handleSelect(u: User) {
  selectedUser.value = u;
  selectedId.value = (u.id as number) ?? null;
  drawerVisible.value = true;
}

function handleRefresh() {
  userListRef.value?.refresh();
}

// 设置灵动岛内容
onMounted(() => {
  setIslandContent({
    component: UsersIslandContent,
    props: {
      onRefresh: handleRefresh
    }
  });
});

// 清理灵动岛内容
onUnmounted(() => {
  clearIslandContent();
});
</script>

<template>
  <div>
    <UserList ref="userListRef" @select="handleSelect" />
    <UserDetails
      :user="selectedUser"
      :user-id="selectedId"
      :visible="drawerVisible"
      @close="drawerVisible = false"
      @saved="() => {}"
    />
  </div>
</template>
