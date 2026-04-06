<script setup lang="ts">
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize    = 'sm' | 'md' | 'lg'

const props = withDefaults(defineProps<{
  variant?:  ButtonVariant
  size?:     ButtonSize
  loading?:  boolean
  disabled?: boolean
  type?:     'button' | 'submit' | 'reset'
  full?:     boolean   // full width
}>(), {
  variant: 'primary',
  size:    'md',
  type:    'button',
})

defineSlots<{
  default(props: {}): unknown
  icon(props: {}):    unknown  // leading icon
}>()
</script>

<template>
  <button
    :type="type"
    class="btn"
    :class="[
      `btn--${variant}`,
      `btn--${size}`,
      { 'btn--loading': loading, 'btn--full': full },
    ]"
    :disabled="disabled || loading"
    :aria-disabled="disabled || loading"
    :aria-busy="loading"
  >
    <!-- Loading spinner -->
    <span v-if="loading" class="btn-spinner" aria-hidden="true" />

    <!-- Leading icon slot -->
    <span v-else-if="$slots.icon" class="btn-icon" aria-hidden="true">
      <slot name="icon" />
    </span>

    <!-- Label -->
    <span class="btn-label">
      <slot />
    </span>
  </button>
</template>

<style scoped>
/* ── Base ────────────────────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-sans);
  font-weight: var(--font-medium);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  line-height: 1;
  outline: none;
  transition:
    background-color var(--transition-fast),
    border-color     var(--transition-fast),
    color            var(--transition-fast),
    box-shadow       var(--transition-fast),
    transform        var(--transition-fast);
  -webkit-user-select: none;
  user-select: none;
}

.btn:focus-visible {
  box-shadow: var(--shadow-focus);
}

.btn:active:not(:disabled) {
  transform: scale(0.97);
}

.btn:disabled,
.btn--loading {
  opacity: 0.55;
  cursor: not-allowed;
  pointer-events: none;
}

.btn--full { width: 100%; }

/* ── Sizes ───────────────────────────────────────────────── */
.btn--sm { height: 32px; padding: 0 var(--space-3); font-size: var(--text-xs); }
.btn--md { height: 40px; padding: 0 var(--space-4); font-size: var(--text-sm); }
.btn--lg { height: 48px; padding: 0 var(--space-6); font-size: var(--text-base); }

/* ── Variants ────────────────────────────────────────────── */
.btn--primary {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}
.btn--primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
  box-shadow: 0 4px 12px rgba(99,102,241,0.3);
}

.btn--secondary {
  background: var(--color-surface);
  color: var(--color-text);
  border-color: var(--color-border-strong);
}
.btn--secondary:hover:not(:disabled) {
  background: var(--color-surface-raised);
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-sm);
}

.btn--ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border-color: transparent;
}
.btn--ghost:hover:not(:disabled) {
  background: var(--color-surface-overlay);
  color: var(--color-text);
}

.btn--danger {
  background: var(--color-error);
  color: white;
  border-color: var(--color-error);
}
.btn--danger:hover:not(:disabled) {
  background: #dc2626;
  box-shadow: 0 4px 12px rgba(239,68,68,0.3);
}

/* ── Icon & spinner ──────────────────────────────────────── */
.btn-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: var(--radius-full);
  animation: btn-spin 0.65s linear infinite;
  flex-shrink: 0;
  opacity: 0.7;
}

@keyframes btn-spin { to { transform: rotate(360deg); } }
</style>
