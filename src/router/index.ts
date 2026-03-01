import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/landing/AppHome.vue'),
        },
        {
          path: 'membership',
          name: 'membership',
          component: () => import('@/views/landing/AppMembership.vue'),
        },
        {
          path: 'programs',
          name: 'programs',
          component: () => import('@/views/landing/AppClass.vue'),
        },
        {
          path: 'trainers',
          name: 'trainers',
          component: () => import('@/views/landing/AppPersonalTrainers.vue'),
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('@/views/landing/AppAbout.vue'),
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LogIn.vue'),
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/auth/SignUp.vue'),
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/auth/ForgotPassword.vue'),
    },
    {
      path: '/member',
      component: MainLayout,
      children: [
        {
          path: 'profile',
          name: 'member-profile',
          component: () => import('@/views/member/MemberProfile.vue'),
        },
        {
          path: 'schedule',
          name: 'member-schedule',
          component: () => import('@/views/member/MemberSchedule.vue'),
        },
      ],
    },
    {
      path: '/pt',
      component: MainLayout,
      children: [
        {
          path: 'profile',
          name: 'pt-profile',
          component: () => import('@/views/pt/PTProfile.vue'),
        },
        {
          path: 'schedule',
          name: 'pt-schedule',
          component: () => import('@/views/pt/PTSchedule.vue'),
        },
        {
          path: 'clients',
          name: 'pt-clients',
          component: () => import('@/views/pt/PTClients.vue'),
        },
      ],
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    // Jika ada savedPosition (tombol back/forward browser), gunakan itu
    if (savedPosition) {
      return savedPosition
    }
    // Jika ada hash (#), scroll ke elemen tersebut
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
    // Default: langsung ke atas tanpa animasi
    return { top: 0, behavior: 'instant' }
  },
})

// Tambahan: pastikan scroll ke atas sebelum navigasi
router.beforeEach((to, from, next) => {
  window.scrollTo(0, 0)
  next()
})

export default router
