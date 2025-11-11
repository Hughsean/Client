<script setup lang="ts">
import { RouterView, useRoute } from "vue-router";
import { computed } from "vue";
import MessageContainer from "./components/MessageContainer.vue";
import AppNavbar from "./components/AppNavbar.vue";

const route = useRoute();
const hideNavbar = computed(() => route.meta?.hideNavbar === true);
const isFullPageView = computed(() => route.name === 'UserConversations');
</script>

<template>
  <div id="app">
    <AppNavbar v-if="!hideNavbar" />
    <main class="app-main" :class="{ 'no-navbar': hideNavbar, 'full-page': isFullPageView }">
      <RouterView v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>
    <MessageContainer v-if="!hideNavbar" />
  </div>
</template>

<style>
@import "./assets/styles/global.css";

#app {
  min-height: 100vh;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.app-main {
  flex: 1;
  padding: var(--spacing-xl);
  animation: fadeIn 0.4s ease-out;
  position: relative;
  z-index: 1;
  overflow: auto;
}

.app-main.no-navbar {
  padding: 0;
}

.app-main.full-page {
  padding: 0;
  overflow: hidden;
}

/* Page transition animations */
.page-enter-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-leave-active {
  transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  width: 100%;
}

.page-enter-from {
  opacity: 0;
}

.page-leave-to {
  opacity: 0;
}
</style>
