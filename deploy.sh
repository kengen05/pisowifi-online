#!/bin/bash

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Piso WiFi Docker Deployment ===${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${BLUE}Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}.env created. Please edit it with your configuration.${NC}"
    exit 0
fi

# Build and start services
echo -e "${BLUE}Building images...${NC}"
docker-compose -f docker-compose.prod.yml build

echo -e "${BLUE}Starting services...${NC}"
docker-compose -f docker-compose.prod.yml up -d

echo -e "${BLUE}Checking status...${NC}"
docker-compose -f docker-compose.prod.yml ps

echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo -e "Frontend: http://localhost"
echo -e "Backend API: http://localhost/api"
echo -e "MongoDB Express: http://localhost:8081"
echo -e ""
echo -e "View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo -e "Stop services: docker-compose -f docker-compose.prod.yml down"
