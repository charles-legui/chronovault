<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAlbumsStore } from '@/stores/albumsStore'
import { useRelativeDate } from '@/composables/useRelativeDate'
import AppIcon from '@/components/ui/AppIcon.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const route  = useRoute()
const router = useRouter()
const albums = useAlbumsStore()

const { shortDate, relativeDate } = useRelativeDate()

const albumId = computed(() => route.params.id as string)

onMounted(async () => {
  albums.clearError()
  await albums.fetchAlbumById(albumId.value)
})

async function handleDelete() {
  const album = albums.currentAlbum
  if (!album) return
  if (!window.confirm(`Supprimer l'album « ${album.title} » ? Cette action est irréversible.`)) return
  const ok = await albums.deleteAlbum(albumId.value)
  if (ok) {
    router.push({ name: 'albums' })
  }
}
</script>

<template>
  <div class="detail-page">

    <!-- Loading -->
    <div v-if="albums.loading && !albums.currentAlbum" class="skeleton-hero" aria-busy="true">
      <div class="skeleton-cover" />
      <div class="skeleton-body">
        <div class="skeleton-line skeleton-line--short" />
        <div class="skeleton-line skeleton-line--title" />
        <div class="skeleton-line" />
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="albums.error && !albums.currentAlbum" class="state-card" role="alert">
      <div class="state-icon state-icon--error" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor"
             stroke-width="1.5" stroke-linecap="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
        </svg>
      </div>
      <p class="state-title">Impossible de charger l'album</p>
      <p class="state-subtitle">{{ albums.error }}</p>
      <BaseButton variant="secondary" size="sm" @click="albums.fetchAlbumById(albumId)">
        Réessayer
      </BaseButton>
    </div>

    <!-- Not found -->
    <div v-else-if="!albums.loading && !albums.currentAlbum" class="state-card" role="status">
      <div class="state-icon" aria-hidden="true">
        <AppIcon name="albums" :size="28" />
      </div>
      <p class="state-title">Album introuvable</p>
      <p class="state-subtitle">Cet album n'existe pas ou vous n'y avez pas accès.</p>
      <BaseButton variant="secondary" size="sm" @click="router.push({ name: 'albums' })">
        Retour aux albums
      </BaseButton>
    </div>

    <!-- Album -->
    <template v-else-if="albums.currentAlbum">

      <!-- Hero -->
      <section class="hero">
        <div class="hero-cover">
          <img
            v-if="albums.currentAlbum.coverImageUrl"
            :src="albums.currentAlbum.coverImageUrl"
            :alt="`Couverture de l'album ${albums.currentAlbum.title}`"
            class="hero-img"
          />
          <div v-else class="hero-placeholder" aria-hidden="true">
            <AppIcon name="albums" :size="56" />
          </div>
          <div class="hero-scrim" aria-hidden="true" />
        </div>

        <!-- Back -->
        <button
          type="button"
          class="btn-back"
          aria-label="Retour aux albums"
          @click="router.push({ name: 'albums' })"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Albums
        </button>

        <!-- Title + description -->
        <div class="hero-info">
          <span v-if="albums.currentAlbum.eventDate" class="hero-event-date">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            {{ shortDate(albums.currentAlbum.eventDate) }}
          </span>
          <h1 class="hero-title">{{ albums.currentAlbum.title }}</h1>
          <p v-if="albums.currentAlbum.description" class="hero-description">
            {{ albums.currentAlbum.description }}
          </p>
        </div>

        <!-- Hero actions -->
        <div class="hero-actions">
          <button
            type="button"
            class="btn-hero btn-hero--primary"
            @click="router.push({ name: 'album-edit', params: { id: albumId } })"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Modifier
          </button>
          <button
            type="button"
            class="btn-hero btn-hero--danger"
            :disabled="albums.loading"
            @click="handleDelete"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
                 stroke-width="1.75" stroke-linecap="round" aria-hidden="true">
              <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
            </svg>
            Supprimer
          </button>
        </div>
      </section>

      <!-- Metadata -->
      <section class="meta-section" aria-label="Informations de l'album">

        <!-- Tags -->
        <div v-if="albums.currentAlbum.tags.length > 0" class="meta-row">
          <span class="meta-label">Tags</span>
          <div class="tags">
            <span v-for="tag in albums.currentAlbum.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>

        <!-- Dates -->
        <div class="meta-row">
          <span class="meta-label">Mis à jour</span>
          <time
            class="meta-value"
            :datetime="albums.currentAlbum.updatedAt"
            :title="shortDate(albums.currentAlbum.updatedAt)"
          >
            {{ relativeDate(albums.currentAlbum.updatedAt) }}
          </time>
        </div>

        <div class="meta-row">
          <span class="meta-label">Créé le</span>
          <time
            class="meta-value"
            :datetime="albums.currentAlbum.createdAt"
          >
            {{ shortDate(albums.currentAlbum.createdAt) }}
          </time>
        </div>

        <div v-if="albums.currentAlbum.eventDate" class="meta-row">
          <span class="meta-label">Événement</span>
          <time
            class="meta-value"
            :datetime="albums.currentAlbum.eventDate"
          >
            {{ shortDate(albums.currentAlbum.eventDate) }}
          </time>
        </div>

      </section>

    </template>

  </div>
</template>

<style scoped>
.detail-page {
  margin-top: calc(-1 * var(--space-8));
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* ── Loading skeleton ─────────────────────────────────── */
.skeleton-hero {
  display: flex;
  flex-direction: column;
}

.skeleton-cover {
  height: 320px;
  background: var(--color-surface-raised);
  border-radius: 0 0 var(--radius-2xl) var(--radius-2xl);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-body {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.skeleton-line {
  height: 14px;
  border-radius: var(--radius-full);
  background: var(--color-surface-raised);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-line--short { width: 30%; }
.skeleton-line--title { width: 60%; height: 28px; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}

/* ── State cards (error / not found) ──────────────────── */
.state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-20) var(--space-8);
  text-align: center;
  margin-top: 0;
}

.state-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-2xl);
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
}

.state-icon--error {
  background: var(--color-error-bg);
  border-color: color-mix(in srgb, var(--color-error) 20%, transparent);
  color: var(--color-error);
}

.state-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-text);
}

.state-subtitle {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  max-width: 320px;
  line-height: var(--leading-relaxed);
}

/* ── Hero ─────────────────────────────────────────────── */
.hero {
  position: relative;
  height: 340px;
  overflow: hidden;
  border-radius: 0 0 var(--radius-2xl) var(--radius-2xl);
}

.hero-cover {
  position: absolute;
  inset: 0;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 40%;
}

.hero-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--neutral-200), var(--neutral-300));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--neutral-400);
}

.hero-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.22) 0%,
    rgba(0,0,0,0)    30%,
    rgba(0,0,0,0.08) 55%,
    rgba(0,0,0,0.72) 100%
  );
}

/* Back button */
.btn-back {
  position: absolute;
  top: var(--space-5);
  left: var(--space-5);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: 34px;
  padding: 0 var(--space-3) 0 var(--space-2);
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: white;
  z-index: 2;
  transition: background var(--transition-fast);
}

.btn-back:hover {
  background: rgba(255,255,255,0.25);
}

/* Album info */
.hero-info {
  position: absolute;
  bottom: var(--space-6);
  left: var(--space-6);
  right: 200px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.hero-event-date {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: rgba(255,255,255,0.75);
}

.hero-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: white;
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  text-shadow: 0 1px 8px rgba(0,0,0,0.3);
}

.hero-description {
  font-size: var(--text-base);
  color: rgba(255,255,255,0.75);
  line-height: var(--leading-normal);
  max-width: 480px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Hero action buttons */
.hero-actions {
  position: absolute;
  bottom: var(--space-6);
  right: var(--space-6);
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  align-items: flex-end;
}

.btn-hero {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: 38px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  white-space: nowrap;
  transition: background-color var(--transition-fast),
              transform var(--transition-fast),
              box-shadow var(--transition-fast);
}

.btn-hero:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-hero--primary {
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  color: white;
}

.btn-hero--primary:hover {
  background: rgba(255,255,255,0.25);
}

.btn-hero--danger {
  background: rgba(239,68,68,0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(239,68,68,0.35);
  color: #fca5a5;
}

.btn-hero--danger:hover {
  background: rgba(239,68,68,0.32);
}

/* ── Metadata section ─────────────────────────────────── */
.meta-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-2) 0;
}

.meta-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-5);
  border-bottom: 1px solid var(--color-border-subtle);
}

.meta-row:last-child {
  border-bottom: none;
}

.meta-label {
  flex-shrink: 0;
  width: 100px;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text-secondary);
  padding-top: 1px;
}

.meta-value {
  font-size: var(--text-sm);
  color: var(--color-text);
}

/* Tags */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.tag {
  display: inline-block;
  padding: 3px var(--space-2);
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  line-height: var(--leading-tight);
}

/* ── Responsive ───────────────────────────────────────── */
@media (max-width: 640px) {
  .hero {
    height: 260px;
  }

  .hero-info {
    right: var(--space-5);
    bottom: var(--space-5);
  }

  .hero-title {
    font-size: var(--text-2xl);
  }

  .hero-actions {
    display: none;
  }

  .meta-label {
    width: 80px;
  }
}
</style>
