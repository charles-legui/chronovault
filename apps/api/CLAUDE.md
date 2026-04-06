# CLAUDE.md — apps/api

Backend rules, architecture constraints, and generation strategy for the `apps/api` GraphQL service.

This backend powers a media portal: users manage photo and video albums, with auth, sharing, and permissions built progressively.

---

## 1. Stack

- Node.js + TypeScript (strict, ESM or project-standard)
- GraphQL (schema-first)
- MongoDB native driver (no Mongoose)
- PostgreSQL when relational data is justified
- Docker + Devcontainer
- Environment-based configuration

---

## 2. Non-negotiable rules

- No decorators
- No ORM for MongoDB (native driver only)
- No business logic in resolvers
- No database logic in resolvers
- No hidden abstractions, no magic, no giant generic helpers
- No overengineered patterns, no premature abstraction
- No unnecessary dependencies
- Prefer explicit, readable, boring code over clever code
- Write code maintainable months later without guesswork

### TypeScript

- Strict TypeScript throughout
- Explicit interfaces, types, function signatures
- Named exports preferred
- No `any` — use `unknown` then narrow safely
- Keep types near their domain

---

## 3. Architecture

### Layer separation

| Layer | Responsibility |
|---|---|
| `models` | Domain types, collection names, collection access helpers, ID normalization |
| `validators` | Input validation — deterministic, no side effects, no DB access |
| `services` | Business logic, orchestration, auth flow, ownership checks |
| `resolvers` | GraphQL adapter only — extract args/context, call service, return result |

### Module structure

Organize by domain: `auth`, `users`, `albums`, `media`

### Dependency rules

- resolvers → services
- services → models/validators/utils
- no circular dependencies
- validators are called explicitly before or inside services

---

## 4. Folder structure

```text
apps/api/
├─ CLAUDE.md
├─ package.json
├─ tsconfig.json
├─ src/
│  ├─ index.ts
│  ├─ server/
│  │  ├─ createServer.ts
│  │  └─ context.ts
│  ├─ config/
│  │  ├─ env.ts
│  │  ├─ auth.ts
│  │  └─ database.ts
│  ├─ db/
│  │  ├─ mongo/
│  │  │  ├─ client.ts
│  │  │  ├─ collections.ts
│  │  │  └─ indexes.ts
│  │  └─ postgres/
│  │     └─ client.ts
│  ├─ schema/
│  │  ├─ typeDefs.ts
│  │  └─ resolvers.ts
│  ├─ modules/
│  │  ├─ auth/
│  │  │  ├─ auth.types.ts
│  │  │  ├─ auth.validators.ts
│  │  │  ├─ auth.service.ts
│  │  │  ├─ auth.resolver.ts
│  │  │  └─ auth.utils.ts
│  │  ├─ users/
│  │  │  ├─ user.types.ts
│  │  │  ├─ user.model.ts
│  │  │  ├─ user.validators.ts
│  │  │  ├─ user.service.ts
│  │  │  └─ user.resolver.ts
│  │  ├─ albums/
│  │  │  ├─ album.types.ts
│  │  │  ├─ album.model.ts
│  │  │  ├─ album.validators.ts
│  │  │  ├─ album.service.ts
│  │  │  └─ album.resolver.ts
│  │  └─ media/
│  │     ├─ media.types.ts
│  │     ├─ media.model.ts
│  │     ├─ media.validators.ts
│  │     ├─ media.service.ts
│  │     └─ media.resolver.ts
│  ├─ utils/
│  │  ├─ errors.ts
│  │  ├─ dates.ts
│  │  ├─ ids.ts
│  │  ├─ crypto.ts
│  │  └─ strings.ts
│  └─ types/
│     ├─ context.ts
│     └─ graphql.ts
└─ tests/
```

---

## 5. Domain boundaries

### auth

sign up · sign in · sign out · current session · forgot/reset/change password · token handling

### users

profile data · user lookup · user update · role representation

### albums

CRUD · ownership · metadata · visibility/share readiness

### media

records · metadata · album linkage · listing and filtering

---

## 6. Security rules

### Passwords

- Always hash with `argon2` or `bcrypt` — centralized config
- Never store plain passwords, never leak hashes
- Use library comparison function (no manual comparison)

### Tokens

- Secure random generation only
- Reset tokens must be time-limited and not stored in plain form
- Expiration checks must be explicit

### JWT (default auth strategy)

- Centralized signing config with explicit expiration
- Parse auth header cleanly, attach current user to GraphQL context
- Session/cookie auth acceptable if explicitly requested

### Error messages

- Explicit but safe — no internal detail leaks
- Forgot password flow: avoid leaking user existence where possible

### Ownership

- Every album/media access path must support owner checks
- Authorization logic belongs in services, not resolvers
- Keep roles simple unless complexity is requested

---

## 7. MongoDB rules

- Native driver only — no hidden abstraction over it
- Define collection names and indexes explicitly
- Use `ObjectId` explicitly, normalize IDs at module boundaries
- Keep queries readable; keep aggregation pipelines simple and justified

### Collections

- `users`
- `password_reset_tokens`
- `albums`
- `media_items`
- `activity_logs`

### Indexes to define

- unique email index
- ownership indexes
- album/media lookup indexes
- token expiration indexes (TTL)

---

## 8. PostgreSQL rules

Add PostgreSQL only when relational integrity is clearly beneficial (permissions, sharing rules, invitations, audit structures). Do not introduce it if MongoDB alone is sufficient for the current phase.

---

## 9. Validation rules

Always validate: email · password strength · display name · IDs · pagination params · token payloads · reset inputs

Style:
- simple named functions with explicit return types
- throw explicit errors
- no giant validator engine

Examples: `validateEmail`, `validatePassword`, `validateObjectId`, `validatePaginationInput`, `validateForgotPasswordInput`, `validateResetPasswordInput`

---

## 10. GraphQL rules

- Schema-first, explicit, grouped by domain
- Avoid over-nesting early
- Use payload objects instead of bare primitives when the UX benefits
- Resolvers split by module, merged centrally

### Auth operations

`signUp` · `signIn` · `signOut` · `me` · `forgotPassword` · `resetPassword` · `changePassword` · `updateProfile`

---

## 11. Configuration rules

All env vars centralized in `src/config/`. No `process.env` reads outside of config files. Validate required vars on startup.

| File | Purpose |
|---|---|
| `env.ts` | All env vars, validated |
| `auth.ts` | JWT config, token TTLs |
| `database.ts` | Mongo + Postgres connection config |

Key vars: `NODE_ENV` · `PORT` · `MONGO_URI` · `MONGO_DB_NAME` · `POSTGRES_URL` · `JWT_SECRET` · `JWT_EXPIRES_IN` · `PASSWORD_RESET_TOKEN_TTL_MINUTES` · `APP_BASE_URL` · `MAIL_FROM`

---

## 12. Error handling

Small, explicit error strategy:
- app-level error class
- auth error class if needed
- validation error class if useful

Rules: human-readable, safe, no silent failures, fail early on invalid input.

---

## 13. Generation rules

Generate code module by module in this order:

1. config
2. db connection
3. shared utilities
4. domain types/models
5. validators
6. services
7. resolvers
8. schema merge
9. startup wiring

Generate full files. Avoid placeholders. One responsibility per file. Name dependencies explicitly. Do not dump all files at once unless asked.

---

## 14. Implementation phases

### Phase 1 — Core auth

config → mongo connection → base GraphQL server → users model → auth validators → auth utils → auth service → auth resolver → `me` + `signUp` + `signIn` + `signOut`

### Phase 2 — Full auth

forgot/reset password flow · profile update · change password · context hardening · indexes

### Phase 3 — Content

albums module · media module · ownership checks · upload metadata

### Phase 4 — Sharing & permissions

permissions · sharing · PostgreSQL integration · audit logging · security hardening

---

## 15. Quality checklist

Before considering a module acceptable:

- [ ] inputs are validated
- [ ] service methods are readable and focused
- [ ] resolvers are thin
- [ ] DB access is explicit
- [ ] errors are safe
- [ ] passwords are hashed
- [ ] tokens are secure
- [ ] environment vars are centralized
- [ ] TypeScript types are explicit
- [ ] code can be understood quickly by a human reviewer
