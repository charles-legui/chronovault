# CLAUDE.md (apps/web)

## 1. Purpose

This file defines frontend rules, architecture, and conventions for the Vue.js application.

Goals:

- clean UI architecture
- reusable components
- clear state management
- GraphQL integration
- simple, maintainable code

This file applies ONLY to frontend code inside apps/web.

---

## 2. Stack

Use only:

- Vue 3
- TypeScript
- Composition API
- Pinia
- Vue Router
- Apollo Client
- Vite

---

## 3. Strict Rules

Non-negotiable:

- No overengineering
- No unnecessary libraries
- No decorators
- No magic
- Keep logic explicit
- Prefer simple code over clever code

Separation is mandatory:

- views → pages
- components → UI only
- stores → state + business logic
- graphql → queries/mutations only
- services → API wrappers (optional)
- types → TypeScript types

---

## 4. Project Structure

```text
src/
  views/
  components/
  stores/
  graphql/
  services/
  composables/
  types/
  router/
  styles/
```
