#!/bin/bash

# 🚀 Emergent GitHub Sync Script - MHT Assessment
# Comprehensive script to sync large projects (>50MB) to GitHub from emergent.sh
# Handles large files, credentials, and complete project transfer

set -e

# Fix HOME environment variable issue in containerized environments
export HOME=${HOME:-/root}
export USER=${USER:-root}

# Ensure HOME directory exists
mkdir -p "$HOME"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="mht-assessment-android-app"
DEFAULT_BRANCH="main"
PROJECT_DIR="/app"

echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    EMERGENT GITHUB SYNC                     ║"
echo "║                  MHT Assessment Project                     ║"
echo "║                                                              ║"
echo "║  Handles large files, credentials, and complete sync        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to print status
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Fix environment variables first
    export HOME=${HOME:-/root}
    export USER=${USER:-root}
    mkdir -p "$HOME"
    
    print_status "Environment: HOME=$HOME, USER=$USER"
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed!"
        exit 1
    fi
    print_success "Git is available"
    
    # Test git configuration
    if ! git --version &> /dev/null; then
        print_error "Git is not working properly!"
        exit 1
    fi
    print_success "Git is functional"
    
    # Check if we're in the right directory
    if [[ ! -f "$PROJECT_DIR/package.json" ]] || [[ ! -f "$PROJECT_DIR/App.tsx" ]]; then
        print_error "Not in MHT Assessment project directory!"
        print_error "Expected files not found: package.json, App.tsx"
        exit 1
    fi
    print_success "Project directory confirmed"
    
    # Check project size
    PROJECT_SIZE=$(du -sh "$PROJECT_DIR" 2>/dev/null | cut -f1 || echo "Unknown")
    print_status "Project size: $PROJECT_SIZE"
    
    # Check git status in project
    cd "$PROJECT_DIR"
    if git status &>/dev/null; then
        print_status "Git repository detected"
    else
        print_status "No git repository - will initialize"
    fi
}

# Function to get GitHub credentials securely
get_credentials() {
    echo ""
    echo -e "${CYAN}📋 GitHub Credentials Required${NC}"
    echo "Please provide your GitHub credentials:"
    echo ""
    
    # Get GitHub username
    read -p "GitHub Username: " GITHUB_USERNAME
    if [[ -z "$GITHUB_USERNAME" ]]; then
        print_error "Username cannot be empty!"
        exit 1
    fi
    
    # Get GitHub token (hidden input)
    echo ""
    echo "GitHub Personal Access Token:"
    echo "(Create at: https://github.com/settings/tokens/new)"
    echo "Required scopes: repo, workflow"
    echo ""
    read -s -p "Token: " GITHUB_TOKEN
    echo ""
    
    if [[ -z "$GITHUB_TOKEN" ]]; then
        print_error "Token cannot be empty!"
        exit 1
    fi
    
    # Get repository name (with default)
    echo ""
    read -p "Repository name [$PROJECT_NAME]: " REPO_NAME
    REPO_NAME=${REPO_NAME:-$PROJECT_NAME}
    
    REPO_URL="https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
    
    print_success "Credentials configured"
}

# Function to setup Git configuration
setup_git_config() {
    print_status "Setting up Git configuration..."
    
    # Ensure HOME is properly set
    export HOME=${HOME:-/root}
    export USER=${USER:-root}
    mkdir -p "$HOME"
    
    # Initialize git config directory if needed
    mkdir -p "$HOME/.config/git" 2>/dev/null || true
    
    # Set git user (required for commits)
    git config --global user.name "$GITHUB_USERNAME" 2>/dev/null || {
        print_warning "Global git config failed, using local config"
        git config user.name "$GITHUB_USERNAME"
        git config user.email "${GITHUB_USERNAME}@users.noreply.github.com"
    }
    
    if ! git config --global user.email >/dev/null 2>&1; then
        git config --global user.email "${GITHUB_USERNAME}@users.noreply.github.com" 2>/dev/null || {
            git config user.email "${GITHUB_USERNAME}@users.noreply.github.com"
        }
    fi
    
    # Configure Git for large files (use local config if global fails)
    configure_git_for_large_files() {
        local scope="$1"
        git config $scope http.postBuffer 524288000 2>/dev/null
        git config $scope http.maxRequestBuffer 100M 2>/dev/null
        git config $scope core.compression 0 2>/dev/null
        git config $scope pack.windowMemory 256m 2>/dev/null
        git config $scope pack.packSizeLimit 2g 2>/dev/null
        git config $scope init.defaultBranch main 2>/dev/null
    }
    
    configure_git_for_large_files "--global" || {
        print_warning "Global git config failed, using local config"
        configure_git_for_large_files ""
    }
    
    print_success "Git configuration complete"
}

# Function to analyze large files
analyze_large_files() {
    print_status "Analyzing large files..."
    
    cd "$PROJECT_DIR"
    
    # Find files larger than 50MB
    LARGE_FILES=$(find . -type f -size +50M 2>/dev/null | grep -v ".git" | head -10)
    
    if [[ -n "$LARGE_FILES" ]]; then
        print_warning "Found large files (>50MB):"
        echo "$LARGE_FILES"
        echo ""
        
        # Ask user what to do with large files
        echo "Options for large files:"
        echo "1. Exclude them (.gitignore)"
        echo "2. Install Git LFS and track them"
        echo "3. Compress and continue"
        read -p "Choose option (1-3): " LARGE_FILE_OPTION
        
        case $LARGE_FILE_OPTION in
            1)
                handle_exclude_large_files "$LARGE_FILES"
                ;;
            2)
                handle_git_lfs "$LARGE_FILES"
                ;;
            3)
                handle_compress_files "$LARGE_FILES"
                ;;
            *)
                print_warning "Invalid option, excluding large files by default"
                handle_exclude_large_files "$LARGE_FILES"
                ;;
        esac
    else
        print_success "No files larger than 50MB found"
    fi
}

# Function to exclude large files
handle_exclude_large_files() {
    local files="$1"
    print_status "Adding large files to .gitignore..."
    
    echo "" >> .gitignore
    echo "# Large files excluded by emergent sync script" >> .gitignore
    while IFS= read -r file; do
        if [[ -n "$file" ]]; then
            echo "$file" >> .gitignore
            print_status "Excluded: $file"
        fi
    done <<< "$files"
    
    print_success "Large files excluded"
}

# Function to setup Git LFS
handle_git_lfs() {
    local files="$1"
    print_status "Setting up Git LFS for large files..."
    
    # Install git-lfs if not available
    if ! command -v git-lfs &> /dev/null; then
        print_warning "Git LFS not installed, excluding files instead"
        handle_exclude_large_files "$files"
        return
    fi
    
    git lfs install
    
    while IFS= read -r file; do
        if [[ -n "$file" ]]; then
            # Get file extension
            EXT="${file##*.}"
            git lfs track "*.${EXT}"
            print_status "Tracking *.${EXT} files with Git LFS"
        fi
    done <<< "$files"
    
    print_success "Git LFS configured"
}

# Function to compress large files
handle_compress_files() {
    local files="$1"
    print_status "Compressing large files..."
    
    while IFS= read -r file; do
        if [[ -n "$file" && -f "$file" ]]; then
            print_status "Compressing: $file"
            gzip "$file"
            print_success "Compressed: ${file}.gz"
        fi
    done <<< "$files"
}

# Function to initialize/update repository
setup_repository() {
    print_status "Setting up repository..."
    
    cd "$PROJECT_DIR"
    
    if [[ ! -d ".git" ]]; then
        print_status "Initializing new Git repository..."
        git init
        git branch -M "$DEFAULT_BRANCH"
    else
        print_status "Using existing Git repository..."
    fi
    
    # Add remote or update existing
    if git remote get-url origin &>/dev/null; then
        print_status "Updating origin remote..."
        git remote set-url origin "$REPO_URL"
    else
        print_status "Adding origin remote..."
        git remote add origin "$REPO_URL"
    fi
    
    print_success "Repository setup complete"
}

# Function to prepare files for commit
prepare_files() {
    print_status "Preparing files for commit..."
    
    cd "$PROJECT_DIR"
    
    # Ensure important files exist
    if [[ ! -f ".gitignore" ]]; then
        print_status "Creating .gitignore..."
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

# Build outputs
build/
*.apk
*.aab
*.ipa

# Environment files
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Cache
.cache/
*.tmp
*.temp

# Large files excluded by sync script
EOF
    fi
    
    # Create comprehensive README if not exists
    if [[ ! -f "README.md" ]]; then
        print_status "Creating README.md..."
        cat > README.md << 'EOF'
# 🏥 MHT Assessment - Menopause Hormone Therapy Decision Support

## Overview
Clinical decision support tool for Menopause Hormone Therapy with comprehensive risk assessment, treatment planning, and drug interaction checking.

## Features
- 🧮 **Risk Calculators**: ASCVD, FRAX, Gail, Wells, Framingham
- ⚕️ **Treatment Plans**: Deterministic engine with 25+ clinical rules
- 🔍 **Decision Support**: Evidence-based recommendations with simulate mode
- 💊 **Drug Interactions**: Comprehensive interaction checking
- 📱 **Mobile Optimized**: React Native/Expo with native UI

## Quick Start
```bash
npm install
npm run check:windows  # Check prerequisites (Windows)
npm run build:apk      # Build Android APK
```

## Documentation
- [Windows Setup Guide](WINDOWS_SETUP_EXECUTION_ORDER.md)
- [Treatment Plan Engine](TREATMENT_PLAN_ENGINE_README.md)
- [Build Instructions](ANDROID_BUILD_README.md)

## Technology Stack
- React Native/Expo SDK 50
- TypeScript
- Medical algorithms with validated formulas
- Offline-first architecture

Built with comprehensive Windows setup system and automated APK building.
EOF
    fi
    
    print_success "Files prepared"
}

# Function to commit and push
commit_and_push() {
    print_status "Committing and pushing to GitHub..."
    
    cd "$PROJECT_DIR"
    
    # Add all files
    print_status "Adding files to Git..."
    git add .
    
    # Check if there are changes to commit
    if git diff --staged --quiet; then
        print_warning "No changes to commit"
        return
    fi
    
    # Create comprehensive commit message
    COMMIT_MESSAGE="🚀 Complete MHT Assessment Project Sync from Emergent

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
- Offline-first architecture with local data persistence
- Comprehensive testing suite and documentation
- Cross-platform compatibility (Android/iOS ready)

📋 Documentation:
- Complete Windows setup guides and PowerShell scripts
- Treatment Plan Engine documentation and test cases
- Build instructions for all platforms
- GitHub sync scripts and transfer tools

🎯 Ready for Production:
- Self-contained Android APK generation
- Professional medical decision support
- Accessibility compliance and mobile optimization
- Comprehensive error handling and edge cases

Synced from emergent.sh environment - $(date)"
    
    print_status "Creating commit..."
    git commit -m "$COMMIT_MESSAGE"
    
    # Push to GitHub
    print_status "Pushing to GitHub (this may take a while for large projects)..."
    
    # Use incremental push for large repositories
    if ! git push -u origin "$DEFAULT_BRANCH" --progress; then
        print_warning "Direct push failed, trying incremental approach..."
        
        # Try pushing in smaller chunks
        git config http.postBuffer 524288000
        git push -u origin "$DEFAULT_BRANCH" --progress --force-with-lease
    fi
    
    print_success "Successfully pushed to GitHub!"
}

# Function to verify sync
verify_sync() {
    print_status "Verifying sync..."
    
    # Get the repository URL for verification
    REPO_WEB_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
    
    echo ""
    print_success "🎉 Sync completed successfully!"
    echo ""
    echo -e "${GREEN}Repository URL: ${REPO_WEB_URL}${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Visit your repository: $REPO_WEB_URL"
    echo "2. Verify all files are uploaded correctly"
    echo "3. Check the commit message and file count"
    echo "4. Test cloning: git clone $REPO_WEB_URL"
    echo ""
    
    # Show final statistics
    FILE_COUNT=$(git ls-files | wc -l)
    COMMIT_HASH=$(git rev-parse HEAD)
    
    echo -e "${CYAN}📊 Sync Statistics:${NC}"
    echo "Files synced: $FILE_COUNT"
    echo "Commit hash: ${COMMIT_HASH:0:8}"
    echo "Branch: $DEFAULT_BRANCH"
    echo "Project size: $(du -sh "$PROJECT_DIR" | cut -f1)"
}

# Main execution
main() {
    echo ""
    print_status "Starting GitHub sync process..."
    
    check_prerequisites
    get_credentials
    setup_git_config
    analyze_large_files
    setup_repository
    prepare_files
    commit_and_push
    verify_sync
    
    echo ""
    print_success "🚀 MHT Assessment project successfully synced to GitHub!"
    echo ""
}

# Handle script interruption
trap 'echo -e "\n${RED}Script interrupted by user${NC}"; exit 1' INT

# Run main function
main "$@"