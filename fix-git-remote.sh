#!/bin/bash

# Fix Git remote URL with correct username
echo "🔧 Fixing Git remote URL"
echo "========================"

# Set the credentials
export GITHUB_USERNAME="vaibhavshrivastavait"
export GITHUB_TOKEN="YOUR_GITHUB_TOKEN_HERE"
export GITHUB_REPO="mht-assessment-android-app"

echo "Current remote URL:"
git remote -v

echo ""
echo "Setting correct remote URL..."

# Create the correct URL
REPO_URL="https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${GITHUB_REPO}.git"

# Update the remote
git remote set-url origin "$REPO_URL"

echo "Updated remote URL:"
git remote -v

echo ""
echo "✅ Git remote URL fixed!"
echo "Now the sync should work correctly."