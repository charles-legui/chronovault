<script setup lang="ts">
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

withDefaults(defineProps<{
  padding?:   CardPadding
  hoverable?: boolean
  selected?:  boolean
  as?:        string    // rendered tag: 'div' | 'article' | 'li' | …
}>(), {
  padding: 'md',
  as:      'div',
})

defineEmits<{ click: [e: MouseEvent] }>()

defineSlots<{
  header(props: {}):  unknown
  default(props: {}): unknown
  footer(props: {}):  unknown
}>()
</script>

<template>
  <component
    :is="as"
    class="card"
    :class="[
      `card--p-${padding}`,
      { 'card--hoverable': hoverable, 'card--selected': selected },
    ]"
    @click="$emit('click', $event)"
  >
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>

    <div v-if="$slots.default" class="card-body" :class="`card-body--p-${padding}`">
      <slot />
    </div>

    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </component>
</template>

<style scoped>
/* ── Shell ───────────────────────────────────────────────── */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── States ──────────────────────────────────────────────── */
.card--hoverable {
  cursor: pointer;
  transition:
    box-shadow   var(--transition-base),
    transform    var(--transition-base),
    border-color var(--transition-base);
}

.card--hoverable:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
  border-color: var(--color-border-strong);
}

.card--hoverable:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus);
  border-color: var(--color-primary);
}

.card--selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary), var(--shadow-sm);
}

/* ── Sections ────────────────────────────────────────────── */
.card-header {
  padding: var(--space-4) var(--space-5) var(--space-3);
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.card-footer {
  padding: var(--space-3) var(--space-5) var(--space-4);
  border-top: 1px solid var(--color-border-subtle);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  background: var(--color-surface-raised);
}

/* ── Padding variants ────────────────────────────────────── */
.card-body--p-none { padding: 0; }
.card-body--p-sm   { padding: var(--space-3) var(--space-4); }
.card-body--p-md   { padding: var(--space-5); }
.card-body--p-lg   { padding: var(--space-8); }
</style>
