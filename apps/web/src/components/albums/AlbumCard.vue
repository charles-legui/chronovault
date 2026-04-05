<script setup lang="ts">
import { useRelativeDate } from '@/composables/useRelativeDate'
import type { Album } from '@/types'

defineProps<{ album: Album }>()
const emit = defineEmits<{ click: [id: string] }>()

const { relativeDate } = useRelativeDate()

function formatCount(n: number): string {
  return new Intl.NumberFormat('fr').format(n)
}
</script>

<template>
  <article
    class="album-card"
    role="button"
    tabindex="0"
    :aria-label="`Ouvrir l'album ${album.title}`"
    @click="emit('click', album.id)"
    @keydown.enter="emit('click', album.id)"
    @keydown.space.prevent="emit('click', album.id)"
  >
    <!-- Cover -->
    <div class="album-cover">
      <img
        v-if="album.coverUrl"
        :src="album.coverUrl"
        :alt="`Couverture de l'album ${album.title}`"
        class="cover-img"
        loading="lazy"
      />
      <div v-else class="cover-placeholder" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/>
          <path d="m21 15-5-5L5 21"/>
        </svg>
      </div>

      <!-- Gradient overlay -->
      <div class="cover-gradient" aria-hidden="true" />

      <!-- Shared badge -->
      <span v-if="album.isShared" class="badge-shared" aria-label="Album partagé">
        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>
        </svg>
        <span>Partagé</span>
      </span>

      <!-- Media count pill (overlay) -->
      <span class="cover-count" aria-hidden="true">
        {{ formatCount(album.mediaCount) }}
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/>
          <path d="m21 15-5-5L5 21"/>
        </svg>
      </span>
    </div>

    <!-- Card body -->
    <div class="album-body">
      <div class="album-meta-row">
        <h3 class="album-title">{{ album.title }}</h3>
      </div>

      <p v-if="album.description" class="album-description">
        {{ album.description }}
      </p>

      <div class="album-footer">
        <span class="album-count">
          {{ formatCount(album.mediaCount) }} élément{{ album.mediaCount !== 1 ? 's' : '' }}
        </span>
        <span class="album-sep" aria-hidden="true">·</span>
        <time
          class="album-date"
          :datetime="album.updatedAt"
          :title="`Mis à jour le ${new Date(album.updatedAt).toLocaleDateString('fr')}`"
        >
          {{ relativeDate(album.updatedAt) }}
        </time>
      </div>
    </div>
  </article>
</template>

<style scoped>
.album-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
  transition:
    box-shadow var(--transition-base),
    transform var(--transition-base),
    border-color var(--transition-base);
  outline: none;
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
.album-cover {
  position: relative;
  aspect-ratio: 3 / 2;
  background-color: var(--color-surface-overlay);
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--duration-slower) var(--ease-out);
}

.album-card:hover .cover-img {
  transform: scale(1.04);
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
    transparent 45%,
    rgba(0, 0, 0, 0.5) 100%
  );
  pointer-events: none;
}

/* Shared badge */
.badge-shared {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px var(--space-2);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(6px);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--color-text);
  line-height: 1;
  box-shadow: var(--shadow-xs);
}

/* Media count (on cover, bottom right) */
.cover-count {
  position: absolute;
  bottom: var(--space-3);
  right: var(--space-3);
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px var(--space-2);
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: white;
  line-height: 1;
}

/* Body */
.album-body {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex: 1;
}

.album-meta-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2);
}

.album-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-text);
  line-height: var(--leading-snug);
  letter-spacing: var(--tracking-tight);
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.album-description {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  flex: 1;
}

.album-footer {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: auto;
  padding-top: var(--space-1);
}

.album-count {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--color-text-secondary);
}

.album-sep {
  color: var(--color-text-tertiary);
  font-size: var(--text-xs);
}

.album-date {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}
</style>
