# ==============================================================================
# Stage 1: Build & Compile TypeScript
# ==============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package.json package-lock.json ./

# Install all dependencies including devDependencies for build phase
RUN npm ci

# Copy configuration, source code, and prompts
COPY tsconfig.json ./
COPY src/ ./src/
COPY prompts/ ./prompts/

# Compile TypeScript
RUN npm run build

# ==============================================================================
# Stage 2: Base Production Runner
# ==============================================================================
FROM node:22-alpine AS base-runner

ENV NODE_ENV=production

WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled JavaScript output and prompts from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prompts ./prompts

# Run as non-root user
USER node

# ==============================================================================
# Stage 3: Product Managers Target Image
# ==============================================================================
FROM base-runner AS product-managers

# Expose Product Manager flow server ports & Cloud Run standard port
EXPOSE 8080 3002 3003 3004 3005

# Default command: launch Generic Product Manager flow server
CMD ["node", "dist/ai/agents/product-managers/generic-product-manager/flow-server.js"]

# ==============================================================================
# Stage 4: Assistants Target Image
# ==============================================================================
FROM base-runner AS assistants

# Expose Assistant flow server ports & Cloud Run standard port
EXPOSE 8080 3010 3011 3012

# Default command: launch Executive Assistant flow server
CMD ["node", "dist/ai/agents/assistants/executive-assistant/flow-server.js"]
