export type MediaType = 'photo' | 'video'

export interface Album {
  id: string
  title: string
  description?: string
  coverUrl?: string
  mediaCount: number
  createdAt: string
  updatedAt: string
  isShared: boolean
}

export interface MediaItem {
  id: string
  albumId: string
  type: MediaType
  url: string
  thumbnailUrl: string
  title?: string
  duration?: number // seconds, video only
  width?: number
  height?: number
  takenAt?: string
  createdAt: string
}

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

export interface NavItem {
  label: string
  to: string
  icon: string
}
