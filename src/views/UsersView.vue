<script setup lang="ts">
import { ref } from "vue";
import UserList from "../components/UserList.vue";
import UserDetails from "../components/UserDetails.vue";
import RiskMonitoringView from "./RiskMonitoringView.vue";
import UiDialog from "../components/ui/UiDialog.vue";
import type { User } from "../server";

const selectedUser = ref<User | null>(null);
const selectedId = ref<number | null>(null);
const drawerVisible = ref(false);
const riskViewVisible = ref(false); // 新的全屏视图模式

function handleSelect(u: User) {
  selectedUser.value = u;
  selectedId.value = (u.id as number) ?? null;
  drawerVisible.value = true;
}

function handleViewRisk(u: User) {
  selectedUser.value = u;
  selectedId.value = (u.id as number) ?? null;
  // 打开新的风险监测视图（全屏对话框）
  riskViewVisible.value = true;
}
</script>

<template>
  <div>
    <UserList @select="handleSelect" @view-risk="handleViewRisk" />
    <UserDetails
      :user="selectedUser"
      :user-id="selectedId"
      :visible="drawerVisible"
      @close="drawerVisible = false"
      @saved="() => {}"
    />
    <!-- 旧的风险对话弹窗入口已移除（组件不存在） -->

    <!-- 新：风险监测视图，全屏对话框承载 -->
    <UiDialog
      v-model="riskViewVisible"
      :fullscreen="true"
      @close="riskViewVisible = false"
    >
      <RiskMonitoringView
        :user="selectedUser"
        :user-id="selectedId"
        @back="riskViewVisible = false"
      />
    </UiDialog>
  </div>
</template>
