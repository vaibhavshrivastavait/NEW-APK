#!/bin/bash

# 🚀 Simple GitHub Sync Script - MHT Assessment
# Bypasses repository creation and just syncs to existing repo

set -e

# Fix HOME environment variable
export HOME=${HOME:-/root}
export USER=${USER:-root}
mkdir -p "$HOME"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo -e "${BLUE}🚀 Simple GitHub Sync - MHT Assessment${NC}"
echo "======================================"

# Check environment variables
if [[ -z "$GITHUB_TOKEN" || -z "$GITHUB_USERNAME" ]]; then
    print_error "Please set environment variables:"
    echo "export GITHUB_TOKEN='your_token_here'"
    echo "export GITHUB_USERNAME='vaibhavshrivastavait'"
    echo "export GITHUB_EMAIL='vaibhavshrivastavait@gmail.com'"
    echo "export GITHUB_REPO='mht-assessment-android-app'"
    echo "export GITHUB_FULLNAME='vaibhav shrivastava'"
    exit 1
fi

# Set defaults
GITHUB_EMAIL=${GITHUB_EMAIL:-"vaibhavshrivastavait@gmail.com"}
GITHUB_REPO=${GITHUB_REPO:-"mht-assessment-android-app"}
GITHUB_FULLNAME=${GITHUB_FULLNAME:-"vaibhav shrivastava"}

print_success "Environment variables loaded"
print_status "Username: $GITHUB_USERNAME"
print_status "Repository: $GITHUB_REPO"

cd /app

# Setup Git
print_status "Setting up Git configuration..."
git config --global user.name "$GITHUB_FULLNAME" 2>/dev/null || git config user.name "$GITHUB_FULLNAME"
git config --global user.email "$GITHUB_EMAIL" 2>/dev/null || git config user.email "$GITHUB_EMAIL"
git config --global init.defaultBranch main 2>/dev/null || git config init.defaultBranch main

# Initialize or update repository
print_status "Setting up repository..."
REPO_URL="https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${GITHUB_REPO}.git"

if [[ ! -d ".git" ]]; then
    print_status "Initializing Git repository..."
    git init
    git branch -M main
fi

# Set remote
if git remote get-url origin &>/dev/null; then
    git remote set-url origin "$REPO_URL"
else
    git remote add origin "$REPO_URL"
fi

print_success "Repository setup complete"

# Add and commit files
print_status "Adding files to Git..."
git add .

if git diff --staged --quiet; then
    print_status "No changes to commit"
else
    print_status "Creating commit..."
    git commit -m "🚀 Complete MHT Assessment Project Sync

📱 Features Added:
- Comprehensive Windows setup system with prerequisite checker
- Deterministic Treatment Plan Engine with 25+ clinical rules
- Enhanced Risk Calculators (ASCVD, FRAX, Gail, Wells, Framingham)
- Decision Support Detail Screen with simulate mode
- Complete drug interaction checking system
- Android APK build scripts and documentation

🛠️ Technical Implementation:
- React Native/Expo SDK 50 with TypeScript
- Medical algorithms with validated formulas
- Offline-first architecture with local persistence
- Cross-platform compatibility (Android/iOS ready)
- Professional UI/UX with accessibility support

🎯 Ready for Production:
- Self-contained Android APK generation
- Professional medical decision support
- Comprehensive error handling and testing
- Complete documentation and setup guides

Synced from emergent.sh environment - $(date)"
fi

# Push to GitHub
print_status "Pushing to GitHub..."
if git push -u origin main --progress; then
    print_success "🎉 Successfully synced to GitHub!"
    echo ""
    echo -e "${GREEN}Repository URL: https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}${NC}"
    echo ""
    echo "✅ All MHT Assessment files have been synced including:"
    echo "   - Windows prerequisite checker scripts"
    echo "   - Treatment Plan Engine with JSON rule files"
    echo "   - Complete medical decision support system"
    echo "   - Build scripts and comprehensive documentation"
else
    print_error "Push failed! Please check:"
    echo "1. Token has 'repo' scope"
    echo "2. Repository exists and you have access"
    echo "3. Network connectivity"
    echo ""
    echo "Test authentication: ./test-github-auth.sh"
fi