#!/bin/bash

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Piso WiFi Docker Hub Push ===${NC}"
echo ""

# Check if Docker is running
if ! docker ps &> /dev/null; then
    echo -e "${RED}Error: Docker daemon is not running${NC}"
    exit 1
fi

# Get Docker Hub token from environment or prompt
if [ -z "$DOCKER_TOKEN" ]; then
    echo -e "${BLUE}Enter your Docker Hub access token:${NC}"
    read -sp "> " DOCKER_TOKEN
    echo ""
fi

DOCKER_USERNAME="kengen05"

echo -e "${BLUE}Building images...${NC}"
docker-compose build

if [ $? -ne 0 ]; then
    echo -e "${RED}Error building images${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Logging in to Docker Hub...${NC}"
echo "$DOCKER_TOKEN" | docker login -u "$DOCKER_USERNAME" --password-stdin

if [ $? -ne 0 ]; then
    echo -e "${RED}Error logging in to Docker Hub${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Pushing backend image...${NC}"
docker push "$DOCKER_USERNAME/pisowifi-backend:latest"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error pushing backend image${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Pushing frontend image...${NC}"
docker push "$DOCKER_USERNAME/pisowifi-frontend:latest"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error pushing frontend image${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=== ✅ Successfully pushed to Docker Hub ===${NC}"
echo ""
echo -e "${BLUE}Images available at:${NC}"
echo "  Backend:  https://hub.docker.com/r/$DOCKER_USERNAME/pisowifi-backend"
echo "  Frontend: https://hub.docker.com/r/$DOCKER_USERNAME/pisowifi-frontend"
echo ""
echo -e "${BLUE}Watchtower will auto-update containers within 5 minutes${NC}"
echo ""
