#!/bin/bash

# 🚀 MHT Assessment - Quick Setup and Build Script
# This script installs dependencies and builds the APK in one command

echo "🚀 MHT Assessment - Quick Setup & APK Build"
echo "============================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found. Please run this from the project root.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Step 1: Installing dependencies...${NC}"
echo -e "${YELLOW}   This may take 2-3 minutes...${NC}"

# Install dependencies with legacy peer deps to resolve conflicts
if command -v yarn &> /dev/null; then
    echo -e "${BLUE}   Using Yarn...${NC}"
    yarn install
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}   Yarn failed, trying npm with legacy peer deps...${NC}"
        npm install --legacy-peer-deps
    fi
else
    echo -e "${BLUE}   Using npm...${NC}"
    npm install --legacy-peer-deps
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed successfully!${NC}"

echo -e "${BLUE}📱 Step 2: Building self-contained APK...${NC}"
echo -e "${YELLOW}   This may take 5-8 minutes...${NC}"

# Check if build script exists
if [ -f "scripts/build-standalone-apk.sh" ]; then
    chmod +x scripts/build-standalone-apk.sh
    ./scripts/build-standalone-apk.sh debug
else
    echo -e "${YELLOW}   Build script not found, using npm script...${NC}"
    npm run build:apk
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 APK build completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📱 APK Location:${NC}"
    find . -name "*standalone*.apk" -o -name "app-debug.apk" | head -3
    echo ""
    echo -e "${BLUE}📲 Installation Instructions:${NC}"
    echo -e "${GREEN}1. Enable USB Debugging on your Android device${NC}"
    echo -e "${GREEN}2. Connect device via USB${NC}"
    echo -e "${GREEN}3. Run: adb install [apk-file-name]${NC}"
    echo ""
else
    echo -e "${RED}❌ APK build failed${NC}"
    echo -e "${YELLOW}Please check the build logs above for errors${NC}"
    exit 1
fi