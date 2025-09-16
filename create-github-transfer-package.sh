#!/bin/bash

# 🚀 MHT Assessment - Offline GitHub Transfer Package Creator
# This script creates a complete package for local GitHub transfer

set -e  # Exit on any error

# ========================================
# HARDCODED CONFIGURATION
# ========================================
GITHUB_USERNAME="vaibhavshrivastavait"
GITHUB_EMAIL="vaibhavshrivastavait@gmail.com"
FULL_NAME="vaibhav shrivastava"
REPO_NAME="mht-assessment"
GITHUB_REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ========================================
# HELPER FUNCTIONS
# ========================================

print_step() {
    echo -e "\n${BLUE}🚀 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ========================================
# MAIN EXECUTION
# ========================================

echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              MHT ASSESSMENT - OFFLINE TRANSFER              ║"
echo "║            GITHUB PACKAGE CREATOR (NO INTERNET)             ║"
echo "║                                                              ║"
echo "║  Repo: ${REPO_NAME}                                  ║"
echo "║  User: ${GITHUB_USERNAME}                        ║"
echo "║  Email: ${GITHUB_EMAIL}              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "App.tsx" ]; then
    print_error "This doesn't appear to be the MHT Assessment project directory!"
    print_error "Please run this script from the project root directory."
    exit 1
fi

print_step "Verifying project structure..."
if [ -d "android" ] && [ -d "screens" ] && [ -d "utils" ] && [ -d "scripts" ]; then
    print_success "Project structure verified - MHT Assessment project found"
else
    print_error "Missing required project directories!"
    exit 1
fi

print_step "Creating transfer package directory..."
TRANSFER_DIR="mht-assessment-github-transfer"
PACKAGE_NAME="${TRANSFER_DIR}.tar.gz"

# Remove existing transfer directory if it exists
if [ -d "$TRANSFER_DIR" ]; then
    print_warning "Existing transfer directory found, removing..."
    rm -rf "$TRANSFER_DIR"
fi

# Create transfer directory
mkdir -p "$TRANSFER_DIR"
print_success "Transfer directory created: $TRANSFER_DIR"

print_step "Copying project files (excluding unnecessary files)..."

# Create comprehensive .gitignore for the package
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Expo
.expo/
dist/
web-build/

# Native
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# Debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# local env files
.env*.local
.env.local
.env.development.local
.env.test.local
.env.production.local

# typescript
*.tsbuildinfo

# IDE
.vscode/
.idea/
*.swp
*.swo

# Build artifacts
android/app/build/
android/.gradle/
build/
*.apk
*.aab

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# Temporary folders
tmp/
temp/

# OS generated files
Thumbs.db
ehthumbs.db

# Test files
test_result.md
*.test.png
*.test.jpeg

# Backup files
*.backup
*.bak

# Transfer package
mht-assessment-github-transfer/
mht-assessment-github-transfer.tar.gz
EOF

# Copy all project files excluding node_modules and build artifacts
rsync -av --progress \
  --exclude='node_modules' \
  --exclude='.expo' \
  --exclude='android/app/build' \
  --exclude='android/.gradle' \
  --exclude='build' \
  --exclude='*.apk' \
  --exclude='*.aab' \
  --exclude='*.log' \
  --exclude='test_result.md' \
  --exclude="$TRANSFER_DIR" \
  --exclude="$PACKAGE_NAME" \
  . "$TRANSFER_DIR/"

print_success "Project files copied successfully"

print_step "Creating GitHub setup script for local execution..."

# Create the local GitHub setup script
cat > "$TRANSFER_DIR/setup-github-local.sh" << 'LOCALSCRIPT'
#!/bin/bash

# 🚀 MHT Assessment - Local GitHub Setup Script
# Run this script on your local machine with internet access

set -e

# Hardcoded configuration
GITHUB_USERNAME="vaibhavshrivastavait"
GITHUB_EMAIL="vaibhavshrivastavait@gmail.com"
FULL_NAME="vaibhav shrivastava"
REPO_NAME="mht-assessment"
GITHUB_REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_step() {
    echo -e "\n${BLUE}🚀 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    MHT ASSESSMENT                            ║"
echo "║               LOCAL GITHUB SETUP                             ║"
echo "║                                                              ║"
echo "║  Repo: ${REPO_NAME}                                  ║"
echo "║  User: ${GITHUB_USERNAME}                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if git is available
if ! command -v git &> /dev/null; then
    print_error "Git is not installed! Please install git first."
    exit 1
fi

print_step "Setting up Git configuration..."
git config --global user.name "$FULL_NAME"
git config --global user.email "$GITHUB_EMAIL"
git config --global init.defaultBranch main
print_success "Git configured"

print_step "Initializing Git repository..."
if [ -d ".git" ]; then
    rm -rf .git
fi
git init
print_success "Git repository initialized"

print_step "Adding all files to Git..."
git add .
print_success "Files staged"

print_step "Creating commit..."
COMMIT_MESSAGE="🎉 Initial commit: Complete MHT Assessment Clinical Decision Support App

✅ Features included:
- React Native/Expo mobile app with TypeScript
- Comprehensive medical risk calculators (ASCVD, Gail, Wells, FRAX)
- Evidence-based treatment plan generator
- Drug interaction checker with 10+ medicine categories
- CME quiz system for continuing medical education
- Patient data management with local SQLite storage
- PDF export functionality for assessments and treatment plans
- Offline-first architecture - works without internet

🛠️ Build system included:
- Self-contained APK build scripts (Windows, Linux, macOS)
- GitHub Actions workflow for automated APK building
- Complete environment setup scripts
- Universal APK generation (all Android architectures)
- Professional medical-grade UI/UX

📚 Documentation included:
- Complete setup guides for all platforms
- Build instructions and troubleshooting
- Medical calculator documentation
- API documentation and testing guides

🚀 Ready for production deployment!
Project transferred from emergent.sh development environment."

git commit -m "$COMMIT_MESSAGE"
print_success "Commit created"

print_step "Setting up GitHub remote..."
git remote add origin "$GITHUB_REPO_URL"
print_success "Remote configured"

echo -e "\n${YELLOW}🔐 GITHUB AUTHENTICATION REQUIRED${NC}"
echo "To push to GitHub, you need to authenticate:"
echo ""
echo "Option 1: Personal Access Token (Recommended)"
echo "  1. Go to: https://github.com/settings/tokens/new"
echo "  2. Generate token with 'repo' scope"
echo "  3. Use token as password when prompted"
echo ""
echo "Option 2: SSH Key"
echo "  1. Set up SSH key in GitHub settings"
echo "  2. Repository will use SSH URL"
echo ""

read -p "Use SSH instead of HTTPS? (y/N): " use_ssh

if [[ $use_ssh =~ ^[Yy]$ ]]; then
    SSH_URL="git@github.com:${GITHUB_USERNAME}/${REPO_NAME}.git"
    git remote set-url origin "$SSH_URL"
    print_success "Configured for SSH authentication"
else
    print_success "Configured for HTTPS authentication (will prompt for token)"
fi

print_step "Pushing to GitHub..."
if git push -u origin main; then
    print_success "🎉 Successfully pushed to GitHub!"
    echo -e "\n${GREEN}Repository URL: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}${NC}"
else
    print_error "Push failed. Please check your authentication and try again."
    echo -e "\n${YELLOW}Manual push command:${NC}"
    echo "git push -u origin main"
fi

echo -e "\n${GREEN}✅ Setup complete! Your MHT Assessment app is on GitHub!${NC}"
LOCALSCRIPT

chmod +x "$TRANSFER_DIR/setup-github-local.sh"
print_success "Local GitHub setup script created"

print_step "Creating Windows batch file for local setup..."

# Create Windows batch file
cat > "$TRANSFER_DIR/setup-github-local.bat" << 'BATCHSCRIPT'
@echo off
echo ====================================================================
echo                    MHT ASSESSMENT - LOCAL GITHUB SETUP
echo ====================================================================
echo.
echo Repo: mht-assessment
echo User: vaibhavshrivastavait
echo.

REM Check if git is available
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed! Please install git first.
    pause
    exit /b 1
)

echo Setting up Git configuration...
git config --global user.name "vaibhav shrivastava"
git config --global user.email "vaibhavshrivastavait@gmail.com"
git config --global init.defaultBranch main
echo Git configured successfully.

echo.
echo Initializing Git repository...
if exist .git rmdir /s /q .git
git init
echo Git repository initialized.

echo.
echo Adding all files to Git...
git add .
echo Files staged successfully.

echo.
echo Creating commit...
git commit -m "Initial commit: Complete MHT Assessment Clinical Decision Support App"
echo Commit created successfully.

echo.
echo Setting up GitHub remote...
git remote add origin https://github.com/vaibhavshrivastavait/mht-assessment.git
echo Remote configured successfully.

echo.
echo ====================================================================
echo GITHUB AUTHENTICATION REQUIRED
echo ====================================================================
echo To push to GitHub, you need a Personal Access Token:
echo 1. Go to: https://github.com/settings/tokens/new
echo 2. Generate token with 'repo' scope
echo 3. Use token as password when prompted
echo.

echo Pushing to GitHub...
git push -u origin main

if errorlevel 0 (
    echo.
    echo ====================================================================
    echo SUCCESS! Your MHT Assessment app is now on GitHub!
    echo Repository URL: https://github.com/vaibhavshrivastavait/mht-assessment
    echo ====================================================================
) else (
    echo.
    echo Push failed. Please check your authentication and try:
    echo git push -u origin main
)

echo.
pause
BATCHSCRIPT

print_success "Windows batch file created"

print_step "Creating comprehensive README for transfer package..."

cat > "$TRANSFER_DIR/TRANSFER_INSTRUCTIONS.md" << 'README'
# 🚀 MHT Assessment - GitHub Transfer Package

## 📋 What This Package Contains

This package contains the **complete MHT Assessment project** ready for GitHub transfer:

- ✅ **Complete React Native/Expo App** (Medical decision support)
- ✅ **APK Build Scripts** (Windows, Linux, macOS)
- ✅ **GitHub Actions Workflow** (Automated building)
- ✅ **Complete Documentation** (Setup guides)
- ✅ **Medical Features** (Risk calculators, treatment plans)

## 🎯 Hardcoded Configuration

- **GitHub Username**: `vaibhavshrivastavait`
- **Email**: `vaibhavshrivastavait@gmail.com`
- **Full Name**: `vaibhav shrivastava`
- **Repository Name**: `mht-assessment`
- **Repository URL**: `https://github.com/vaibhavshrivastavait/mht-assessment`

## 🚀 Quick Setup (Choose Your Platform)

### **Windows Users**
1. Extract this package to a folder
2. Double-click `setup-github-local.bat`
3. Enter your GitHub Personal Access Token when prompted

### **Linux/macOS Users**
1. Extract this package to a folder
2. Open terminal in the extracted folder
3. Run: `./setup-github-local.sh`
4. Follow the authentication prompts

## 🔐 GitHub Personal Access Token Setup

**BEFORE running the setup:**

1. Go to: https://github.com/settings/tokens/new
2. Token name: **"MHT Assessment Transfer"**
3. Select scope: **`repo`** (Full control of repositories)
4. Click **"Generate token"**
5. **COPY THE TOKEN** (you won't see it again!)

## 📱 After Transfer - Users Can Build APK

Once on GitHub, anyone can build the APK:

```bash
# Clone the repository
git clone https://github.com/vaibhavshrivastavait/mht-assessment.git
cd mht-assessment

# Install dependencies
npm install

# Build APK
npm run build:apk
```

## 🏥 App Features Included

### **Medical Assessment Tools**
- ASCVD Risk Calculator
- Gail Breast Cancer Risk Model
- Wells VTE Score
- FRAX Fracture Risk Assessment
- Framingham Risk Score

### **Clinical Decision Support**
- Evidence-based treatment plan generator
- Drug interaction checker (10+ medicine categories)
- Contraindication alerts and warnings
- Alternative therapy recommendations

### **Professional Features**
- CME quiz system for continuing education
- Patient data management with SQLite
- PDF export for assessments and treatment plans
- Offline-first architecture (no internet required)

## ✅ Success Verification

After running the setup script, verify success by:

1. **Check GitHub**: Visit https://github.com/vaibhavshrivastavait/mht-assessment
2. **Verify Files**: Should see all project files uploaded
3. **Test Clone**: Try cloning the repository locally
4. **Build Test**: Run `npm install && npm run build:apk`

## 🛠️ Manual Setup (If Scripts Fail)

If the automated scripts don't work:

```bash
# Extract package and navigate to folder
cd mht-assessment

# Initialize git
git init
git add .
git commit -m "Initial commit: MHT Assessment app"

# Add GitHub remote
git remote add origin https://github.com/vaibhavshrivastavait/mht-assessment.git

# Push to GitHub (will prompt for token)
git push -u origin main
```

## 📊 Package Contents

- **Source Code**: Complete React Native/Expo application
- **Build Scripts**: APK generation for all platforms
- **Documentation**: Setup guides and medical information
- **GitHub Actions**: Automated build workflow
- **Assets**: Images, medical content, quiz data

## 🎉 Ready to Transfer!

Your complete MHT Assessment project is packaged and ready for GitHub!

Just run the setup script for your platform and enter your GitHub token when prompted.
README

print_success "Transfer instructions created"

print_step "Creating compressed package..."

# Create compressed archive
tar -czf "$PACKAGE_NAME" "$TRANSFER_DIR"
PACKAGE_SIZE=$(du -h "$PACKAGE_NAME" | cut -f1)

print_success "Package created: $PACKAGE_NAME ($PACKAGE_SIZE)"

print_step "Generating package summary..."

# Count files
TOTAL_FILES=$(find "$TRANSFER_DIR" -type f | wc -l)
SOURCE_FILES=$(find "$TRANSFER_DIR" -name "*.tsx" -o -name "*.ts" -o -name "*.js" | wc -l)
DOC_FILES=$(find "$TRANSFER_DIR" -name "*.md" | wc -l)

cat > "GITHUB_TRANSFER_PACKAGE_SUMMARY.md" << EOF
# 🎉 MHT Assessment - GitHub Transfer Package Created

## 📊 Package Summary
- **Date**: $(date)
- **Package File**: $PACKAGE_NAME
- **Package Size**: $PACKAGE_SIZE
- **Total Files**: $TOTAL_FILES
- **Source Code Files**: $SOURCE_FILES
- **Documentation Files**: $DOC_FILES

## 🎯 Hardcoded Configuration
- **GitHub Username**: $GITHUB_USERNAME
- **Email**: $GITHUB_EMAIL
- **Full Name**: $FULL_NAME
- **Repository**: $REPO_NAME
- **URL**: $GITHUB_REPO_URL

## 📦 Package Contents
✅ Complete MHT Assessment React Native/Expo app
✅ Medical risk calculators and decision support tools
✅ Treatment plan generator with evidence-based recommendations
✅ Drug interaction checker with comprehensive medicine database
✅ APK build scripts for Windows, Linux, macOS
✅ GitHub Actions workflow for automated builds
✅ Complete documentation and setup guides
✅ Local GitHub setup scripts (automated transfer)

## 🚀 Next Steps
1. **Download** the package: $PACKAGE_NAME
2. **Extract** to your local machine
3. **Run setup script**:
   - Windows: Double-click \`setup-github-local.bat\`
   - Linux/macOS: Run \`./setup-github-local.sh\`
4. **Enter GitHub token** when prompted
5. **Verify** at: https://github.com/$GITHUB_USERNAME/$REPO_NAME

## 🔐 GitHub Token Required
Before running setup:
1. Go to: https://github.com/settings/tokens/new
2. Token name: "MHT Assessment Transfer"
3. Scope: Select "repo"
4. Generate and copy token

## ✅ After Transfer
Users can immediately:
\`\`\`bash
git clone https://github.com/$GITHUB_USERNAME/$REPO_NAME.git
cd $REPO_NAME
npm install && npm run build:apk
\`\`\`

**🎉 Your complete medical assessment app is ready for GitHub!**
EOF

print_success "Package summary created"

# Final status display
echo -e "\n${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                🎉 TRANSFER PACKAGE READY! 🎉                ║"
echo "║                                                              ║"
echo "║  Package: $PACKAGE_NAME                       ║"
echo "║  Size: $PACKAGE_SIZE                                          ║"
echo "║  Files: $TOTAL_FILES                                         ║"
echo "║                                                              ║"
echo "║  Next Steps:                                                 ║"
echo "║  1. Download the package to your local machine               ║"
echo "║  2. Extract and run setup script                             ║"
echo "║  3. Enter GitHub token when prompted                         ║"
echo "║  4. Your app will be live on GitHub!                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "\n${BLUE}📦 Files created:${NC}"
echo "  • $PACKAGE_NAME - Complete transfer package"
echo "  • $TRANSFER_DIR/ - Extracted project files"
echo "  • GITHUB_TRANSFER_PACKAGE_SUMMARY.md - Setup instructions"

echo -e "\n${GREEN}🚀 Your MHT Assessment project is packaged and ready for local GitHub transfer!${NC}"