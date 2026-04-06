<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAlbumsStore } from '@/stores/albumsStore'
import AlbumFormFields from '@/components/albums/AlbumFormFields.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

interface CreateForm {
  title:         string
  description:   string
  tags:          string[]
  coverImageUrl: string
  eventDate:     string
}

const router = useRouter()
const albums = useAlbumsStore()

const form = reactive<CreateForm>({
  title:         '',
  description:   '',
  tags:          [],
  coverImageUrl: '',
  eventDate:     '',
})

const fieldErrors = reactive({ title: '' })

onMounted(() => albums.clearError())

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

// ── Submit ────────────────────────────────────────────────────────────────────

async function handleSubmit() {
  if (!validate()) return

  const created = await albums.createAlbum({
    title:        form.title.trim(),
    description:  form.description.trim()   || undefined,
    tags:         form.tags.length ? [...form.tags] : undefined,
    coverImageUrl: form.coverImageUrl.trim() || undefined,
    eventDate:    form.eventDate             || undefined,
  })

  if (created) {
    router.push({ name: 'album-detail', params: { id: created.id } })
  }
}
</script>

<template>
  <div class="create-page">

    <!-- Page header -->
    <header class="page-header">
      <button type="button" class="btn-back"
              @click="router.push({ name: 'albums' })">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        Retour
      </button>
      <h1 class="page-title">Nouvel album</h1>
    </header>

    <form class="form-card" novalidate @submit.prevent="handleSubmit">

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
          @click="router.push({ name: 'albums' })"
        >
          Annuler
        </BaseButton>
        <BaseButton
          type="submit"
          variant="primary"
          :loading="albums.loading"
        >
          Créer l'album
        </BaseButton>
      </div>

    </form>
  </div>
</template>

<style scoped>
.create-page {
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

.form-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.form-error {
  font-size: var(--text-sm);
  color: var(--color-error);
  background: color-mix(in srgb, var(--color-error) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-error) 20%, transparent);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  line-height: var(--leading-normal);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border-subtle);
}
</style>
