FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src/ ./src/
RUN addgroup -S appgroup && adduser -S -u 1001 -G appgroup appuser
USER 1001
EXPOSE 8080
CMD ["node", "src/index.js"]
