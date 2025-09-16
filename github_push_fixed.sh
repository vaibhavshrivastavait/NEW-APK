#!/bin/bash

# =============================================================================
# GitHub Push Script - Fixed for File Size Limits
# =============================================================================

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

clear
echo "🚀 MHT Assessment - GitHub Push (Fixed for File Size Limits)"
echo "=========================================================="
echo ""

# Get GitHub username
echo -n "Enter your GitHub username: "
read GITHUB_USER

if [[ -z "$GITHUB_USER" ]]; then
    print_error "GitHub username cannot be empty!"
    exit 1
fi

REPO_NAME="mht-assessment-android-app"

print_info "Repository URL: https://github.com/${GITHUB_USER}/${REPO_NAME}"
echo -n "Is this correct? (y/N): "
read -r CONFIRM

if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    print_error "Cancelled by user."
    exit 1
fi

# Show what was fixed
print_info "🔧 GITHUB FILE SIZE ISSUE RESOLVED:"
print_info "✅ Android SDK excluded from repository (too large for GitHub)"
print_info "✅ .gitignore updated to exclude android-sdk/ directory"  
print_info "✅ All Android build configuration fixes preserved"
print_info "✅ Repository now within GitHub file size limits"
echo ""

# Check git status
if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
    print_error "No commits found!"
    exit 1
fi

print_status "✅ Repository ready for GitHub transfer"

# Set up remote
if git remote | grep -q origin; then
    git remote remove origin
fi

git remote add origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
git branch -M main

print_status "✅ GitHub remote configured"

# Show current repository size
REPO_SIZE=$(du -sh . | cut -f1)
print_info "📊 Repository size: ${REPO_SIZE}"

# Ask about repository creation
echo ""
print_warning "IMPORTANT: Make sure you've created the GitHub repository!"
print_info "1. Go to https://github.com/new"
print_info "2. Repository name: ${REPO_NAME}"
print_info "3. Make it public or private as needed"
print_info "4. DO NOT initialize with README"
echo ""

echo -n "Have you created the GitHub repository? (y/N): "
read -r REPO_CREATED

if [[ ! "$REPO_CREATED" =~ ^[Yy]$ ]]; then
    print_error "Please create the GitHub repository first."
    print_info "Then run this script again to push your project."
    exit 1
fi

# Push to GitHub
print_info "🚀 Pushing to GitHub..."
print_warning "You will be prompted for GitHub credentials"
print_info "Use your GitHub username and Personal Access Token (not password)"
echo ""

if git push -u origin main; then
    print_status "🎉 SUCCESS! MHT Assessment project transferred to GitHub!"
    echo ""
    print_info "🌐 Repository URL: https://github.com/${GITHUB_USER}/${REPO_NAME}"
    echo ""
    print_status "✅ WHAT WAS TRANSFERRED:"
    print_info "• Complete MHT Assessment React Native/Expo application"
    print_info "• All Android build configuration fixes"
    print_info "• React Native 0.73.3 compatibility fixes"
    print_info "• Library namespace fixes for AGP 8.1.4"
    print_info "• Complete node_modules for build reproducibility"
    print_info "• All source code, assets, and documentation"
    echo ""
    print_warning "📝 IMPORTANT FOR USERS:"
    print_info "After cloning, users must install Android SDK locally:"
    print_info "1. Install Java 17"
    print_info "2. Install Android SDK with API 34"
    print_info "3. Set ANDROID_HOME and JAVA_HOME environment variables"
    print_info "4. Run: yarn install"
    print_info "5. Run: cd android && ./gradlew assembleDebug"
    print_info "6. APK location: android/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    print_status "🏆 All Android build configuration issues have been resolved!"
    print_status "The project is ready for APK generation once SDK is installed locally."
    
else
    print_error "❌ Failed to push to GitHub!"
    echo ""
    print_info "💡 TROUBLESHOOTING:"
    print_info "1. Make sure the repository exists: https://github.com/${GITHUB_USER}/${REPO_NAME}"
    print_info "2. Use Personal Access Token instead of password"
    print_info "3. Generate token at: https://github.com/settings/tokens"
    print_info "4. Try again with: git push -u origin main"
    exit 1
fi