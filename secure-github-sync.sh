#!/bin/bash

# 🔒 SECURE GitHub Sync Script - MHT Assessment
# Uses environment variables instead of hardcoded credentials

set -e

# Fix HOME environment variable issue
export HOME=${HOME:-/root}
export USER=${USER:-root}
mkdir -p "$HOME"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# SECURE: Use these environment variables instead of hardcoding
# Set these before running the script:
# export GITHUB_USERNAME="vaibhavshrivastavait"
# export GITHUB_EMAIL="vaibhavshrivastavait@gmail.com"  
# export GITHUB_TOKEN="your_new_secure_token_here"
# export GITHUB_REPO="mht-assessment-android-app"
# export GITHUB_FULLNAME="vaibhav shrivastava"
# export SKIP_REPO_CREATION="true"  # Optional: Skip repository creation if it already exists
#
# Alternative: Use command line flag: ./secure-github-sync.sh --skip-repo

PROJECT_DIR="/app"
DEFAULT_BRANCH="main"

echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                🔒 SECURE GITHUB SYNC 🔒                    ║"
echo "║                  MHT Assessment Project                     ║"
echo "║                                                              ║"
echo "║  Uses environment variables for security                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if environment variables are set
check_environment() {
    print_status "Checking environment variables..."
    
    local missing_vars=()
    
    if [[ -z "$GITHUB_USERNAME" ]]; then missing_vars+=("GITHUB_USERNAME"); fi
    if [[ -z "$GITHUB_EMAIL" ]]; then missing_vars+=("GITHUB_EMAIL"); fi
    if [[ -z "$GITHUB_TOKEN" ]]; then missing_vars+=("GITHUB_TOKEN"); fi
    if [[ -z "$GITHUB_REPO" ]]; then missing_vars+=("GITHUB_REPO"); fi
    if [[ -z "$GITHUB_FULLNAME" ]]; then missing_vars+=("GITHUB_FULLNAME"); fi
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            print_error "  - $var"
        done
        echo ""
        print_error "Please set them like this:"
        echo 'export GITHUB_USERNAME="vaibhavshrivastavait"'
        echo 'export GITHUB_EMAIL="vaibhavshrivastavait@gmail.com"'
        echo 'export GITHUB_TOKEN="your_new_secure_token"'
        echo 'export GITHUB_REPO="mht-assessment-android-app"'
        echo 'export GITHUB_FULLNAME="vaibhav shrivastava"'
        echo ""
        echo "Then run: $0"
        exit 1
    fi
    
    print_success "All environment variables are set"
    print_status "Username: $GITHUB_USERNAME"
    print_status "Email: $GITHUB_EMAIL"
    print_status "Repository: $GITHUB_REPO"
    print_status "Full Name: $GITHUB_FULLNAME"
    print_status "Token: ${GITHUB_TOKEN:0:8}... (hidden for security)"
}

# Setup Git with environment variables
setup_git_config() {
    print_status "Setting up Git configuration..."
    
    git config --global user.name "$GITHUB_FULLNAME" 2>/dev/null || git config user.name "$GITHUB_FULLNAME"
    git config --global user.email "$GITHUB_EMAIL" 2>/dev/null || git config user.email "$GITHUB_EMAIL"
    
    # Configure for large files
    git config --global http.postBuffer 524288000 2>/dev/null || git config http.postBuffer 524288000
    git config --global init.defaultBranch main 2>/dev/null || git config init.defaultBranch main
    
    print_success "Git configuration complete"
}

# Test GitHub authentication and repository
test_github_auth() {
    print_status "Testing GitHub authentication..."
    
    # Test API access with the token
    local auth_test=$(curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user)
    
    if echo "$auth_test" | grep -q "login"; then
        local username=$(echo "$auth_test" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('login', ''))" 2>/dev/null || echo "$auth_test" | sed -n 's/.*"login": *"\([^"]*\)".*/\1/p')
        print_success "Authentication successful for user: $username"
        
        # Verify the username matches
        if [[ "$username" != "$GITHUB_USERNAME" ]]; then
            print_warning "Token belongs to '$username' but you specified '$GITHUB_USERNAME'"
            print_status "Using token owner: $username"
            GITHUB_USERNAME="$username"
        fi
    else
        print_error "GitHub authentication failed!"
        print_error "Response: $auth_test"
        echo ""
        print_error "Common issues:"
        print_error "1. Token is invalid or expired"
        print_error "2. Token doesn't have 'repo' scope"
        print_error "3. Token format is incorrect"
        echo ""
        print_error "Please:"
        print_error "1. Go to: https://github.com/settings/tokens"
        print_error "2. Generate a new token with 'repo' scope"
        print_error "3. Set: export GITHUB_TOKEN='your_new_token'"
        exit 1
    fi
    
    # Debug environment variable and check if user wants to skip repository creation
    print_status "SKIP_REPO_CREATION environment variable is: '$SKIP_REPO_CREATION'"
    
    # Check command line argument first, then environment variable
    if [[ "$1" == "--skip-repo" ]] || [[ "$SKIP_REPO_CREATION" == "true" ]]; then
        print_success "🚀 Skipping repository creation as requested"
        print_status "📁 Assuming repository exists: $GITHUB_USERNAME/$GITHUB_REPO"
        print_status "⏭️  Proceeding directly to Git setup and sync..."
        return
    fi
    
    # Test repository access
    print_status "Checking repository status..."
    local repo_test=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "https://api.github.com/repos/$GITHUB_USERNAME/$GITHUB_REPO")
    
    if echo "$repo_test" | grep -q '"full_name"'; then
        print_success "Repository access confirmed: $GITHUB_USERNAME/$GITHUB_REPO"
    elif echo "$repo_test" | grep -q '"message": "Not Found"'; then
        print_warning "Repository not found, attempting to create..."
        
        # Try to create the repository
        local create_repo=$(curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" \
            -H "Content-Type: application/json" \
            https://api.github.com/user/repos \
            -d "{\"name\":\"$GITHUB_REPO\",\"description\":\"MHT Assessment - Menopause Hormone Therapy Decision Support\",\"private\":false}")
        
        if echo "$create_repo" | grep -q '"full_name"'; then
            print_success "Repository created: $GITHUB_USERNAME/$GITHUB_REPO"
        elif echo "$create_repo" | grep -q "name already exists"; then
            print_success "Repository already exists: $GITHUB_USERNAME/$GITHUB_REPO"
            print_status "Proceeding with existing repository..."
        else
            print_error "Failed to create repository"
            print_error "Response: $create_repo"
            exit 1
        fi
    else
        # For any other response, assume repository exists and proceed
        print_success "Repository exists: $GITHUB_USERNAME/$GITHUB_REPO"
        print_status "Proceeding with existing repository..."
    fi
}

# Setup repository
setup_repository() {
    print_status "Setting up repository..."
    
    cd "$PROJECT_DIR"
    
    # Create repository URL with token
    REPO_URL="https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${GITHUB_REPO}.git"
    
    if [[ ! -d ".git" ]]; then
        print_status "Initializing new Git repository..."
        git init
        git branch -M "$DEFAULT_BRANCH"
    fi
    
    # Add or update remote
    if git remote get-url origin &>/dev/null; then
        git remote set-url origin "$REPO_URL"
    else
        git remote add origin "$REPO_URL"
    fi
    
    print_success "Repository setup complete"
}

# Commit and push
commit_and_push() {
    print_status "Committing and pushing to GitHub..."
    
    cd "$PROJECT_DIR"
    
    # Add all files
    git add .
    
    # Check for changes
    if git diff --staged --quiet; then
        print_warning "No changes to commit"
        return
    fi
    
    # Create commit
    COMMIT_MESSAGE="🚀 Complete MHT Assessment Project Sync

📱 Features:
- Comprehensive Windows setup system with prerequisite checker
- Deterministic Treatment Plan Engine with 25+ clinical rules  
- Enhanced Risk Calculators (ASCVD, FRAX, Gail, Wells, Framingham)
- Decision Support Detail Screen with simulate mode
- Complete drug interaction checking system
- Android APK build scripts and documentation

🛠️ Implementation:
- React Native/Expo SDK 50 with TypeScript
- Medical algorithms with validated formulas
- Offline-first architecture with local persistence
- Cross-platform compatibility (Android/iOS ready)
- Professional UI/UX with accessibility support

Synced securely from emergent.sh - $(date)"
    
    git commit -m "$COMMIT_MESSAGE"
    
    # Push to GitHub
    print_status "Pushing to GitHub..."
    git push -u origin "$DEFAULT_BRANCH" --progress
    
    print_success "Successfully pushed to GitHub!"
}

# Main function
main() {
    check_environment
    
    print_status "Checking prerequisites..."
    if [[ ! -f "$PROJECT_DIR/package.json" ]]; then
        print_error "Not in MHT Assessment project directory!"
        exit 1
    fi
    print_success "Project directory confirmed"
    
    test_github_auth "$1"
    setup_git_config
    setup_repository
    commit_and_push
    
    echo ""
    print_success "🎉 MHT Assessment project securely synced to GitHub!"
    echo ""
    echo -e "${GREEN}Repository URL: https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}${NC}"
    echo ""
}

main "$@"