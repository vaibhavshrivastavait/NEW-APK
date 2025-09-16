#!/bin/bash

# =========================================================
# MHT Assessment - Run on Physical Device Script (FIXED)
# Modern Expo CLI + Clear Network Requirements
# =========================================================

echo "🚀 MHT Assessment - Physical Device Deployment Solutions"
echo "========================================================"

# Check current directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in app directory. Run from /app"
    exit 1
fi

echo "📱 Choose your deployment method:"
echo
echo "1️⃣ DEVELOPMENT MODE (Expo Go)"
echo "   📶 Network: Same WiFi OR tunnel mode (cross-network)"
echo "   🔄 Metro: Required (live updates)"
echo "   📱 Install: Expo Go app from Play Store"
echo "   ⚡ Best for: Development and testing"
echo
echo "2️⃣ DEVELOPMENT BUILD (Direct APK)"
echo "   📶 Network: Same WiFi OR tunnel mode (cross-network)" 
echo "   🔄 Metro: Required (connects to development server)"
echo "   📱 Install: APK directly on phone"
echo "   ⚡ Best for: Testing without Expo Go"
echo
echo "3️⃣ PRODUCTION BUILD (Standalone APK)"
echo "   📶 Network: NOT REQUIRED (completely offline)"
echo "   🔄 Metro: NOT REQUIRED (standalone bundle)"
echo "   📱 Install: APK directly on phone"
echo "   ⚡ Best for: Distribution and production"
echo

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "🔄 Starting Development Mode with Expo Go..."
        echo
        echo "📋 NETWORK REQUIREMENTS:"
        echo "• Option A: Same WiFi network (phone + computer)"
        echo "• Option B: Tunnel mode (works across different networks)"
        echo
        echo "📱 INSTRUCTIONS:"
        echo "1. Install 'Expo Go' app on your phone from Play Store"
        echo "2. Keep this terminal open (Metro server running)"
        echo "3. Scan the QR code that appears with Expo Go"
        echo "4. App loads with live updates enabled"
        echo
        
        # Kill any existing processes
        pkill -f metro || true
        pkill -f expo || true
        
        # Use modern local Expo CLI with tunnel for cross-network access
        echo "🌐 Starting with tunnel mode (works across networks)..."
        npx expo start --tunnel --clear
        ;;
        
    2)
        echo "🔧 Creating Development Build..."
        echo
        echo "📋 NETWORK REQUIREMENTS:"
        echo "• Same WiFi network OR tunnel mode required"
        echo "• Metro server must keep running"
        echo "• APK connects to development server for updates"
        echo
        echo "📱 INSTRUCTIONS:"
        echo "1. APK will be built and installed directly"
        echo "2. Keep Metro server running after install"
        echo "3. App will connect to development server"
        echo "4. Hot reloading and live updates work"
        echo
        
        echo "Building development APK..."
        # Use modern local Expo CLI
        npx expo run:android --device
        ;;
        
    3)
        echo "📦 Creating Production APK (Standalone)..."
        echo
        echo "📋 NETWORK REQUIREMENTS:"
        echo "• ✅ NO NETWORK REQUIRED after build"
        echo "• ✅ NO METRO SERVER needed"
        echo "• ✅ Works completely offline"
        echo "• ✅ Ready for distribution"
        echo
        echo "📱 INSTRUCTIONS:"
        echo "1. APK will be built with all code bundled"
        echo "2. Install APK on any Android device"
        echo "3. Runs independently without development server"
        echo "4. No live updates (fixed version)"
        echo
        
        echo "Building standalone production APK..."
        # Create production build with modern CLI
        npx expo build:android --type=apk --release-channel=production
        ;;
        
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo
echo "🎯 SUMMARY OF NETWORK REQUIREMENTS:"
echo "Development Mode (1): Metro required + Network needed"
echo "Development Build (2): Metro required + Network needed"  
echo "Production Build (3): NO Metro + NO Network needed"