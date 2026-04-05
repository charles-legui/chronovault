import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(true)
  const searchQuery = ref('')

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function setSearch(query: string) {
    searchQuery.value = query
  }

  return { sidebarOpen, searchQuery, toggleSidebar, setSearch }
})
