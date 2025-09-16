#!/bin/bash

# =========================================================
# MHT Assessment - Simple Device Deployment (CLI Fixed)
# Avoids deprecated expo-cli issues
# =========================================================

echo "📱 MHT Assessment - Simple Device Deployment"
echo "============================================"

cd /app

echo "🎯 NETWORK REQUIREMENTS CLARIFICATION:"
echo
echo "1️⃣ EXPO GO (Development Mode):"
echo "   📶 Network: Same WiFi OR tunnel mode"
echo "   🔄 Metro: Required (keeps running)"
echo "   📱 Phone App: Expo Go (from Play Store)"
echo
echo "2️⃣ DEVELOPMENT APK (Normal):"
echo "   📶 Network: Same WiFi OR tunnel mode" 
echo "   🔄 Metro: Required (must keep running)"
echo "   📱 Install: Direct APK, but connects to Metro"
echo
echo "3️⃣ STANDALONE DEBUG APK (NEW!):"
echo "   📶 Network: NOT REQUIRED ✅"
echo "   🔄 Metro: NOT REQUIRED ✅" 
echo "   📱 Install: Direct APK, works offline"
echo "   🎯 Best of both: Debug features + Standalone"
echo
echo "4️⃣ PRODUCTION APK (Release):"
echo "   📶 Network: NOT REQUIRED"
echo "   🔄 Metro: NOT REQUIRED" 
echo "   📱 Install: Works completely offline"
echo

read -p "Choose (1=Expo Go, 2=Dev APK, 3=Standalone Debug, 4=Production): " choice

case $choice in
    1)
        echo "🚀 Starting Expo Go Development Mode..."
        echo
        echo "📋 STEPS:"
        echo "1. Install 'Expo Go' on your phone"
        echo "2. This will start Metro server with QR code"
        echo "3. Scan QR code with Expo Go"
        echo "4. App loads with live updates"
        echo
        echo "⚡ Starting Metro server..."
        
        # Clean start without deprecated CLI warnings
        rm -rf .expo/ .metro-cache/ || true
        
        # Start with local expo package (modern)
        ./node_modules/.bin/expo start --tunnel --clear
        ;;
        
    2)
        echo "⚠️  DEVELOPMENT APK EXPLANATION:"
        echo
        echo "Development APK still needs Metro server running because:"
        echo "• Contains development code that connects to Metro"
        echo "• Enables hot reloading and live updates"
        echo "• Requires network connection to Metro server"
        echo "• NOT standalone like production APK"
        echo
        echo "For true standalone experience, choose option 3."
        echo
        read -p "Continue with Development APK? (y/n): " confirm
        
        if [ "$confirm" = "y" ]; then
            echo "Building Development APK..."
            # Use Android Studio gradle directly to avoid CLI issues
            cd android && ./gradlew assembleDebug
            echo "✅ Development APK built: android/app/build/outputs/apk/debug/app-debug.apk"
            echo "📱 Install this APK, but keep Metro running!"
        fi
        ;;
        
    3)
        echo "🎯 STANDALONE DEBUG APK (Best of Both Worlds!):"
        echo
        echo "This creates a Debug APK that:"
        echo "• ✅ Works without Metro server"
        echo "• ✅ Works without WiFi connection"
        echo "• ✅ Includes all debug features (better error messages)"
        echo "• ✅ Ready for offline testing anywhere"
        echo "• 🚀 Perfect for development testing!"
        echo
        
        echo "Building Standalone Debug APK..."
        # Use our specialized build script
        ./build_standalone_debug.sh
        ;;
        
    4)
        echo "📦 PRODUCTION APK (True Standalone):"
        echo
        echo "This creates a completely standalone APK that:"
        echo "• Works without Metro server"
        echo "• Works without network connection"
        echo "• Ready for distribution"
        echo "• No live updates (fixed version)"
        echo
        
        echo "Building Production APK..."
        # Use Android Studio gradle directly for production
        cd android && ./gradlew assembleRelease
        echo "✅ Production APK built: android/app/build/outputs/apk/release/app-release.apk"
        echo "📱 This APK works completely offline!"
        ;;
        
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo
echo "🎯 QUICK REFERENCE:"
echo "Expo Go (1): Metro + Network needed"
echo "Dev APK (2): Metro + Network needed" 
echo "Standalone Debug (3): Nothing needed - offline debug!"
echo "Prod APK (4): Nothing needed - standalone!"