// UI component library — barrel export
// Future: these will be moved to packages/ui and imported as @chronovault/ui

export { default as AppIcon }      from './AppIcon.vue'
export { default as BaseButton }   from './BaseButton.vue'
export { default as BaseInput }    from './BaseInput.vue'
export { default as BaseCard }     from './BaseCard.vue'
export { default as BaseBadge }    from './BaseBadge.vue'
export { default as BaseDropdown } from './BaseDropdown.vue'
export { default as BaseModal }    from './BaseModal.vue'

// Re-export types
export type { ButtonVariant, ButtonSize }       from './BaseButton.vue'
export type { InputType }                       from './BaseInput.vue'
export type { CardPadding }                     from './BaseCard.vue'
export type { BadgeVariant, BadgeSize }         from './BaseBadge.vue'
export type { DropdownPlacement }               from './BaseDropdown.vue'
export type { ModalSize }                       from './BaseModal.vue'
