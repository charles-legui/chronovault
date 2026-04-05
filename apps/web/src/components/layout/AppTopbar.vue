<script setup lang="ts">
import { ref } from 'vue'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
const localSearch = ref(ui.searchQuery)

function onSearch() {
  ui.setSearch(localSearch.value)
}
</script>

<template>
  <header class="topbar">
    <!-- Search -->
    <div class="topbar-search">
      <span class="search-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" stroke-linecap="round" />
        </svg>
      </span>
      <input
        v-model="localSearch"
        type="search"
        placeholder="Rechercher des albums, médias…"
        class="search-input"
        @input="onSearch"
      />
    </div>

    <!-- Actions -->
    <div class="topbar-actions">
      <button class="btn-add" type="button" title="Ajouter">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14" stroke-linecap="round" />
        </svg>
        <span>Nouveau</span>
      </button>

      <button class="icon-btn" type="button" title="Notifications">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      </button>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  height: var(--topbar-height);
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
  gap: var(--space-4);
  position: sticky;
  top: 0;
  z-index: 10;
}

.topbar-search {
  position: relative;
  flex: 1;
  max-width: 480px;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-muted);
  display: flex;
}

.search-input {
  width: 100%;
  height: 40px;
  padding: 0 var(--space-4) 0 2.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background-color: var(--color-surface-raised);
  font-size: var(--font-size-sm);
  color: var(--color-text);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.search-input::placeholder {
  color: var(--color-muted);
}

.search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  background-color: var(--color-surface);
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.btn-add {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--space-4);
  height: 38px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-add:hover {
  background-color: var(--color-primary-hover);
}

.icon-btn {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}

.icon-btn:hover {
  background-color: var(--color-surface-overlay);
  color: var(--color-text);
}
</style>
