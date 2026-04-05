import { ref, computed } from 'vue'
import type { Album } from '@/types'

export type AlbumFilter = 'all' | 'shared' | 'private'
export type AlbumSort   = 'updated' | 'created' | 'title' | 'count'

export function useAlbumFilters(albums: Album[]) {
  const search     = ref('')
  const activeFilter = ref<AlbumFilter>('all')
  const activeSort   = ref<AlbumSort>('updated')

  const filtered = computed(() => {
    let result = [...albums]

    // Text search
    const q = search.value.trim().toLowerCase()
    if (q) {
      result = result.filter(
        a => a.title.toLowerCase().includes(q) ||
             a.description?.toLowerCase().includes(q),
      )
    }

    // Filter tab
    if (activeFilter.value === 'shared')  result = result.filter(a =>  a.isShared)
    if (activeFilter.value === 'private') result = result.filter(a => !a.isShared)

    // Sort
    result.sort((a, b) => {
      switch (activeSort.value) {
        case 'updated': return b.updatedAt.localeCompare(a.updatedAt)
        case 'created': return b.createdAt.localeCompare(a.createdAt)
        case 'title':   return a.title.localeCompare(b.title)
        case 'count':   return b.mediaCount - a.mediaCount
      }
    })

    return result
  })

  return { search, activeFilter, activeSort, filtered }
}
