import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 导入视图组件
import UsersView from '@/views/UsersView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Users',
    component: UsersView,
    meta: {
      title: '用户管理 - 风险管理客户端',
      icon: '👥'
    }
  },
  // 其他路由可以在这里添加

  // 404页面必须放在最后
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
    meta: {
      title: '404 - 页面未找到'
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 页面标题更新
router.beforeEach((to, _from, next) => {
  const title = to.meta?.title as string || '风险管理客户端'
  document.title = title
  next()
})

export default router
