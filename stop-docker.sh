#!/bin/bash

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Stopping Piso WiFi Docker Environment ===${NC}"
echo ""

# Check if docker-compose is running
if ! docker-compose ps &> /dev/null; then
    echo "Docker Compose is not initialized in this directory"
    exit 1
fi

echo "Stopping containers..."
docker-compose down

echo ""
echo -e "${GREEN}✅ All containers stopped${NC}"
echo ""
echo "To restart: bash run-docker.sh"
echo ""
