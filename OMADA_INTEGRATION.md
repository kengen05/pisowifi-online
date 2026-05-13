# Omada SDN Controller Integration

This document describes the Omada SDN integration for the PiSoWiFi-online system.

## Overview

The Omada service allows the PiSoWiFi-online system to manage TP-Link Omada SDN controllers. This enables:
- Monitoring connected devices through the Omada controller
- Managing network devices (APs, switches, gateways)
- Captive portal management
- Network health monitoring

## Configuration

Add the following to your `backend/.env` file:

```env
# Omada SDN Controller (TP-Link)
OMADA_HOST=192.168.1.100
OMADA_PORT=8043
OMADA_USERNAME=admin
OMADA_PASSWORD=your_password
OMADA_SITE_ID=default
OMADA_USE_HTTPS=false
```

## API Endpoints

### 1. Health Check
```
GET /api/omada/health
```
Returns the Omada controller connection status.

### 2. Hosts Management
```
GET    /api/omada/hosts              - Get all connected hosts
GET    /api/omada/hosts/:deviceId    - Get specific host
DELETE /api/omada/hosts/:deviceId/disconnect - Disconnect a host
POST   /api/omada/hosts/:deviceId/block    - Block a host
POST   /api/omada/hosts/:deviceId/unblock  - Unblock a host
```

### 3. Devices Management
```
GET /api/omada/devices - Get all Omada devices (APs, switches, gateways)
```

### 4. Statistics
```
GET /api/omada/stats/hosted - Get hosted data for a specific host
```

## Authentication

The Omada API uses cookie-based authentication. The service automatically handles login/logout and session management.

## Testing

After configuring the `.env` file, test the integration:

```bash
# Check health
curl http://localhost:5000/api/omada/health

# Get connected hosts
curl http://localhost:5000/api/omada/hosts

# Get devices
curl http://localhost:5000/api/omada/devices
```

## Docker Deployment

When deploying with Docker, ensure the backend container can reach the Omada controller:

```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - OMADA_HOST=omada-controller-ip
      - OMADA_PORT=8043
      - OMADA_USERNAME=your_username
      - OMADA_PASSWORD=your_password
```

## Notes

- The Omada controller must have the API enabled
- Default port is 8043 for the Omada API
- Use HTTPS in production environments
- The service handles token refresh automatically