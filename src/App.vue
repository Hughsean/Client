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
	/* 使用全局渐变变量使页面整体色彩更丰富 */
	color: var(--text-on-bg, #2c3e50);
	background: linear-gradient(135deg, var(--bg-grad-1, #0b1220) 0%, var(--bg-grad-2, #1a2a4a) 30%, var(--bg-grad-3, #3b6aa0) 65%, var(--bg-grad-4, #70c1ff) 100%);
	min-height: 100vh;
}
</style>
