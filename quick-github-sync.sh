#!/bin/bash

# 🚀 MHT Assessment - Quick GitHub Sync Script
# Run this script on your local machine with internet access

set -e

# Colors
GREEN='33[0;32m'
BLUE='33[0;34m'
YELLOW='33[1;33m'
RED='33[0;31m'
NC='33[0m'

echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    MHT ASSESSMENT                            ║"
echo "║                QUICK GITHUB SYNC                             ║"
echo "║                                                              ║"
echo "║  Repository: mht-assessment-android-app                      ║"
echo "║  User: vaibhavshrivastavait                                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Configuration
REPO_URL="https://github.com/vaibhavshrivastavait/mht-assessment-android-app.git"
COMMIT_MESSAGE="✅ Add comprehensive Windows setup system

🎯 Features Added:
- PowerShell prerequisite checker with 25+ system checks
- Batch script fallback for universal Windows compatibility
- Complete step-by-step setup guide with exact timing
- Quick reference card and troubleshooting documentation
- Package.json integration for easy npm script access
- GitHub sync guide with verification steps
- Support for Windows 10/11 APK building environment

🛠️ New npm Scripts:
- npm run check:windows
- npm run check:windows-detailed
- npm run check:windows-report

📚 Documentation Added:
- WINDOWS_SETUP_EXECUTION_ORDER.md - Complete setup guide
- WINDOWS_QUICK_REFERENCE.md - One-page reference
- WINDOWS_PREREQUISITE_SCRIPTS_README.md - Full documentation
- COMPREHENSIVE_WINDOWS_SETUP_COMPLETE.md - Implementation summary
- GITHUB_SYNC_GUIDE.md - Sync instructions

🚀 Ready for production use!"

echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

# Check if git is available
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed! Please install git first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Git is available${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "App.tsx" ]; then
    echo -e "${RED}❌ Error: Not in MHT Assessment project directory${NC}"
    echo -e "${YELLOW}Please navigate to your MHT Assessment project folder first${NC}"
    echo -e "${YELLOW}Example: cd /path/to/your/mht-assessment-project${NC}"
    exit 1
fi
echo -e "${GREEN}✅ MHT Assessment project detected${NC}"

# Check internet connectivity
if ! ping -c 1 github.com &> /dev/null; then
    echo -e "${RED}❌ No internet connection to GitHub${NC}"
    exit 1
fi
echo -e "${GREEN}✅ GitHub connectivity verified${NC}"

echo -e "${BLUE}📊 Checking Git status...${NC}"
git status

echo -e "${BLUE}🔗 Checking remote repository...${NC}"
git remote -v

# Ensure we're on main branch
echo -e "${BLUE}🌿 Ensuring we're on main branch...${NC}"
git checkout main

# Pull latest changes first
echo -e "${BLUE}⬇️  Pulling latest changes...${NC}"
git pull origin main

# Add all files
echo -e "${BLUE}📁 Adding all files...${NC}"
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo -e "${YELLOW}ℹ️  No new changes to commit${NC}"
    echo -e "${BLUE}🚀 Pushing existing commits...${NC}"
    git push origin main
else
    echo -e "${BLUE}💾 Creating commit with Windows setup system...${NC}"
    git commit -m "$COMMIT_MESSAGE"
    
    echo -e "${BLUE}🚀 Pushing to GitHub...${NC}"
    git push origin main
fi

echo -e "${GREEN}✅ Sync completed successfully!${NC}"

# Show success information
echo -e "\n${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                   🎉 SYNC COMPLETE! 🎉                      ║"
echo "║                                                              ║"
echo "║  Your MHT Assessment project with comprehensive Windows      ║"
echo "║  setup system is now live on GitHub!                        ║"
echo "║                                                              ║"
echo "║  Repository: vaibhavshrivastavait/mht-assessment-android-app ║"
echo "║  URL: https://github.com/vaibhavshrivastavait/...            ║"
echo "║                                                              ║"
echo "║  New Features Available:                                     ║"
echo "║  ✅ Windows prerequisite checker (25+ checks)               ║"
echo "║  ✅ Complete setup guides and documentation                  ║"
echo "║  ✅ npm scripts for easy access                              ║"
echo "║  ✅ Universal Windows compatibility                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "\n${BLUE}🔗 Repository URL:${NC}"
echo "https://github.com/vaibhavshrivastavait/mht-assessment-android-app"

echo -e "\n${BLUE}📋 Quick Commands for Users:${NC}"
echo "git clone https://github.com/vaibhavshrivastavait/mht-assessment-android-app.git"
echo "cd mht-assessment-android-app"
echo "npm run check:windows-detailed"
echo "npm install && npm run build:apk"

echo -e "\n${GREEN}🚀 Your medical assessment app is now fully synced and ready!${NC}"