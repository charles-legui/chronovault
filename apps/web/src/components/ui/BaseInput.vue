<script setup lang="ts">
import { ref, useId } from 'vue'

export type InputType = 'text' | 'email' | 'password' | 'search' | 'url' | 'number' | 'tel'

const props = withDefaults(defineProps<{
  modelValue?: string
  type?:        InputType
  label?:       string
  placeholder?: string
  hint?:        string
  error?:       string
  disabled?:    boolean
  readonly?:    boolean
  required?:    boolean
  clearable?:   boolean
}>(), {
  type: 'text',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus:  [e: FocusEvent]
  blur:   [e: FocusEvent]
  clear:  []
}>()

defineSlots<{
  leading(props: {}): unknown  // icon/prefix inside left
  trailing(props: {}): unknown // icon/suffix inside right
}>()

const inputId = useId()
const hintId  = `${inputId}-hint`
const errorId = `${inputId}-error`
const focused = ref(false)

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
function onFocus(e: FocusEvent) { focused.value = true;  emit('focus', e) }
function onBlur(e: FocusEvent)  { focused.value = false; emit('blur',  e) }
function onClear() {
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<template>
  <div
    class="field"
    :class="{
      'field--error':    !!error,
      'field--disabled': disabled,
      'field--focused':  focused,
    }"
  >
    <!-- Label -->
    <label v-if="label" :for="inputId" class="field-label">
      {{ label }}
      <span v-if="required" class="field-required" aria-hidden="true">*</span>
    </label>

    <!-- Input wrapper -->
    <div class="field-wrap">
      <span v-if="$slots.leading" class="field-adornment field-adornment--leading" aria-hidden="true">
        <slot name="leading" />
      </span>

      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :aria-invalid="!!error"
        :aria-describedby="[error ? errorId : '', hint ? hintId : ''].filter(Boolean).join(' ') || undefined"
        class="field-input"
        :class="{
          'field-input--leading':   $slots.leading,
          'field-input--trailing':  $slots.trailing || clearable,
        }"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
      />

      <!-- Clearable button -->
      <button
        v-if="clearable && modelValue"
        type="button"
        class="field-clear"
        aria-label="Effacer"
        tabindex="-1"
        @click="onClear"
      >
        <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
          <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z"/>
        </svg>
      </button>

      <span v-else-if="$slots.trailing" class="field-adornment field-adornment--trailing" aria-hidden="true">
        <slot name="trailing" />
      </span>
    </div>

    <!-- Error -->
    <p v-if="error" :id="errorId" class="field-error" role="alert">
      <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3.5a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4.5zm0 6.5a.875.875 0 1 1 0-1.75A.875.875 0 0 1 8 11z"/>
      </svg>
      {{ error }}
    </p>

    <!-- Hint -->
    <p v-else-if="hint" :id="hintId" class="field-hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
/* ── Field container ─────────────────────────────────────── */
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

/* ── Label ───────────────────────────────────────────────── */
.field-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: var(--space-1);
  cursor: default;
}

.field-required {
  color: var(--color-error);
  font-weight: var(--font-bold);
  line-height: 1;
}

/* ── Wrapper ─────────────────────────────────────────────── */
.field-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

/* ── Input ───────────────────────────────────────────────── */
.field-input {
  width: 100%;
  height: 40px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--color-text);
  outline: none;
  transition:
    border-color var(--transition-fast),
    box-shadow   var(--transition-fast),
    background   var(--transition-fast);
}

.field-input::placeholder { color: var(--color-text-tertiary); }

.field-input:focus {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.field-input:disabled {
  background: var(--color-surface-raised);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
}

.field-input:read-only {
  background: var(--color-surface-raised);
}

/* Error state */
.field--error .field-input {
  border-color: var(--color-error);
}

.field--error .field-input:focus {
  box-shadow: var(--shadow-focus-error);
}

/* With adornments */
.field-input--leading  { padding-left: 2.5rem; }
.field-input--trailing { padding-right: 2.5rem; }

/* ── Adornments ──────────────────────────────────────────── */
.field-adornment {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  color: var(--color-text-tertiary);
  pointer-events: none;
}

.field-adornment--leading  { left: var(--space-3); }
.field-adornment--trailing { right: var(--space-3); }

/* ── Clear button ────────────────────────────────────────── */
.field-clear {
  position: absolute;
  right: var(--space-2);
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  color: var(--color-text-tertiary);
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.field-clear:hover {
  background: var(--color-surface-overlay);
  color: var(--color-text);
}

/* ── Messages ────────────────────────────────────────────── */
.field-error {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-error);
  line-height: var(--leading-normal);
}

.field-hint {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  line-height: var(--leading-normal);
}
</style>
