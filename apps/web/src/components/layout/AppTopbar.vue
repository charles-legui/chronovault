<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUiStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/authStore'
import AppIcon from '@/components/ui/AppIcon.vue'

const ui            = useUiStore()
const auth          = useAuthStore()
const localSearch   = ref(ui.searchQuery)
const profileOpen   = ref(false)
const profileRef    = ref<HTMLElement | null>(null)

const initials = computed(() => {
  const name = auth.user?.displayName ?? ''
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
})

function onSearch() {
  ui.setSearch(localSearch.value)
}

function toggleProfile() {
  profileOpen.value = !profileOpen.value
}

function closeProfile() {
  profileOpen.value = false
}

// Close profile dropdown on outside click
function onClickOutside(e: MouseEvent) {
  if (profileRef.value && !profileRef.value.contains(e.target as Node)) {
    profileOpen.value = false
  }
}

onMounted(()  => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<template>
  <header class="topbar">

    <!-- Mobile menu toggle -->
    <button
      type="button"
      class="mobile-menu-btn"
      aria-label="Ouvrir le menu"
      @click="ui.openMobileSidebar()"
    >
      <AppIcon name="menu" :size="20" />
    </button>

    <!-- Search -->
    <div class="topbar-search">
      <span class="search-icon">
        <AppIcon name="search" :size="16" />
      </span>
      <input
        v-model="localSearch"
        type="search"
        placeholder="Rechercher des albums, médias…"
        class="search-input"
        aria-label="Rechercher"
        @input="onSearch"
      />
      <kbd class="search-shortcut" aria-hidden="true">⌘K</kbd>
    </div>

    <!-- Right actions -->
    <div class="topbar-actions">

      <!-- Add button -->
      <button type="button" class="btn-primary" aria-label="Nouvel album">
        <AppIcon name="plus" :size="16" />
        <span>Nouveau</span>
      </button>

      <!-- Notifications -->
      <button type="button" class="icon-btn" aria-label="Notifications">
        <span class="notif-dot" aria-hidden="true" />
        <AppIcon name="bell" :size="18" />
      </button>

      <!-- Profile dropdown -->
      <div ref="profileRef" class="profile-wrapper">
        <button
          type="button"
          class="profile-trigger"
          :aria-expanded="profileOpen"
          aria-haspopup="menu"
          @click="toggleProfile"
        >
          <div class="profile-avatar" aria-hidden="true">{{ initials }}</div>
          <span class="profile-name">{{ auth.user?.displayName }}</span>
          <span class="profile-chevron" :class="{ 'profile-chevron--open': profileOpen }">
            <AppIcon name="chevron-down" :size="14" />
          </span>
        </button>

        <!-- Dropdown menu -->
        <Transition name="dropdown">
          <div v-if="profileOpen" class="profile-dropdown" role="menu">
            <div class="dropdown-header">
              <p class="dropdown-user-name">{{ auth.user?.displayName }}</p>
              <p class="dropdown-user-email">{{ auth.user?.email }}</p>
            </div>
            <div class="dropdown-divider" />
            <button type="button" class="dropdown-item" role="menuitem" @click="closeProfile">
              <AppIcon name="user" :size="15" />
              <span>Mon profil</span>
            </button>
            <button type="button" class="dropdown-item" role="menuitem" @click="closeProfile">
              <AppIcon name="settings" :size="15" />
              <span>Paramètres</span>
            </button>
            <div class="dropdown-divider" />
            <button type="button" class="dropdown-item dropdown-item--danger" role="menuitem" @click="auth.signOut()">
              <AppIcon name="logout" :size="15" />
              <span>Sign out</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  height: var(--topbar-height);
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: 0 var(--space-6);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  flex-shrink: 0;
}

/* Mobile toggle — hidden on desktop */
.mobile-menu-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  flex-shrink: 0;
  transition: background-color var(--transition-fast);
}

.mobile-menu-btn:hover {
  background-color: var(--color-surface-overlay);
}

/* Search */
.topbar-search {
  position: relative;
  flex: 1;
  max-width: 460px;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
  display: flex;
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 38px;
  padding: 0 var(--space-10) 0 2.25rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background-color: var(--color-surface-raised);
  font-size: var(--text-sm);
  color: var(--color-text);
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast),
              background-color var(--transition-fast);
}

.search-input::placeholder {
  color: var(--color-text-tertiary);
}

.search-input:focus {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
  background-color: var(--color-surface);
}

/* Hide the native clear button */
.search-input::-webkit-search-cancel-button { display: none; }

.search-shortcut {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  font-size: var(--text-xs);
  font-family: var(--font-sans);
  color: var(--color-text-tertiary);
  background: var(--color-surface-overlay);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 1px 6px;
  pointer-events: none;
}

/* Right actions */
.topbar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: auto;
  flex-shrink: 0;
}

/* Primary button */
.btn-primary {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: 36px;
  padding: 0 var(--space-4);
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  white-space: nowrap;
  transition: background-color var(--transition-fast);
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

/* Icon button */
.icon-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.icon-btn:hover {
  background-color: var(--color-surface-overlay);
  color: var(--color-text);
}

.notif-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 7px;
  height: 7px;
  border-radius: var(--radius-full);
  background-color: var(--color-error);
  border: 2px solid var(--color-surface);
}

/* Profile */
.profile-wrapper {
  position: relative;
}

.profile-trigger {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: 36px;
  padding: 0 var(--space-2) 0 var(--space-1);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: background-color var(--transition-fast);
}

.profile-trigger:hover {
  background-color: var(--color-surface-raised);
}

.profile-avatar {
  width: 26px;
  height: 26px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--indigo-500), var(--indigo-700));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: var(--font-bold);
  color: white;
  flex-shrink: 0;
}

.profile-name {
  max-width: 110px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-chevron {
  display: flex;
  color: var(--color-text-tertiary);
  transition: transform var(--transition-fast);
}

.profile-chevron--open {
  transform: rotate(180deg);
}

/* Dropdown */
.profile-dropdown {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  width: 220px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: var(--z-dropdown);
}

.dropdown-header {
  padding: var(--space-4) var(--space-4) var(--space-3);
}

.dropdown-user-name {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text);
  line-height: var(--leading-tight);
}

.dropdown-user-email {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-top: 2px;
}

.dropdown-divider {
  height: 1px;
  background: var(--color-border-subtle);
  margin: var(--space-1) 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  text-align: left;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.dropdown-item:hover {
  background-color: var(--color-surface-raised);
  color: var(--color-text);
}

.dropdown-item--danger:hover {
  background-color: var(--color-error-bg);
  color: var(--color-error);
}

/* Last item padding fix */
.dropdown-item:last-child {
  margin-bottom: var(--space-1);
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out),
              transform var(--duration-fast) var(--ease-out);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}

/* Responsive — mobile */
@media (max-width: 768px) {
  .topbar {
    padding: 0 var(--space-4);
  }

  .mobile-menu-btn {
    display: flex;
  }

  .search-shortcut {
    display: none;
  }

  .profile-name {
    display: none;
  }

  .profile-chevron {
    display: none;
  }

  .profile-trigger {
    border: none;
    padding: 0;
    border-radius: var(--radius-full);
  }

  .btn-primary span {
    display: none;
  }

  .btn-primary {
    width: 36px;
    padding: 0;
    justify-content: center;
  }
}
</style>
