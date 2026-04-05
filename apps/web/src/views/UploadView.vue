<script setup lang="ts">
import { computed } from 'vue'
import UploadDropzone from '@/components/upload/UploadDropzone.vue'
import { useUploadQueue } from '@/composables/useUploadQueue'

const {
  queue, pending, uploading, succeeded, failed, total, allDone, overallProgress,
  addFiles, remove, retry, clearDone, clearAll,
  ACCEPTED,
} = useUploadQueue()

const accept = [...ACCEPTED].join(',')

// Global state derived for the summary bar
const summaryVisible = computed(() => total.value > 0)
const summaryLabel   = computed(() => {
  if (allDone.value && failed.value === 0) return `${succeeded.value} fichier${succeeded.value > 1 ? 's' : ''} importé${succeeded.value > 1 ? 's' : ''} avec succès`
  if (allDone.value && failed.value > 0)  return `${succeeded.value} succès · ${failed.value} erreur${failed.value > 1 ? 's' : ''}`
  return `${uploading.value} en cours · ${pending.value} en attente…`
})

function fmtSize(bytes: number): string {
  if (bytes < 1024)       return `${bytes} o`
  if (bytes < 1048576)    return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / 1048576).toFixed(1)} Mo`
}

function fmtType(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'JPEG', 'image/png': 'PNG', 'image/webp': 'WebP',
    'image/gif': 'GIF', 'video/mp4': 'MP4', 'video/quicktime': 'MOV',
    'video/webm': 'WebM',
  }
  return map[mime] ?? mime.split('/')[1]?.toUpperCase() ?? '?'
}

function isVideo(mime: string): boolean {
  return mime.startsWith('video/')
}
</script>

<template>
  <div class="upload-page">

    <!-- ── Page header ─────────────────────────────────── -->
    <header class="page-header">
      <div>
        <h1 class="page-title">Upload</h1>
        <p class="page-subtitle">Importez vos photos et vidéos</p>
      </div>
      <button
        v-if="total > 0"
        type="button"
        class="btn-ghost"
        @click="clearAll"
      >
        Tout effacer
      </button>
    </header>

    <!-- ── Dropzone ────────────────────────────────────── -->
    <UploadDropzone
      :accept="accept"
      @drop="addFiles"
    />

    <!-- ── Summary bar ────────────────────────────────── -->
    <Transition name="slide-down">
      <div
        v-if="summaryVisible"
        class="summary-bar"
        :class="{
          'summary-bar--done':  allDone && failed === 0,
          'summary-bar--error': allDone && failed > 0,
        }"
        role="status"
        aria-live="polite"
        aria-atomic="false"
      >
        <!-- Global progress -->
        <div class="summary-left">
          <div
            v-if="!allDone"
            class="summary-spinner"
            aria-hidden="true"
          />
          <svg
            v-else-if="failed === 0"
            viewBox="0 0 20 20" width="18" height="18"
            fill="none" stroke="var(--color-success)" stroke-width="2"
            stroke-linecap="round" aria-hidden="true"
          >
            <path d="M4 10.5 8 14.5 16 6.5"/>
          </svg>
          <svg
            v-else
            viewBox="0 0 20 20" width="18" height="18"
            fill="none" stroke="var(--color-warning)" stroke-width="2"
            stroke-linecap="round" aria-hidden="true"
          >
            <path d="M10 7v4M10 13.5v.5"/>
            <path d="M9.13 3.5 2 16h16L10.87 3.5a1 1 0 0 0-1.74 0z"/>
          </svg>

          <span class="summary-label">{{ summaryLabel }}</span>
        </div>

        <div class="summary-right">
          <div v-if="!allDone" class="summary-progress-wrap">
            <div
              class="summary-progress-bar"
              :style="{ width: `${overallProgress}%` }"
              role="progressbar"
              :aria-valuenow="overallProgress"
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>

          <button
            v-if="allDone && succeeded > 0"
            type="button"
            class="btn-sm"
            @click="clearDone"
          >
            Effacer les succès
          </button>
        </div>
      </div>
    </Transition>

    <!-- ── File list ────────────────────────────────────── -->
    <TransitionGroup
      v-if="queue.length > 0"
      name="file-list"
      tag="ul"
      class="file-list"
      aria-label="Fichiers à importer"
    >
      <li
        v-for="item in queue"
        :key="item.id"
        class="file-item"
        :class="{
          'file-item--uploading': item.status === 'uploading',
          'file-item--success':   item.status === 'success',
          'file-item--error':     item.status === 'error',
        }"
      >
        <!-- ── Thumbnail ─────────────── -->
        <div class="file-thumb">
          <!-- Image preview -->
          <img
            v-if="item.previewUrl"
            :src="item.previewUrl"
            :alt="item.file.name"
            class="file-thumb-img"
          />
          <!-- Video placeholder -->
          <div v-else-if="isVideo(item.file.type)" class="file-thumb-placeholder file-thumb-placeholder--video">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
                 stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2"/>
            </svg>
          </div>
          <!-- Generic placeholder -->
          <div v-else class="file-thumb-placeholder">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
                 stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/>
              <path d="m21 15-5-5L5 21"/>
            </svg>
          </div>

          <!-- Status icon overlay on thumb -->
          <div
            v-if="item.status === 'success' || item.status === 'error'"
            class="file-thumb-status"
            :class="{
              'file-thumb-status--success': item.status === 'success',
              'file-thumb-status--error':   item.status === 'error',
            }"
            aria-hidden="true"
          >
            <!-- Checkmark -->
            <svg v-if="item.status === 'success'" viewBox="0 0 14 14" width="10" height="10"
                 fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
              <path d="M2 7 5.5 10.5 12 3.5"/>
            </svg>
            <!-- X -->
            <svg v-else viewBox="0 0 14 14" width="9" height="9"
                 fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
              <path d="M2 2l10 10M12 2 2 12"/>
            </svg>
          </div>
        </div>

        <!-- ── Info ──────────────────── -->
        <div class="file-info">
          <div class="file-name-row">
            <p class="file-name" :title="item.file.name">{{ item.file.name }}</p>
            <span class="file-badge" :class="`file-badge--${item.file.type.startsWith('video') ? 'video' : 'photo'}`">
              {{ fmtType(item.file.type) }}
            </span>
          </div>

          <p class="file-meta">{{ fmtSize(item.file.size) }}</p>

          <!-- Error message -->
          <p v-if="item.status === 'error' && item.error" class="file-error">
            {{ item.error }}
          </p>

          <!-- Progress bar -->
          <div
            v-if="item.status === 'uploading' || item.status === 'pending'"
            class="file-progress"
            role="progressbar"
            :aria-valuenow="Math.round(item.progress)"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="`Progression de ${item.file.name}`"
          >
            <div class="file-progress-track">
              <div
                class="file-progress-fill"
                :style="{ width: `${item.progress}%` }"
              />
            </div>
            <span class="file-progress-pct">{{ Math.round(item.progress) }}%</span>
          </div>
        </div>

        <!-- ── Status label ──────────── -->
        <div class="file-status">
          <span
            v-if="item.status === 'pending'"
            class="status-label status-label--pending"
          >
            En attente
          </span>

          <span
            v-else-if="item.status === 'uploading'"
            class="status-label status-label--uploading"
          >
            <span class="status-dot-anim" aria-hidden="true"/>
            Envoi…
          </span>

          <span
            v-else-if="item.status === 'success'"
            class="status-label status-label--success"
          >
            Importé
          </span>

          <span
            v-else-if="item.status === 'error'"
            class="status-label status-label--error"
          >
            Erreur
          </span>
        </div>

        <!-- ── Actions ───────────────── -->
        <div class="file-actions">
          <button
            v-if="item.status === 'error'"
            type="button"
            class="file-btn file-btn--retry"
            aria-label="Réessayer"
            title="Réessayer"
            @click="retry(item.id)"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <path d="M1 4v6h6"/>
              <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
            </svg>
          </button>

          <button
            v-if="item.status !== 'uploading'"
            type="button"
            class="file-btn file-btn--remove"
            :aria-label="`Supprimer ${item.file.name}`"
            title="Supprimer"
            @click="remove(item.id)"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </li>
    </TransitionGroup>

    <!-- ── Empty hint ────────────────────────────────────── -->
    <p v-else class="empty-hint" aria-hidden="true">
      Aucun fichier sélectionné. Glissez des médias dans la zone ci-dessus.
    </p>

  </div>
</template>

<style scoped>
.upload-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-width: 800px;
}

/* ── Header ─────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
}

.btn-ghost {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  transition: color var(--transition-fast), background-color var(--transition-fast);
}

.btn-ghost:hover {
  color: var(--color-error);
  background: var(--color-error-bg);
}

/* ── Summary bar ────────────────────────────────────────── */
.summary-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.summary-bar--done  { border-color: var(--green-100);  background: var(--green-100); }
.summary-bar--error { border-color: var(--yellow-100); background: var(--yellow-100); }

.summary-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.summary-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text);
  white-space: nowrap;
}

.summary-bar--done  .summary-label { color: var(--green-500); }
.summary-bar--error .summary-label { color: var(--yellow-500); }

.summary-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: var(--radius-full);
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }

.summary-right {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.summary-progress-wrap {
  width: 120px;
  height: 6px;
  background: var(--color-surface-overlay);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.summary-progress-bar {
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width var(--transition-fast);
}

.btn-sm {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--color-text-secondary);
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  white-space: nowrap;
  transition: background-color var(--transition-fast);
}

.btn-sm:hover { background: var(--color-surface-overlay); }

/* ── File list ──────────────────────────────────────────── */
.file-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  list-style: none;
}

.file-item {
  display: grid;
  grid-template-columns: 64px 1fr auto auto;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  transition:
    border-color var(--transition-fast),
    background-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.file-item--uploading { border-color: var(--color-primary-border); }
.file-item--success   { border-color: var(--green-100); background: color-mix(in srgb, var(--green-100) 40%, white); }
.file-item--error     { border-color: var(--red-100); background: color-mix(in srgb, var(--red-100) 30%, white); }

/* ── Thumbnail ──────────────────────────────────────────── */
.file-thumb {
  position: relative;
  width: 64px;
  height: 52px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
}

.file-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-overlay);
  color: var(--color-text-tertiary);
}

.file-thumb-placeholder--video {
  background: linear-gradient(135deg, var(--neutral-800), var(--neutral-700));
  color: rgba(255,255,255,0.5);
}

.file-thumb-status {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-thumb-status--success { background: rgba(34,197,94,0.75); }
.file-thumb-status--error   { background: rgba(239,68,68,0.75); }

/* ── Info ───────────────────────────────────────────────── */
.file-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.file-name-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}

.file-name {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-badge {
  flex-shrink: 0;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  padding: 1px 6px;
  border-radius: var(--radius-full);
  line-height: 1.5;
}

.file-badge--photo {
  background: var(--color-primary-subtle);
  color: var(--color-primary);
}

.file-badge--video {
  background: rgba(251,191,36,0.15);
  color: #b45309;
}

.file-meta {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

.file-error {
  font-size: var(--text-xs);
  color: var(--color-error);
  line-height: var(--leading-snug);
}

/* Progress bar */
.file-progress {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-1);
}

.file-progress-track {
  flex: 1;
  height: 4px;
  background: var(--color-surface-overlay);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.file-progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width 0.15s linear;
}

.file-progress-pct {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  font-variant-numeric: tabular-nums;
  width: 30px;
  text-align: right;
  flex-shrink: 0;
}

/* ── Status labels ──────────────────────────────────────── */
.file-status { flex-shrink: 0; }

.status-label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  padding: 3px var(--space-2);
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.status-label--pending  { background: var(--color-surface-overlay); color: var(--color-text-tertiary); }
.status-label--uploading{ background: var(--color-primary-subtle); color: var(--color-primary); }
.status-label--success  { background: var(--green-100); color: var(--green-500); }
.status-label--error    { background: var(--red-100); color: var(--red-500); }

.status-dot-anim {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  animation: pulse-dot 1s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(0.75); }
}

/* ── Action buttons ─────────────────────────────────────── */
.file-actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex-shrink: 0;
}

.file-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  color: var(--color-text-tertiary);
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.file-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

.file-btn--retry:hover { background: var(--color-primary-subtle); color: var(--color-primary); }
.file-btn--remove:hover { background: var(--color-error-bg); color: var(--color-error); }

/* ── Empty hint ─────────────────────────────────────────── */
.empty-hint {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  text-align: center;
  padding: var(--space-4);
}

/* ── Transitions ────────────────────────────────────────── */
.file-list-enter-active {
  transition: opacity var(--duration-base) var(--ease-out),
              transform var(--duration-base) var(--ease-out);
}
.file-list-leave-active {
  transition: opacity var(--duration-fast) var(--ease-in),
              transform var(--duration-fast) var(--ease-in);
  position: absolute;
  width: 100%;
}
.file-list-enter-from { opacity: 0; transform: translateY(-8px); }
.file-list-leave-to   { opacity: 0; transform: translateX(12px); }
.file-list-move {
  transition: transform var(--duration-base) var(--ease-out);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: opacity var(--duration-base) var(--ease-out),
              transform var(--duration-base) var(--ease-out);
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
