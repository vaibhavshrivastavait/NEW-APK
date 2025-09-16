#!/bin/bash

# ============================================================================
# MHT Assessment - Complete GitHub Repository Sync Script
# ============================================================================
# Version: 2.0 Enhanced - Complete project transfer with size optimization
# Purpose: Sync ALL essential project files to GitHub for local APK building
# Compatible with: Linux/macOS/Windows (Git Bash)
#
# This script ensures ALL necessary files are available on GitHub for:
# - Complete project cloning
# - Local dependency restoration (npm install/yarn install)
# - Android Studio project import
# - APK generation and testing
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Enhanced output functions
print_header() {
    echo -e "${MAGENTA}============================================================================${NC}"
    echo -e "${MAGENTA}$1${NC}"
    echo -e "${MAGENTA}============================================================================${NC}"
}

print_section() {
    echo -e "${CYAN}🔹 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${CYAN}🔍 $1${NC}"
}

# Initialize variables
REPO_URL="https://github.com/vaibhavshrivastavait/MHT-FINAL.git"
BRANCH="apk"
COMMIT_MESSAGE="Complete MHT Assessment app with Windows APK build environment - Ready for local development"
FORCE_PUSH=false
DRY_RUN=false
ANALYZE_ONLY=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -r|--repo)
            REPO_URL="$2"
            shift 2
            ;;
        -b|--branch)
            BRANCH="$2"
            shift 2
            ;;
        -m|--message)
            COMMIT_MESSAGE="$2"
            shift 2
            ;;
        -f|--force)
            FORCE_PUSH=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --analyze-only)
            ANALYZE_ONLY=true
            shift
            ;;
        -h|--help)
            echo "MHT Assessment - Complete GitHub Sync Script v2.0"
            echo ""
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -r, --repo URL          GitHub repository URL (required unless --analyze-only)"
            echo "  -b, --branch NAME       Branch name (default: main)"
            echo "  -m, --message MSG       Commit message"
            echo "  -f, --force             Force push (use with caution)"
            echo "  --dry-run               Show what would be synced without actually doing it"
            echo "  --analyze-only          Only analyze project structure and files"
            echo "  -h, --help              Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 --analyze-only                                    # Analyze project structure"
            echo "  $0 -r https://github.com/username/mht-assessment.git # Basic sync"
            echo "  $0 -r git@github.com:username/mht-assessment.git -b develop # Different branch"
            echo "  $0 --dry-run -r https://github.com/username/repo.git        # Preview sync"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Validate repository URL (not required for analyze-only mode)
if [[ -z "$REPO_URL" && "$ANALYZE_ONLY" != "true" && "$DRY_RUN" != "true" ]]; then
    print_error "Repository URL is required!"
    echo "Use -r or --repo to specify the GitHub repository URL"
    echo "Example: $0 -r https://github.com/vaibhavshrivastavait/MHT-FINAL.git"
    echo "Or use --analyze-only to just analyze the project structure"
    exit 1
fi

print_header "MHT ASSESSMENT - COMPLETE GITHUB SYNC SCRIPT V2.0"

if [[ "$ANALYZE_ONLY" == "true" ]]; then
    echo "Mode: Project Analysis Only"
elif [[ "$DRY_RUN" == "true" ]]; then
    echo "Mode: Dry Run (Preview Only)"
    echo "Repository: $REPO_URL"
else
    echo "Repository: $REPO_URL"
    echo "Branch: $BRANCH"
    echo "Commit Message: $COMMIT_MESSAGE"
fi
echo ""

# Change to project directory
cd /app

print_section "Project Structure Analysis"

# Verify we're in the right directory
if [[ ! -f "package.json" ]] || [[ ! -f "app.json" ]]; then
    print_error "Not in a valid Expo project directory!"
    print_error "Make sure you're running this from the MHT Assessment project root"
    exit 1
fi

print_success "Verified Expo project structure (package.json + app.json found)"

# Analyze project size and structure
print_step "Analyzing project files and sizes..."

# Get total project size
TOTAL_SIZE=$(du -sh . 2>/dev/null | cut -f1 || echo "Unknown")
print_info "Total project size: $TOTAL_SIZE"

# Find large directories that should be excluded
echo ""
print_step "Large directories (excluded from sync):"
du -sh node_modules 2>/dev/null && echo "  📦 node_modules - Contains npm dependencies (will be restored with 'npm install')"
du -sh android/app/build 2>/dev/null && echo "  🔨 android/app/build - Android build outputs (regenerated during build)"
du -sh android/build 2>/dev/null && echo "  🔨 android/build - Android build cache (regenerated during build)"
du -sh ios/build 2>/dev/null && echo "  🔨 ios/build - iOS build outputs (regenerated during build)"
du -sh .expo 2>/dev/null && echo "  📱 .expo - Expo cache (regenerated during development)"
du -sh dist 2>/dev/null && echo "  📦 dist - Distribution files (regenerated during build)"
du -sh web-build 2>/dev/null && echo "  🌐 web-build - Web build outputs (regenerated during build)"

echo ""
print_step "Essential files and directories to sync:"

# Count and show essential files
ESSENTIAL_FILES=0

# Source code files
TYPESCRIPT_FILES=$(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | wc -l)
JAVASCRIPT_FILES=$(find . -name "*.js" -o -name "*.jsx" | grep -v node_modules | wc -l)
print_info "TypeScript/JavaScript files: $((TYPESCRIPT_FILES + JAVASCRIPT_FILES))"
ESSENTIAL_FILES=$((ESSENTIAL_FILES + TYPESCRIPT_FILES + JAVASCRIPT_FILES))

# Configuration files
CONFIG_FILES=$(find . -maxdepth 1 \( -name "*.json" -o -name "*.js" -o -name "*.ts" -o -name "*.md" \) | grep -v node_modules | wc -l)
print_info "Configuration files: $CONFIG_FILES"
ESSENTIAL_FILES=$((ESSENTIAL_FILES + CONFIG_FILES))

# Android project files
ANDROID_FILES=$(find android -type f \( -name "*.gradle" -o -name "*.xml" -o -name "*.properties" -o -name "*.java" -o -name "*.kt" \) 2>/dev/null | wc -l)
print_info "Android project files: $ANDROID_FILES"
ESSENTIAL_FILES=$((ESSENTIAL_FILES + ANDROID_FILES))

# iOS project files (if exists)
if [[ -d "ios" ]]; then
    IOS_FILES=$(find ios -type f \( -name "*.pbxproj" -o -name "*.plist" -o -name "*.m" -o -name "*.h" -o -name "*.swift" \) 2>/dev/null | wc -l)
    print_info "iOS project files: $IOS_FILES"
    ESSENTIAL_FILES=$((ESSENTIAL_FILES + IOS_FILES))
fi

# Assets
ASSET_FILES=$(find assets -type f 2>/dev/null | wc -l || echo 0)
print_info "Asset files: $ASSET_FILES"
ESSENTIAL_FILES=$((ESSENTIAL_FILES + ASSET_FILES))

# Scripts
SCRIPT_FILES=$(find scripts -type f 2>/dev/null | wc -l || echo 0)
print_info "Script files: $SCRIPT_FILES"
ESSENTIAL_FILES=$((ESSENTIAL_FILES + SCRIPT_FILES))

# Utility files
UTIL_FILES=$(find utils -type f 2>/dev/null | wc -l || echo 0)
print_info "Utility files: $UTIL_FILES"
ESSENTIAL_FILES=$((ESSENTIAL_FILES + UTIL_FILES))

# Components
COMPONENT_FILES=$(find components -type f 2>/dev/null | wc -l || echo 0)
print_info "Component files: $COMPONENT_FILES"
ESSENTIAL_FILES=$((ESSENTIAL_FILES + COMPONENT_FILES))

# Screens
SCREEN_FILES=$(find screens -type f 2>/dev/null | wc -l || echo 0)
print_info "Screen files: $SCREEN_FILES"
ESSENTIAL_FILES=$((ESSENTIAL_FILES + SCREEN_FILES))

# Data files
DATA_FILES=$(find data -type f 2>/dev/null | wc -l || echo 0)
if [[ $DATA_FILES -gt 0 ]]; then
    print_info "Data files: $DATA_FILES"
    ESSENTIAL_FILES=$((ESSENTIAL_FILES + DATA_FILES))
fi

# MHT Rules files
MHT_RULES_FILES=$(find mht_rules -type f 2>/dev/null | wc -l || echo 0)
if [[ $MHT_RULES_FILES -gt 0 ]]; then
    print_info "MHT Rules files: $MHT_RULES_FILES"
    ESSENTIAL_FILES=$((ESSENTIAL_FILES + MHT_RULES_FILES))
fi

echo ""
print_success "Total essential files to sync: $ESSENTIAL_FILES"

# Show what key files will be included
echo ""
print_step "Key files included in sync:"
echo "📱 App Configuration:"
[[ -f "app.json" ]] && echo "  ✓ app.json (Expo configuration)"
[[ -f "package.json" ]] && echo "  ✓ package.json (Dependencies and scripts)"
[[ -f "metro.config.js" ]] && echo "  ✓ metro.config.js (Metro bundler configuration)"
[[ -f "babel.config.js" ]] && echo "  ✓ babel.config.js (Babel transpiler configuration)"
[[ -f "tsconfig.json" ]] && echo "  ✓ tsconfig.json (TypeScript configuration)"

echo ""
echo "🏗️  Build Configuration:"
[[ -f "android/build.gradle" ]] && echo "  ✓ android/build.gradle (Android root build file)"
[[ -f "android/app/build.gradle" ]] && echo "  ✓ android/app/build.gradle (Android app build file)"
[[ -f "android/gradle.properties" ]] && echo "  ✓ android/gradle.properties (Android build properties)"
[[ -f "android/settings.gradle" ]] && echo "  ✓ android/settings.gradle (Android settings)"

echo ""
echo "📱 Application Files:"
[[ -f "App.tsx" ]] && echo "  ✓ App.tsx (Main application entry point)"
[[ -f "index.js" ]] && echo "  ✓ index.js (Expo entry point)"
[[ -d "screens" ]] && echo "  ✓ screens/ (Application screens)"
[[ -d "components" ]] && echo "  ✓ components/ (Reusable components)"
[[ -d "utils" ]] && echo "  ✓ utils/ (Utility functions and calculators)"
[[ -d "store" ]] && echo "  ✓ store/ (State management)"

echo ""
echo "🎨 Resources:"
[[ -d "assets" ]] && echo "  ✓ assets/ (Images, fonts, sounds)"
[[ -d "data" ]] && echo "  ✓ data/ (Static data files)"
[[ -d "mht_rules" ]] && echo "  ✓ mht_rules/ (Medical decision rules)"

echo ""
echo "🔧 Development Tools:"
[[ -d "scripts" ]] && echo "  ✓ scripts/ (Build and utility scripts)"
[[ -f ".env" ]] && echo "  ✓ .env (Environment configuration)"

# If analyze-only mode, exit here
if [[ "$ANALYZE_ONLY" == "true" ]]; then
    echo ""
    print_header "PROJECT ANALYSIS COMPLETE"
    print_success "Project is ready for GitHub sync with $ESSENTIAL_FILES essential files"
    print_info "To sync to GitHub, run:"
    echo "  $0 -r https://github.com/your-username/mht-assessment.git"
    exit 0
fi

echo ""
print_section "Git Repository Setup"

# Initialize git if not already initialized
if [[ ! -d ".git" ]]; then
    print_step "Initializing Git repository..."
    git init
    print_success "Git repository initialized"
else
    print_success "Git repository already initialized"
fi

# Create comprehensive .gitignore
print_step "Setting up .gitignore for APK build environment..."

cat > .gitignore << 'EOL'
# ============================================================================
# MHT Assessment - Complete .gitignore for APK Build Environment
# ============================================================================

# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
package-lock.json
yarn.lock

# Expo
.expo/
dist/
web-build/
.expo-shared/

# Build outputs
android/app/build/
android/build/
android/.gradle/
ios/build/
ios/Pods/
*.apk
*.aab
*.ipa

# Environment files (keep .env for local development reference)
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# Bundle artifacts
*.jsbundle

# Metro bundler cache
.metro-health-check*

# Temporary files
*.tmp
*.temp

# Python cache (for any Python scripts)
__pycache__/
*.py[cod]
*$py.class

# Local development
*.local

# Test results backup
test_result.md.backup

# Build scripts output
*.err
*.out

# APK build temporary files
android/app/src/main/assets/index.android.bundle*
android/app/src/main/res/drawable-*
android/app/src/main/res/raw/

# Large data files (will be regenerated)
*.zip
*.tar.gz

# Keep important configuration files for APK building
!android/build.gradle
!android/app/build.gradle
!android/gradle.properties
!android/settings.gradle
!android/gradlew
!android/gradlew.bat
!android/gradle/wrapper/gradle-wrapper.properties
!metro.config.js
!babel.config.js
!tsconfig.json
EOL

print_success ".gitignore configured for APK build environment"

# Show what will be committed (dry run mode)
if [[ "$DRY_RUN" == "true" ]]; then
    echo ""
    print_section "DRY RUN: Files that would be synced"
    
    # Add files and show what would be committed
    git add . 2>/dev/null || true
    
    if git diff --cached --quiet; then
        print_warning "No new changes detected"
    else
        print_step "Files that would be committed:"
        git diff --cached --name-only | head -20
        
        local file_count=$(git diff --cached --name-only | wc -l)
        if [[ $file_count -gt 20 ]]; then
            print_info "... and $((file_count - 20)) more files"
        fi
        
        print_info "Total files to commit: $file_count"
    fi
    
    # Reset the staged changes since this is a dry run
    git reset HEAD . >/dev/null 2>&1 || true
    
    echo ""
    print_header "DRY RUN COMPLETE"
    print_info "To actually sync to GitHub, run:"
    echo "  $0 -r $REPO_URL"
    exit 0
fi

# Add files to git
print_step "Adding files to Git staging area..."
git add .

# Check for changes
if git diff --cached --quiet; then
    print_warning "No changes detected to commit"
    SKIP_COMMIT=true
else
    print_success "Files staged for commit"
    
    # Show summary of what's being committed
    STAGED_FILES=$(git diff --cached --name-only | wc -l)
    print_info "Files staged for commit: $STAGED_FILES"
    
    # Show first few files as examples
    print_step "Sample files to be committed:"
    git diff --cached --name-only | head -10 | while read file; do
        echo "  ✓ $file"
    done
    
    if [[ $STAGED_FILES -gt 10 ]]; then
        print_info "  ... and $((STAGED_FILES - 10)) more files"
    fi
    
    SKIP_COMMIT=false
fi

# Commit changes
if [[ "$SKIP_COMMIT" != "true" ]]; then
    print_step "Committing changes..."
    git commit -m "$COMMIT_MESSAGE"
    print_success "Changes committed successfully"
fi

# Configure remote
print_step "Configuring remote repository..."
if git remote get-url origin >/dev/null 2>&1; then
    print_step "Updating existing remote origin..."
    git remote set-url origin "$REPO_URL"
else
    print_step "Adding remote origin..."
    git remote add origin "$REPO_URL"
fi
print_success "Remote repository configured: $REPO_URL"

# Push to GitHub
print_step "Pushing to GitHub..."

if [[ "$FORCE_PUSH" == "true" ]]; then
    print_warning "Force pushing to $BRANCH..."
    git push origin "$BRANCH" --force
    PUSH_SUCCESS=true
else
    # Try normal push first
    if git push origin "$BRANCH" 2>/dev/null; then
        print_success "Successfully pushed to $BRANCH"
        PUSH_SUCCESS=true
    else
        print_warning "Normal push failed, trying to set upstream..."
        if git push --set-upstream origin "$BRANCH" 2>/dev/null; then
            print_success "Successfully pushed with upstream set"
            PUSH_SUCCESS=true
        else
            print_error "Push failed!"
            print_info "This might be because:"
            print_info "1. The repository doesn't exist on GitHub"
            print_info "2. You don't have push permissions"
            print_info "3. There are conflicts with existing commits"
            print_info ""
            print_info "Solutions:"
            print_info "1. Create the repository on GitHub first"
            print_info "2. Use --force flag if you want to overwrite remote history"
            print_info "3. Check your GitHub credentials and permissions"
            PUSH_SUCCESS=false
        fi
    fi
fi

echo ""

if [[ "$PUSH_SUCCESS" == "true" ]]; then
    print_header "🎉 GITHUB SYNC COMPLETED SUCCESSFULLY!"
    print_success "Repository: $REPO_URL"
    print_success "Branch: $BRANCH"
    print_success "Essential files synced: $ESSENTIAL_FILES"
    
    echo ""
    print_header "📋 NEXT STEPS FOR LOCAL WINDOWS APK BUILDING"
    echo ""
    print_section "1. Set up your Windows environment:"
    echo "   PowerShell -ExecutionPolicy Bypass -File .\\scripts\\windows-complete-apk-builder-setup.ps1 -AutoInstall"
    echo ""
    print_section "2. Clone the repository:"
    echo "   git clone $REPO_URL"
    echo "   cd $(basename $REPO_URL .git)"
    echo ""
    print_section "3. Install dependencies:"
    echo "   npm install    # or yarn install"
    echo ""
    print_section "4. Build the Android bundle:"
    echo "   npm run bundle:android"
    echo ""
    print_section "5. Generate the APK:"
    echo "   cd android"
    echo "   .\\gradlew assembleDebug"
    echo ""
    print_section "6. Find your APK:"
    echo "   android\\app\\build\\outputs\\apk\\debug\\app-debug.apk"
    echo ""
    print_section "7. Install on Android device:"
    echo "   adb install app-debug.apk"
    echo ""
    
    print_success "🚀 Complete MHT Assessment project is now available on GitHub!"
    print_success "📱 Ready for local APK building and Android device testing"
else
    print_error "GitHub sync failed - please check the error messages above"
    exit 1
fi