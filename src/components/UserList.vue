<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { UsersApi } from "../server";
import type { User } from "../server";

// emits
const emit = defineEmits<{
  (e: "select", user: User): void;
  (e: "refresh"): void;
}>();

const loading = ref(false);
const users = ref<User[]>([]);
const selectedId = ref<number | null>(null);

const api = new UsersApi();

async function fetchUsers() {
  loading.value = true;
  try {
    users.value = await api.getAll();

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

function rowClassName({ row }: { row: User }) {
  return row?.id === selectedId.value ? "is-active" : "";
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

    <el-table
      :data="users"
      stripe
      border
      height="calc(100vh - 220px)"
      v-loading="loading"
      @row-click="handleRowClick"
      :row-class-name="rowClassName"
    >
      <el-table-column type="index" width="60" label="#" />
      <el-table-column prop="id" label="ID" width="90" sortable />
      <el-table-column
        prop="username"
        label="用户名"
        min-width="140"
        show-overflow-tooltip
      />
      <el-table-column
        prop="nickname"
        label="昵称"
        min-width="140"
        show-overflow-tooltip
      />
      <el-table-column
        prop="email"
        label="邮箱"
        min-width="180"
        show-overflow-tooltip
      />
      <el-table-column
        prop="phone"
        label="手机"
        min-width="140"
        show-overflow-tooltip
      />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag
            :type="
              row.status === 1
                ? 'success'
                : row.status === 0
                ? 'info'
                : 'warning'
            "
            >{{ row.status ?? "-" }}</el-tag
          >
        </template>
      </el-table-column>
    </el-table>
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
.el-table .is-active > td {
  background-color: var(--el-color-primary-light-9) !important;
}
</style>
