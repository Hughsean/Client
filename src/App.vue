<script setup lang="ts">
// 根组件：挂载 UsersList 用于查看用户
import UsersList from './components/UsersList.vue';
</script>

<template>
	<div id="app">
		<UsersList />
	</div>
</template>

<style scoped>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	color: #2c3e50;
}
</style>
