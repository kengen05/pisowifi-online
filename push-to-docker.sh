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

DOCKER_USERNAME="codehubit"
IMAGE_NAME="pisowifi"

echo -e "${BLUE}Building Docker image...${NC}"
docker build -t "$DOCKER_USERNAME/$IMAGE_NAME:latest" .

if [ $? -ne 0 ]; then
    echo -e "${RED}Error building Docker image${NC}"
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
echo -e "${BLUE}Pushing image to Docker Hub...${NC}"
docker push "$DOCKER_USERNAME/$IMAGE_NAME:latest"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error pushing image${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=== ✅ Successfully pushed to Docker Hub ===${NC}"
echo ""
echo -e "${BLUE}Image available at:${NC}"
echo "  https://hub.docker.com/r/$DOCKER_USERNAME/$IMAGE_NAME"
echo ""
echo -e "${BLUE}Watchtower will auto-update containers within 5 minutes${NC}"
echo ""
