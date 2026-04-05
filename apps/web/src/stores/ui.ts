import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(true)
  const mobileSidebarOpen = ref(false)
  const searchQuery = ref('')

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function openMobileSidebar() {
    mobileSidebarOpen.value = true
  }

  function closeMobileSidebar() {
    mobileSidebarOpen.value = false
  }

  function setSearch(query: string) {
    searchQuery.value = query
  }

  return {
    sidebarOpen,
    mobileSidebarOpen,
    searchQuery,
    toggleSidebar,
    openMobileSidebar,
    closeMobileSidebar,
    setSearch,
  }
})
