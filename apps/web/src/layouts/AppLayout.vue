<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'

const route = useRoute()
const ui    = useUiStore()

// Close mobile sidebar on route change
watch(() => route.path, () => ui.closeMobileSidebar())
</script>

<template>
  <div class="app-shell">

    <!-- Desktop sidebar -->
    <AppSidebar class="sidebar-desktop" />

    <!-- Mobile sidebar -->
    <Transition name="sidebar-slide">
      <div v-if="ui.mobileSidebarOpen" class="sidebar-mobile-wrapper">
        <AppSidebar />
      </div>
    </Transition>

    <!-- Mobile overlay -->
    <Transition name="fade">
      <div
        v-if="ui.mobileSidebarOpen"
        class="sidebar-overlay"
        aria-hidden="true"
        @click="ui.closeMobileSidebar()"
      />
    </Transition>

    <!-- Main area -->
    <div class="app-main">
      <AppTopbar />
      <main class="app-content">
        <div class="app-content-inner">
          <RouterView />
        </div>
      </main>
    </div>

  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-bg);
}

/* Desktop sidebar — always visible */
.sidebar-desktop {
  display: flex;
}

/* Main area */
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.app-content {
  flex: 1;
  overflow-y: auto;
}

.app-content-inner {
  max-width: var(--content-max-width);
  padding: var(--space-8) var(--space-8);
  margin: 0 auto;
  width: 100%;
}

/* Mobile sidebar wrapper */
.sidebar-mobile-wrapper {
  position: fixed;
  inset-y: 0;
  left: 0;
  z-index: var(--z-modal);
  display: flex;
}

/* Overlay */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  z-index: calc(var(--z-modal) - 1);
  background-color: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar-desktop {
    display: none;
  }

  .app-content-inner {
    padding: var(--space-6) var(--space-4);
  }
}

/* Transitions */
.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: transform var(--duration-slow) var(--ease-out);
}

.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  transform: translateX(-100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-slow) var(--ease-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
