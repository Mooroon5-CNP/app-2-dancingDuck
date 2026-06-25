FROM node:20-alpine AS builder
WORKDIR /app
# hadolint ignore=DL3018
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci --omit=dev
COPY src/ ./src/

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY package*.json ./
RUN mkdir -p /data && chown -R node:node /app /data
USER 1000
EXPOSE 8080
CMD ["node", "src/index.js"]
