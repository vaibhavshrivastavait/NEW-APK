#!/bin/bash

# MHT Assessment - GitHub Repository Update Script
# This script helps you update your GitHub repo with all the APK build changes

echo "🚀 MHT Assessment - GitHub Repository Update"
echo "============================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ This is not a git repository. Please run this from your project root.${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Files to be added/updated:${NC}"
echo "  ✅ scripts/build-standalone-apk.sh"
echo "  ✅ scripts/build-standalone-apk.ps1" 
echo "  ✅ .github/workflows/build-apk.yml"
echo "  ✅ ANDROID_BUILD_README.md"
echo "  ✅ QUICK_BUILD_GUIDE.md"
echo "  ✅ android/app/build.gradle (Universal APK config)"
echo "  ✅ package.json (Build scripts)"
echo ""

read -p "Do you want to proceed with the update? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Update cancelled."
    exit 1
fi

echo -e "${BLUE}📦 Adding files to git...${NC}"

# Add all the new files
git add scripts/build-standalone-apk.sh
git add scripts/build-standalone-apk.ps1
git add .github/workflows/build-apk.yml
git add ANDROID_BUILD_README.md
git add QUICK_BUILD_GUIDE.md
git add android/app/build.gradle
git add package.json

echo -e "${BLUE}📝 Creating commit...${NC}"

# Create descriptive commit
git commit -m "feat: Add self-contained Android APK build system

- Add build scripts for Linux/macOS (build-standalone-apk.sh) and Windows (build-standalone-apk.ps1)
- Configure universal APK build (no ABI splits) in android/app/build.gradle
- Add GitHub Actions workflow for automated APK building
- Add comprehensive build documentation (ANDROID_BUILD_README.md)
- Add quick start guide (QUICK_BUILD_GUIDE.md)
- Add NPM scripts for easy building (build:apk, build:apk:debug, build:apk:release)
- APK is fully self-contained (no Metro server required)
- Universal APK works on all Android architectures
- Ready for production deployment and testing

Breaking changes: None
New features: Self-contained APK build system
Documentation: Complete build guides included"

echo -e "${GREEN}✅ Commit created successfully!${NC}"

echo -e "${BLUE}🚀 Pushing to GitHub...${NC}"

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# Push to current branch
git push origin $CURRENT_BRANCH

echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"

echo ""
echo -e "${BLUE}🎉 Repository Update Complete!${NC}"
echo "=============================="
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Go to your GitHub repository"
echo "2. Check that all files were uploaded correctly"
echo "3. Go to Actions tab to see the new 'Build Android APK' workflow"
echo "4. You can now build APKs locally or via GitHub Actions"
echo ""
echo -e "${YELLOW}To build APK locally:${NC}"
echo "  ./scripts/build-standalone-apk.sh debug"
echo ""
echo -e "${YELLOW}To build APK via GitHub Actions:${NC}"
echo "  1. Go to Actions → 'Build Android APK' → Run workflow"
echo "  2. Download APK from artifacts"
echo ""