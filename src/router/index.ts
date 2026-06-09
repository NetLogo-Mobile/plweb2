import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { keepAlive: true },
  },
  {
    path: '/b',
    name: 'BlackHole',
    component: () => import('../views/BlackHole.vue'),
    meta: { keepAlive: true },
  },
  {
    path: '/n',
    name: 'notifications',
    component: () => import('../views/Notifications.vue'),
    meta: { keepAlive: true },
  },
  {
    path: '/m',
    name: 'messages',
    component: () => import('../views/Comments.vue'),
    meta: { keepAlive: true },
  },
  {
    path: '/p/:category/:id',
    name: 'ExperimentSummary',
    component: () => import('../views/ExperimentSummary.vue'),
    meta: { keepAlive: true },
  },
  {
    path: '/c/:category/:id/:name',
    name: 'Comments',
    component: () => import('../views/Comments.vue'),
    meta: { keepAlive: true },
  },
  {
    path: '/u/:id',
    name: 'profile',
    component: () => import('../views/Profile.vue'),
    meta: { keepAlive: true },
  },
  {
    path: '/f',
    name: 'friends',
    component: () => import('../views/Friends.vue'),
    meta: { keepAlive: true },
  },
  {
    path: '/l/:config',
    name: 'list',
    component: () => import('../views/WorkList.vue'),
    meta: { keepAlive: true },
  },
  {
    path: '/s',
    name: 'settings',
    component: () => import('../views/Settings.vue'),
    meta: { keepAlive: false },
  },

  // To maintain compatibility with old versions, we add some redirects for old paths
  { path: '/black-hole', redirect: '/b' },
  { path: '/notifications', redirect: '/n' },
  { path: '/messages', redirect: '/m' },

  {
    path: '/e/:category?/:id?',
    name: 'Editor',
    component: () => import('../views/Editor.vue'),
    meta: { keepAlive: false },
  },
  {
    path: '/ExperimentSummary/:category/:id',
    redirect: (to) => ({
      name: 'ExperimentSummary',
      params: to.params,
    }),
  },

  {
    path: '/Comments/:category/:id/:name',
    redirect: (to) => ({
      name: 'Comments',
      params: to.params,
    }),
  },

  {
    path: '/profile/:id',
    redirect: (to) => ({
      name: 'profile',
      params: to.params,
    }),
  },

  { path: '/friends', redirect: '/f' },

  {
    path: '/list/:config',
    redirect: (to) => ({
      name: 'list',
      params: to.params,
    }),
  },

  { path: '/settings', redirect: '/s' },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/About.vue'),
    meta: { keepAlive: true },
  },
  {
    path: '/:catchAll(.*)',
    component: () => import('../views/NotFound.vue'),
    meta: { keepAlive: true },
  },
]

const router = createRouter({
  history: createWebHashHistory('/plweb2/'),
  routes,
})

router.onError((error, to) => {
  if (error.message?.includes('Failed to fetch dynamically imported module')) {
    window.location.href = to.fullPath
  }
})

export default router
