<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { NavItem } from '@/types'

const route = useRoute()

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: 'grid' },
  { label: 'Albums', to: '/albums', icon: 'images' },
  { label: 'Favoris', to: '/favorites', icon: 'heart' },
  { label: 'Upload', to: '/upload', icon: 'upload-cloud' },
  { label: 'Paramètres', to: '/settings', icon: 'settings' },
]

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}

// Simple SVG icon map
const icons: Record<string, string> = {
  grid: `<path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/>`,
  images: `<rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="m21 15-5-5L5 21" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/>`,
  heart: `<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
  'upload-cloud': `<polyline points="16 16 12 12 8 16" stroke="currentColor" stroke-width="1.5" fill="none"/><line x1="12" y1="12" x2="12" y2="21" stroke="currentColor" stroke-width="1.5"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
  settings: `<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
}

const activeClass = computed(() => '')
</script>

<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="sidebar-logo">
      <div class="logo-icon">CV</div>
      <span class="logo-label">ChronoVault</span>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ 'nav-item--active': isActive(item.to) }"
      >
        <span class="nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" v-html="icons[item.icon]" />
        </span>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <!-- Bottom user section -->
    <div class="sidebar-footer">
      <div class="user-avatar">JD</div>
      <div class="user-info">
        <p class="user-name">Jean Dupont</p>
        <p class="user-email">jean@example.com</p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background-color: var(--color-sidebar-bg);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: sticky;
  top: 0;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-6) var(--space-5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: var(--color-primary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.logo-label {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: white;
  letter-spacing: -0.01em;
}

.sidebar-nav {
  flex: 1;
  padding: var(--space-4) var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-3);
  border-radius: var(--radius-md);
  color: var(--color-sidebar-text);
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: background-color 0.15s, color 0.15s;
  cursor: pointer;
}

.nav-item:hover {
  background-color: var(--color-sidebar-hover);
  color: white;
}

.nav-item--active {
  background-color: rgba(99, 102, 241, 0.15);
  color: white;
}

.nav-item--active .nav-icon {
  color: var(--color-sidebar-active);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  opacity: 0.8;
}

.nav-item--active .nav-icon {
  opacity: 1;
}

.sidebar-footer {
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.user-avatar {
  width: 34px;
  height: 34px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.user-info {
  overflow: hidden;
}

.user-name {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
