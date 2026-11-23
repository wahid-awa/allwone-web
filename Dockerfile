# ── Stage 1: Build Frontend ──────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: Unified Production Container ────────────────────
FROM node:22-alpine

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copy server logic
COPY backend/server.js ./

# Copy compiled frontend assets into ./dist
COPY --from=builder /app/dist ./dist

# Volume for persistent subscriber database
VOLUME ["/app/data"]

ENV PORT=80
ENV DATA_DIR=/app/data
EXPOSE 80

CMD ["node", "server.js"]
