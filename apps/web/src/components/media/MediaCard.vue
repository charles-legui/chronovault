<script setup lang="ts">
import { ref } from 'vue'
import type { MediaType } from '@/types'

// ── Props ────────────────────────────────────────────────
const props = defineProps<{
  id:           string
  type:         MediaType
  thumbnailUrl: string
  title?:       string
  duration?:    number    // seconds — video only
  takenAt?:     string
  selected?:    boolean
  favorite?:    boolean
}>()

// ── Emits ────────────────────────────────────────────────
const emit = defineEmits<{
  click:     [id: string]
  select:    [id: string, value: boolean]
  download:  [id: string]
  favorite:  [id: string]
  rename:    [id: string]
  delete:    [id: string]
}>()

// ── Menu state ───────────────────────────────────────────
const menuOpen = ref(false)
const menuRef  = ref<HTMLElement | null>(null)

function openMenu(e: MouseEvent) {
  e.stopPropagation()
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

function onMenuFocusOut(e: FocusEvent) {
  if (!menuRef.value?.contains(e.relatedTarget as Node)) closeMenu()
}

function menuAction(action: 'download' | 'favorite' | 'rename' | 'delete', e: MouseEvent) {
  e.stopPropagation()
  emit(action, props.id)
  closeMenu()
}

// ── Checkbox ─────────────────────────────────────────────
function onSelect(e: MouseEvent) {
  e.stopPropagation()
  emit('select', props.id, !props.selected)
}

// ── Helpers ──────────────────────────────────────────────
function fmtDuration(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat('fr', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(iso))
}
</script>

<template>
  <article
    class="mc"
    :class="{
      'mc--video':    type === 'video',
      'mc--selected': selected,
    }"
    tabindex="0"
    :aria-label="[title, type === 'video' ? 'Vidéo' : 'Photo', takenAt ? fmtDate(takenAt) : ''].filter(Boolean).join(' · ')"
    :aria-pressed="selected"
    @click="emit('click', id)"
    @keydown.enter="emit('click', id)"
    @keydown.space.prevent="emit('click', id)"
  >

    <!-- ═══════════════════════════════════
         THUMBNAIL
    ════════════════════════════════════ -->
    <div class="mc-thumb">

      <img
        :src="thumbnailUrl"
        :alt="title ?? ''"
        class="mc-img"
        loading="lazy"
        draggable="false"
      />

      <!-- Dark gradient, on hover + selected -->
      <div class="mc-overlay" aria-hidden="true" />

      <!-- ── Top-left: checkbox ── -->
      <button
        type="button"
        role="checkbox"
        class="mc-checkbox"
        :aria-label="selected ? 'Désélectionner' : 'Sélectionner'"
        :aria-checked="selected"
        @click="onSelect"
      >
        <Transition name="check">
          <svg
            v-if="selected"
            viewBox="0 0 10 10" width="9" height="9"
            fill="none" stroke="white" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M1.5 5.5 4 8l4.5-6"/>
          </svg>
        </Transition>
      </button>

      <!-- ── Top-right: type chip ── -->
      <span
        class="mc-type-chip"
        :class="type === 'video' ? 'mc-type-chip--video' : 'mc-type-chip--photo'"
        aria-hidden="true"
      >
        <!-- Camera icon for photo -->
        <template v-if="type === 'photo'">
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          Photo
        </template>
        <!-- Video camera icon for video -->
        <template v-else>
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <polygon points="23 7 16 12 23 17 23 7"/>
            <rect x="1" y="5" width="15" height="14" rx="2"/>
          </svg>
          Vidéo
        </template>
      </span>

      <!-- ── Video: play button ── -->
      <div v-if="type === 'video'" class="mc-play" aria-hidden="true">
        <div class="mc-play-ring">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="white" aria-hidden="true">
            <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l10.5-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14z"/>
          </svg>
        </div>
      </div>

      <!-- ── Video: duration badge ── -->
      <span
        v-if="type === 'video' && duration != null"
        class="mc-duration"
        :aria-label="`Durée : ${fmtDuration(duration)}`"
      >
        {{ fmtDuration(duration) }}
      </span>

      <!-- ── Favorite star ── -->
      <button
        v-if="favorite"
        type="button"
        class="mc-favorite"
        aria-label="Retiré des favoris"
        @click.stop="emit('favorite', id)"
      >
        <svg viewBox="0 0 24 24" width="13" height="13" fill="#fbbf24" stroke="#fbbf24"
             stroke-width="1.5" aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </button>

    </div><!-- /mc-thumb -->

    <!-- ═══════════════════════════════════
         FOOTER
    ════════════════════════════════════ -->
    <div class="mc-footer">

      <!-- Title / date -->
      <div class="mc-info">
        <p v-if="title" class="mc-title">{{ title }}</p>
        <time v-if="takenAt" class="mc-date" :datetime="takenAt">
          {{ fmtDate(takenAt) }}
        </time>
        <p v-if="!title && !takenAt" class="mc-date">Sans titre</p>
      </div>

      <!-- ⋮ Actions menu -->
      <div
        ref="menuRef"
        class="mc-menu-wrap"
        @focusout="onMenuFocusOut"
      >
        <button
          type="button"
          class="mc-menu-btn"
          :aria-label="`Actions pour ce ${type === 'video' ? 'vidéo' : 'photo'}`"
          :aria-expanded="menuOpen"
          aria-haspopup="menu"
          @click="openMenu"
        >
          <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor" aria-hidden="true">
            <circle cx="10" cy="4"  r="1.5"/>
            <circle cx="10" cy="10" r="1.5"/>
            <circle cx="10" cy="16" r="1.5"/>
          </svg>
        </button>

        <Transition name="dropdown">
          <div v-if="menuOpen" class="mc-dropdown" role="menu">
            <button
              class="mc-dropdown-item"
              role="menuitem"
              @click="menuAction('download', $event)"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
                   stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Télécharger
            </button>

            <button
              class="mc-dropdown-item"
              role="menuitem"
              @click="menuAction('favorite', $event)"
            >
              <svg viewBox="0 0 24 24" width="14" height="14"
                   :fill="favorite ? '#fbbf24' : 'none'"
                   stroke="#fbbf24" stroke-width="1.5" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              {{ favorite ? 'Retirer des favoris' : 'Ajouter aux favoris' }}
            </button>

            <button
              class="mc-dropdown-item"
              role="menuitem"
              @click="menuAction('rename', $event)"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
                   stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Renommer
            </button>

            <div class="mc-dropdown-sep" />

            <button
              class="mc-dropdown-item mc-dropdown-item--danger"
              role="menuitem"
              @click="menuAction('delete', $event)"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
                   stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
                <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
              </svg>
              Supprimer
            </button>
          </div>
        </Transition>
      </div>

    </div><!-- /mc-footer -->
  </article>
</template>

<style scoped>
/* ── Shell ────────────────────────────────────────────────
   overflow: visible so the dropdown can bleed outside
   ────────────────────────────────────────────────────── */
.mc {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: visible;       /* ← keeps dropdown visible */
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  cursor: pointer;
  outline: none;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xs);
  transition:
    transform      var(--transition-base),
    box-shadow     var(--transition-base),
    border-color   var(--transition-base);
}

.mc:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-strong);
}

.mc:focus-visible {
  box-shadow: var(--shadow-focus);
  border-color: var(--color-primary);
}

.mc--selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary),
              var(--shadow-md);
}

/* ── Thumbnail ───────────────────────────────────────────
   overflow: hidden HERE — clips the zoom animation
   ────────────────────────────────────────────────────── */
.mc-thumb {
  position: relative;
  aspect-ratio: 3 / 2;
  overflow: hidden;               /* ← clips zoom, not dropdown */
  background: var(--color-surface-overlay);
  border-radius: calc(var(--radius-lg) - 1px)
                 calc(var(--radius-lg) - 1px)
                 0 0;
}

.mc-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--duration-slower) var(--ease-out);
  will-change: transform;
}

.mc:hover .mc-img {
  transform: scale(1.05);
}

/* ── Dark overlay ────────────────────────────────────── */
.mc-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.22)  0%,
    rgba(0,0,0,0)     40%,
    rgba(0,0,0,0)     60%,
    rgba(0,0,0,0.38)  100%
  );
  opacity: 0;
  transition: opacity var(--transition-base);
  pointer-events: none;
}

.mc:hover .mc-overlay,
.mc--selected .mc-overlay {
  opacity: 1;
}

/* ── Checkbox (top-left) ─────────────────────────────── */
.mc-checkbox {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  z-index: 2;
  width: 22px;
  height: 22px;
  border-radius: var(--radius-full);
  border: 2px solid rgba(255,255,255,0.8);
  background: rgba(0,0,0,0.22);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition:
    opacity          var(--transition-fast),
    background-color var(--transition-fast),
    border-color     var(--transition-fast),
    transform        var(--transition-fast);
}

.mc:hover .mc-checkbox,
.mc--selected .mc-checkbox {
  opacity: 1;
}

.mc--selected .mc-checkbox {
  background: var(--color-primary);
  border-color: var(--color-primary);
  transform: scale(1.08);
}

.mc-checkbox:hover:not(.mc--selected .mc-checkbox) {
  background: rgba(255,255,255,0.25);
}

/* Checkmark animation */
.check-enter-active { transition: transform 0.15s var(--ease-spring), opacity 0.1s; }
.check-enter-from   { transform: scale(0); opacity: 0; }

/* ── Type chip (top-right) ───────────────────────────── */
.mc-type-chip {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 7px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  line-height: 1;
  backdrop-filter: blur(6px);
  transition: opacity var(--transition-fast);
}

.mc-type-chip--photo {
  background: rgba(255,255,255,0.18);
  border: 1px solid rgba(255,255,255,0.25);
  color: rgba(255,255,255,0.9);
  opacity: 0;                       /* shown on hover only */
}

.mc-type-chip--video {
  background: rgba(0,0,0,0.48);
  border: 1px solid rgba(255,255,255,0.12);
  color: white;
  opacity: 1;                       /* always visible for video */
}

.mc:hover .mc-type-chip--photo {
  opacity: 1;
}

/* ── Play button (video center) ──────────────────────── */
.mc-play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.mc-play-ring {
  width: 46px;
  height: 46px;
  border-radius: var(--radius-full);
  background: rgba(0,0,0,0.40);
  backdrop-filter: blur(8px);
  border: 1.5px solid rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-base),
              background-color var(--transition-base);
}

.mc:hover .mc-play-ring {
  transform: scale(1.12);
  background: rgba(0,0,0,0.60);
}

.mc-play-ring svg {
  transform: translateX(2px);
  filter: drop-shadow(0 1px 4px rgba(0,0,0,0.4));
}

/* ── Duration badge (video, bottom-left) ─────────────── */
.mc-duration {
  position: absolute;
  bottom: var(--space-2);
  left: var(--space-2);
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px var(--space-2);
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(4px);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: white;
  letter-spacing: 0.03em;
  line-height: 1;
}

/* ── Favorite star (bottom-right) ───────────────────── */
.mc-favorite {
  position: absolute;
  bottom: var(--space-2);
  right: var(--space-2);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: var(--radius-full);
  background: rgba(0,0,0,0.35);
  backdrop-filter: blur(4px);
  transition: transform var(--transition-fast);
}

.mc-favorite:hover {
  transform: scale(1.2);
}

/* ── Footer ──────────────────────────────────────────── */
.mc-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-2) var(--space-2) var(--space-3);
  background: var(--color-surface);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  min-height: 44px;
}

.mc-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mc-title {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: var(--leading-snug);
}

.mc-date {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  line-height: var(--leading-tight);
}

/* ── Actions menu ────────────────────────────────────── */
.mc-menu-wrap {
  position: relative;
  flex-shrink: 0;
}

.mc-menu-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: var(--color-text-tertiary);
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.mc-menu-btn:hover,
.mc-menu-btn[aria-expanded="true"] {
  background: var(--color-surface-overlay);
  color: var(--color-text);
}

.mc-menu-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

/* Dropdown */
.mc-dropdown {
  position: absolute;
  bottom: calc(100% + var(--space-1));
  right: 0;
  min-width: 185px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--space-1) 0;
  z-index: var(--z-dropdown);
}

.mc-dropdown-item {
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

.mc-dropdown-item:hover {
  background: var(--color-surface-raised);
  color: var(--color-text);
}

.mc-dropdown-item--danger:hover {
  background: var(--color-error-bg);
  color: var(--color-error);
}

.mc-dropdown-sep {
  height: 1px;
  background: var(--color-border-subtle);
  margin: var(--space-1) 0;
}

/* Dropdown opens upward (above footer) */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out),
              transform var(--duration-fast) var(--ease-out);
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.97);
  transform-origin: bottom right;
}
</style>
