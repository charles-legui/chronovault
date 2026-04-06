FROM node:22-alpine

# Required for argon2 native bindings compilation
RUN apk add --no-cache python3 make g++

RUN npm install -g pnpm

WORKDIR /workspace

# Copy monorepo manifests first — maximises layer cache reuse
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/

# Install api dependencies only
RUN pnpm install --filter @chronovault/api --frozen-lockfile

WORKDIR /workspace/apps/api

EXPOSE 4000

CMD ["pnpm", "dev"]
