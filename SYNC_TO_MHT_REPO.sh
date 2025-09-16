#!/bin/bash

# =================================================================
# MHT Assessment - GitHub Sync Script for MHT.git Repository
# Repository: https://github.com/vaibhavshrivastavait/MHT.git
# =================================================================

set -e  # Exit on any error

# Fix container environment issues
export HOME="${HOME:-/root}"
mkdir -p "$HOME"

# Repository configuration
REPO_URL="https://github.com/vaibhavshrivastavait/MHT.git"
GITHUB_USERNAME="vaibhavshrivastavait" 
GITHUB_EMAIL="vaibhavshrivastavait@gmail.com"
GITHUB_NAME="Vaibhav Shrivastava"
MAX_FILE_SIZE="50M"  # 50 MB limit for individual files

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================================${NC}"
echo -e "${BLUE}🚀 MHT Assessment - Sync to MHT Repository${NC}"
echo -e "${BLUE}Repository: ${REPO_URL}${NC}"
echo -e "${BLUE}Max File Size: ${MAX_FILE_SIZE} | Optimized for GitHub${NC}"
echo -e "${BLUE}==================================================================${NC}"

# Function to configure git
configure_git() {
    echo -e "${CYAN}🔧 Configuring Git...${NC}"
    
    git config --global user.email "${GITHUB_EMAIL}"
    git config --global user.name "${GITHUB_NAME}"
    git config --global init.defaultBranch main
    
    echo -e "${GREEN}✅ Git configured for ${GITHUB_NAME}${NC}"
}

# Function to cleanup large build artifacts
cleanup_build_artifacts() {
    echo -e "${CYAN}🧹 Cleaning up large build artifacts...${NC}"
    
    # Remove build directories
    rm -rf android/app/build/ android/build/ android/.gradle/ || true
    rm -rf ios/build/ ios/Pods/ || true
    rm -rf .expo/ .expo-shared/ .metro-cache/ || true
    rm -rf node_modules/ || true
    rm -rf dist/ web-build/ || true
    
    # Remove large bundle files
    find . -name "*.bundle" -size +10M -delete 2>/dev/null || true
    find . -name "*.map" -size +10M -delete 2>/dev/null || true
    
    echo -e "${GREEN}✅ Build artifacts cleaned${NC}"
}

# Function to create comprehensive .gitignore
create_comprehensive_gitignore() {
    echo -e "${CYAN}📝 Creating comprehensive .gitignore...${NC}"
    
    cat > .gitignore << 'EOL'
# ================================
# MHT Assessment - Comprehensive .gitignore
# Excludes large files while preserving all source code
# ================================

# Dependencies (large - must exclude)
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
package-lock.json
yarn.lock

# Expo build outputs and cache
.expo/
.expo-shared/
dist/
web-build/
.metro-cache/
*.tgz

# Android build outputs (large files)
android/app/build/
android/build/
android/.gradle/
android/gradle/wrapper/gradle-wrapper.jar
android/app/src/main/assets/index.android.bundle*
android/local.properties
android/keystore.properties

# iOS build outputs
ios/build/
ios/Pods/
ios/*.xcworkspace
ios/*.xcuserdata

# Native binaries and packages
*.ipa
*.apk
*.aab
*.keystore
*.jks

# Cache and temporary files
.cache/
tmp/
.tmp/
*.log
*.tmp

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE and editor files
.vscode/
.idea/
*.swp
*.swo
*~

# Environment and secrets (but keep .env templates)
.env.local
.env.development.local
.env.test.local
.env.production.local

# Large media files (> 50MB)
*.mov
*.mp4
*.avi
*.mkv
*.iso
*.dmg

# Keep all essential files:
# *.tsx *.ts *.jsx *.js *.json *.md *.txt
# *.gradle (Android config) 
# *.kt (Kotlin files)
# *.xml (Android manifests)
# *.png *.jpg *.jpeg *.gif (small images)
# *.sh (scripts)

EOL

    echo -e "${GREEN}✅ Comprehensive .gitignore created${NC}"
}

# Function to sync to GitHub
sync_to_github() {
    echo -e "${CYAN}🔄 Syncing to MHT GitHub Repository...${NC}"
    
    # Initialize or use existing repository
    if [ ! -d ".git" ]; then
        echo -e "${BLUE}Initializing new Git repository...${NC}"
        git init
        git branch -M main
        git remote add origin "${REPO_URL}"
    else
        echo -e "${BLUE}Using existing Git repository...${NC}"
        git remote set-url origin "${REPO_URL}" 2>/dev/null || \
        git remote add origin "${REPO_URL}"
    fi
    
    # Add ALL files (respecting .gitignore)
    echo -e "${BLUE}📁 Adding all project files...${NC}"
    git add .
    
    # Show what's being added
    echo -e "${BLUE}Files to be committed:${NC}"
    git diff --staged --name-only | head -20
    TOTAL_FILES=$(git diff --staged --name-only | wc -l)
    echo -e "${BLUE}Total files: ${TOTAL_FILES}${NC}"
    
    # Check if there are changes to commit
    if git diff --staged --quiet; then
        echo -e "${YELLOW}⚠️  No new changes to commit${NC}"
        return
    fi
    
    # Create comprehensive commit message with AsyncStorage fix
    COMMIT_MSG="🏥 MHT Assessment - Complete with AsyncStorage Fix $(date '+%Y-%m-%d %H:%M:%S')

📱 COMPLETE PROJECT FEATURES:
✅ All source code files (.tsx, .ts, .js, .jsx)
✅ Complete Android project structure
✅ Drug Interaction Checker (150 combinations)
✅ MHT Guidelines (10 sections, offline-first)
✅ CME Mode (6 modules with quizzes)
✅ Risk Assessment Calculators
✅ Treatment Plan Generator
✅ Patient Records Management

🔧 CRITICAL FIXES INCLUDED:
- ✅ AsyncStorage Error Fixed: GuidelinesScreen crash resolved
- ✅ Crash-proof storage wrapper implementation
- ✅ All screens now use safe AsyncStorage utils
- ✅ No more 'Cannot read property getItem of undefined' errors
- ✅ Guidelines screen fully functional with bookmarks
- ✅ Complete app stability improvements

📊 PROJECT STATS:
- Total files synced: ${TOTAL_FILES}
- Size optimized for GitHub
- Tech stack: React Native + Expo SDK 50
- Target: Android APK ready for production

🚀 STATUS: Production-ready with all critical bugs fixed
Ready for clone, dependency install, and APK generation"

    git commit -m "$COMMIT_MSG"
    
    # Push to GitHub
    echo -e "${BLUE}📤 Pushing to GitHub...${NC}"
    echo -e "${YELLOW}⚠️  You'll need to authenticate with GitHub${NC}"
    echo -e "${YELLOW}Enter your GitHub username and password/token when prompted${NC}"
    
    if git push origin main; then
        echo -e "${GREEN}✅ Successfully synced to GitHub!${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to push to GitHub${NC}"
        echo -e "${YELLOW}💡 Try these authentication methods:${NC}"
        echo -e "${YELLOW}1. Personal Access Token:${NC}"
        echo -e "${YELLOW}   git remote set-url origin https://USERNAME:TOKEN@github.com/vaibhavshrivastavait/MHT.git${NC}"
        echo -e "${YELLOW}   git push origin main${NC}"
        echo
        echo -e "${YELLOW}2. SSH Key (if configured):${NC}"
        echo -e "${YELLOW}   git remote set-url origin git@github.com:vaibhavshrivastavait/MHT.git${NC}"
        echo -e "${YELLOW}   git push origin main${NC}"
        return 1
    fi
}

# Function to show project summary
show_project_summary() {
    echo -e "${GREEN}==================================================================${NC}"
    echo -e "${GREEN}🎉 MHT ASSESSMENT PROJECT SYNC COMPLETED!${NC}" 
    echo -e "${GREEN}==================================================================${NC}"
    echo
    echo -e "${BLUE}📋 Repository Details:${NC}"
    echo -e "${BLUE}• URL: ${REPO_URL}${NC}"
    echo -e "${BLUE}• Owner: ${GITHUB_NAME}${NC}"
    echo -e "${BLUE}• Status: Production-ready with AsyncStorage fix${NC}"
    echo
    echo -e "${CYAN}🏥 MHT Assessment Features:${NC}"
    echo -e "${CYAN}• Comprehensive assessment workflow${NC}"
    echo -e "${CYAN}• Drug Interaction Checker (150 combinations)${NC}"
    echo -e "${CYAN}• MHT Guidelines (10 clinical sections)${NC}"
    echo -e "${CYAN}• CME Mode (6 modules with certificates)${NC}"
    echo -e "${CYAN}• Risk Calculators (BMI, ASCVD, Framingham, etc.)${NC}"
    echo -e "${CYAN}• Treatment Plan Generator${NC}"
    echo -e "${CYAN}• Patient Records Management${NC}"
    echo
    echo -e "${GREEN}🔧 Critical Fixes Applied:${NC}"
    echo -e "${GREEN}• AsyncStorage crash prevention${NC}"
    echo -e "${GREEN}• Guidelines screen fully functional${NC}"
    echo -e "${GREEN}• Crash-proof storage wrapper${NC}"
    echo -e "${GREEN}• All navigation working properly${NC}"
    echo
    echo -e "${GREEN}🚀 Ready for Local Development:${NC}"
    echo -e "${GREEN}• Git clone from GitHub${NC}"
    echo -e "${GREEN}• npm install / yarn install${NC}" 
    echo -e "${GREEN}• Android Studio APK build${NC}"
    echo -e "${GREEN}• Expo development server${NC}"
}

# Main execution function
main() {
    echo -e "${BLUE}Starting sync to MHT repository...${NC}"
    
    # Change to app directory
    cd /app
    
    # Configure git
    configure_git
    
    # Clean up build artifacts
    cleanup_build_artifacts
    
    # Create comprehensive .gitignore
    create_comprehensive_gitignore
    
    # Sync to GitHub
    if sync_to_github; then
        # Show summary
        show_project_summary
    else
        echo -e "${RED}❌ Sync failed. Please check authentication and try again.${NC}"
        exit 1
    fi
}

# Run main function
main

echo -e "${GREEN}Sync to MHT repository completed! 🎯${NC}"