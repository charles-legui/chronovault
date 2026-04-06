<script setup lang="ts">
import { reactive, ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAlbumsStore } from '@/stores/albumsStore'
import AlbumFormFields from '@/components/albums/AlbumFormFields.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const route  = useRoute()
const router = useRouter()
const albums = useAlbumsStore()

const albumId = computed(() => route.params.id as string)

interface EditForm {
  title:         string
  description:   string
  tags:          string[]
  coverImageUrl: string
  eventDate:     string
}

const form = reactive<EditForm>({
  title:         '',
  description:   '',
  tags:          [],
  coverImageUrl: '',
  eventDate:     '',
})

const fieldErrors = reactive({ title: '' })
const saved       = ref(false)
let redirectTimer: ReturnType<typeof setTimeout> | null = null

onMounted(async () => {
  albums.clearError()
  await albums.fetchAlbumById(albumId.value)
})

onUnmounted(() => {
  if (redirectTimer !== null) clearTimeout(redirectTimer)
})

watch(
  () => albums.currentAlbum,
  (album) => {
    if (!album) return
    form.title         = album.title
    form.description   = album.description  ?? ''
    form.tags          = [...album.tags]
    form.coverImageUrl = album.coverImageUrl ?? ''
    form.eventDate     = album.eventDate
      ? album.eventDate.slice(0, 10)  // ISO → YYYY-MM-DD for <input type="date">
      : ''
  },
  { immediate: true },
)

// ── Validation ────────────────────────────────────────────────────────────────

function validate(): boolean {
  fieldErrors.title = ''
  if (!form.title.trim()) {
    fieldErrors.title = 'Le titre est requis'
    return false
  }
  if (form.title.trim().length > 200) {
    fieldErrors.title = 'Le titre ne peut pas dépasser 200 caractères'
    return false
  }
  return true
}

// ── Delete ────────────────────────────────────────────────────────────────────

async function handleDelete() {
  const album = albums.currentAlbum
  if (!album) return
  if (!window.confirm(`Supprimer l'album « ${album.title} » ? Cette action est irréversible.`)) return
  const ok = await albums.deleteAlbum(albumId.value)
  if (ok) {
    router.push({ name: 'albums' })
  }
}

// ── Submit ────────────────────────────────────────────────────────────────────

async function handleSubmit() {
  if (!validate()) return
  saved.value = false

  const updated = await albums.updateAlbum(albumId.value, {
    title:         form.title.trim(),
    description:   form.description.trim()   || undefined,
    tags:          [...form.tags],
    coverImageUrl: form.coverImageUrl.trim() || undefined,
    eventDate:     form.eventDate             || undefined,
  })

  if (updated) {
    saved.value = true
    redirectTimer = setTimeout(() => {
      router.push({ name: 'album-detail', params: { id: albumId.value } })
    }, 1200)
  }
}
</script>

<template>
  <div class="edit-page">

    <!-- Page header -->
    <header class="page-header">
      <button type="button" class="btn-back"
              @click="router.push({ name: 'album-detail', params: { id: albumId } })">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Retour à l'album
      </button>
      <h1 class="page-title">Modifier l'album</h1>
    </header>

    <!-- Loading -->
    <div v-if="albums.loading && !albums.currentAlbum" class="loading-state" aria-busy="true">
      <div class="skeleton-field" />
      <div class="skeleton-field skeleton-field--tall" />
      <div class="skeleton-field skeleton-field--short" />
    </div>

    <!-- Not found -->
    <div v-else-if="!albums.loading && !albums.currentAlbum && !albums.error"
         class="empty-state" role="status">
      <p class="empty-title">Album introuvable</p>
      <p class="empty-subtitle">Cet album n'existe pas ou vous n'y avez pas accès.</p>
      <BaseButton variant="secondary" @click="router.push({ name: 'albums' })">
        Retour aux albums
      </BaseButton>
    </div>

    <!-- Error -->
    <div v-else-if="albums.error && !albums.currentAlbum" class="error-banner" role="alert">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
      </svg>
      {{ albums.error }}
      <button type="button" class="error-retry"
              @click="albums.fetchAlbumById(albumId)">
        Réessayer
      </button>
    </div>

    <!-- Form -->
    <form v-else class="form-card" novalidate @submit.prevent="handleSubmit">

      <Transition name="fade">
        <div v-if="saved" class="success-banner" role="status">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
          Album mis à jour — redirection en cours…
        </div>
      </Transition>

      <AlbumFormFields
        v-model:title="form.title"
        v-model:description="form.description"
        v-model:tags="form.tags"
        v-model:cover-image-url="form.coverImageUrl"
        v-model:event-date="form.eventDate"
        :disabled="albums.loading"
        :title-error="fieldErrors.title"
      />

      <p v-if="albums.error" class="form-error" role="alert">
        {{ albums.error }}
      </p>

      <div class="form-actions">
        <BaseButton
          type="button"
          variant="secondary"
          :disabled="albums.loading"
          @click="router.push({ name: 'album-detail', params: { id: albumId } })"
        >
          Annuler
        </BaseButton>
        <BaseButton
          type="submit"
          variant="primary"
          :loading="albums.loading"
        >
          Enregistrer
        </BaseButton>
      </div>

      <div class="danger-zone">
        <div class="danger-text">
          <p class="danger-title">Zone de danger</p>
          <p class="danger-subtitle">La suppression est définitive et ne peut pas être annulée.</p>
        </div>
        <BaseButton
          type="button"
          variant="danger"
          size="sm"
          :disabled="albums.loading"
          @click="handleDelete"
        >
          Supprimer l'album
        </BaseButton>
      </div>

    </form>
  </div>
</template>

<style scoped>
.edit-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-width: 600px;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
  width: fit-content;
}

.btn-back:hover { color: var(--color-text); }

/* Loading skeleton */
.loading-state {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.skeleton-field {
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-surface-raised);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-field--tall  { height: 88px; }
.skeleton-field--short { width: 50%; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}

/* Empty / error states */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-16) var(--space-8);
  text-align: center;
}

.empty-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-text);
}

.empty-subtitle {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

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

/* Form card */
.form-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Success banner */
.success-banner {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: color-mix(in srgb, var(--color-success, #22c55e) 10%, transparent);
  color: var(--color-success, #16a34a);
  border: 1px solid color-mix(in srgb, var(--color-success, #22c55e) 25%, transparent);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.fade-enter-active,
.fade-leave-active { transition: opacity var(--duration-fast) var(--ease-out); }
.fade-enter-from,
.fade-leave-to     { opacity: 0; }

/* Error */
.form-error {
  font-size: var(--text-sm);
  color: var(--color-error);
  background: color-mix(in srgb, var(--color-error) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-error) 20%, transparent);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  line-height: var(--leading-normal);
}

/* Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border-subtle);
}

/* Danger zone */
.danger-zone {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4);
  border: 1px solid color-mix(in srgb, var(--color-error) 25%, transparent);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-error) 4%, transparent);
}

.danger-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.danger-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-error);
}

.danger-subtitle {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);
}
</style>
