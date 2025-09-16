#!/bin/bash

# GitHub Sync Script for MHT Assessment
echo "🚀 MHT Assessment - GitHub Sync Script"
echo "======================================"

# Add all changes
echo "📁 Adding all project files..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "MHT Assessment v1.0 - Complete with enhanced drug interaction checker (150 combinations), professional disclaimers, and version 1 release"

# Push to GitHub (requires authentication)
echo "🌐 Pushing to GitHub..."
echo "⚠️  You'll need to authenticate with GitHub"
echo "Repository: https://github.com/vaibhavshrivastavait/MHT-FINAL.git"

# Show current status
git status
git log --oneline -5

echo ""
echo "📋 Next Steps:"
echo "1. Run: git push origin main"
echo "2. Enter your GitHub credentials when prompted"
echo "3. Or use GitHub token authentication"
echo ""
echo "🔐 Token Authentication (Alternative):"
echo "git remote set-url origin https://USERNAME:TOKEN@github.com/vaibhavshrivastavait/MHT-FINAL.git"
echo "git push origin main"