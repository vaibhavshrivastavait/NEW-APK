#!/bin/bash

# =========================================================
# Fix APK Build Issues - Multiple Solutions
# For createBundleDebugJsAndAssets errors
# =========================================================

echo "🔧 APK Build Error Fix - Multiple Solutions"
echo "============================================="

echo "This script provides multiple solutions for the APK build error:"
echo "Execution failed for task ':app:createBundleDebugJsAndAssets'"
echo

read -p "Choose solution (1=Clean Build, 2=Manual Bundle, 3=Disable Bundle, 4=All): " choice

case $choice in
    1)
        echo "🧹 Solution 1: Clean Build & Cache Reset"
        echo "========================================"
        
        echo "Cleaning Android build..."
        cd android && ./gradlew clean
        cd ..
        
        echo "Clearing React Native cache..."
        rm -rf node_modules/.cache/ 2>/dev/null || true
        rm -rf .metro-cache/ 2>/dev/null || true
        
        echo "Clearing npm cache..."
        npm cache clean --force
        
        echo "Rebuilding..."
        cd android && ./gradlew assembleDebug --stacktrace
        ;;
        
    2)
        echo "📦 Solution 2: Manual Bundle Creation"
        echo "====================================="
        
        echo "Creating assets directory..."
        mkdir -p android/app/src/main/assets
        
        echo "Creating bundle manually..."
        npx react-native bundle \
            --platform android \
            --dev false \
            --entry-file index.js \
            --bundle-output android/app/src/main/assets/index.android.bundle \
            --assets-dest android/app/src/main/res/
        
        if [ $? -eq 0 ]; then
            echo "✅ Bundle created successfully!"
            echo "Building APK..."
            cd android && ./gradlew assembleDebug
        else
            echo "❌ Manual bundle creation failed. Check the error above."
        fi
        ;;
        
    3)
        echo "🔄 Solution 3: Temporarily Disable Bundle (Normal Debug APK)"
        echo "============================================================"
        
        echo "Reverting to normal debug APK (requires Metro server)..."
        
        # Backup current build.gradle
        cp android/app/build.gradle android/app/build.gradle.backup
        
        # Modify build.gradle to enable debuggableVariants
        sed -i 's/debuggableVariants = \[\]/debuggableVariants = ["debug"]/' android/app/build.gradle
        
        echo "✅ Reverted to normal debug APK configuration"
        echo "This APK will need Metro server running to work"
        
        cd android && ./gradlew assembleDebug
        
        echo
        echo "To restore bundled debug APK later:"
        echo "cp android/app/build.gradle.backup android/app/build.gradle"
        ;;
        
    4)
        echo "🔄 Solution 4: Try All Solutions"
        echo "==============================="
        
        echo "Step 1: Clean build..."
        cd android && ./gradlew clean && cd ..
        
        echo "Step 2: Clear caches..."
        rm -rf node_modules/.cache/ .metro-cache/ 2>/dev/null || true
        npm cache clean --force
        
        echo "Step 3: Try normal build..."
        cd android && ./gradlew assembleDebug
        
        if [ $? -ne 0 ]; then
            echo "Normal build failed. Trying manual bundle..."
            cd ..
            mkdir -p android/app/src/main/assets
            
            npx react-native bundle \
                --platform android \
                --dev false \
                --entry-file index.js \
                --bundle-output android/app/src/main/assets/index.android.bundle \
                --assets-dest android/app/src/main/res/
            
            cd android && ./gradlew assembleDebug
        fi
        ;;
        
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo
echo "🎯 APK Location (if successful):"
echo "android/app/build/outputs/apk/debug/app-debug.apk"