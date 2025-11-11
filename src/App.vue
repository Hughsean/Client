<script setup lang="ts">
import UsersView from './views/UsersView.vue'
</script>

<template>
	<div id="app">
		<el-config-provider size="large">
			<UsersView />
		</el-config-provider>
	</div>
</template>

<style scoped>
#app {
	font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif;
	color: #2c3e50;
	background: #f5f7fa;
	min-height: 100vh;
}
</style>
