import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 导入视图组件
import SplashView from '@/views/SplashView.vue'
import UsersView from '@/views/UsersView.vue'
import RiskMonitoringView from '@/views/RiskMonitoringView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Splash',
        component: SplashView,
        meta: {
            title: '风险管理客户端',
            hideNavbar: true // 启动页面隐藏导航栏
        }
    },
    {
        path: '/users',
        name: 'Users',
        component: UsersView,
        meta: {
            title: '用户管理 - 风险管理客户端',
            icon: '👥'
        }
    },
    {
        path: '/user/:userId/conversations',
        name: 'UserConversations',
        component: RiskMonitoringView,
        props: true,
        meta: {
            title: '用户对话 - 风险管理客户端',
            icon: '💬'
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
