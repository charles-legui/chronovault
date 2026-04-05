<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mockMedia } from '@/assets/mocks/media'
import { mockAlbums } from '@/assets/mocks/albums'

// ── Routing ───────────────────────────────────────────────
const route  = useRoute()
const router = useRouter()

const albumId = computed(() => route.params.albumId as string)
const mediaId = computed(() => route.params.mediaId as string)

// ── Data ──────────────────────────────────────────────────
const albumMedia = computed(() =>
  mockMedia.filter(m => m.albumId === albumId.value),
)

const album = computed(() =>
  mockAlbums.find(a => a.id === albumId.value),
)

const currentIndex = computed(() =>
  albumMedia.value.findIndex(m => m.id === mediaId.value),
)

const current = computed(() =>
  albumMedia.value[currentIndex.value] ?? albumMedia.value[0],
)

const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < albumMedia.value.length - 1)

// ── Navigation ────────────────────────────────────────────
function goTo(index: number) {
  const item = albumMedia.value[index]
  if (item) router.replace({ name: 'media-viewer', params: { albumId: albumId.value, mediaId: item.id } })
}

function prev() { if (hasPrev.value) goTo(currentIndex.value - 1) }
function next() { if (hasNext.value) goTo(currentIndex.value + 1) }

function goBack() {
  router.push({ name: 'album-detail', params: { id: albumId.value } })
}

// ── Keyboard ──────────────────────────────────────────────
function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft')  { e.preventDefault(); prev() }
  if (e.key === 'ArrowRight') { e.preventDefault(); next() }
  if (e.key === 'Escape')     goBack()
  if (e.key === 'i' || e.key === 'I') toggleInfo()
}

onMounted(()  => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

// ── Thumbnail strip scroll ────────────────────────────────
const stripRef = ref<HTMLElement | null>(null)

watch(currentIndex, async () => {
  await nextTick()
  const strip = stripRef.value
  const thumb = strip?.querySelector<HTMLElement>('.thumb--active')
  if (strip && thumb) {
    const offset = thumb.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2
    strip.scrollTo({ left: offset, behavior: 'smooth' })
  }
})

// ── UI state ──────────────────────────────────────────────
const showInfo  = ref(true)
const imgLoaded = ref(false)

function toggleInfo() { showInfo.value = !showInfo.value }

watch(current, () => { imgLoaded.value = false })

// ── Helpers ───────────────────────────────────────────────
function fmtDuration(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat('fr', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(iso))
}

function fmtTime(iso: string): string {
  return new Intl.DateTimeFormat('fr', {
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

function fmtDims(w?: number, h?: number): string {
  return w && h ? `${w.toLocaleString('fr')} × ${h.toLocaleString('fr')} px` : '—'
}

// Mock file size based on dimensions
function mockFileSize(w?: number, h?: number, type = 'photo'): string {
  if (!w || !h) return '—'
  const kb = type === 'video' ? Math.round(w * h * 0.012) : Math.round(w * h * 0.0008)
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} Mo` : `${kb} Ko`
}
</script>

<template>
  <div class="viewer" @dblclick.self="goBack">

    <!-- ═══════════════════════════════════════════════════
         TOP BAR
    ══════════════════════════════════════════════════════ -->
    <header class="viewer-topbar">

      <!-- Left: back + breadcrumb -->
      <div class="topbar-left">
        <button type="button" class="btn-icon" aria-label="Retour à l'album" @click="goBack">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>

        <nav class="breadcrumb" aria-label="Navigation">
          <button type="button" class="breadcrumb-link" @click="goBack">
            {{ album?.title ?? 'Album' }}
          </button>
          <span class="breadcrumb-sep" aria-hidden="true">/</span>
          <span class="breadcrumb-current">
            {{ current.title ?? `Photo ${currentIndex + 1}` }}
          </span>
        </nav>
      </div>

      <!-- Center: counter -->
      <div class="topbar-counter" aria-live="polite" aria-atomic="true">
        <span class="counter-current">{{ currentIndex + 1 }}</span>
        <span class="counter-sep">/</span>
        <span class="counter-total">{{ albumMedia.length }}</span>
      </div>

      <!-- Right: actions -->
      <div class="topbar-right">
        <button type="button" class="btn-icon" aria-label="Télécharger" title="Télécharger">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
               stroke-width="1.75" stroke-linecap="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>

        <button type="button" class="btn-icon" aria-label="Ajouter aux favoris" title="Favoris">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
               stroke-width="1.75" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>

        <button type="button" class="btn-icon" aria-label="Partager" title="Partager">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
               stroke-width="1.75" stroke-linecap="round" aria-hidden="true">
            <circle cx="18" cy="5"  r="3"/>
            <circle cx="6"  cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>
          </svg>
        </button>

        <div class="topbar-divider" aria-hidden="true" />

        <button
          type="button"
          class="btn-icon"
          :class="{ 'btn-icon--active': showInfo }"
          :aria-label="showInfo ? 'Masquer les infos' : 'Afficher les infos'"
          :title="showInfo ? 'Masquer les infos (i)' : 'Afficher les infos (i)'"
          @click="toggleInfo"
        >
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor"
               stroke-width="1.75" stroke-linecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="8" stroke-width="2.5"/>
            <line x1="12" y1="12" x2="12" y2="16"/>
          </svg>
        </button>

        <button type="button" class="btn-icon" aria-label="Fermer" title="Fermer (Échap)" @click="goBack">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <line x1="18" y1="6"  x2="6"  y2="18"/>
            <line x1="6"  y1="6"  x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- ═══════════════════════════════════════════════════
         MAIN AREA (preview + sidebar)
    ══════════════════════════════════════════════════════ -->
    <div class="viewer-body">

      <!-- ── Preview ─────────────────────────────────── -->
      <div class="viewer-preview">

        <!-- Prev arrow -->
        <button
          type="button"
          class="nav-arrow nav-arrow--prev"
          :class="{ 'nav-arrow--disabled': !hasPrev }"
          :aria-label="hasPrev ? 'Précédent' : undefined"
          :aria-disabled="!hasPrev"
          :tabindex="hasPrev ? 0 : -1"
          @click="prev"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>

        <!-- Media display -->
        <Transition name="slide" mode="out-in">
          <div :key="current.id" class="preview-stage">
            <!-- Photo -->
            <img
              v-if="current.type === 'photo'"
              :src="current.url"
              :alt="current.title ?? 'Photo'"
              class="preview-img"
              :class="{ 'preview-img--loaded': imgLoaded }"
              draggable="false"
              @load="imgLoaded = true"
            />

            <!-- Video placeholder (no real playback in static version) -->
            <div v-else class="preview-video">
              <img
                :src="current.thumbnailUrl"
                :alt="current.title ?? 'Vidéo'"
                class="preview-img preview-img--loaded"
                draggable="false"
              />
              <div class="preview-video-overlay" aria-hidden="true">
                <div class="preview-play-ring">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="white" aria-hidden="true">
                    <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l10.5-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14z"/>
                  </svg>
                </div>
                <span v-if="current.duration" class="preview-duration">
                  {{ fmtDuration(current.duration) }}
                </span>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Next arrow -->
        <button
          type="button"
          class="nav-arrow nav-arrow--next"
          :class="{ 'nav-arrow--disabled': !hasNext }"
          :aria-label="hasNext ? 'Suivant' : undefined"
          :aria-disabled="!hasNext"
          :tabindex="hasNext ? 0 : -1"
          @click="next"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>

        <!-- Keyboard hint -->
        <div class="key-hints" aria-hidden="true">
          <kbd>←</kbd> <kbd>→</kbd> naviguer &ensp; <kbd>I</kbd> infos &ensp; <kbd>Échap</kbd> fermer
        </div>
      </div>

      <!-- ── Metadata sidebar ─────────────────────────── -->
      <Transition name="panel">
        <aside v-if="showInfo" class="viewer-meta" aria-label="Informations sur le média">

          <!-- Thumbnail preview -->
          <div class="meta-thumb">
            <img :src="current.thumbnailUrl" :alt="''" class="meta-thumb-img" />
          </div>

          <!-- Title + type badge -->
          <div class="meta-section">
            <div class="meta-title-row">
              <h2 class="meta-title">
                {{ current.title ?? (current.type === 'video' ? 'Vidéo sans titre' : 'Photo sans titre') }}
              </h2>
              <span
                class="meta-type-badge"
                :class="current.type === 'video' ? 'meta-type-badge--video' : 'meta-type-badge--photo'"
              >
                {{ current.type === 'video' ? 'Vidéo' : 'Photo' }}
              </span>
            </div>
          </div>

          <div class="meta-divider" />

          <!-- Date & time -->
          <div class="meta-section" v-if="current.takenAt">
            <p class="meta-label">Date de prise de vue</p>
            <p class="meta-value">{{ fmtDate(current.takenAt) }}</p>
            <p class="meta-subvalue">{{ fmtTime(current.takenAt) }}</p>
          </div>

          <div class="meta-divider" />

          <!-- Technical details -->
          <div class="meta-section">
            <p class="meta-label">Détails techniques</p>
            <dl class="meta-dl">
              <div class="meta-row">
                <dt>Dimensions</dt>
                <dd>{{ fmtDims(current.width, current.height) }}</dd>
              </div>
              <div class="meta-row" v-if="current.type === 'video' && current.duration">
                <dt>Durée</dt>
                <dd>{{ fmtDuration(current.duration) }}</dd>
              </div>
              <div class="meta-row">
                <dt>Type</dt>
                <dd>{{ current.type === 'video' ? 'MP4 / H.264' : 'JPEG' }}</dd>
              </div>
              <div class="meta-row">
                <dt>Taille</dt>
                <dd>{{ mockFileSize(current.width, current.height, current.type) }}</dd>
              </div>
            </dl>
          </div>

          <div class="meta-divider" />

          <!-- Album -->
          <div class="meta-section">
            <p class="meta-label">Album</p>
            <button type="button" class="meta-album-link" @click="goBack">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
                   stroke-width="1.5" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/>
                <path d="m21 15-5-5L5 21"/>
              </svg>
              {{ album?.title ?? 'Album' }}
            </button>
          </div>

          <div class="meta-divider" />

          <!-- Position in album -->
          <div class="meta-section">
            <p class="meta-label">Position dans l'album</p>
            <p class="meta-value">
              {{ currentIndex + 1 }} sur {{ albumMedia.length }}
            </p>
          </div>

        </aside>
      </Transition>

    </div><!-- /viewer-body -->

    <!-- ═══════════════════════════════════════════════════
         THUMBNAIL STRIP
    ══════════════════════════════════════════════════════ -->
    <div class="viewer-strip-wrapper">
      <div ref="stripRef" class="viewer-strip" role="listbox" aria-label="Miniatures de l'album">
        <button
          v-for="(item, i) in albumMedia"
          :key="item.id"
          type="button"
          role="option"
          class="thumb"
          :class="{ 'thumb--active': i === currentIndex }"
          :aria-selected="i === currentIndex"
          :aria-label="`${item.title ?? (item.type === 'video' ? 'Vidéo' : 'Photo')} ${i + 1}`"
          @click="goTo(i)"
        >
          <img :src="item.thumbnailUrl" :alt="''" class="thumb-img" loading="lazy" />

          <!-- Video indicator -->
          <span v-if="item.type === 'video'" class="thumb-video-dot" aria-hidden="true">
            <svg viewBox="0 0 10 10" width="8" height="8" fill="white" aria-hidden="true">
              <path d="M2 2v6l6-3-6-3z"/>
            </svg>
          </span>

          <!-- Active ring -->
          <span v-if="i === currentIndex" class="thumb-active-ring" aria-hidden="true" />
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ── Shell ────────────────────────────────────────────────
   Full viewport, dark, no scroll on the outer container
   ────────────────────────────────────────────────────── */
.viewer {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  background: #0d0f14;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: white;
}

/* ── Top bar ──────────────────────────────────────────── */
.viewer-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  height: 56px;
  padding: 0 var(--space-5);
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid rgba(255,255,255,0.07);
  flex-shrink: 0;
  backdrop-filter: blur(12px);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  min-width: 0;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex: 1;
  justify-content: flex-end;
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}

.breadcrumb-link {
  font-size: var(--text-sm);
  color: rgba(255,255,255,0.5);
  font-weight: var(--font-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  transition: color var(--transition-fast);
}

.breadcrumb-link:hover { color: rgba(255,255,255,0.85); }

.breadcrumb-sep {
  color: rgba(255,255,255,0.2);
  font-size: var(--text-sm);
  flex-shrink: 0;
}

.breadcrumb-current {
  font-size: var(--text-sm);
  color: rgba(255,255,255,0.85);
  font-weight: var(--font-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;
}

/* Counter */
.topbar-counter {
  display: flex;
  align-items: baseline;
  gap: 3px;
  flex-shrink: 0;
}

.counter-current {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: white;
  line-height: 1;
}

.counter-sep {
  font-size: var(--text-sm);
  color: rgba(255,255,255,0.3);
}

.counter-total {
  font-size: var(--text-sm);
  color: rgba(255,255,255,0.4);
}

/* Icon buttons */
.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  color: rgba(255,255,255,0.6);
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.btn-icon:hover {
  background: rgba(255,255,255,0.08);
  color: white;
}

.btn-icon--active {
  background: rgba(99,102,241,0.2);
  color: var(--indigo-400);
}

.btn-icon--active:hover {
  background: rgba(99,102,241,0.3);
  color: var(--indigo-400);
}

.btn-icon:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.topbar-divider {
  width: 1px;
  height: 20px;
  background: rgba(255,255,255,0.12);
  margin: 0 var(--space-1);
}

/* ── Main area ────────────────────────────────────────── */
.viewer-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

/* ── Preview stage ────────────────────────────────────── */
.viewer-preview {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: var(--space-8);
}

.preview-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: var(--radius-md);
  opacity: 0;
  transition: opacity var(--duration-slow) var(--ease-out);
  box-shadow: 0 24px 60px rgba(0,0,0,0.6);
  user-select: none;
}

.preview-img--loaded {
  opacity: 1;
}

/* Video preview */
.preview-video {
  position: relative;
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0,0,0,0.6);
}

.preview-video-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.28);
  gap: var(--space-3);
}

.preview-play-ring {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(12px);
  border: 2px solid rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  transition: transform var(--transition-base);
}

.preview-play-ring:hover { transform: scale(1.06); }

.preview-play-ring svg { transform: translateX(3px); }

.preview-duration {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: rgba(255,255,255,0.8);
  background: rgba(0,0,0,0.4);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  letter-spacing: 0.04em;
}

/* ── Navigation arrows ────────────────────────────────── */
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(8px);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color var(--transition-fast),
    transform var(--transition-fast),
    opacity var(--transition-fast);
}

.nav-arrow--prev { left: var(--space-5); }
.nav-arrow--next { right: var(--space-5); }

.nav-arrow:hover {
  background: rgba(255,255,255,0.16);
  transform: translateY(-50%) scale(1.06);
}

.nav-arrow:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.nav-arrow--disabled {
  opacity: 0.2;
  cursor: default;
  pointer-events: none;
}

/* Keyboard hints */
.key-hints {
  position: absolute;
  bottom: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
  font-size: var(--text-xs);
  color: rgba(255,255,255,0.2);
  white-space: nowrap;
  pointer-events: none;
  letter-spacing: 0.02em;
}

.key-hints kbd {
  display: inline-block;
  padding: 1px 5px;
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: var(--radius-xs);
  font-family: var(--font-sans);
  font-size: var(--text-xs);
  color: rgba(255,255,255,0.35);
  background: rgba(255,255,255,0.04);
}

/* ── Metadata sidebar ─────────────────────────────────── */
.viewer-meta {
  width: 280px;
  flex-shrink: 0;
  background: rgba(255,255,255,0.03);
  border-left: 1px solid rgba(255,255,255,0.07);
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.12) transparent;
}

.meta-thumb {
  width: 100%;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  flex-shrink: 0;
}

.meta-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.meta-section {
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.meta-label {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
}

.meta-value {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: rgba(255,255,255,0.85);
  line-height: var(--leading-snug);
}

.meta-subvalue {
  font-size: var(--text-xs);
  color: rgba(255,255,255,0.4);
}

.meta-title-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
}

.meta-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: white;
  line-height: var(--leading-snug);
  flex: 1;
}

.meta-type-badge {
  flex-shrink: 0;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  line-height: 1;
  margin-top: 2px;
}

.meta-type-badge--photo {
  background: rgba(99,102,241,0.2);
  color: var(--indigo-400);
}

.meta-type-badge--video {
  background: rgba(251,191,36,0.15);
  color: #fbbf24;
}

/* Definition list */
.meta-dl {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
}

.meta-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
}

.meta-row dt {
  font-size: var(--text-xs);
  color: rgba(255,255,255,0.4);
  white-space: nowrap;
}

.meta-row dd {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: rgba(255,255,255,0.75);
  text-align: right;
  word-break: break-all;
}

.meta-divider {
  height: 1px;
  background: rgba(255,255,255,0.06);
  flex-shrink: 0;
}

.meta-album-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--indigo-400);
  transition: color var(--transition-fast);
}

.meta-album-link:hover {
  color: var(--indigo-200);
}

/* ── Thumbnail strip ──────────────────────────────────── */
.viewer-strip-wrapper {
  height: 88px;
  background: rgba(0,0,0,0.4);
  border-top: 1px solid rgba(255,255,255,0.07);
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.viewer-strip {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--space-5);
  height: 100%;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.viewer-strip::-webkit-scrollbar { display: none; }

.thumb {
  position: relative;
  width: 72px;
  height: 60px;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  opacity: 0.45;
  scroll-snap-align: center;
  transition: opacity var(--transition-fast), transform var(--transition-fast);
  outline: none;
}

.thumb:hover { opacity: 0.8; transform: scale(1.05); }
.thumb:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
.thumb--active { opacity: 1; transform: scale(1.05); }

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-video-dot {
  position: absolute;
  bottom: 3px;
  left: 3px;
  width: 14px;
  height: 14px;
  border-radius: var(--radius-full);
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumb-active-ring {
  position: absolute;
  inset: 0;
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-md);
  pointer-events: none;
  box-shadow: inset 0 0 0 1px rgba(99,102,241,0.4);
}

/* ── Slide transition (preview) ──────────────────────── */
.slide-enter-active,
.slide-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out),
              transform var(--duration-fast) var(--ease-out);
}
.slide-enter-from { opacity: 0; transform: scale(0.97); }
.slide-leave-to   { opacity: 0; transform: scale(1.02); }

/* ── Panel slide-in/out ───────────────────────────────── */
.panel-enter-active,
.panel-leave-active {
  transition: width var(--duration-slow) var(--ease-out),
              opacity var(--duration-slow) var(--ease-out);
}
.panel-enter-from,
.panel-leave-to {
  width: 0;
  opacity: 0;
}

/* ── Responsive ───────────────────────────────────────── */
@media (max-width: 768px) {
  .viewer-meta { display: none; }

  .breadcrumb-current { max-width: 140px; }

  .key-hints { display: none; }

  .nav-arrow {
    width: 40px;
    height: 40px;
  }

  .nav-arrow--prev { left: var(--space-3); }
  .nav-arrow--next { right: var(--space-3); }
}
</style>
