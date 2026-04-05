import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/diary',
    },
    {
      path: '/diary',
      name: 'DiaryEdit',
      component: () => import('@/views/DiaryEdit/index.vue'),
    },
    {
      path: '/diary/:date',
      name: 'DiaryEditDate',
      component: () => import('@/views/DiaryEdit/index.vue'),
    },
    {
      path: '/list',
      name: 'DiaryList',
      component: () => import('@/views/DiaryList/index.vue'),
    },
    {
      path: '/statistics',
      name: 'Statistics',
      component: () => import('@/views/Statistics/index.vue'),
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('@/views/Settings/index.vue'),
    },
  ],
})

export default router
