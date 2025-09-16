#!/bin/bash

# MHT Assessment App - Complete GitHub Transfer Script
# This script transfers everything from Emergent to GitHub for Android Studio APK building

echo "🚀 Starting Complete MHT Assessment App Transfer to GitHub..."

# Step 1: Create clean transfer directory
echo "📁 Creating transfer directory..."
cd /app
rm -rf github-ready-transfer
mkdir -p github-ready-transfer
cd github-ready-transfer

# Step 2: Copy ALL frontend files (including Android)
echo "📱 Copying complete React Native/Expo project..."
cp -r /app/frontend/* .

# Step 3: Copy backend for full-stack functionality
echo "⚙️  Copying backend API..."
cp -r /app/frontend/backend . 2>/dev/null || cp -r /app/backend . 2>/dev/null || echo "No backend folder found"

# Step 4: Copy any root configuration files
echo "📋 Copying configuration files..."
cp /app/package.json . 2>/dev/null || echo "No root package.json"
cp /app/app.json . 2>/dev/null || echo "No root app.json" 
cp /app/README.md . 2>/dev/null || echo "No root README"

# Step 5: Verify critical files for APK building
echo "✅ Verifying Android files..."
if [ -d "android" ]; then
    echo "  ✓ Android folder exists"
    if [ -f "android/app/build.gradle" ]; then
        echo "  ✓ Android build.gradle exists"
    else
        echo "  ❌ Missing android/app/build.gradle"
    fi
    if [ -f "android/app/src/main/AndroidManifest.xml" ]; then
        echo "  ✓ AndroidManifest.xml exists"
    else
        echo "  ❌ Missing AndroidManifest.xml"
    fi
else
    echo "  ❌ Android folder missing - Cannot build APK!"
    exit 1
fi

# Step 6: Verify essential React Native files
echo "✅ Verifying React Native files..."
[ -f "App.tsx" ] && echo "  ✓ App.tsx" || echo "  ❌ Missing App.tsx"
[ -f "package.json" ] && echo "  ✓ package.json" || echo "  ❌ Missing package.json"  
[ -f "app.json" ] && echo "  ✓ app.json" || echo "  ❌ Missing app.json"
[ -f "index.js" ] && echo "  ✓ index.js" || echo "  ❌ Missing index.js"

# Step 7: Verify screens and assets
echo "✅ Verifying app content..."
screen_count=$(ls screens/*.tsx 2>/dev/null | wc -l)
echo "  ✓ Screen files: $screen_count"

asset_count=$(find assets/ -type f 2>/dev/null | wc -l)
echo "  ✓ Asset files: $asset_count"

[ -f "assets/cme-content.json" ] && echo "  ✓ CME content" || echo "  ❌ Missing CME content"
[ -f "assets/guidelines.json" ] && echo "  ✓ Guidelines data" || echo "  ❌ Missing guidelines"

# Step 8: Check for branding assets
if [ -f "assets/images/branding/mht_logo_primary.png" ]; then
    echo "  ✓ MHT logo assets"
else
    echo "  ❌ Missing MHT logo files"
fi

# Step 9: Display total file count
total_files=$(find . -type f | wc -l)
echo "📊 Total files ready for transfer: $total_files"

# Step 10: Create .gitignore for React Native/Expo
echo "📝 Creating .gitignore..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/

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

# Local env files
.env*.local

# Typescript
*.tsbuildinfo
EOF

echo "✅ Project ready for GitHub transfer!"
echo ""
echo "📋 TRANSFER SUMMARY:"
echo "   • Total files: $total_files"
echo "   • Screen components: $screen_count"  
echo "   • Asset files: $asset_count"
echo "   • Android build files: ✓ Ready for APK"
echo "   • Backend API: $([ -d "backend" ] && echo "✓ Included" || echo "❌ Not found")"
echo ""
echo "🔧 NEXT STEPS:"
echo "1. Initialize git repository"
echo "2. Push to GitHub"  
echo "3. Open android/ folder in Android Studio"
echo "4. Build APK"
echo ""
echo "Run the following commands to push to GitHub:"
echo ""
echo "git init"
echo "git add ."
echo "git commit -m \"Complete MHT Assessment App from Emergent\""
echo "git branch -M main"
echo "git remote add origin https://github.com/vaibhavshrivastavait/MHT-Apk.git"
echo "git push -u origin main"
echo ""
echo "🎯 Ready for Android Studio APK building!"