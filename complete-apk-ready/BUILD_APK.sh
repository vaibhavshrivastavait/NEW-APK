#!/bin/bash

# MHT Assessment - Direct APK Build Script
# No dependency installation required!

set -e  # Exit on any error

echo "🚀 MHT Assessment - Direct APK Builder"
echo "====================================="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    echo "🔍 Checking prerequisites..."
    
    # Check Java
    if ! command -v java &> /dev/null; then
        print_error "Java is not installed. Please install Java 17 from https://adoptium.net/"
        exit 1
    fi
    
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | awk -F '"' '{print $2}' | cut -d'.' -f1)
    if [ "$JAVA_VERSION" -lt 17 ]; then
        print_error "Java 17+ required. Current version: $(java -version 2>&1 | head -n 1)"
        exit 1
    fi
    print_status "Java $(java -version 2>&1 | head -n 1 | awk -F '"' '{print $2}') found"
    
    # Check Android SDK
    if [ -z "$ANDROID_HOME" ]; then
        print_error "ANDROID_HOME not set. Please install Android Studio and set environment variables."
        print_info "Set: export ANDROID_HOME=\$HOME/Android/Sdk"
        exit 1
    fi
    
    if [ ! -d "$ANDROID_HOME" ]; then
        print_error "ANDROID_HOME directory not found: $ANDROID_HOME"
        exit 1
    fi
    print_status "Android SDK found at $ANDROID_HOME"
    
    # Check ADB
    if ! command -v adb &> /dev/null; then
        print_error "ADB not found. Please ensure Android SDK platform-tools are in PATH."
        exit 1
    fi
    print_status "ADB found"
}

# Verify project structure
verify_project() {
    echo ""
    echo "🔍 Verifying project structure..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Make sure you're in the project root directory."
        exit 1
    fi
    
    # Check if node_modules exists (should be included in package)
    if [ ! -d "node_modules" ]; then
        print_error "node_modules not found. This should be included in the complete package."
        exit 1
    fi
    print_status "Dependencies found (node_modules included)"
    
    # Check essential files
    if [ ! -f "App.tsx" ]; then
        print_error "App.tsx not found. Package may be incomplete."
        exit 1
    fi
    print_status "Project structure verified"
}

# Generate Android project
generate_android_project() {
    echo ""
    echo "🏗️  Generating Android project..."
    
    # Check if android directory exists
    if [ -d "android" ]; then
        print_info "Android directory exists. Cleaning..."
        rm -rf android
    fi
    
    print_info "Running expo prebuild (this may take 2-5 minutes)..."
    npx expo prebuild --platform android --clear
    
    if [ ! -d "android" ]; then
        print_error "Android project generation failed"
        exit 1
    fi
    print_status "Android project generated successfully"
}

# Build APK
build_apk() {
    echo ""
    echo "🔨 Building APK..."
    
    # Navigate to android directory
    cd android
    
    # Make gradlew executable
    chmod +x gradlew
    
    print_info "Cleaning previous builds..."
    ./gradlew clean
    
    print_info "Building debug APK (this may take 5-15 minutes for first build)..."
    ./gradlew assembleDebug
    
    # Check if APK was created
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    if [ -f "$APK_PATH" ]; then
        APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
        print_status "APK built successfully!"
        print_status "Location: android/$APK_PATH"
        print_status "Size: $APK_SIZE"
        
        # Copy APK to project root for easy access
        cp "$APK_PATH" "../mht-assessment-debug.apk"
        print_status "APK copied to project root as 'mht-assessment-debug.apk'"
        
        return 0
    else
        print_error "APK build failed - file not found at $APK_PATH"
        return 1
    fi
}

# Install APK on device
install_apk() {
    echo ""
    echo "📱 Installing APK on device..."
    
    cd ..  # Back to project root
    
    # Check if device is connected
    DEVICES=$(adb devices | grep -v "List of devices" | grep "device" | wc -l)
    if [ "$DEVICES" -eq 0 ]; then
        print_warning "No Android devices connected"
        print_info "Connect your Android device via USB and enable USB debugging"
        print_info "Then run: adb install mht-assessment-debug.apk"
        return 0
    fi
    
    print_status "$DEVICES Android device(s) connected"
    
    # Install APK
    if [ -f "mht-assessment-debug.apk" ]; then
        print_info "Installing APK on device..."
        adb install -r mht-assessment-debug.apk
        print_status "APK installed successfully!"
        print_info "Look for 'MHT Assessment' app in your device's app drawer"
    else
        print_error "APK file not found: mht-assessment-debug.apk"
        return 1
    fi
}

# Display summary
display_summary() {
    echo ""
    echo "🎉 Build Complete!"
    echo "=================="
    echo ""
    print_status "APK Location: mht-assessment-debug.apk"
    print_status "App Features: 10 screens, 150+ drug interactions"
    print_status "Target: Android 7.0+ devices"
    echo ""
    print_info "App Features:"
    echo "  • Patient Assessment with risk calculators"
    echo "  • Drug Interaction Checker (150+ combinations)"
    echo "  • CME Quiz system with scoring"
    echo "  • Treatment Plan Generator"
    echo "  • Export Reports (PDF/Excel)"
    echo "  • Risk Models Knowledge Hub"
    echo "  • Patient Records management"
    echo "  • Professional medical UI"
    echo ""
    print_info "Next Steps:"
    echo "  1. Install APK on Android devices for testing"
    echo "  2. Test all app features and functionality"
    echo "  3. Share APK file for distribution"
    echo ""
    print_info "Manual Installation:"
    echo "  adb install mht-assessment-debug.apk"
    echo ""
    print_info "Or copy APK to device and install via file manager"
}

# Main execution
main() {
    check_prerequisites
    verify_project
    generate_android_project
    
    if build_apk; then
        install_apk
        display_summary
    else
        print_error "Build failed. Check the output above for errors."
        exit 1
    fi
}

# Run main function
main