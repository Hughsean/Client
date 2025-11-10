<template>
  <el-row class="users-wrapper" :gutter="20">
    <el-col :span="16">
      <el-card shadow="hover">
        <div class="header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h2 style="margin:0">用户列表</h2>
          <el-button type="primary" @click="loadUsers" :loading="loading">刷新</el-button>
        </div>

        <el-alert v-if="error" :title="error" type="error" show-icon class="mb-3" />

        <el-skeleton :loading="loading" animated>
          <template #template>
            <el-skeleton-item variant="text" style="width:60%; height:22px; margin-bottom:12px;" />
            <el-skeleton-item variant="p" style="width:100%; height:200px;" />
          </template>

          <template #default>
            <el-table v-if="users.length" :data="users" stripe style="width:100%">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="username" label="用户名" />
              <el-table-column prop="nickname" label="昵称" />
              <el-table-column prop="email" label="邮箱" />
              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <el-button size="small" @click="viewUser(row)">查看</el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-empty v-else description="没有用户数据" />
          </template>
        </el-skeleton>
      </el-card>
    </el-col>

    <el-col :span="8">
      <el-card v-if="selected" shadow="hover">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3 style="margin:0">用户详情</h3>
          <el-button type="text" @click="selected = null">关闭</el-button>
        </div>

        <el-descriptions :column="1" size="small" border style="margin-top:12px;">
          <el-descriptions-item label="ID">{{ selected.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ selected.username || '-' }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ selected.nickname || '-' }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ selected.email || '-' }}</el-descriptions-item>
          <el-descriptions-item label="电话">{{ selected.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ selected.status ?? '-' }}</el-descriptions-item>
        </el-descriptions>

        <el-divider />
        <pre class="raw">{{ prettySelected }}</pre>
      </el-card>

      <el-card v-else shadow="never">
        <div class="muted">选择一个用户查看详情</div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { AdminApi } from '../apis/AdminApi';
import type { User } from '../types/user';

const api = new AdminApi();
const users = ref<User[]>([]);
const selected = ref<User | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

async function loadUsers() {
  loading.value = true;
  error.value = null;
  try {
    const res = await api.getAllUsers();
    console.log(res);
    
    // 假定返回 Promise<User[]>
    users.value = (res as User[]) || [];
  } catch (err: any) {
    console.error(err);
    error.value = err?.message || String(err) || '获取用户失败';
  } finally {
    loading.value = false;
  }
}

function viewUser(user: User) {
  selected.value = user;
}

const prettySelected = computed(() => (selected.value ? JSON.stringify(selected.value, null, 2) : ''));

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.users-wrapper { padding: 16px; }
.mb-3 { margin-bottom: 12px; }
.muted { color: #666; }
.raw { background: #f7f7f7; padding: 8px; font-size: 12px; overflow: auto; max-height: 240px; }
</style>
