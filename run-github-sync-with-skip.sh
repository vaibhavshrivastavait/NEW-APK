#!/bin/bash

# 🚀 GitHub Sync Script - Skip Repository Creation
# Use this script to sync with existing repositories

echo "🔒 Setting up GitHub Sync with SKIP_REPO_CREATION"
echo "================================================="

# IMPORTANT: Replace these with your actual values
export GITHUB_USERNAME="your_username_here"
export GITHUB_EMAIL="your_email@example.com"
export GITHUB_TOKEN="your_secure_token_here"
export GITHUB_REPO="your_existing_repo_name"
export GITHUB_FULLNAME="Your Full Name"

# THIS IS THE KEY: Skip repository creation entirely
export SKIP_REPO_CREATION="true"

echo "Environment variables set:"
echo "- GITHUB_USERNAME: $GITHUB_USERNAME"
echo "- GITHUB_EMAIL: $GITHUB_EMAIL"
echo "- GITHUB_REPO: $GITHUB_REPO"
echo "- SKIP_REPO_CREATION: $SKIP_REPO_CREATION"
echo ""

echo "🚀 Running secure GitHub sync..."
./secure-github-sync.sh