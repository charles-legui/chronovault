# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

ChronoVault is a photo/video portal built as a **pnpm monorepo** with two apps (`web`, `api`) and two packages (`shared`, `ui`). Full spec is in `SPEC.md`.

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | Vue 3 + TypeScript + Vite + Pinia + Vue Router + Apollo Client + Tailwind CSS |
| Backend | Node.js + TypeScript + GraphQL (schema-first) |
| Databases | PostgreSQL (users/auth/permissions) · MongoDB (albums/media/tags) |
| Infra | Docker Compose · Devcontainer · pnpm workspaces |

## Monorepo structure

```
apps/web/        # Vue 3 frontend
apps/api/        # Node.js GraphQL API
packages/shared/ # Shared TypeScript types, validators, GraphQL helpers
packages/ui/     # Reusable UI component library (BaseButton, BaseCard, etc.)
```

## Common commands

```bash
# Install all dependencies
pnpm install

# Run everything locally
docker compose up

# Frontend dev server
pnpm --filter web dev

# Backend dev server
pnpm --filter api dev

# Type-check all packages
pnpm -r tsc --noEmit

# Lint
pnpm -r lint

# Run tests
pnpm -r test

# Run a single test file
pnpm --filter <package> test <path/to/file>

# Build all packages
pnpm -r build
```

## Architecture decisions

- **Database split**: PostgreSQL owns relational data (`users`, `sessions`, `roles`, `permissions`, `shared_albums`, `invitations`). MongoDB owns flexible document data (`albums`, `mediaItems`, `mediaMetadata`, `tags`, `comments`, `activity logs`).
- **Shared types**: `packages/shared` is the single source of truth for types used by both frontend and backend. Import from there, don't duplicate.
- **UI library**: Generic presentational components (Base*) live in `packages/ui`. Business-specific components belong in `apps/web/src/components/`.
- **GraphQL**: Schema-first approach. Schema defined in `apps/api/src/schema/`, resolvers delegate to services, services delegate to repositories. No business logic in resolvers.
- **State management**: Pinia stores in `apps/web/src/stores/`. API calls go through `apps/web/src/services/` (Apollo Client). Composables in `apps/web/src/composables/` for reusable reactive logic.

## Development phases

The project is built incrementally — see `SPEC.md` section 3 for the full roadmap:

1. **UI foundation** (static pages, layout, design tokens) — *start here*
2. Minimal design system (Base* components)
3. Mock data layer (typed mocks, Pinia stores, realistic navigation)
4. Backend GraphQL API (schema, resolvers, CRUD)
5. Real database integration (MongoDB + PostgreSQL)

## Devcontainer rule

When asked to generate Devcontainer setup:

- always generate full working configuration
- include docker-compose if databases are required
- install pnpm globally
- ensure Node LTS
- include VS Code extensions
- keep configuration minimal and clean