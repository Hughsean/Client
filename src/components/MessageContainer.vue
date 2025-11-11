<template>
  <div>
    <transition-group name="msg" tag="div">
      <div v-for="m in messages" :key="m.id">
        <div>{{ m.text }}</div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { messages } from "../utils/message";
// `messages` (a ref) is used directly in the template; Vue will unwrap it.
</script>

<style scoped></style>
