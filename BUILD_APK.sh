#!/bin/bash

echo "========================================"
echo "MHT Assessment - APK Builder"
echo "========================================"
echo

# Check Java
if ! command -v java &> /dev/null; then
    echo "ERROR: Java is not installed or not in PATH"
    echo "Please install Java JDK 17 from https://adoptium.net/"
    exit 1
fi

echo "Java version:"
java -version
echo

# Check Android SDK
if [ -z "$ANDROID_HOME" ]; then
    echo "ERROR: ANDROID_HOME environment variable is not set"
    echo "Please install Android Studio and set ANDROID_HOME"
    echo "Example: export ANDROID_HOME=~/Android/Sdk"
    exit 1
fi

echo "Android SDK: $ANDROID_HOME"
echo

echo "Building Android APK..."
echo "This may take 10-15 minutes for the first build"
echo

# Generate Android project if needed
if [ ! -d "android" ]; then
    echo "Generating Android project..."
    npx expo prebuild --platform android --clean
fi

# Build APK
echo "Building APK..."
cd android
chmod +x gradlew
./gradlew clean
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo
    echo "========================================"
    echo "BUILD SUCCESSFUL!"
    echo "========================================"
    echo "APK Location: android/app/build/outputs/apk/debug/app-debug.apk"
    echo
    echo "To install on device:"
    echo "adb install android/app/build/outputs/apk/debug/app-debug.apk"
    echo
else
    echo
    echo "BUILD FAILED!"
    echo "Check the error messages above"
    echo
fi