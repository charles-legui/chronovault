FROM node:22-bookworm-slim

# System tools + Docker CLI
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    ca-certificates \
    bash \
    gnupg \
    lsb-release \
  && install -m 0755 -d /etc/apt/keyrings \
  && curl -fsSL https://download.docker.com/linux/debian/gpg \
     | gpg --dearmor -o /etc/apt/keyrings/docker.gpg \
  && echo \
     "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
     https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
     > /etc/apt/sources.list.d/docker.list \
  && apt-get update && apt-get install -y --no-install-recommends \
     docker-ce-cli \
  && rm -rf /var/lib/apt/lists/*

# pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Non-root user (matches VS Code dev containers convention)
ARG USERNAME=node
RUN mkdir -p /workspace && chown -R ${USERNAME}:${USERNAME} /workspace

USER ${USERNAME}
WORKDIR /workspace
