import { ref } from 'vue'
import { defineStore } from 'pinia'
import { apolloClient } from '@/services/apolloClient'
import {
  MY_ALBUMS_QUERY,
  ALBUM_QUERY,
  CREATE_ALBUM_MUTATION,
  UPDATE_ALBUM_MUTATION,
  DELETE_ALBUM_MUTATION,
} from '@/graphql/albums'
import type { Album, CreateAlbumForm, UpdateAlbumForm, DeleteAlbumPayload } from '@/types/albums'

export const useAlbumsStore = defineStore('albums', () => {
  const albums       = ref<Album[]>([])
  const currentAlbum = ref<Album | null>(null)
  const loading      = ref(false)
  const error        = ref<string | null>(null)

  // ── Helpers ───────────────────────────────────────────────────────────────────

  function extractMessage(err: unknown): string {
    if (err instanceof Error) return err.message
    return 'An unexpected error occurred'
  }

  function clearError(): void {
    error.value = null
  }

  // ── Queries ───────────────────────────────────────────────────────────────────

  async function fetchMyAlbums(): Promise<void> {
    loading.value = true
    error.value   = null
    try {
      const result = await apolloClient.query<{ myAlbums: Album[] }>({
        query: MY_ALBUMS_QUERY,
        fetchPolicy: 'network-only',
      })
      if (!result.data?.myAlbums) throw new Error('Failed to fetch albums')
      albums.value = result.data.myAlbums
    } catch (err) {
      error.value = extractMessage(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchAlbumById(id: string): Promise<void> {
    loading.value      = true
    error.value        = null
    currentAlbum.value = null
    try {
      const result = await apolloClient.query<{ album: Album | null }>({
        query: ALBUM_QUERY,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      // null is a valid API response (album not found or not owned) — not an error
      currentAlbum.value = result.data?.album ?? null
    } catch (err) {
      error.value = extractMessage(err)
    } finally {
      loading.value = false
    }
  }

  // ── Mutations ─────────────────────────────────────────────────────────────────

  async function createAlbum(input: CreateAlbumForm): Promise<Album | null> {
    loading.value = true
    error.value   = null
    try {
      const result = await apolloClient.mutate<{ createAlbum: Album }>({
        mutation:  CREATE_ALBUM_MUTATION,
        variables: { input },
      })
      if (!result.data?.createAlbum) throw new Error('Failed to create album')
      const album = result.data.createAlbum
      albums.value = [album, ...albums.value]
      return album
    } catch (err) {
      error.value = extractMessage(err)
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateAlbum(id: string, input: UpdateAlbumForm): Promise<Album | null> {
    loading.value = true
    error.value   = null
    try {
      const result = await apolloClient.mutate<{ updateAlbum: Album }>({
        mutation:  UPDATE_ALBUM_MUTATION,
        variables: { id, input },
      })
      if (!result.data?.updateAlbum) throw new Error('Failed to update album')
      const updated = result.data.updateAlbum
      albums.value = albums.value.map(a => a.id === id ? updated : a)
      if (currentAlbum.value?.id === id) currentAlbum.value = updated
      return updated
    } catch (err) {
      error.value = extractMessage(err)
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteAlbum(id: string): Promise<boolean> {
    loading.value = true
    error.value   = null
    try {
      const result = await apolloClient.mutate<{ deleteAlbum: DeleteAlbumPayload }>({
        mutation:  DELETE_ALBUM_MUTATION,
        variables: { id },
      })
      if (!result.data?.deleteAlbum?.deleted) throw new Error('Failed to delete album')
      albums.value = albums.value.filter(a => a.id !== id)
      if (currentAlbum.value?.id === id) currentAlbum.value = null
      return true
    } catch (err) {
      error.value = extractMessage(err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    albums,
    currentAlbum,
    loading,
    error,
    clearError,
    fetchMyAlbums,
    fetchAlbumById,
    createAlbum,
    updateAlbum,
    deleteAlbum,
  }
})
