<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mockAlbums } from '@/assets/mocks/albums'
import { mockMedia } from '@/assets/mocks/media'
import MediaCard from '@/components/media/MediaCard.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { MediaType } from '@/types'

const route  = useRoute()
const router = useRouter()

// ── Album data ──────────────────────────────────────────
const album = computed(() =>
  mockAlbums.find(a => a.id === route.params.id) ?? mockAlbums[0],
)

// ── Media filter ────────────────────────────────────────
type MediaFilter = 'all' | MediaType
const activeFilter = ref<MediaFilter>('all')

const filterTabs: { label: string; value: MediaFilter }[] = [
  { label: 'Tous',   value: 'all'   },
  { label: 'Photos', value: 'photo' },
  { label: 'Vidéos', value: 'video' },
]

const albumMedia = computed(() =>
  mockMedia.filter(m => m.albumId === album.value.id),
)

const filteredMedia = computed(() => {
  if (activeFilter.value === 'all') return albumMedia.value
  return albumMedia.value.filter(m => m.type === activeFilter.value)
})

function countOf(type: MediaFilter) {
  if (type === 'all') return albumMedia.value.length
  return albumMedia.value.filter(m => m.type === type).length
}

// ── View mode ───────────────────────────────────────────
type ViewMode = 'grid' | 'compact'
const viewMode = ref<ViewMode>('grid')

// ── Selection ───────────────────────────────────────────
const selected = ref<Set<string>>(new Set())

function toggleSelect(id: string) {
  const s = new Set(selected.value)
  s.has(id) ? s.delete(id) : s.add(id)
  selected.value = s
}

function clearSelection() {
  selected.value = new Set()
}

// ── Shared link copy (mock) ──────────────────────────────
const linkCopied = ref(false)
function copyLink() {
  linkCopied.value = true
  setTimeout(() => { linkCopied.value = false }, 2000)
}

// ── Date range ──────────────────────────────────────────
function dateRange(album: { createdAt: string; updatedAt: string }): string {
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat('fr', { month: 'long', year: 'numeric' }).format(new Date(iso))
  return fmt(album.createdAt)
}
</script>

<template>
  <div class="detail-page">

    <!-- ══════════════════════════════════════════════════
         HERO — full-width banner
    ═══════════════════════════════════════════════════ -->
    <section class="hero">
      <!-- Cover image -->
      <div class="hero-cover">
        <img
          v-if="album.coverUrl"
          :src="album.coverUrl.replace('600/400', '1400/500')"
          :alt="`Couverture de l'album ${album.title}`"
          class="hero-img"
        />
        <div v-else class="hero-placeholder" aria-hidden="true">
          <AppIcon name="albums" :size="56" />
        </div>
        <div class="hero-scrim" aria-hidden="true" />
      </div>

      <!-- Back button -->
      <button
        type="button"
        class="btn-back"
        aria-label="Retour aux albums"
        @click="router.push('/albums')"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round"
             aria-hidden="true">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Albums
      </button>

      <!-- Album info overlay -->
      <div class="hero-info">
        <div class="hero-meta">
          <span v-if="album.isShared" class="badge-shared">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none"
                 stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                 aria-hidden="true">
              <circle cx="18" cy="5"  r="3"/>
              <circle cx="6"  cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>
            </svg>
            Partagé
          </span>
          <span class="hero-date">{{ dateRange(album) }}</span>
        </div>

        <h1 class="hero-title">{{ album.title }}</h1>

        <p v-if="album.description" class="hero-description">
          {{ album.description }}
        </p>

        <div class="hero-stats">
          <span>{{ albumMedia.length }} médias</span>
          <span class="stat-dot" aria-hidden="true">·</span>
          <span>{{ countOf('photo') }} photos</span>
          <span class="stat-dot" aria-hidden="true">·</span>
          <span>{{ countOf('video') }} vidéos</span>
        </div>
      </div>

      <!-- Hero actions -->
      <div class="hero-actions">
        <button type="button" class="btn-action btn-action--primary">
          <AppIcon name="upload" :size="16" />
          <span>Ajouter des médias</span>
        </button>

        <button
          type="button"
          class="btn-action btn-action--ghost"
          :class="{ 'btn-action--copied': linkCopied }"
          @click="copyLink"
        >
          <AppIcon v-if="!linkCopied" name="heart" :size="16" />
          <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round"
               stroke-linejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
          <span>{{ linkCopied ? 'Lien copié !' : 'Partager' }}</span>
        </button>

        <button type="button" class="btn-action btn-action--ghost">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
               stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
               aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span>Télécharger</span>
        </button>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════
         TOOLBAR
    ═══════════════════════════════════════════════════ -->
    <div class="toolbar">
      <!-- Filter tabs -->
      <div class="filter-tabs" role="tablist">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          type="button"
          role="tab"
          class="filter-tab"
          :class="{ 'filter-tab--active': activeFilter === tab.value }"
          :aria-selected="activeFilter === tab.value"
          @click="activeFilter = tab.value"
        >
          {{ tab.label }}
          <span class="tab-count">{{ countOf(tab.value) }}</span>
        </button>
      </div>

      <div class="toolbar-right">
        <!-- Selection info -->
        <Transition name="fade">
          <span v-if="selected.size > 0" class="selection-info">
            {{ selected.size }} sélectionné{{ selected.size > 1 ? 's' : '' }}
            <button type="button" class="btn-clear-sel" @click="clearSelection">
              <AppIcon name="x" :size="12" />
            </button>
          </span>
        </Transition>

        <!-- View toggle -->
        <div class="view-toggle" role="group" aria-label="Mode d'affichage">
          <button
            type="button"
            class="view-btn"
            :class="{ 'view-btn--active': viewMode === 'grid' }"
            aria-label="Grille normale"
            @click="viewMode = 'grid'"
          >
            <!-- 3×3 grid icon -->
            <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden="true">
              <rect x="1" y="1" width="4" height="4" rx="0.75"/>
              <rect x="6" y="1" width="4" height="4" rx="0.75"/>
              <rect x="11" y="1" width="4" height="4" rx="0.75"/>
              <rect x="1" y="6" width="4" height="4" rx="0.75"/>
              <rect x="6" y="6" width="4" height="4" rx="0.75"/>
              <rect x="11" y="6" width="4" height="4" rx="0.75"/>
              <rect x="1" y="11" width="4" height="4" rx="0.75"/>
              <rect x="6" y="11" width="4" height="4" rx="0.75"/>
              <rect x="11" y="11" width="4" height="4" rx="0.75"/>
            </svg>
          </button>

          <button
            type="button"
            class="view-btn"
            :class="{ 'view-btn--active': viewMode === 'compact' }"
            aria-label="Grille compacte"
            @click="viewMode = 'compact'"
          >
            <!-- 4×4 compact icon -->
            <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden="true">
              <rect x="1"    y="1"    width="2.75" height="2.75" rx="0.5"/>
              <rect x="4.75" y="1"    width="2.75" height="2.75" rx="0.5"/>
              <rect x="8.5"  y="1"    width="2.75" height="2.75" rx="0.5"/>
              <rect x="12.25" y="1"   width="2.75" height="2.75" rx="0.5"/>
              <rect x="1"    y="4.75" width="2.75" height="2.75" rx="0.5"/>
              <rect x="4.75" y="4.75" width="2.75" height="2.75" rx="0.5"/>
              <rect x="8.5"  y="4.75" width="2.75" height="2.75" rx="0.5"/>
              <rect x="12.25" y="4.75" width="2.75" height="2.75" rx="0.5"/>
              <rect x="1"    y="8.5"  width="2.75" height="2.75" rx="0.5"/>
              <rect x="4.75" y="8.5"  width="2.75" height="2.75" rx="0.5"/>
              <rect x="8.5"  y="8.5"  width="2.75" height="2.75" rx="0.5"/>
              <rect x="12.25" y="8.5" width="2.75" height="2.75" rx="0.5"/>
              <rect x="1"    y="12.25" width="2.75" height="2.75" rx="0.5"/>
              <rect x="4.75" y="12.25" width="2.75" height="2.75" rx="0.5"/>
              <rect x="8.5"  y="12.25" width="2.75" height="2.75" rx="0.5"/>
              <rect x="12.25" y="12.25" width="2.75" height="2.75" rx="0.5"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════
         MEDIA GRID
    ═══════════════════════════════════════════════════ -->
    <Transition name="fade" mode="out-in">
      <section
        v-if="filteredMedia.length > 0"
        class="media-grid"
        :class="{ 'media-grid--compact': viewMode === 'compact' }"
        aria-label="Médias de l'album"
      >
        <MediaCard
          v-for="item in filteredMedia"
          :key="item.id"
          :id="item.id"
          :type="item.type"
          :thumbnail-url="item.thumbnailUrl"
          :title="item.title"
          :duration="item.duration"
          :taken-at="item.takenAt"
          :selected="selected.has(item.id)"
          @click="router.push(`/albums/${album.id}/media/${item.id}`)"
          @select="toggleSelect"
        />
      </section>

      <!-- Empty state -->
      <div v-else class="empty-state" role="status">
        <div class="empty-icon" aria-hidden="true">
          <AppIcon name="albums" :size="32" />
        </div>
        <p class="empty-title">Aucun média</p>
        <p class="empty-subtitle">
          {{ activeFilter !== 'all'
              ? `Cet album ne contient pas de ${activeFilter === 'photo' ? 'photos' : 'vidéos'}.`
              : 'Ajoutez vos premières photos ou vidéos.' }}
        </p>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.detail-page {
  /* Bleed the hero to the edges of app-content-inner */
  margin-top: calc(-1 * var(--space-8));
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* ── Hero ──────────────────────────────────────────────── */
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

/* Scrim — cinematic gradient */
.hero-scrim {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      to bottom,
      rgba(0,0,0,0.25) 0%,
      rgba(0,0,0,0)    30%,
      rgba(0,0,0,0.1)  55%,
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
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: white;
  transition: background var(--transition-fast);
  z-index: 2;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* Album info */
.hero-info {
  position: absolute;
  bottom: var(--space-6);
  left: var(--space-6);
  right: 220px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.badge-shared {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px var(--space-2);
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: white;
  line-height: 1;
}

.hero-date {
  font-size: var(--text-sm);
  color: rgba(255,255,255,0.7);
  font-weight: var(--font-medium);
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
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: rgba(255,255,255,0.65);
  font-weight: var(--font-medium);
}

.stat-dot {
  opacity: 0.5;
}

/* Hero actions */
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

.btn-action {
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

.btn-action--primary {
  background: var(--color-primary);
  color: white;
}

.btn-action--primary:hover {
  background: var(--color-primary-hover);
  box-shadow: 0 4px 14px rgba(99,102,241,0.4);
  transform: translateY(-1px);
}

.btn-action--ghost {
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  color: white;
}

.btn-action--ghost:hover {
  background: rgba(255,255,255,0.25);
}

.btn-action--copied {
  background: rgba(34,197,94,0.25);
  border-color: rgba(34,197,94,0.4);
  color: #86efac;
}

/* ── Toolbar ───────────────────────────────────────────── */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.filter-tabs {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1);
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: 30px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text-secondary);
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.filter-tab:hover {
  color: var(--color-text);
}

.filter-tab--active {
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: var(--shadow-xs);
}

.tab-count {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--color-text-tertiary);
  background: var(--color-surface-overlay);
  padding: 1px 6px;
  border-radius: var(--radius-full);
  line-height: var(--leading-tight);
}

.filter-tab--active .tab-count {
  background: var(--color-primary-subtle);
  color: var(--color-primary);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

/* Selection pill */
.selection-info {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--space-2) 0 var(--space-3);
  height: 30px;
  background: var(--color-primary-subtle);
  border: 1px solid var(--color-primary-border);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--color-primary);
}

.btn-clear-sel {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: white;
  transition: background var(--transition-fast);
}

.btn-clear-sel:hover {
  background: var(--color-primary-hover);
}

/* View toggle */
.view-toggle {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: var(--space-1);
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.view-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: var(--color-text-tertiary);
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.view-btn:hover {
  color: var(--color-text-secondary);
}

.view-btn--active {
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: var(--shadow-xs);
}

/* ── Media grid ────────────────────────────────────────── */
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-3);
}

.media-grid--compact {
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--space-2);
}

/* ── Empty state ───────────────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-16) var(--space-8);
  text-align: center;
}

.empty-icon {
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

.empty-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-text);
}

.empty-subtitle {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  max-width: 300px;
  line-height: var(--leading-relaxed);
}

/* ── Transitions ───────────────────────────────────────── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ── Responsive ────────────────────────────────────────── */
@media (max-width: 768px) {
  .hero {
    height: 280px;
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

  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>
