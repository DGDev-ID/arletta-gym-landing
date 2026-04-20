import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import authState, { fetchMe } from '@/stores/auth'

// Tracks whether the initial session restore has been attempted
let sessionRestored = false

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ── Public landing pages (accessible by everyone) ──────────────
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

    // ── Guest-only pages (redirect to dashboard when already logged in) ──
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LogIn.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/auth/SignUp.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/auth/ForgotPassword.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/auth/ResetPassword.vue'),
      meta: { requiresGuest: true },
    },

    // ── Member-only pages ────────────────────────────────────────────
    {
      path: '/member',
      component: MainLayout,
      meta: { requiresAuth: true, roles: ['member'] },
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

    // ── PT-only pages ────────────────────────────────────────────────
    {
      path: '/pt',
      component: MainLayout,
      meta: { requiresAuth: true, roles: ['pt'] },
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

    // ── Catch-all 404 ────────────────────────────────────────────────
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'instant' }
  },
})

// Helper: return the default dashboard path for a given role
function dashboardFor(role: 'member' | 'pt'): string {
  return role === 'pt' ? '/pt/profile' : '/member/profile'
}

router.beforeEach(
  async (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    window.scrollTo(0, 0)

    // ── Restore session once per app load ──────────────────────────
    if (!sessionRestored) {
      sessionRestored = true
      const token = localStorage.getItem('auth_token')
      if (token) {
        // api.js auto-sets the token from localStorage on import;
        // we just need to call fetchMe to populate the auth store.
        await fetchMe()
      }
    }

    const { isLoggedIn, user } = authState
    const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)
    const requiresGuest = to.matched.some((r) => r.meta.requiresGuest)
    const allowedRoles = to.matched.flatMap((r) => (r.meta.roles as string[] | undefined) ?? [])

    // ── 1. Protected route — user not logged in → /login ───────────
    if (requiresAuth && !isLoggedIn) {
      return next({ name: 'login', query: { redirect: to.fullPath } })
    }

    // ── 2. Protected route — user logged in but wrong role ─────────
    if (requiresAuth && isLoggedIn && user && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        return next(dashboardFor(user.role))
      }
    }

    // ── 3. Guest-only route — user already logged in → dashboard ───
    if (requiresGuest && isLoggedIn && user) {
      return next(dashboardFor(user.role))
    }

    next()
  },
)

export default router
