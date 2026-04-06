// ── Album ─────────────────────────────────────────────────────────────────────

export interface Album {
  id: string
  ownerId: string
  title: string
  description?: string
  tags: string[]
  coverImageUrl?: string
  eventDate?: string
  createdAt: string
  updatedAt: string
}

// ── Payloads ──────────────────────────────────────────────────────────────────

export interface DeleteAlbumPayload {
  id: string
  deleted: boolean
}

// ── Form inputs ───────────────────────────────────────────────────────────────

export interface CreateAlbumForm {
  title: string
  description?: string
  tags?: string[]
  coverImageUrl?: string
  eventDate?: string
}

export interface UpdateAlbumForm {
  title?: string
  description?: string
  tags?: string[]
  coverImageUrl?: string
  eventDate?: string
}
