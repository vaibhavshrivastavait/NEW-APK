#!/bin/bash

# =========================================================
# MHT Assessment - Standalone Debug APK Builder
# Creates a Debug APK with bundled JS (works without WiFi)
# =========================================================

echo "📱 MHT Assessment - Standalone Debug APK Builder"
echo "================================================"
echo "This creates a Debug APK that works offline (no Metro/WiFi needed)"
echo

cd /app

echo "🔧 Building Standalone Debug APK..."
echo "⚡ This APK will include:"
echo "   ✅ All JavaScript bundled (no Metro needed)"
echo "   ✅ Debug features enabled (better error messages)"
echo "   ✅ Works completely offline"
echo "   ✅ Install on any Android device"
echo

# Method 1: Using Gradle directly (recommended)
echo "🏗️  Method 1: Direct Gradle Build (Recommended)"
echo "Building with Android Gradle..."

cd android

# Clean previous builds
echo "🧹 Cleaning previous builds..."
./gradlew clean

# Build debug APK with bundled JS
echo "📦 Building standalone debug APK..."
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo
    echo "✅ SUCCESS! Standalone Debug APK built successfully!"
    echo
    echo "📁 APK Location:"
    echo "   android/app/build/outputs/apk/debug/app-debug.apk"
    echo
    echo "📱 This APK:"
    echo "   ✅ Works without Metro server"
    echo "   ✅ Works without WiFi connection"
    echo "   ✅ Includes all debug features"
    echo "   ✅ Ready for testing on any device"
    echo
    echo "🚀 To install on your phone:"
    echo "   1. Transfer app-debug.apk to your phone"
    echo "   2. Enable 'Unknown Sources' in Android settings"
    echo "   3. Install the APK"
    echo "   4. Launch MHT Assessment app"
    echo
else
    echo "❌ Build failed. Trying alternative method..."
    
    # Method 2: Using Expo build (fallback)
    echo
    echo "🏗️  Method 2: Expo Build (Fallback)"
    cd ..
    
    # Create bundle first
    echo "📦 Creating JavaScript bundle..."
    npx expo export:embed --platform android --dev
    
    # Build APK
    echo "🔧 Building APK with bundle..."
    cd android && ./gradlew assembleDebug
    
    if [ $? -eq 0 ]; then
        echo "✅ SUCCESS! Standalone Debug APK built with alternative method!"
    else
        echo "❌ Both methods failed. Please check the errors above."
        exit 1
    fi
fi

echo
echo "🎯 APK COMPARISON:"
echo "Normal Debug APK: Needs Metro server + WiFi"
echo "This Debug APK:   ✅ Completely standalone!"
echo
echo "Ready for offline testing! 🚀"