#!/bin/bash

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Piso WiFi Repository Sync ===${NC}"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${RED}Error: Git repository not found. Please run 'git init' first.${NC}"
    exit 1
fi

# Show current status
echo -e "${BLUE}Current status:${NC}"
git status --short
echo ""

# Get commit message
if [ -z "$1" ]; then
    echo -e "${BLUE}Enter commit message (or press Enter for auto-generated):${NC}"
    read -p "> " COMMIT_MSG
    
    if [ -z "$COMMIT_MSG" ]; then
        COMMIT_MSG="Update: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
else
    COMMIT_MSG="$1"
fi

echo ""
echo -e "${BLUE}Syncing changes...${NC}"
echo ""

# Add all changes
echo -e "Adding files..."
git add -A

# Commit
echo "Committing: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

if [ $? -ne 0 ]; then
    echo -e "${RED}Nothing to commit. Repository is up to date.${NC}"
    exit 0
fi

echo ""

# Push to remote
echo "Pushing to remote..."
git push

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=== ✅ Successfully synced to GitHub ===${NC}"
    echo -e "View your changes: https://github.com/kengen05/pisowifi-online"
else
    echo -e "${RED}Error pushing to remote. Check your connection and credentials.${NC}"
    exit 1
fi
