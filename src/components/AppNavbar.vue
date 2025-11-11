<template>
  <div>
    <div>
      <div>
        <div aria-hidden></div>
        <h1>风险管理</h1>
      </div>

      <nav>
        <RouterLink v-for="item in navItems" :key="item.path" :to="item.path">
          <span>{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div>
        <div>
          <span></span>
          <span>在线</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";

const navItems = [
  { path: "/", label: "用户管理", icon: "👥" },
  // 可以添加更多导航项
];
</script>
