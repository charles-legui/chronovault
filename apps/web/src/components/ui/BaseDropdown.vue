<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

export type DropdownPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'

const props = withDefaults(defineProps<{
  modelValue?:  boolean
  placement?:   DropdownPlacement
  width?:       string   // e.g. '200px' — defaults to auto
  disabled?:    boolean
}>(), {
  modelValue: false,
  placement:  'bottom-start',
})

const emit = defineEmits<{
  'update:modelValue': [open: boolean]
}>()

defineSlots<{
  trigger(props: { toggle: () => void; open: boolean }): unknown
  default(props: { close: () => void }): unknown
}>()

const wrapRef = ref<HTMLElement | null>(null)

function open()   { if (!props.disabled) emit('update:modelValue', true)  }
function close()  { emit('update:modelValue', false) }
function toggle() { props.modelValue ? close() : open() }

// Close on click outside
function onClickOutside(e: MouseEvent) {
  if (wrapRef.value && !wrapRef.value.contains(e.target as Node)) close()
}

// Close on Escape
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modelValue) {
    close()
    // Return focus to trigger
    const trigger = wrapRef.value?.querySelector<HTMLElement>('[data-trigger]')
    trigger?.focus()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onClickOutside)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="wrapRef" class="dropdown-wrap" :style="width ? { width } : {}">

    <!-- Trigger slot — passes toggle + open state -->
    <slot name="trigger" :toggle="toggle" :open="modelValue" />

    <!-- Menu -->
    <Transition name="dropdown">
      <div
        v-if="modelValue"
        class="dropdown-menu"
        :class="`dropdown-menu--${placement}`"
        :style="width ? { minWidth: width } : {}"
        role="menu"
        @click.stop
      >
        <slot :close="close" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-wrap {
  position: relative;
  display: inline-flex;
}

/* ── Menu panel ──────────────────────────────────────────── */
.dropdown-menu {
  position: absolute;
  z-index: var(--z-dropdown);
  min-width: 180px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--space-1) 0;
  overflow: hidden;
}

/* ── Placement ───────────────────────────────────────────── */
.dropdown-menu--bottom-start { top: calc(100% + var(--space-2)); left: 0;   }
.dropdown-menu--bottom-end   { top: calc(100% + var(--space-2)); right: 0;  }
.dropdown-menu--top-start    { bottom: calc(100% + var(--space-2)); left: 0;  }
.dropdown-menu--top-end      { bottom: calc(100% + var(--space-2)); right: 0; }

/* ── Transition ──────────────────────────────────────────── */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out),
              transform var(--duration-fast) var(--ease-out);
}

.dropdown-menu--bottom-start.dropdown-enter-from,
.dropdown-menu--bottom-start.dropdown-leave-to,
.dropdown-menu--bottom-end.dropdown-enter-from,
.dropdown-menu--bottom-end.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
  transform-origin: top;
}

.dropdown-menu--top-start.dropdown-enter-from,
.dropdown-menu--top-start.dropdown-leave-to,
.dropdown-menu--top-end.dropdown-enter-from,
.dropdown-menu--top-end.dropdown-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.97);
  transform-origin: bottom;
}
</style>
