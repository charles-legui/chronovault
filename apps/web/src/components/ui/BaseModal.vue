<script setup lang="ts">
import { watch, onMounted, onUnmounted, nextTick, ref } from 'vue'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

const props = withDefaults(defineProps<{
  modelValue:  boolean
  title?:      string
  size?:       ModalSize
  persistent?: boolean   // prevent close on backdrop click
  hideClose?:  boolean
}>(), {
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [open: boolean]
  close: []
}>()

defineSlots<{
  default(props: {}):  unknown
  footer(props: {}):   unknown
}>()

const panelRef = ref<HTMLElement | null>(null)

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function onBackdrop() {
  if (!props.persistent) close()
}

// Lock body scroll + focus trap
watch(() => props.modelValue, async (open) => {
  if (open) {
    document.body.style.overflow = 'hidden'
    await nextTick()
    panelRef.value?.focus()
  } else {
    document.body.style.overflow = ''
  }
}, { immediate: true })

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modelValue && !props.persistent) close()
}

onMounted(()  => document.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="modal-root"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <!-- Backdrop -->
        <div
          class="modal-backdrop"
          aria-hidden="true"
          @click="onBackdrop"
        />

        <!-- Panel -->
        <div
          ref="panelRef"
          class="modal-panel"
          :class="`modal-panel--${size}`"
          tabindex="-1"
        >
          <!-- Header -->
          <div v-if="title || !hideClose" class="modal-header">
            <h2 v-if="title" class="modal-title">{{ title }}</h2>
            <div class="modal-header-spacer" />
            <button
              v-if="!hideClose"
              type="button"
              class="modal-close"
              aria-label="Fermer"
              @click="close"
            >
              <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22z"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── Root (full viewport) ────────────────────────────────── */
.modal-root {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

/* ── Backdrop ────────────────────────────────────────────── */
.modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
}

/* ── Panel ───────────────────────────────────────────────── */
.modal-panel {
  position: relative;
  background: var(--color-surface);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - var(--space-8));
  width: 100%;
  outline: none;
  overflow: hidden;
}

/* ── Sizes ───────────────────────────────────────────────── */
.modal-panel--sm   { max-width: 400px; }
.modal-panel--md   { max-width: 560px; }
.modal-panel--lg   { max-width: 720px; }
.modal-panel--xl   { max-width: 960px; }
.modal-panel--full { max-width: calc(100vw - var(--space-8)); max-height: calc(100vh - var(--space-8)); }

/* ── Header ──────────────────────────────────────────────── */
.modal-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-6) var(--space-4);
  border-bottom: 1px solid var(--color-border-subtle);
  flex-shrink: 0;
}

.modal-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-text);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

.modal-header-spacer { flex: 1; }

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  color: var(--color-text-tertiary);
  flex-shrink: 0;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.modal-close:hover {
  background: var(--color-surface-overlay);
  color: var(--color-text);
}

.modal-close:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

/* ── Body ────────────────────────────────────────────────── */
.modal-body {
  padding: var(--space-6);
  overflow-y: auto;
  flex: 1;
}

/* ── Footer ──────────────────────────────────────────────── */
.modal-footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border-subtle);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
  flex-shrink: 0;
  background: var(--color-surface-raised);
}

/* ── Transition ──────────────────────────────────────────── */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--duration-slow) var(--ease-out);
}

.modal-enter-active .modal-panel,
.modal-leave-active .modal-panel {
  transition: transform var(--duration-slow) var(--ease-out),
              opacity   var(--duration-slow) var(--ease-out);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-panel {
  transform: scale(0.95) translateY(8px);
  opacity: 0;
}

.modal-leave-to .modal-panel {
  transform: scale(0.97) translateY(4px);
  opacity: 0;
}
</style>
