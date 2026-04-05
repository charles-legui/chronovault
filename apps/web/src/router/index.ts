import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
    // Media viewer — full-screen, no sidebar layout
    {
      path: '/albums/:albumId/media/:mediaId',
      name: 'media-viewer',
      component: () => import('@/views/MediaViewerView.vue'),
    },
  ],
})

export default router
