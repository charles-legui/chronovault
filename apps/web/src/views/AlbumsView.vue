<script setup lang="ts">
import { useRouter } from 'vue-router'
import { mockAlbums } from '@/assets/mocks/albums'
import { useAlbumFilters, type AlbumFilter, type AlbumSort } from '@/composables/useAlbumFilters'
import AlbumCard from '@/components/albums/AlbumCard.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const router = useRouter()

const { search, activeFilter, activeSort, filtered } = useAlbumFilters(mockAlbums)

const filterTabs: { label: string; value: AlbumFilter; count?: number }[] = [
  { label: 'Tous',     value: 'all',     count: mockAlbums.length },
  { label: 'Partagés', value: 'shared',  count: mockAlbums.filter(a =>  a.isShared).length },
  { label: 'Privés',   value: 'private', count: mockAlbums.filter(a => !a.isShared).length },
]

const sortOptions: { label: string; value: AlbumSort }[] = [
  { label: 'Récemment modifié', value: 'updated' },
  { label: 'Date de création',  value: 'created' },
  { label: 'Nom',               value: 'title'   },
  { label: 'Nombre de médias',  value: 'count'   },
]

function openAlbum(id: string) {
  router.push(`/albums/${id}`)
}
</script>

<template>
  <div class="albums-page">

    <!-- Page header -->
    <header class="page-header">
      <div class="header-text">
        <h1 class="page-title">Albums</h1>
        <p class="page-subtitle">{{ mockAlbums.length }} albums · {{ mockAlbums.reduce((s, a) => s + a.mediaCount, 0).toLocaleString('fr') }} médias</p>
      </div>

      <button type="button" class="btn-create">
        <AppIcon name="plus" :size="16" />
        <span>Nouvel album</span>
      </button>
    </header>

    <!-- Toolbar -->
    <div class="toolbar">

      <!-- Search -->
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

      <!-- Filter tabs -->
      <div class="filter-tabs" role="tablist" aria-label="Filtres">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          type="button"
          role="tab"
          :aria-selected="activeFilter === tab.value"
          class="filter-tab"
          :class="{ 'filter-tab--active': activeFilter === tab.value }"
          @click="activeFilter = tab.value"
        >
          {{ tab.label }}
          <span class="filter-tab-count">{{ tab.count }}</span>
        </button>
      </div>

      <!-- Sort -->
      <div class="toolbar-sort">
        <label for="sort-select" class="sr-only">Trier par</label>
        <select id="sort-select" v-model="activeSort" class="sort-select">
          <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <span class="sort-icon" aria-hidden="true">
          <AppIcon name="chevron-down" :size="14" />
        </span>
      </div>
    </div>

    <!-- Grid -->
    <Transition name="fade" mode="out-in">

      <!-- Results -->
      <section v-if="filtered.length > 0" class="albums-grid" aria-label="Liste des albums">
        <AlbumCard
          v-for="album in filtered"
          :key="album.id"
          :id="album.id"
          :title="album.title"
          :cover-url="album.coverUrl"
          :media-count="album.mediaCount"
          :updated-at="album.updatedAt"
          :is-shared="album.isShared"
          @click="openAlbum"
        />
      </section>

      <!-- Empty state -->
      <div v-else class="empty-state" role="status">
        <div class="empty-icon" aria-hidden="true">
          <AppIcon name="albums" :size="36" />
        </div>
        <p class="empty-title">Aucun album trouvé</p>
        <p class="empty-subtitle">
          {{ search ? `Aucun résultat pour « ${search} »` : 'Créez votre premier album pour commencer.' }}
        </p>
        <button v-if="!search" type="button" class="btn-create">
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

.btn-create:active {
  transform: translateY(0);
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

/* Filter tabs */
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
  background: var(--color-surface-overlay);
}

.filter-tab--active {
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: var(--shadow-xs);
}

.filter-tab-count {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--color-text-tertiary);
  background: var(--color-surface-overlay);
  padding: 1px 6px;
  border-radius: var(--radius-full);
  line-height: var(--leading-tight);
}

.filter-tab--active .filter-tab-count {
  background: var(--color-primary-subtle);
  color: var(--color-primary);
}

/* Sort select */
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

/* Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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

  .toolbar {
    gap: var(--space-2);
  }

  .toolbar-search {
    max-width: 100%;
    flex: 1 1 100%;
  }

  .toolbar-sort {
    margin-left: 0;
  }

  .albums-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--space-4);
  }
}
</style>
