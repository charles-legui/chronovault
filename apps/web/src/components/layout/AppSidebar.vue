<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/authStore'
import AppIcon from '@/components/ui/AppIcon.vue'

const route  = useRoute()
const router = useRouter()
const ui     = useUiStore()
const auth   = useAuthStore()

const initials = computed(() => {
  const name = auth.user?.displayName ?? ''
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
})

const roleLabel = computed(() =>
  auth.user?.role === 'admin' ? 'Administrator' : 'Member'
)

const navMain = [
  { label: 'Dashboard', to: '/',        icon: 'dashboard' },
  { label: 'Albums',    to: '/albums',  icon: 'albums'    },
  { label: 'Favoris',   to: '/favorites', icon: 'heart'   },
  { label: 'Upload',    to: '/upload',  icon: 'upload'    },
]

const navSecondary = [
  { label: 'Paramètres', to: '/settings', icon: 'settings' },
]

function isActive(to: string) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}

function navigate(to: string) {
  router.push(to)
  ui.closeMobileSidebar()
}
</script>

<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="sidebar-logo">
      <div class="logo-mark">
        <span>CV</span>
      </div>
      <span class="logo-name">ChronoVault</span>
    </div>

    <!-- Nav main -->
    <nav class="sidebar-nav" aria-label="Navigation principale">
      <p class="nav-group-label">Menu</p>

      <button
        v-for="item in navMain"
        :key="item.to"
        type="button"
        class="nav-item"
        :class="{ 'nav-item--active': isActive(item.to) }"
        :aria-current="isActive(item.to) ? 'page' : undefined"
        @click="navigate(item.to)"
      >
        <span class="nav-item-icon">
          <AppIcon :name="item.icon" :size="18" />
        </span>
        <span class="nav-item-label">{{ item.label }}</span>

        <!-- Active indicator bar -->
        <span v-if="isActive(item.to)" class="nav-active-bar" aria-hidden="true" />
      </button>
    </nav>

    <!-- Spacer -->
    <div class="flex-1" />

    <!-- Nav secondary -->
    <nav class="sidebar-nav-secondary" aria-label="Navigation secondaire">
      <button
        v-for="item in navSecondary"
        :key="item.to"
        type="button"
        class="nav-item"
        :class="{ 'nav-item--active': isActive(item.to) }"
        @click="navigate(item.to)"
      >
        <span class="nav-item-icon">
          <AppIcon :name="item.icon" :size="18" />
        </span>
        <span class="nav-item-label">{{ item.label }}</span>
      </button>
    </nav>

    <!-- User footer -->
    <div class="sidebar-user">
      <div class="user-avatar" aria-hidden="true">{{ initials }}</div>
      <div class="user-info">
        <p class="user-name">{{ auth.user?.displayName }}</p>
        <p class="user-role">{{ roleLabel }}</p>
      </div>
      <button type="button" class="user-logout" title="Sign out" aria-label="Sign out" @click="auth.signOut()">
        <AppIcon name="logout" :size="16" />
      </button>
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
  overflow: hidden;
}

/* Logo */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-5) var(--space-4);
  border-bottom: 1px solid var(--color-sidebar-border);
  flex-shrink: 0;
}

.logo-mark {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--indigo-500), var(--indigo-700));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
}

.logo-mark span {
  font-size: 11px;
  font-weight: var(--font-bold);
  color: white;
  letter-spacing: var(--tracking-wide);
}

.logo-name {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: white;
  letter-spacing: var(--tracking-tight);
}

/* Nav */
.sidebar-nav {
  padding: var(--space-5) var(--space-3) var(--space-2);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  flex-shrink: 0;
}

.sidebar-nav-secondary {
  padding: var(--space-2) var(--space-3) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  flex-shrink: 0;
  border-top: 1px solid var(--color-sidebar-border);
}

.nav-group-label {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: var(--color-sidebar-text-dim);
  padding: 0 var(--space-3);
  margin-bottom: var(--space-2);
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  color: var(--color-sidebar-text);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.nav-item:hover {
  background-color: var(--color-sidebar-hover);
  color: white;
}

.nav-item--active {
  background-color: var(--color-sidebar-active-bg);
  color: white;
}

.nav-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  color: var(--color-sidebar-text-dim);
  transition: color var(--transition-fast);
}

.nav-item:hover .nav-item-icon,
.nav-item--active .nav-item-icon {
  color: var(--color-sidebar-active);
}

.nav-item-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-active-bar {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 18px;
  background: var(--color-sidebar-active);
  border-radius: var(--radius-full) 0 0 var(--radius-full);
}

/* User footer */
.sidebar-user {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-4);
  border-top: 1px solid var(--color-sidebar-border);
  flex-shrink: 0;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--indigo-500), var(--indigo-700));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  color: white;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  overflow: hidden;
}

.user-name {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: var(--leading-tight);
}

.user-role {
  font-size: var(--text-xs);
  color: var(--color-sidebar-text-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.user-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  color: var(--color-sidebar-text-dim);
  background: none;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.user-logout:hover {
  background-color: var(--color-sidebar-hover);
  color: var(--color-error);
}
</style>
