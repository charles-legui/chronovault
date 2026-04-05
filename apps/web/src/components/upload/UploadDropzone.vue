<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ accept?: string; disabled?: boolean }>()
const emit = defineEmits<{ drop: [files: File[]] }>()

const dragging  = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
let dragCounter = 0   // track nested drag enter/leave

function onDragEnter(e: DragEvent) {
  e.preventDefault()
  dragCounter++
  if (e.dataTransfer?.types.includes('Files')) dragging.value = true
}

function onDragLeave() {
  dragCounter--
  if (dragCounter === 0) dragging.value = false
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  dragCounter = 0
  dragging.value = false
  const files = Array.from(e.dataTransfer?.files ?? [])
  if (files.length) emit('drop', files)
}

function openPicker() {
  fileInput.value?.click()
}

function onFileInput(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  if (files.length) emit('drop', files)
  // Reset so the same file can be re-selected
  ;(e.target as HTMLInputElement).value = ''
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    openPicker()
  }
}
</script>

<template>
  <div
    class="dropzone"
    :class="{ 'dropzone--over': dragging, 'dropzone--disabled': disabled }"
    role="button"
    tabindex="0"
    aria-label="Zone de dépôt — cliquez ou glissez des fichiers ici"
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
    @dragover="onDragOver"
    @drop="onDrop"
    @click="openPicker"
    @keydown="onKeydown"
  >
    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      multiple
      :accept="accept"
      class="sr-only"
      tabindex="-1"
      aria-hidden="true"
      @change="onFileInput"
    />

    <!-- Animated border ring (shown while dragging) -->
    <div class="dropzone-ring" aria-hidden="true" />

    <!-- Icon -->
    <div class="dropzone-icon" :class="{ 'dropzone-icon--over': dragging }" aria-hidden="true">
      <svg viewBox="0 0 48 48" width="44" height="44" fill="none" stroke="currentColor"
           stroke-width="1.5" stroke-linecap="round">
        <rect x="6" y="10" width="36" height="28" rx="4"/>
        <path d="M24 32V20M17 27l7-7 7 7"/>
        <path d="M16 38h16"/>
      </svg>
    </div>

    <!-- Text -->
    <div class="dropzone-text">
      <p class="dropzone-heading">
        <span v-if="!dragging">Glissez vos fichiers ici</span>
        <span v-else>Déposez maintenant</span>
      </p>
      <p class="dropzone-sub" v-if="!dragging">
        ou <span class="dropzone-browse">parcourir</span> depuis votre ordinateur
      </p>
      <p class="dropzone-formats" v-if="!dragging">
        JPEG · PNG · WebP · GIF · MP4 · MOV · WebM
      </p>
    </div>
  </div>
</template>

<style scoped>
.dropzone {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-12) var(--space-8);
  border: 2px dashed var(--color-border-strong);
  border-radius: var(--radius-2xl);
  background: var(--color-surface);
  cursor: pointer;
  outline: none;
  transition:
    border-color     var(--transition-base),
    background-color var(--transition-base);
  text-align: center;
  user-select: none;
}

.dropzone:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-subtle);
}

.dropzone:focus-visible {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
  background: var(--color-primary-subtle);
}

.dropzone--over {
  border-color: var(--color-primary);
  background: var(--color-primary-subtle);
  border-style: solid;
}

.dropzone--disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* Animated ring on drag-over */
.dropzone-ring {
  position: absolute;
  inset: -2px;
  border-radius: var(--radius-2xl);
  border: 2px solid transparent;
  transition: border-color var(--transition-fast);
  pointer-events: none;
}

.dropzone--over .dropzone-ring {
  border-color: var(--color-primary);
  animation: ring-pulse 1.2s var(--ease-default) infinite;
}

@keyframes ring-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

/* Icon */
.dropzone-icon {
  color: var(--color-text-tertiary);
  transition: color var(--transition-base), transform var(--transition-base);
}

.dropzone:hover .dropzone-icon,
.dropzone-icon--over {
  color: var(--color-primary);
  transform: translateY(-3px);
}

/* Text */
.dropzone-heading {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-text);
  line-height: var(--leading-tight);
}

.dropzone-sub {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-top: var(--space-1);
}

.dropzone-browse {
  color: var(--color-primary);
  font-weight: var(--font-medium);
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: text-decoration-color var(--transition-fast);
}

.dropzone:hover .dropzone-browse {
  text-decoration-color: var(--color-primary);
}

.dropzone-formats {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  letter-spacing: var(--tracking-wide);
  margin-top: var(--space-3);
}

.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}
</style>
