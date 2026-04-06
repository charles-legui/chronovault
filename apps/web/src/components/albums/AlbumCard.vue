<script setup lang="ts">
import { ref } from 'vue'
import { useRelativeDate } from '@/composables/useRelativeDate'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { Album } from '@/types/albums'

const props = defineProps<{
  album: Album
}>()

const emit = defineEmits<{
  click:  [id: string]
  edit:   [id: string]
  delete: [id: string]
}>()

const { relativeDate, shortDate } = useRelativeDate()

const menuOpen = ref(false)
const menuRef  = ref<HTMLElement | null>(null)

function onCardClick() {
  if (!menuOpen.value) emit('click', props.album.id)
}

function toggleMenu(e: MouseEvent) {
  e.stopPropagation()
  menuOpen.value = !menuOpen.value
}

function onMenuFocusOut(e: FocusEvent) {
  if (!menuRef.value?.contains(e.relatedTarget as Node)) {
    menuOpen.value = false
  }
}

function menuAction(action: 'edit' | 'delete', e: MouseEvent) {
  e.stopPropagation()
  menuOpen.value = false
  emit(action, props.album.id)
}
</script>

<template>
  <article
    class="album-card"
    tabindex="0"
    :aria-label="`Album : ${album.title}`"
    @click="onCardClick"
    @keydown.enter="emit('click', album.id)"
    @keydown.space.prevent="emit('click', album.id)"
  >
    <!-- Cover -->
    <div class="cover">
      <img
        v-if="album.coverImageUrl"
        :src="album.coverImageUrl"
        alt=""
        class="cover-img"
        loading="lazy"
        draggable="false"
      />
      <div v-else class="cover-placeholder" aria-hidden="true">
        <AppIcon name="albums" :size="40" />
      </div>

      <div class="cover-gradient" aria-hidden="true" />

      <!-- Event date badge -->
      <span
        v-if="album.eventDate"
        class="badge badge--date"
        :title="`Événement : ${shortDate(album.eventDate)}`"
      >
        <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <path d="M16 2v4M8 2v4M3 10h18"/>
        </svg>
        {{ shortDate(album.eventDate) }}
      </span>

      <!-- Actions menu -->
      <div
        ref="menuRef"
        class="menu-wrapper"
        @focusout="onMenuFocusOut"
      >
        <button
          type="button"
          class="btn-menu"
          :aria-label="`Actions pour l'album ${album.title}`"
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
            <button class="dropdown-item" role="menuitem"
                    @click.stop="emit('click', album.id); menuOpen = false">
              <AppIcon name="albums" :size="14" /> Ouvrir
            </button>
            <button class="dropdown-item" role="menuitem"
                    @click="menuAction('edit', $event)">
              <AppIcon name="settings" :size="14" /> Modifier
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
    </div>

    <!-- Body -->
    <div class="body">
      <h3 class="album-title">{{ album.title }}</h3>

      <p v-if="album.description" class="album-description">{{ album.description }}</p>

      <!-- Tags -->
      <div v-if="album.tags.length > 0" class="tags">
        <span v-for="tag in album.tags.slice(0, 4)" :key="tag" class="tag">{{ tag }}</span>
        <span v-if="album.tags.length > 4" class="tag tag--more">+{{ album.tags.length - 4 }}</span>
      </div>

      <time
        class="album-date"
        :datetime="album.updatedAt"
        :title="`Mis à jour le ${new Date(album.updatedAt).toLocaleDateString('fr')}`"
      >
        {{ relativeDate(album.updatedAt) }}
      </time>
    </div>
  </article>
</template>

<style scoped>
/* Card shell */
.album-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: visible;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  outline: none;
  box-shadow: var(--shadow-sm);
  transition:
    box-shadow    var(--transition-base),
    transform     var(--transition-base),
    border-color  var(--transition-base);
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

/* Cover */
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
  background: linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.45) 100%);
  pointer-events: none;
  border-radius: inherit;
}

/* Event date badge */
.badge {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  line-height: 1;
  white-space: nowrap;
}

.badge--date {
  background: rgba(255, 255, 255, 0.90);
  backdrop-filter: blur(8px);
  color: var(--color-text);
  box-shadow: var(--shadow-xs);
}

/* Actions menu */
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
  transition: opacity var(--transition-fast), background var(--transition-fast);
}

.album-card:hover .btn-menu,
.album-card:focus-within .btn-menu {
  opacity: 1;
}

.btn-menu:hover { background: white; }

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
  min-width: 160px;
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

/* Body */
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-description {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Tags */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.tag {
  display: inline-block;
  padding: 2px var(--space-2);
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  line-height: var(--leading-tight);
  white-space: nowrap;
}

.tag--more {
  background: var(--color-surface-raised);
  color: var(--color-text-tertiary);
}

.album-date {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}
</style>
