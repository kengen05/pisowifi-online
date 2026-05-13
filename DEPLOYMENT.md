# Docker VM Deployment Guide

## Prerequisites
- Docker and Docker Compose installed on the VM
- SSH access to the Docker VM
- Git (optional, for cloning repo)

## Steps to Deploy

### 1. Copy files to Docker VM

```bash
# From your local machine, copy the entire project
scp -r c:\Users\VSLC-092\VS Code\Pisowifi-online user@docker-vm:/opt/pisowifi-online

# Or clone from Git if available
# ssh user@docker-vm
# git clone <your-repo> /opt/pisowifi-online
```

### 2. SSH into Docker VM

```bash
ssh user@docker-vm
cd /opt/pisowifi-online
```

### 3. Create .env file

```bash
cat > .env << EOF
JWT_SECRET=your-super-secret-key-here
QR_PH_API_KEY=your-qr-ph-api-key-here
QR_PH_API_URL=https://api.qrph.com
EOF
```

### 4. Deploy with Docker Compose

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop all services
docker-compose -f docker-compose.prod.yml down
```

## Access Points

- **Frontend**: http://docker-vm-ip
- **Backend API**: http://docker-vm-ip/api
- **MongoDB Express**: http://docker-vm-ip:8081
- **MongoDB Direct**: docker-vm-ip:27017 (admin:password123)

## Useful Commands

```bash
# Restart services
docker-compose -f docker-compose.prod.yml restart

# Update and rebuild
docker-compose -f docker-compose.prod.yml up -d --build

# Clean up (remove containers, volumes)
docker-compose -f docker-compose.prod.yml down -v

# Check logs of specific service
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
```

## Production Recommendations

1. Change MongoDB credentials in docker-compose.prod.yml
2. Set strong JWT_SECRET in .env
3. Use a reverse proxy (Nginx) for SSL/TLS
4. Setup automated backups for MongoDB volumes
5. Configure firewall rules to restrict access
6. Enable resource limits in docker-compose.yml
7. Setup monitoring and alerting
