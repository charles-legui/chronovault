<script setup lang="ts">
import { ref } from 'vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const props = defineProps<{
  title:         string
  description:   string
  tags:          string[]
  coverImageUrl: string
  eventDate:     string
  disabled:      boolean
  titleError:    string
}>()

const emit = defineEmits<{
  'update:title':         [value: string]
  'update:description':   [value: string]
  'update:tags':          [value: string[]]
  'update:coverImageUrl': [value: string]
  'update:eventDate':     [value: string]
}>()

const tagInput = ref('')

function addTag() {
  const value = tagInput.value.trim().replace(/,+$/, '')
  if (!value) return
  if (!props.tags.includes(value) && props.tags.length < 50) {
    emit('update:tags', [...props.tags, value])
  }
  tagInput.value = ''
}

function removeTag(index: number) {
  const updated = [...props.tags]
  updated.splice(index, 1)
  emit('update:tags', updated)
}

function onTagKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addTag()
  } else if (e.key === 'Backspace' && !tagInput.value && props.tags.length) {
    const updated = [...props.tags]
    updated.pop()
    emit('update:tags', updated)
  }
}
</script>

<template>
  <!-- Title -->
  <BaseInput
    :model-value="title"
    type="text"
    label="Titre"
    placeholder="Mon album de vacances"
    :error="titleError"
    :disabled="disabled"
    required
    @update:model-value="emit('update:title', $event ?? '')"
  />

  <!-- Description -->
  <div class="field">
    <label class="field-label" for="description">Description</label>
    <textarea
      id="description"
      :value="description"
      class="field-textarea"
      :class="{ 'field-textarea--disabled': disabled }"
      placeholder="Une courte description de cet album…"
      rows="3"
      :disabled="disabled"
      maxlength="2000"
      @input="emit('update:description', ($event.target as HTMLTextAreaElement).value)"
    />
    <p v-if="description" class="field-hint">{{ description.length }} / 2000</p>
  </div>

  <!-- Tags -->
  <div class="field">
    <label class="field-label" for="tag-input">Tags</label>
    <div class="tag-field" :class="{ 'tag-field--disabled': disabled }">
      <span v-for="(tag, i) in tags" :key="tag" class="tag-chip">
        {{ tag }}
        <button
          type="button"
          class="tag-remove"
          :aria-label="`Supprimer le tag ${tag}`"
          :disabled="disabled"
          @click="removeTag(i)"
        >
          <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor" aria-hidden="true">
            <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z"/>
          </svg>
        </button>
      </span>
      <input
        id="tag-input"
        v-model="tagInput"
        type="text"
        class="tag-input"
        placeholder="Ajouter un tag…"
        :disabled="disabled"
        @keydown="onTagKeydown"
        @blur="addTag"
      />
    </div>
    <p class="field-hint">Appuyez sur Entrée ou virgule pour ajouter un tag</p>
  </div>

  <!-- Cover image URL -->
  <BaseInput
    :model-value="coverImageUrl"
    type="url"
    label="URL de la couverture"
    placeholder="https://example.com/cover.jpg"
    hint="Image affichée sur la vignette de l'album"
    :disabled="disabled"
    @update:model-value="emit('update:coverImageUrl', $event ?? '')"
  />

  <!-- Event date -->
  <div class="field">
    <label class="field-label" for="event-date">Date de l'événement</label>
    <input
      id="event-date"
      :value="eventDate"
      type="date"
      class="field-input"
      :class="{ 'field-input--disabled': disabled }"
      :disabled="disabled"
      @input="emit('update:eventDate', ($event.target as HTMLInputElement).value)"
    />
    <p class="field-hint">Date à laquelle cet événement a eu lieu</p>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-text);
}

.field-hint {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  line-height: var(--leading-normal);
}

/* Textarea */
.field-textarea {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--color-text);
  resize: vertical;
  min-height: 88px;
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.field-textarea::placeholder { color: var(--color-text-tertiary); }

.field-textarea:focus {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.field-textarea--disabled {
  background: var(--color-surface-raised);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
}

/* Date input */
.field-input {
  height: 40px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--color-text);
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  width: 100%;
  max-width: 200px;
}

.field-input:focus {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.field-input--disabled {
  background: var(--color-surface-raised);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
}

/* Tag field */
.tag-field {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  min-height: 42px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  cursor: text;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.tag-field:focus-within {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.tag-field--disabled {
  background: var(--color-surface-raised);
  cursor: not-allowed;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px var(--space-2);
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  line-height: 1;
  white-space: nowrap;
}

.tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  opacity: 0.6;
  transition: opacity var(--transition-fast);
}

.tag-remove:hover { opacity: 1; }

.tag-input {
  flex: 1;
  min-width: 120px;
  border: none;
  background: transparent;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--color-text);
  outline: none;
  padding: 2px 0;
}

.tag-input::placeholder { color: var(--color-text-tertiary); }
.tag-input:disabled      { cursor: not-allowed; }
</style>
