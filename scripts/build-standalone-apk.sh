#!/bin/bash

# MHT Assessment - Standalone APK Build Script
# Produces self-contained APK that doesn't require Metro
# Works on: Linux, macOS, Windows (WSL/Git Bash)

set -e

echo "🚀 Building MHT Assessment - Standalone APK"
echo "============================================="

# Colors for outputs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check required tools
echo -e "${BLUE}📋 Checking build requirements...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+ ${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"

# Check npm/yarn
if command -v yarn &> /dev/null; then
    PACKAGE_MANAGER="yarn"
    PACKAGE_VERSION=$(yarn --version)
    echo -e "${GREEN}✅ Yarn: $PACKAGE_VERSION${NC}"
else
    PACKAGE_MANAGER="npm"
    PACKAGE_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm: $PACKAGE_VERSION${NC}"
fi

# Check Java
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java not found. Please install OpenJDK 17+ ${NC}"
    exit 1
fi
JAVA_VERSION=$(java -version 2>&1 | head -n 1)
echo -e "${GREEN}✅ Java: $JAVA_VERSION${NC}"

# Check Android SDK
if [[ -z "$ANDROID_HOME" ]] && [[ -z "$ANDROID_SDK_ROOT" ]]; then
    echo -e "${RED}❌ Android SDK not found. Please set ANDROID_HOME or ANDROID_SDK_ROOT${NC}"
    echo -e "${YELLOW}   Download from: https://developer.android.com/studio/command-line-tools${NC}"
    exit 1
fi

ANDROID_SDK_PATH="${ANDROID_HOME:-$ANDROID_SDK_ROOT}"
echo -e "${GREEN}✅ Android SDK: $ANDROID_SDK_PATH${NC}"

# Check if platform-tools exist
if [[ ! -d "$ANDROID_SDK_PATH/platform-tools" ]]; then
    echo -e "${YELLOW}⚠️  platform-tools not found. Installing...${NC}"
    $ANDROID_SDK_PATH/cmdline-tools/latest/bin/sdkmanager "platform-tools"
fi

# Build configuration
BUILD_TYPE="${1:-debug}"  # debug or release
OUTPUT_DIR="$PWD/android/app/build/outputs/apk/$BUILD_TYPE"

echo -e "${BLUE}📦 Build configuration${NC}"
echo -e "  Build Type: $BUILD_TYPE"
echo -e "  Output Dir: $OUTPUT_DIR"
echo ""

# Step 1: Install dependencies
echo -e "${BLUE}📥 Installing dependencies...${NC}"
if [[ "$PACKAGE_MANAGER" == "yarn" ]]; then
    yarn install --frozen-lockfile
else
    npm ci
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 2: Clean previous builds
echo -e "${BLUE}🧹 Cleaning previous builds...${NC}"
rm -rf android/app/src/main/assets/index.android.bundle
rm -rf android/app/src/main/res/drawable-*
rm -rf android/app/src/main/res/raw
cd android
./gradlew clean --quiet
cd ..
echo -e "${GREEN}✅ Build cleaned${NC}"

# Step 3: Create assets directory
echo -e "${BLUE}📁 Preparing asset directories...${NC}"
mkdir -p android/app/src/main/assets
mkdir -p android/app/src/main/res
echo -e "${GREEN}✅ Directories prepared${NC}"

# Step 4: Bundle JavaScript and assets
echo -e "${BLUE}⚡ Bundling JavaScript for Android...${NC}"
echo -e "${YELLOW}   This may take 2-3 minutes...${NC}"

# Set dev flag based on build type
if [[ "$BUILD_TYPE" == "release" ]]; then
    DEV_FLAG="false"
else
    DEV_FLAG="false"  # Even debug builds should be standalone (no Metro)
fi

# Bundle with proper error handling
if npx react-native bundle \
    --platform android \
    --dev $DEV_FLAG \
    --entry-file index.js \
    --bundle-output android/app/src/main/assets/index.android.bundle \
    --assets-dest android/app/src/main/res/ \
    --reset-cache; then
    echo -e "${GREEN}✅ JavaScript bundled successfully${NC}"
else
    echo -e "${RED}❌ JavaScript bundling failed${NC}"
    echo -e "${YELLOW}   Trying alternative method with Expo CLI...${NC}"
    
    if npx expo export:embed \
        --entry-file index.js \
        --platform android \
        --dev $DEV_FLAG \
        --bundle-output android/app/src/main/assets/index.android.bundle \
        --assets-dest android/app/src/main/res/ \
        --reset-cache; then
        echo -e "${GREEN}✅ JavaScript bundled with Expo CLI${NC}"
    else
        echo -e "${RED}❌ Both bundling methods failed${NC}"
        echo -e "${YELLOW}   Check Metro configuration and try manually:${NC}"
        echo -e "   npx react-native start --reset-cache"
        exit 1
    fi
fi

# Verify bundle was created
if [[ ! -f "android/app/src/main/assets/index.android.bundle" ]]; then
    echo -e "${RED}❌ Bundle file not found: android/app/src/main/assets/index.android.bundle${NC}"
    exit 1
fi

BUNDLE_SIZE=$(ls -lh android/app/src/main/assets/index.android.bundle | awk '{print $5}')
echo -e "${GREEN}✅ Bundle created: ${BUNDLE_SIZE}${NC}"

# Step 5: Build APK
echo -e "${BLUE}🔨 Building Android APK...${NC}"
echo -e "${YELLOW}   This may take 3-5 minutes...${NC}"

cd android

# Set environment variables for build
export JAVA_HOME="${JAVA_HOME:-/usr/lib/jvm/java-17-openjdk-arm64}"
export ANDROID_HOME="$ANDROID_SDK_PATH"
export PATH="$PATH:$ANDROID_SDK_PATH/cmdline-tools/latest/bin:$ANDROID_SDK_PATH/platform-tools"

# Build based on type
if [[ "$BUILD_TYPE" == "release" ]]; then
    echo -e "${YELLOW}   Building signed release APK...${NC}"
    if ./gradlew assembleRelease --stacktrace; then
        echo -e "${GREEN}✅ Release APK built successfully${NC}"
    else
        echo -e "${RED}❌ Release APK build failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}   Building debug APK...${NC}"
    if ./gradlew assembleDebug --stacktrace; then
        echo -e "${GREEN}✅ Debug APK built successfully${NC}"
    else
        echo -e "${RED}❌ Debug APK build failed${NC}"
        exit 1
    fi
fi

cd ..

# Step 6: Locate and report APK
echo -e "${BLUE}📱 Locating built APK...${NC}"

APK_FILE=$(find android/app/build/outputs/apk/$BUILD_TYPE -name "*.apk" | head -1)

if [[ -z "$APK_FILE" ]]; then
    echo -e "${RED}❌ APK file not found in expected location${NC}"
    echo -e "${YELLOW}   Searching in build outputs...${NC}"
    find android/app/build/outputs -name "*.apk" -type f
    exit 1
fi

APK_SIZE=$(ls -lh "$APK_FILE" | awk '{print $5}')
APK_NAME=$(basename "$APK_FILE")

echo -e "${GREEN}✅ APK built successfully!${NC}"
echo ""
echo -e "${BLUE}📦 Build Summary${NC}"
echo "=================="
echo -e "  APK File: $APK_NAME"
echo -e "  APK Size: $APK_SIZE"
echo -e "  Location: $APK_FILE"
echo -e "  Build Type: $BUILD_TYPE"
echo ""

# Step 7: Copy APK to project root for easy access
FINAL_APK="mht-assessment-standalone-$BUILD_TYPE.apk"
cp "$APK_FILE" "$FINAL_APK"
echo -e "${GREEN}✅ APK copied to: $FINAL_APK${NC}"

# Step 8: Installation instructions
echo -e "${BLUE}📲 Installation Instructions${NC}"
echo "=============================="
echo ""
echo -e "${YELLOW}Option 1: USB Debugging (Recommended)${NC}"
echo "  1. Enable Developer Options on your Android device"
echo "  2. Enable USB Debugging"
echo "  3. Connect device via USB"
echo "  4. Run: adb install $FINAL_APK"
echo ""
echo -e "${YELLOW}Option 2: Sideload via File Transfer${NC}"
echo "  1. Copy $FINAL_APK to your Android device"
echo "  2. Enable 'Unknown Sources' in device settings"
echo "  3. Open file manager and tap the APK to install"
echo ""
echo -e "${YELLOW}Option 3: Test with ADB (if device connected)${NC}"
echo "  adb devices                    # Check connected devices"
echo "  adb install $FINAL_APK         # Install APK"
echo "  adb shell am start -n com.mht.assessment/.MainActivity  # Launch app"
echo ""

# Step 9: Verification checklist
echo -e "${BLUE}✅ Verification Checklist${NC}"
echo "=========================="
echo "  □ APK installs without errors"
echo "  □ App launches without Metro connection"
echo "  □ No 'Enable JavaScript' error messages"
echo "  □ Patient data can be saved/loaded offline"
echo "  □ CME quizzes work offline"
echo "  □ Risk calculators function properly"
echo "  □ App works without internet connection"
echo ""

echo -e "${GREEN}🎉 Standalone APK build completed successfully!${NC}"
echo -e "${BLUE}Build artifact: ${FINAL_APK}${NC}"