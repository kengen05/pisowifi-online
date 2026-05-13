#!/bin/bash

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Piso WiFi Local Docker Setup ===${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed or not in PATH${NC}"
    echo "Install Docker from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker daemon is running
if ! docker ps &> /dev/null; then
    echo -e "${RED}Error: Docker daemon is not running${NC}"
    echo "Please start Docker Desktop or Docker daemon and try again"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    echo "Install Docker Compose from: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${BLUE}Starting local development environment...${NC}"
echo ""

# Start services
echo "Starting containers..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}Error starting containers${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Waiting for services to be ready...${NC}"
sleep 5

# Check status
echo ""
echo -e "${BLUE}Container Status:${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}=== ✅ Local environment is ready ===${NC}"
echo ""
echo -e "${YELLOW}Access Points:${NC}"
echo "  Frontend (React):      http://localhost:3000"
echo "  Backend API:           http://localhost:5000"
echo "  MongoDB Express:       http://localhost:8081"
echo "  MongoDB Direct:        localhost:27017"
echo ""
echo -e "${YELLOW}Database Credentials:${NC}"
echo "  Username:              admin"
echo "  Password:              password123"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo "  View logs:             docker-compose logs -f"
echo "  Stop containers:       docker-compose down"
echo "  View specific log:     docker-compose logs -f [backend|frontend|mongodb]"
echo "  Rebuild images:        docker-compose up -d --build"
echo "  Clean everything:      docker-compose down -v"
echo ""
echo "Open http://localhost:3000 to access the admin portal"
echo ""
