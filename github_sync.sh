#!/bin/bash

# =============================================================================
# Quick GitHub Sync Script for MHT Assessment App
# =============================================================================

echo "🚀 MHT Assessment - Quick GitHub Sync"
echo "======================================"
echo ""
echo "This will transfer your complete MHT Assessment project"
echo "with all Android build fixes to GitHub repository:"
echo "📁 Repository: mht-assessment-android-app"
echo ""

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    echo "❌ Error: Run this script from the MHT project root directory"
    exit 1
fi

# Run the main transfer script
exec ./transfer_to_github.sh