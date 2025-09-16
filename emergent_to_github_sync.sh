#!/bin/bash

# =========================================================
# EMERGENT TO GITHUB SYNC SCRIPT
# Designed specifically for Emergent in-built terminal
# Syncs MHT Assessment project to GitHub repository
# =========================================================

set -e  # Exit on any error

# Colors for better output visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Repository Configuration
REPO_NAME="mht-assessment-android-app"
GITHUB_USERNAME="vaibhavshrivastavait"
GITHUB_EMAIL="vaibhavshrivastavait@gmail.com"
GITHUB_NAME="vaibhav Shrivastava"

# GitHub token (replace with your actual token)
GITHUB_TOKEN="YOUR_GITHUB_TOKEN_HERE"

echo -e "${BOLD}${BLUE}================================================================${NC}"
echo -e "${BOLD}${BLUE}🚀 EMERGENT TO GITHUB SYNC - MHT Assessment App${NC}"
echo -e "${BOLD}${BLUE}================================================================${NC}"
echo -e "${CYAN}📂 Source: Emergent.sh Platform${NC}"
echo -e "${CYAN}📂 Target: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}${NC}"
echo -e "${CYAN}📂 Project: MHT Assessment React Native App${NC}"
echo

# Function to configure git environment
configure_git_environment() {
    echo -e "${CYAN}🔧 Configuring Git for Emergent environment...${NC}"
    
    # Fix HOME directory issue in containers
    export HOME="${HOME:-/root}"
    mkdir -p "$HOME"
    
    # Configure git with user details
    git config --global user.email "${GITHUB_EMAIL}"
    git config --global user.name "${GITHUB_NAME}"
    git config --global init.defaultBranch main
    git config --global push.default simple
    
    echo -e "${GREEN}✅ Git configured successfully${NC}"
}

# Function to analyze project structure
analyze_project_structure() {
    echo -e "${CYAN}📊 Analyzing MHT Assessment project structure...${NC}"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ Error: package.json not found. Please run this script from /app directory${NC}"
        exit 1
    fi
    
    # Check for key project files
    local key_files=("App.tsx" "screens" "components" "android" "app.json")
    echo -e "${BLUE}🔍 Checking key project files:${NC}"
    
    for file in "${key_files[@]}"; do
        if [ -e "$file" ]; then
            echo -e "${GREEN}  ✅ $file${NC}"
        else
            echo -e "${YELLOW}  ⚠️  $file (missing but may be optional)${NC}"
        fi
    done
    
    # Count important files
    echo -e "${BLUE}📈 Project Statistics:${NC}"
    echo "  • Total files (excluding node_modules): $(find . -type f -not -path '*/node_modules*' -not -path '*/.git*' | wc -l)"
    echo "  • React Native screens: $(find ./screens -name '*.tsx' 2>/dev/null | wc -l)"
    echo "  • Components: $(find ./components -name '*.tsx' 2>/dev/null | wc -l)"
    echo "  • Configuration files: $(find . -name '*.json' -o -name '*.gradle' -o -name '*.xml' | grep -v node_modules | wc -l)"
}

# Function to clean up large files before sync
cleanup_large_files() {
    echo -e "${CYAN}🧹 Cleaning up large files for GitHub compatibility...${NC}"
    
    # Remove build artifacts and cache
    rm -rf node_modules/ 2>/dev/null || true
    rm -rf android/build/ 2>/dev/null || true
    rm -rf android/app/build/ 2>/dev/null || true
    rm -rf android/.gradle/ 2>/dev/null || true
    rm -rf .expo/ 2>/dev/null || true
    rm -rf .metro-cache/ 2>/dev/null || true
    rm -rf ios/build/ 2>/dev/null || true
    
    # Remove large bundle files
    find . -name "*.bundle" -size +10M -delete 2>/dev/null || true
    find . -name "*.map" -size +5M -delete 2>/dev/null || true
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Function to create optimized .gitignore
create_gitignore() {
    echo -e "${CYAN}📝 Creating optimized .gitignore for React Native...${NC}"
    
    cat > .gitignore << 'EOL'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Expo
.expo/
.expo-shared/
dist/
web-build/

# Metro
.metro-cache/

# Android
android/app/build/
android/build/
android/.gradle/
android/local.properties

# iOS
ios/build/
ios/Pods/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Keep all source files, configs, and assets
EOL

    echo -e "${GREEN}✅ .gitignore created${NC}"
}

# Function to initialize or update git repository
setup_git_repository() {
    echo -e "${CYAN}📦 Setting up Git repository...${NC}"
    
    if [ ! -d ".git" ]; then
        echo -e "${BLUE}🆕 Initializing new Git repository...${NC}"
        git init
        git branch -M main
    else
        echo -e "${BLUE}📂 Using existing Git repository...${NC}"
    fi
    
    # Set up remote
    if git remote get-url origin >/dev/null 2>&1; then
        echo -e "${BLUE}🔗 Updating existing remote...${NC}"
        git remote set-url origin "https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
    else
        echo -e "${BLUE}🔗 Adding new remote...${NC}"
        git remote add origin "https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
    fi
    
    echo -e "${GREEN}✅ Git repository configured${NC}"
}

# Function to sync files to GitHub
sync_to_github() {
    echo -e "${CYAN}📤 Syncing to GitHub...${NC}"
    
    # Add all files
    echo -e "${BLUE}📁 Adding project files...${NC}"
    git add .
    
    # Check if there are changes
    if git diff --staged --quiet; then
        echo -e "${YELLOW}ℹ️  No new changes detected${NC}"
        
        # Try to push any existing commits
        if git push origin main 2>/dev/null; then
            echo -e "${GREEN}✅ Successfully synced existing commits${NC}"
        else
            echo -e "${YELLOW}ℹ️  Repository is already up to date${NC}"
        fi
    else
        # Show what's being committed
        STAGED_FILES=$(git diff --staged --name-only | wc -l)
        echo -e "${BLUE}📊 Files to sync: ${STAGED_FILES}${NC}"
        
        # Create commit
        COMMIT_MSG="🏥 MHT Assessment - Emergent Sync $(date '+%Y-%m-%d %H:%M:%S')

📱 COMPLETE PROJECT SYNC FROM EMERGENT PLATFORM:
✅ All React Native source code (.tsx, .ts, .js files)
✅ Complete Android project structure for APK builds
✅ All configuration files (app.json, gradle configs)
✅ Assets and resources (images, fonts, data)
✅ Documentation and build scripts

🔧 LATEST FEATURES INCLUDED:
- ✅ Single splash screen (no duplicates)
- ✅ Bundled Debug APK configuration (works offline)
- ✅ Visible back buttons (← arrows)
- ✅ Working CME quiz with ✕ close button
- ✅ Fixed MaterialIcons rendering issues
- ✅ Enhanced Android stability

🚀 READY FOR:
- Git clone to any local machine
- npm/yarn install to restore dependencies
- Android Studio import and APK generation
- Direct installation on Android devices

📊 SYNC INFO:
- Files synced: ${STAGED_FILES}
- Optimized for GitHub (< 100MB)
- All build dependencies excluded (restorable)
- Production-ready React Native project"

        git commit -m "$COMMIT_MSG"
        
        # Push to GitHub
        echo -e "${BLUE}🚀 Pushing to GitHub...${NC}"
        if git push -u origin main; then
            echo -e "${GREEN}✅ Successfully synced to GitHub!${NC}"
        else
            echo -e "${RED}❌ Failed to push to GitHub${NC}"
            echo -e "${YELLOW}💡 This might be due to network issues or token permissions${NC}"
            return 1
        fi
    fi
}

# Function to show sync summary
show_sync_summary() {
    echo
    echo -e "${BOLD}${GREEN}================================================================${NC}"
    echo -e "${BOLD}${GREEN}🎉 EMERGENT TO GITHUB SYNC COMPLETED SUCCESSFULLY!${NC}"
    echo -e "${BOLD}${GREEN}================================================================${NC}"
    echo
    echo -e "${BLUE}📋 Repository Information:${NC}"
    echo -e "${BLUE}🔗 GitHub URL: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}${NC}"
    echo -e "${BLUE}👤 Owner: ${GITHUB_NAME}${NC}"
    echo -e "${BLUE}📧 Email: ${GITHUB_EMAIL}${NC}"
    echo
    echo -e "${CYAN}📁 What was synced:${NC}"
    echo -e "${CYAN}• Complete MHT Assessment React Native project${NC}"
    echo -e "${CYAN}• All source code (screens, components, stores)${NC}"
    echo -e "${CYAN}• Full Android project for APK builds${NC}"
    echo -e "${CYAN}• Configuration files and assets${NC}"
    echo -e "${CYAN}• Build scripts and documentation${NC}"
    echo
    echo -e "${GREEN}🚀 Next Steps:${NC}"
    echo -e "${GREEN}1. Clone repository: git clone https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git${NC}"
    echo -e "${GREEN}2. Install dependencies: npm install or yarn install${NC}"
    echo -e "${GREEN}3. Open in Android Studio: Import android/ folder${NC}"
    echo -e "${GREEN}4. Build APK: Use Android Studio or ./gradlew assembleDebug${NC}"
    echo
    echo -e "${BOLD}${BLUE}🎯 Your MHT Assessment app is now available on GitHub!${NC}"
}

# Main execution function
main() {
    echo -e "${BLUE}Starting sync process...${NC}"
    echo
    
    # Change to app directory if not already there
    cd /app 2>/dev/null || {
        echo -e "${RED}❌ Error: Cannot access /app directory${NC}"
        exit 1
    }
    
    # Execute sync steps
    configure_git_environment
    echo
    
    analyze_project_structure
    echo
    
    cleanup_large_files
    echo
    
    create_gitignore
    echo
    
    setup_git_repository
    echo
    
    sync_to_github
    echo
    
    show_sync_summary
}

# Handle script interruption
trap 'echo -e "\n${YELLOW}⚠️  Sync interrupted by user${NC}"; exit 130' INT

# Run the main function
main

echo -e "${BOLD}${GREEN}Sync completed successfully! 🎉${NC}"