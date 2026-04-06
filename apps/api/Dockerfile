FROM node:22-alpine

# Required for argon2 native bindings compilation
RUN apk add --no-cache python3 make g++

RUN npm install -g pnpm

WORKDIR /workspace

# Copy monorepo manifests first — maximises layer cache reuse
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/

# --no-frozen-lockfile: allows installing without a fully in-sync lockfile during development
RUN pnpm install --filter @chronovault/api --no-frozen-lockfile

WORKDIR /workspace/apps/api

EXPOSE 4000

CMD ["sh", "-c", "pnpm install --no-frozen-lockfile --config.confirmModulesPurge=false && pnpm dev"]
