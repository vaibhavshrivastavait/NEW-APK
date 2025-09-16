#!/bin/bash

# Quick GitHub Sync Script - Simplified for testing
# Repository: https://github.com/vaibhavshrivastavait/mht-assessment.git

set -e

# Set environment
export HOME=/root
mkdir -p "$HOME"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Quick GitHub Sync for MHT Assessment${NC}"
echo -e "${BLUE}Repository: https://github.com/vaibhavshrivastavait/mht-assessment.git${NC}"
echo ""

# Change to project directory
cd /app

# Configure Git
git config --global user.name "vaibhav shrivastava"
git config --global user.email "vaibhavshrivastavait@users.noreply.github.com"
git config --global init.defaultBranch main

echo -e "${GREEN}✅ Git configured${NC}"

# Initialize git if needed
if [[ ! -d ".git" ]]; then
    git init
    echo -e "${GREEN}✅ Git repository initialized${NC}"
fi

# Create basic .gitignore
cat > .gitignore << 'EOL'
# Large files and build outputs
node_modules/
android/app/build/
android/build/
android/.gradle/
ios/build/
ios/Pods/
.expo/
dist/
web-build/
*.log
*.apk
*.aab
*.ipa

# Temporary files
.DS_Store
.vscode/
.idea/
*.tmp
*.temp

# Environment files
.env.local
.env.development.local
.env.test.local
.env.production.local

# Keep essential files
!android/build.gradle
!android/app/build.gradle
!android/gradle.properties
!android/settings.gradle
!metro.config.js
!babel.config.js
!package.json
!app.json
EOL

echo -e "${GREEN}✅ .gitignore created${NC}"

# Add files
echo -e "${YELLOW}📦 Adding files to staging...${NC}"
git add .

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo -e "${YELLOW}⚠️  No changes to commit${NC}"
else
    # Commit changes
    git commit -m "Complete MHT Assessment app with Windows APK build environment - Ready for local development"
    echo -e "${GREEN}✅ Changes committed${NC}"
fi

# Add remote
if ! git remote get-url origin &>/dev/null; then
    git remote add origin https://github.com/vaibhavshrivastavait/mht-assessment.git
    echo -e "${GREEN}✅ Remote repository added${NC}"
fi

# Show status
echo ""
echo -e "${BLUE}📊 Repository Status:${NC}"
echo -e "Files staged: $(git diff --cached --name-only | wc -l)"
git log --oneline -1 2>/dev/null && echo -e "${GREEN}✅ Ready to push${NC}" || echo -e "${YELLOW}⚠️  No commits yet${NC}"

echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "${YELLOW}1. To push to GitHub (requires authentication):${NC}"
echo -e "   git push -u origin main"
echo ""
echo -e "${YELLOW}2. Or use GitHub CLI if available:${NC}"
echo -e "   gh repo create vaibhavshrivastavait/mht-assessment --public --push"
echo ""
echo -e "${YELLOW}3. Manual push with credentials:${NC}"
echo -e "   git push https://USERNAME:TOKEN@github.com/vaibhavshrivastavait/mht-assessment.git main"
echo ""
echo -e "${GREEN}✅ Repository prepared for sync!${NC}"