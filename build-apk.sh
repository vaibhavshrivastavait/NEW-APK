#!/bin/bash

echo "=== MHT Assessment Android APK Build Script ==="

# Set environment variables
export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-arm64"
export ANDROID_HOME="/opt/android-sdk"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools"

echo "Java Home: $JAVA_HOME"
echo "Android Home: $ANDROID_HOME"

# Verify Java installation
echo "Java version:"
java -version

# Verify Android SDK
echo -e "\nAndroid SDK Manager:"
sdkmanager --version

# Clean any previous build
echo -e "\nCleaning previous builds..."
cd /app/android
rm -rf build/
rm -rf app/build/

# Ensure node_modules symlink exists
if [ ! -L "node_modules" ]; then
    ln -sf ../node_modules node_modules
    echo "Created node_modules symlink"
fi

# Try to build APK
echo -e "\nAttempting to build APK..."
./gradlew clean
./gradlew assembleDebug --stacktrace --info

# Check if APK was created
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo -e "\n✅ APK BUILD SUCCESS!"
    echo "APK Location: /app/android/$APK_PATH"
    echo "APK Size: $APK_SIZE"
    
    # Copy APK to root directory for easy access
    cp "$APK_PATH" "/app/mht-assessment-debug.apk"
    echo "APK copied to: /app/mht-assessment-debug.apk"
else
    echo -e "\n❌ APK BUILD FAILED!"
    echo "No APK file found at expected location."
fi