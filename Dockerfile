# Build backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# Final runtime image
FROM node:20-alpine
WORKDIR /app

# Copy backend
COPY --from=backend-builder /app/backend ./backend
WORKDIR /app/backend

# Install nginx for frontend
RUN apk add --no-cache nginx

# Copy frontend dist and nginx config
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Create nginx config for API proxy
RUN mkdir -p /etc/nginx/conf.d && \
    echo 'server {\
    listen 80;\
    server_name _;\
    client_max_body_size 10M;\
    location / {\
        root /usr/share/nginx/html;\
        try_files $uri $uri/ /index.html;\
    }\
    location /api/ {\
        proxy_pass http://localhost:5000/api/;\
        proxy_http_version 1.1;\
        proxy_set_header Upgrade $http_upgrade;\
        proxy_set_header Connection upgrade;\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\
        proxy_set_header X-Forwarded-Proto $scheme;\
    }\
}' > /etc/nginx/conf.d/default.conf

# Expose ports
EXPOSE 5000 80

# Start both backend and nginx
CMD ["sh", "-c", "nginx && npm start"]
