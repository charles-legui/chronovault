<script setup lang="ts">
import { ref } from 'vue'
import { useRelativeDate } from '@/composables/useRelativeDate'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps<{
  id:         string
  title:      string
  coverUrl?:  string
  mediaCount: number
  updatedAt:  string
  isShared:   boolean
}>()

const emit = defineEmits<{
  click:  [id: string]
  open:   [id: string]
  rename: [id: string]
  share:  [id: string]
  delete: [id: string]
}>()

const { relativeDate } = useRelativeDate()

const menuOpen = ref(false)
const menuRef  = ref<HTMLElement | null>(null)

function formatCount(n: number): string {
  return new Intl.NumberFormat('fr').format(n)
}

function onCardClick() {
  if (!menuOpen.value) emit('click', props.id)
}

function toggleMenu(e: MouseEvent) {
  e.stopPropagation()
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

function menuAction(event: string, e: MouseEvent) {
  e.stopPropagation()
  emit(event as 'open' | 'rename' | 'share' | 'delete', props.id)
  menuOpen.value = false
}

// Close on outside click via focusout
function onMenuFocusOut(e: FocusEvent) {
  if (!menuRef.value?.contains(e.relatedTarget as Node)) {
    menuOpen.value = false
  }
}
</script>

<template>
  <article
    class="album-card"
    tabindex="0"
    :aria-label="`Album : ${title}`"
    @click="onCardClick"
    @keydown.enter="emit('click', id)"
    @keydown.space.prevent="emit('click', id)"
  >
    <!-- ── Cover ─────────────────────────────────── -->
    <div class="cover">

      <!-- Image or placeholder -->
      <img
        v-if="coverUrl"
        :src="coverUrl"
        :alt="''"
        class="cover-img"
        loading="lazy"
        draggable="false"
      />
      <div v-else class="cover-placeholder" aria-hidden="true">
        <AppIcon name="albums" :size="40" />
      </div>

      <!-- Bottom gradient -->
      <div class="cover-gradient" aria-hidden="true" />

      <!-- Shared badge ── top left -->
      <span
        v-if="isShared"
        class="badge badge--shared"
        title="Album partagé"
        aria-label="Album partagé"
      >
        <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor"
             stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <circle cx="18" cy="5"  r="3"/>
          <circle cx="6"  cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>
        </svg>
        Partagé
      </span>

      <!-- Actions menu button ── top right -->
      <div
        ref="menuRef"
        class="menu-wrapper"
        @focusout="onMenuFocusOut"
      >
        <button
          type="button"
          class="btn-menu"
          :aria-label="`Actions pour l'album ${title}`"
          :aria-expanded="menuOpen"
          aria-haspopup="menu"
          @click="toggleMenu"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
            <circle cx="12" cy="5"  r="1.5"/>
            <circle cx="12" cy="12" r="1.5"/>
            <circle cx="12" cy="19" r="1.5"/>
          </svg>
        </button>

        <Transition name="menu">
          <div v-if="menuOpen" class="dropdown" role="menu">
            <button class="dropdown-item" role="menuitem" @click="menuAction('open',   $event)">
              <AppIcon name="albums"   :size="14" /> Ouvrir
            </button>
            <button class="dropdown-item" role="menuitem" @click="menuAction('rename', $event)">
              <AppIcon name="settings" :size="14" /> Renommer
            </button>
            <button class="dropdown-item" role="menuitem" @click="menuAction('share',  $event)">
              <AppIcon name="heart"    :size="14" />
              {{ isShared ? 'Arrêter le partage' : 'Partager' }}
            </button>
            <div class="dropdown-divider" />
            <button class="dropdown-item dropdown-item--danger" role="menuitem"
                    @click="menuAction('delete', $event)">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
                   stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
                <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
              </svg>
              Supprimer
            </button>
          </div>
        </Transition>
      </div>

      <!-- Media count pill ── bottom right (on cover) -->
      <span class="cover-count" aria-hidden="true">
        {{ formatCount(mediaCount) }}
        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor"
             stroke-width="2" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/>
          <path d="m21 15-5-5L5 21"/>
        </svg>
      </span>
    </div>

    <!-- ── Body ──────────────────────────────────── -->
    <div class="body">
      <h3 class="album-title">{{ title }}</h3>

      <div class="album-meta">
        <span class="meta-count">
          {{ formatCount(mediaCount) }}&thinsp;élément{{ mediaCount !== 1 ? 's' : '' }}
        </span>
        <span class="meta-dot" aria-hidden="true">·</span>
        <time
          class="meta-date"
          :datetime="updatedAt"
          :title="`Mis à jour le ${new Date(updatedAt).toLocaleDateString('fr')}`"
        >
          {{ relativeDate(updatedAt) }}
        </time>
      </div>
    </div>
  </article>
</template>

<style scoped>
/* ── Card shell ───────────────────────────────────���──── */
.album-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: visible;          /* allow dropdown to overflow */
  cursor: pointer;
  display: flex;
  flex-direction: column;
  outline: none;
  box-shadow: var(--shadow-sm);
  transition:
    box-shadow  var(--transition-base),
    transform   var(--transition-base),
    border-color var(--transition-base);
}

.album-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
  border-color: var(--color-border-strong);
}

.album-card:focus-visible {
  box-shadow: var(--shadow-focus);
  border-color: var(--color-primary);
}

/* ── Cover ──────────────────────────────────────��────── */
.cover {
  position: relative;
  aspect-ratio: 3 / 2;
  background: var(--color-surface-overlay);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--duration-slower) var(--ease-out);
  will-change: transform;
}

.album-card:hover .cover-img {
  transform: scale(1.05);
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
  background: linear-gradient(135deg, var(--neutral-100), var(--neutral-200));
}

.cover-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0)   40%,
    rgba(0,0,0,0.52) 100%
  );
  pointer-events: none;
  border-radius: inherit;
}

/* Badges & pills ─ shared positioning */
.badge {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px var(--space-2) 3px var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  line-height: 1;
  white-space: nowrap;
}

.badge--shared {
  background: rgba(255, 255, 255, 0.90);
  backdrop-filter: blur(8px);
  color: var(--color-text);
  box-shadow: var(--shadow-xs);
}

/* Cover count ── bottom right */
.cover-count {
  position: absolute;
  bottom: var(--space-3);
  right: var(--space-3);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px var(--space-2);
  background: rgba(0, 0, 0, 0.48);
  backdrop-filter: blur(6px);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: white;
  line-height: 1;
  pointer-events: none;
}

/* ── Actions menu ──���─────────────────────────────────── */
.menu-wrapper {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  z-index: var(--z-raised);
}

.btn-menu {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.90);
  backdrop-filter: blur(8px);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  box-shadow: var(--shadow-xs);
  transition:
    opacity   var(--transition-fast),
    background var(--transition-fast);
}

/* Show on card hover OR when menu is already open */
.album-card:hover .btn-menu,
.album-card:focus-within .btn-menu {
  opacity: 1;
}

.btn-menu:hover {
  background: white;
}

.btn-menu:focus-visible {
  opacity: 1;
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

/* Dropdown */
.dropdown {
  position: absolute;
  top: calc(100% + var(--space-1));
  right: 0;
  min-width: 172px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--space-1) 0;
  z-index: var(--z-dropdown);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  text-align: left;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.dropdown-item:hover {
  background: var(--color-surface-raised);
  color: var(--color-text);
}

.dropdown-item--danger:hover {
  background: var(--color-error-bg);
  color: var(--color-error);
}

.dropdown-divider {
  height: 1px;
  background: var(--color-border-subtle);
  margin: var(--space-1) 0;
}

/* Dropdown transition */
.menu-enter-active,
.menu-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out),
              transform var(--duration-fast) var(--ease-out);
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.97);
  transform-origin: top right;
}

/* ── Body ────────────────────────────────────────��───── */
.body {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.album-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-text);
  line-height: var(--leading-snug);
  letter-spacing: var(--tracking-tight);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.meta-count {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--color-text-secondary);
}

.meta-dot {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  line-height: 1;
}

.meta-date {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}
</style>
