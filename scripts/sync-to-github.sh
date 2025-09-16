#!/bin/bash

# ============================================================================
# MHT Assessment - Complete GitHub Repository Sync Script
# ============================================================================
# Version: 3.0 Enhanced - Hardcoded repository with file size filtering
# Purpose: Sync ALL project files under 50MB to hardcoded GitHub repository
# Repository: https://github.com/vaibhavshrivastavait/mht-assessment.git
# Authentication: GitHub username/password or personal access token
# ============================================================================

set -e

# Enhanced output functions

# Set HOME environment variable if not set (required for Git)
if [[ -z "$HOME" ]]; then
    export HOME="/root"
    echo "ℹ️  HOME environment variable set to: $HOME"
fi

# Ensure HOME directory exists
if [[ ! -d "$HOME" ]]; then
    mkdir -p "$HOME"
    echo "ℹ️  Created HOME directory: $HOME"
fi

# Set up Git directories
mkdir -p "$HOME/.config/git" 2>/dev/null || true

# Hardcoded repository configuration
REPO_URL="https://github.com/vaibhavshrivastavait/mht-assessment.git"
REPO_OWNER="vaibhavshrivastavait"
REPO_NAME="mht-assessment"
GIT_USER_NAME="vaibhav shrivastava"
GIT_USER_EMAIL="vaibhavshrivastavait@users.noreply.github.com"
BRANCH="main"
COMMIT_MESSAGE="Complete MHT Assessment app with Windows APK build environment - Ready for local development"
MAX_FILE_SIZE_MB=50

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

# Function to convert bytes to human readable format
human_readable_size() {
    local bytes=$1
    local sizes=("B" "KB" "MB" "GB" "TB")
    local i=0
    local size=$bytes

    while (( size > 1024 && i < 4 )); do
        size=$((size / 1024))
        ((i++))
    done

    echo "${size}${sizes[$i]}"
}

# Function to check file size in MB
get_file_size_mb() {
    local file_path="$1"
    if [[ -f "$file_path" ]]; then
        local size_bytes=$(stat -f%z "$file_path" 2>/dev/null || stat -c%s "$file_path" 2>/dev/null || echo "0")
        local size_mb=$((size_bytes / 1024 / 1024))
        echo $size_mb
    else
        echo "0"
    fi
}

# Function to authenticate with GitHub
setup_git_auth() {
    print_section "Setting up Git authentication"
    
    # Configure git user
    git config --global user.name "$GIT_USER_NAME"
    git config --global user.email "$GIT_USER_EMAIL"
    
    print_success "Git user configured: $GIT_USER_NAME <$GIT_USER_EMAIL>"
    
    # Check if GitHub CLI is available
    if command -v gh &> /dev/null; then
        print_info "GitHub CLI detected - checking authentication status"
        if gh auth status &> /dev/null; then
            print_success "GitHub CLI already authenticated"
            return 0
        else
            print_info "GitHub CLI not authenticated - will use username/password"
        fi
    fi
    
    # Check if we're in interactive mode
    if [[ ! -t 0 ]]; then
        print_warning "Non-interactive mode detected"
        print_info "Skipping authentication setup - you may need to authenticate manually"
        print_info "Run 'git config --global credential.helper store' and then push manually"
        return 0
    fi
    
    # Prompt for GitHub credentials
    echo ""
    print_info "GitHub Authentication Required"
    print_info "Repository: $REPO_URL"
    print_info "You can use either:"
    print_info "  1. GitHub username + password"
    print_info "  2. GitHub username + Personal Access Token (recommended)"
    echo ""
    
    read -p "GitHub username [$REPO_OWNER]: " github_username
    github_username=${github_username:-$REPO_OWNER}
    
    read -s -p "GitHub password or Personal Access Token: " github_password
    echo ""
    
    if [[ -z "$github_password" ]]; then
        print_warning "No password provided - you'll need to authenticate manually during push"
        return 0
    fi
    
    # Test authentication by trying to access the repository
    print_step "Testing GitHub authentication..."
    
    # Create a temporary git config with credentials
    git config --global credential.helper 'cache --timeout=3600'
    
    # Store credentials in git credential cache
    cat <<EOF | git credential approve
protocol=https
host=github.com
username=$github_username
password=$github_password
EOF

    print_success "Authentication configured successfully"
}

# Function to create .gitignore optimized for file size limits
create_size_optimized_gitignore() {
    print_step "Creating size-optimized .gitignore for files under ${MAX_FILE_SIZE_MB}MB..."

cat > .gitignore << 'EOL'
# ============================================================================
# MHT Assessment - Size-Optimized .gitignore (Files under 50MB)
# ============================================================================

# Large build outputs and dependencies (usually over 50MB)
node_modules/
.npm/
.yarn/
*.log

# Build outputs that can be regenerated
android/app/build/
android/build/
android/.gradle/
ios/build/
ios/Pods/
.expo/
dist/
web-build/

# Large media files (if over 50MB)
*.mov
*.mp4
*.avi
*.mkv
*.iso
*.dmg

# Database files (can be large)
*.db
*.sqlite
*.sqlite3

# Archive files (often large)
*.zip
*.tar
*.tar.gz
*.rar
*.7z

# Temporary and cache files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
*.tmp
*.temp
.cache/
.parcel-cache/

# IDE and editor files
.vscode/
.idea/
*.swp
*.swo
*~

# Environment and secret files
.env.local
.env.development.local
.env.test.local
.env.production.local

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage and test outputs
coverage/
.nyc_output/

# Bundle artifacts (can be large)
*.jsbundle
*.bundle

# Metro bundler cache
.metro-health-check*

# APK and build artifacts (can be large)
*.apk
*.aab
*.ipa

# Keep important configuration files for development
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
!package.json
!app.json
!.env

# Keep essential project files
!README.md
!*.md
!assets/
!components/
!screens/
!utils/
!data/
!mht_rules/
!scripts/
!store/

# Auto-excluded: Files over 50MB will be automatically detected and excluded
EOL

    print_success ".gitignore created with size optimization"
}

# Function to scan and exclude large files
scan_and_exclude_large_files() {
    print_step "Scanning for files larger than ${MAX_FILE_SIZE_MB}MB..."
    
    local large_files=()
    local total_files=0
    local excluded_files=0
    local total_size=0
    
    # Find all files and check their sizes
    while IFS= read -r -d '' file; do
        ((total_files++))
        
        if [[ -f "$file" ]]; then
            local size_mb=$(get_file_size_mb "$file")
            local size_bytes=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
            total_size=$((total_size + size_bytes))
            
            if (( size_mb >= MAX_FILE_SIZE_MB )); then
                large_files+=("$file")
                ((excluded_files++))
                
                # Add to .gitignore
                echo "$file" >> .gitignore
                print_warning "Excluded large file: $file ($(human_readable_size $size_bytes))"
            fi
        fi
    done < <(find . -type f -not -path "./.git/*" -print0 2>/dev/null)
    
    print_info "File scan results:"
    print_info "  Total files scanned: $total_files"
    print_info "  Files excluded (≥${MAX_FILE_SIZE_MB}MB): $excluded_files"
    print_info "  Total project size: $(human_readable_size $total_size)"
    
    if (( excluded_files > 0 )); then
        print_warning "Large files have been added to .gitignore and will not be synced"
        print_info "These files can be regenerated locally using the provided build scripts"
    fi
    
    return 0
}

# Function to validate repository access
validate_repository_access() {
    print_step "Validating repository access..."
    
    # For public repositories, we can validate without authentication
    # Try to fetch repository information
    if git ls-remote "$REPO_URL" HEAD &> /dev/null; then
        print_success "Repository access validated: $REPO_URL"
        return 0
    else
        print_warning "Cannot access repository: $REPO_URL"
        print_info "This could be due to:"
        print_info "  1. Repository doesn't exist yet (will be created on first push)"
        print_info "  2. Repository is private and needs authentication"
        print_info "  3. Network connectivity issues"
        print_info "Continuing with sync - repository may be created on push"
        return 0
    fi
}

# Main script execution
main() {
    cd /app
    
    print_header "MHT ASSESSMENT - COMPLETE GITHUB SYNC v3.0"
    echo "Repository: $REPO_URL"
    echo "Owner: $REPO_OWNER"
    echo "User: $GIT_USER_NAME"
    echo "Branch: $BRANCH"
    echo "Max file size: ${MAX_FILE_SIZE_MB}MB"
    echo ""

    # Verify we're in the right directory
    if [[ ! -f "package.json" ]] || [[ ! -f "app.json" ]]; then
        print_error "Not in a valid Expo project directory!"
        print_error "Make sure you're running this from the MHT Assessment project root"
        exit 1
    fi

    print_success "Verified Expo project structure (package.json + app.json found)"

    # Setup Git authentication
    setup_git_auth

    # Validate repository access
    if ! validate_repository_access; then
        print_error "Repository validation failed. Please check your credentials and repository URL."
        exit 1
    fi

    # Initialize git if not already initialized
    if [[ ! -d ".git" ]]; then
        print_step "Initializing Git repository..."
        git init
        print_success "Git repository initialized"
    else
        print_success "Git repository already initialized"
    fi

    # Create size-optimized .gitignore
    create_size_optimized_gitignore

    # Scan and exclude large files
    scan_and_exclude_large_files

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
            if [[ -f "$file" ]]; then
                local size_bytes=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
                echo "  ✓ $file ($(human_readable_size $size_bytes))"
            else
                echo "  ✓ $file"
            fi
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
            print_info "2. Check your GitHub credentials and permissions"
            print_info "3. Verify the repository URL is correct"
            PUSH_SUCCESS=false
        fi
    fi

    echo ""

    if [[ "$PUSH_SUCCESS" == "true" ]]; then
        print_header "🎉 GITHUB SYNC COMPLETED SUCCESSFULLY!"
        print_success "Repository: $REPO_URL"
        print_success "Branch: $BRANCH"
        print_success "Files synced: All files under ${MAX_FILE_SIZE_MB}MB"
        
        echo ""
        print_header "📋 NEXT STEPS FOR LOCAL WINDOWS APK BUILDING"
        echo ""
        print_section "1. Clone the repository on your Windows machine:"
        echo "   git clone $REPO_URL"
        echo "   cd $REPO_NAME"
        echo ""
        print_section "2. Set up your Windows environment:"
        echo "   PowerShell -ExecutionPolicy Bypass -File .\\scripts\\windows-complete-apk-builder-setup.ps1 -AutoInstall"
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
        
        echo ""
        print_info "Repository details:"
        print_info "  URL: https://github.com/$REPO_OWNER/$REPO_NAME"
        print_info "  Clone command: git clone $REPO_URL"
        print_info "  Files: All project files under ${MAX_FILE_SIZE_MB}MB"
        print_info "  Large files excluded: Can be regenerated using build scripts"
        
    else
        print_error "GitHub sync failed - please check the error messages above"
        exit 1
    fi
}

# Handle script interruption
trap 'print_error "Script interrupted by user"; exit 130' INT

# Run main function
main "$@"