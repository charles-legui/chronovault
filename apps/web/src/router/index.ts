import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ── Auth — public, redirect away if already signed in ──
    {
      path: '/sign-in',
      name: 'sign-in',
      component: () => import('@/views/SignInView.vue'),
      meta: { public: true, redirectIfAuth: true },
    },
    {
      path: '/sign-up',
      name: 'sign-up',
      component: () => import('@/views/SignUpView.vue'),
      meta: { public: true, redirectIfAuth: true },
    },

    // ── Auth — public, accessible regardless of auth state ─
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/ForgotPasswordView.vue'),
      meta: { public: true },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      // Token comes from the query string: /reset-password?token=...
      component: () => import('@/views/ResetPasswordView.vue'),
      meta: { public: true },
    },

    // ── App (protected) ────────────────────────────────────
    {
      path: '/',
      component: AppLayout,
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'albums',
          name: 'albums',
          component: () => import('@/views/AlbumsView.vue'),
        },
        {
          path: 'albums/:id',
          name: 'album-detail',
          component: () => import('@/views/AlbumDetailView.vue'),
        },
        {
          path: 'favorites',
          name: 'favorites',
          component: () => import('@/views/FavoritesView.vue'),
        },
        {
          path: 'upload',
          name: 'upload',
          component: () => import('@/views/UploadView.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/SettingsView.vue'),
        },
      ],
    },

    // ── Media viewer (protected, no layout) ───────────────
    {
      path: '/albums/:albumId/media/:mediaId',
      name: 'media-viewer',
      component: () => import('@/views/MediaViewerView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  // Unauthenticated user trying to reach a protected route
  if (!to.meta.public && !auth.isAuthenticated) {
    return { name: 'sign-in', query: { redirect: to.fullPath } }
  }

  // Authenticated user on sign-in or sign-up — send them home
  if (to.meta.redirectIfAuth && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }
})

export default router
