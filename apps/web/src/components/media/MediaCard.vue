<script setup lang="ts">
import type { MediaType } from '@/types'

const props = defineProps<{
  id:           string
  type:         MediaType
  thumbnailUrl: string
  title?:       string
  duration?:    number   // seconds, video only
  takenAt?:     string
  selected?:    boolean
}>()

const emit = defineEmits<{
  click:  [id: string]
  select: [id: string, value: boolean]
}>()

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('fr', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(iso))
}

function onCheckbox(e: MouseEvent) {
  e.stopPropagation()
  emit('select', props.id, !props.selected)
}
</script>

<template>
  <article
    class="media-card"
    :class="{
      'media-card--video':    type === 'video',
      'media-card--selected': selected,
    }"
    tabindex="0"
    :aria-label="title ?? (type === 'video' ? 'Vidéo' : 'Photo')"
    :aria-pressed="selected"
    @click="emit('click', id)"
    @keydown.enter="emit('click', id)"
    @keydown.space.prevent="emit('click', id)"
  >
    <!-- Thumbnail -->
    <div class="thumb">
      <img
        :src="thumbnailUrl"
        :alt="title ?? ''"
        class="thumb-img"
        loading="lazy"
        draggable="false"
      />

      <!-- Overlay (hover + selected) -->
      <div class="thumb-overlay" aria-hidden="true" />

      <!-- Selection checkbox -->
      <button
        type="button"
        class="btn-select"
        :aria-label="selected ? 'Désélectionner' : 'Sélectionner'"
        :aria-checked="selected"
        role="checkbox"
        @click="onCheckbox"
      >
        <svg
          v-if="selected"
          viewBox="0 0 14 14" width="9" height="9"
          fill="none" stroke="white" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M2 7l3.5 3.5L12 3"/>
        </svg>
      </button>

      <!-- ── Video-specific overlays ── -->
      <template v-if="type === 'video'">
        <!-- Play button -->
        <div class="play-btn" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="white" aria-hidden="true">
            <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l10.5-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14z"/>
          </svg>
        </div>

        <!-- Duration badge -->
        <span class="duration-badge" aria-label="`Durée : ${formatDuration(duration ?? 0)}`">
          <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor"
               stroke-width="2" aria-hidden="true">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          {{ formatDuration(duration ?? 0) }}
        </span>
      </template>

      <!-- ── Photo type badge (shown only on hover) ── -->
      <span v-else class="type-badge" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor"
             stroke-width="2" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/>
          <path d="m21 15-5-5L5 21"/>
        </svg>
      </span>
    </div>

    <!-- Caption (visible on hover or when titled) -->
    <div v-if="title || takenAt" class="caption">
      <p v-if="title" class="caption-title">{{ title }}</p>
      <time v-if="takenAt" class="caption-date" :datetime="takenAt">
        {{ formatDate(takenAt) }}
      </time>
    </div>
  </article>
</template>

<style scoped>
/* ── Shell ────────────────────────────────────────────── */
.media-card {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  outline: none;
  background: var(--color-surface-overlay);
  display: flex;
  flex-direction: column;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.media-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.media-card:focus-visible {
  box-shadow: var(--shadow-focus);
}

.media-card--selected {
  box-shadow: 0 0 0 3px var(--color-primary);
}

/* ── Thumbnail ─────────────────────────────────────────── */
.thumb {
  position: relative;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  background: var(--color-surface-overlay);
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--duration-slower) var(--ease-out);
  will-change: transform;
}

.media-card:hover .thumb-img {
  transform: scale(1.04);
}

/* Gradient overlay */
.thumb-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.18) 0%,
    rgba(0,0,0,0)    35%,
    rgba(0,0,0,0)    60%,
    rgba(0,0,0,0.45) 100%
  );
  opacity: 0;
  transition: opacity var(--transition-base);
  pointer-events: none;
}

.media-card:hover .thumb-overlay,
.media-card--selected .thumb-overlay {
  opacity: 1;
}

/* ── Select checkbox ──────────────────────────────────── */
.btn-select {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  width: 22px;
  height: 22px;
  border-radius: var(--radius-full);
  border: 2px solid rgba(255, 255, 255, 0.85);
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-fast),
              background-color var(--transition-fast),
              transform var(--transition-fast);
  z-index: 1;
}

.media-card:hover .btn-select,
.media-card--selected .btn-select {
  opacity: 1;
}

.media-card--selected .btn-select {
  background: var(--color-primary);
  border-color: var(--color-primary);
  transform: scale(1.1);
}

.btn-select:hover {
  background: rgba(255, 255, 255, 0.3);
}

.media-card--selected .btn-select:hover {
  background: var(--color-primary-hover);
}

/* ── Video — play button ──────────────────────────────── */
.play-btn {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.play-btn::before {
  content: '';
  position: absolute;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background: rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(6px);
  transition: transform var(--transition-base), background-color var(--transition-base);
}

.media-card:hover .play-btn::before {
  transform: scale(1.1);
  background: rgba(0, 0, 0, 0.6);
}

.play-btn svg {
  position: relative;
  z-index: 1;
  transform: translateX(1px);
  filter: drop-shadow(0 1px 3px rgba(0,0,0,0.3));
}

/* ── Duration badge ───────────────────────────────────── */
.duration-badge {
  position: absolute;
  bottom: var(--space-2);
  right: var(--space-2);
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px var(--space-2);
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: white;
  line-height: 1;
  letter-spacing: 0.02em;
}

/* ── Photo type badge ─────────────────────────────────── */
.type-badge {
  position: absolute;
  bottom: var(--space-2);
  right: var(--space-2);
  display: inline-flex;
  align-items: center;
  padding: 3px 5px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  border-radius: var(--radius-sm);
  color: rgba(255, 255, 255, 0.85);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.media-card:hover .type-badge {
  opacity: 1;
}

/* ── Caption ──────────────────────────────────────────── */
.caption {
  padding: var(--space-2) var(--space-3) var(--space-3);
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border-subtle);
}

.caption-title {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: var(--leading-tight);
}

.caption-date {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}
</style>
