<script setup lang="ts">
import { ref } from 'vue'
import UserList from '../components/UserList.vue'
import UserDetails from '../components/UserDetails.vue'
import type { User } from '../server'

const selectedUser = ref<User | null>(null)
const selectedId = ref<number | null>(null)
const drawerVisible = ref(false)

function handleSelect(u: User) {
  selectedUser.value = u
  selectedId.value = (u.id as number) ?? null
  drawerVisible.value = true
}
</script>

<template>
  <div class="users-view">
    <UserList @select="handleSelect" />
    <UserDetails
      :user="selectedUser"
      :user-id="selectedId"
      :visible="drawerVisible"
      @close="drawerVisible = false"
      @saved="() => {}"
    />
  </div>
</template>

<style scoped>
.users-view { padding: 16px; }
</style>
