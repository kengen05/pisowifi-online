# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY backend/package*.json ./
RUN npm install

COPY backend/ ./

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]