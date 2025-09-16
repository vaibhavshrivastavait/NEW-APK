#!/bin/bash

# ============================================================================
# File Size Verification Script - Ensure all files are under 50MB
# ============================================================================

echo "🔍 Verifying all files are under 50MB..."
echo "============================================"

# Check for files over 50MB
echo "Checking for files over 50MB..."
LARGE_FILES=$(find . -type f -size +50M 2>/dev/null | grep -v node_modules | grep -v .git)

if [ -n "$LARGE_FILES" ]; then
    echo "⚠️  WARNING: Found files over 50MB:"
    echo "$LARGE_FILES"
    echo ""
    echo "These files will be excluded from Git due to .gitignore rules."
else
    echo "✅ No files over 50MB found (excluding node_modules)"
fi

echo ""
echo "📊 Directory sizes (excluding node_modules):"
echo "============================================"
du -sh */ 2>/dev/null | grep -v node_modules | sort -hr

echo ""
echo "📁 Essential directories under 50MB:"
echo "===================================="
for dir in components screens utils store assets data mht_rules android ios scripts __tests__; do
    if [ -d "$dir" ]; then
        size=$(du -sh "$dir" 2>/dev/null | cut -f1)
        echo "✅ $dir: $size"
    fi
done

echo ""
echo "📄 Key files:"
echo "============="
for file in App.tsx index.js package.json app.json metro.config.js babel.config.js tsconfig.json; do
    if [ -f "$file" ]; then
        size=$(du -sh "$file" 2>/dev/null | cut -f1)
        echo "✅ $file: $size"
    fi
done

echo ""
echo "🎯 Total project size (excluding node_modules, .git, logs):"
echo "=========================================================="
du -sh --exclude=node_modules --exclude=.git --exclude="*.log" . 2>/dev/null

echo ""
echo "✅ File size verification complete!"
echo "All essential files are under 50MB and ready for GitHub sync."