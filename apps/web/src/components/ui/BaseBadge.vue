<script setup lang="ts">
export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
export type BadgeSize    = 'sm' | 'md'

withDefaults(defineProps<{
  variant?: BadgeVariant
  size?:    BadgeSize
  dot?:     boolean     // show colored dot instead of/before text
}>(), {
  variant: 'default',
  size:    'md',
})

defineSlots<{ default(props: {}): unknown }>()
</script>

<template>
  <span
    class="badge"
    :class="[`badge--${variant}`, `badge--${size}`, { 'badge--dot': dot }]"
  >
    <span v-if="dot" class="badge-dot" aria-hidden="true" />
    <slot />
  </span>
</template>

<style scoped>
/* ── Base ────────────────────────────────────────────────── */
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-family: var(--font-sans);
  font-weight: var(--font-semibold);
  line-height: 1;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

/* ── Sizes ───────────────────────────────────────────────── */
.badge--sm { font-size: var(--text-xs); padding: 2px var(--space-2); }
.badge--md { font-size: var(--text-xs); padding: 3px var(--space-2); }

/* ── Dot ─────────────────────────────────────────────────── */
.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: currentColor;
  flex-shrink: 0;
}

/* ── Variants ────────────────────────────────────────────── */
.badge--default {
  background: var(--color-surface-overlay);
  color: var(--color-text-secondary);
}

.badge--primary {
  background: var(--color-primary-subtle);
  color: var(--color-primary);
}

.badge--success {
  background: var(--green-100);
  color: var(--green-500);
}

.badge--warning {
  background: var(--yellow-100);
  color: var(--yellow-500);
}

.badge--error {
  background: var(--red-100);
  color: var(--red-500);
}

.badge--info {
  background: rgba(14,165,233,0.1);
  color: #0ea5e9;
}
</style>
