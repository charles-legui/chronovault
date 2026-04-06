<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAlbumsStore } from '@/stores/albumsStore'
import AlbumCard from '@/components/albums/AlbumCard.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const router = useRouter()
const albums = useAlbumsStore()

type SortKey = 'updated' | 'created' | 'title'

const search  = ref('')
const sortBy  = ref<SortKey>('updated')

const sortOptions: { label: string; value: SortKey }[] = [
  { label: 'Récemment modifié', value: 'updated' },
  { label: 'Date de création',  value: 'created' },
  { label: 'Nom',               value: 'title'   },
]

const filtered = computed(() => {
  let result = [...albums.albums]

  const q = search.value.trim().toLowerCase()
  if (q) {
    result = result.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q)),
    )
  }

  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'updated': return b.updatedAt.localeCompare(a.updatedAt)
      case 'created': return b.createdAt.localeCompare(a.createdAt)
      case 'title':   return a.title.localeCompare(b.title)
    }
  })

  return result
})

onMounted(() => albums.fetchMyAlbums())

function openAlbum(id: string) {
  router.push({ name: 'album-detail', params: { id } })
}

function editAlbum(id: string) {
  router.push({ name: 'album-edit', params: { id } })
}

async function deleteAlbum(id: string) {
  const album = albums.albums.find(a => a.id === id)
  if (!album) return
  if (!window.confirm(`Supprimer l'album « ${album.title} » ? Cette action est irréversible.`)) return
  await albums.deleteAlbum(id)
}
</script>

<template>
  <div class="albums-page">

    <!-- Page header -->
    <header class="page-header">
      <div class="header-text">
        <h1 class="page-title">Albums</h1>
        <p class="page-subtitle">
          {{ albums.albums.length }} album{{ albums.albums.length !== 1 ? 's' : '' }}
        </p>
      </div>

      <button type="button" class="btn-create" @click="router.push('/albums/new')">
        <AppIcon name="plus" :size="16" />
        <span>Nouvel album</span>
      </button>
    </header>

    <!-- Error banner -->
    <div v-if="albums.error" class="error-banner" role="alert">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4M12 16h.01"/>
      </svg>
      {{ albums.error }}
      <button type="button" class="error-retry" @click="albums.fetchMyAlbums()">Réessayer</button>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-search">
        <span class="search-icon" aria-hidden="true">
          <AppIcon name="search" :size="15" />
        </span>
        <input
          v-model="search"
          type="search"
          placeholder="Rechercher un album…"
          class="search-input"
          aria-label="Rechercher un album"
        />
      </div>

      <div class="toolbar-sort">
        <label for="sort-select" class="sr-only">Trier par</label>
        <select id="sort-select" v-model="sortBy" class="sort-select">
          <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <span class="sort-icon" aria-hidden="true">
          <AppIcon name="chevron-down" :size="14" />
        </span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="albums.loading" class="loading-grid" aria-busy="true" aria-label="Chargement…">
      <div v-for="n in 6" :key="n" class="skeleton-card">
        <div class="skeleton-cover" />
        <div class="skeleton-body">
          <div class="skeleton-line skeleton-line--title" />
          <div class="skeleton-line skeleton-line--short" />
        </div>
      </div>
    </div>

    <!-- Grid -->
    <Transition v-else name="fade" mode="out-in">

      <section v-if="filtered.length > 0" class="albums-grid" aria-label="Liste des albums">
        <AlbumCard
          v-for="album in filtered"
          :key="album.id"
          :album="album"
          @click="openAlbum"
          @edit="editAlbum"
          @delete="deleteAlbum"
        />
      </section>

      <!-- Empty state -->
      <div v-else class="empty-state" role="status">
        <div class="empty-icon" aria-hidden="true">
          <AppIcon name="albums" :size="36" />
        </div>
        <p class="empty-title">
          {{ search ? 'Aucun résultat' : 'Aucun album' }}
        </p>
        <p class="empty-subtitle">
          {{ search
            ? `Aucun album ne correspond à « ${search} »`
            : 'Créez votre premier album pour commencer.' }}
        </p>
        <button v-if="!search" type="button" class="btn-create" @click="router.push('/albums/new')">
          <AppIcon name="plus" :size="16" />
          <span>Créer un album</span>
        </button>
      </div>

    </Transition>
  </div>
</template>

<style scoped>
.albums-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Header */
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

/* Create button */
.btn-create {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: 40px;
  padding: 0 var(--space-5);
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  white-space: nowrap;
  flex-shrink: 0;
  transition: background-color var(--transition-fast),
              box-shadow var(--transition-fast),
              transform var(--transition-fast);
}

.btn-create:hover {
  background-color: var(--color-primary-hover);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
  transform: translateY(-1px);
}

.btn-create:active { transform: translateY(0); }

/* Error banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--color-error-bg);
  color: var(--color-error);
  border: 1px solid color-mix(in srgb, var(--color-error) 20%, transparent);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
}

.error-retry {
  margin-left: auto;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-error);
  text-decoration: underline;
}

/* Toolbar */
.toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.toolbar-search {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 320px;
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
  padding: 0 var(--space-3) 0 2.1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  font-size: var(--text-sm);
  color: var(--color-text);
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.search-input:focus {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.search-input::-webkit-search-cancel-button { display: none; }

.toolbar-sort {
  position: relative;
  margin-left: auto;
  flex-shrink: 0;
}

.sort-select {
  height: 38px;
  padding: 0 2.25rem 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  outline: none;
  appearance: none;
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.sort-select:focus {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.sort-icon {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
  pointer-events: none;
  display: flex;
}

/* Albums grid */
.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-5);
}

/* Loading skeleton */
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-5);
}

.skeleton-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.skeleton-cover {
  aspect-ratio: 3 / 2;
  background: var(--color-surface-raised);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-body {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.skeleton-line {
  height: 12px;
  border-radius: var(--radius-full);
  background: var(--color-surface-raised);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-line--title { width: 65%; height: 14px; }
.skeleton-line--short { width: 40%; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-20) var(--space-8);
  text-align: center;
}

.empty-icon {
  width: 72px;
  height: 72px;
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
  max-width: 320px;
  line-height: var(--leading-relaxed);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out);
}
.fade-enter-from,
.fade-leave-to { opacity: 0; }

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar-search {
    max-width: 100%;
    flex: 1 1 100%;
  }

  .toolbar-sort { margin-left: 0; }

  .albums-grid,
  .loading-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--space-4);
  }
}
</style>
