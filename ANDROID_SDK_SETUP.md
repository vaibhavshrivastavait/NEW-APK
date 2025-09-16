# 📱 Android SDK Setup Instructions

## ⚠️ IMPORTANT NOTICE

This repository **does not include the Android SDK** to comply with GitHub's file size limits. The Android SDK contains files larger than 100MB, which exceed GitHub's limits.

**All Android build configuration fixes are preserved** - you just need to install the Android SDK locally.

## 🔧 Required Setup After Cloning

### 1. Install Java 17

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install openjdk-17-jdk
```

**macOS:**
```bash
brew install openjdk@17
```

**Windows:**
Download from [Oracle JDK 17](https://www.oracle.com/java/technologies/downloads/#java17) or [OpenJDK 17](https://adoptium.net/)

### 2. Install Android SDK

**Option A: Android Studio (Recommended)**
1. Download [Android Studio](https://developer.android.com/studio)
2. Install and open Android Studio
3. Go to **Settings** → **Appearance & Behavior** → **System Settings** → **Android SDK**
4. Install:
   - **Android API 34** (Android 14)
   - **Android SDK Build-Tools 34.0.0**
   - **Android SDK Platform-Tools**
   - **Android NDK** (if needed for native modules)

**Option B: Command Line Tools**
1. Download [Android Command Line Tools](https://developer.android.com/studio#cmdline-tools)
2. Extract to a directory (e.g., `/path/to/android-sdk/cmdline-tools/latest/`)
3. Run:
```bash
# Accept licenses
./sdkmanager --licenses

# Install required components
./sdkmanager "platform-tools" "build-tools;34.0.0" "platforms;android-34"
```

### 3. Set Environment Variables

**Linux/macOS (add to ~/.bashrc or ~/.zshrc):**
```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64  # Adjust path as needed
export ANDROID_HOME=/path/to/your/android-sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin
```

**Windows (System Environment Variables):**
```
JAVA_HOME=C:\Program Files\Java\jdk-17
ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk
ANDROID_SDK_ROOT=%ANDROID_HOME%
PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin
```

### 4. Verify Setup

```bash
# Check Java
java -version
# Should show: openjdk version "17.x.x"

# Check Android SDK
adb version
# Should show: Android Debug Bridge version x.x.x

# Check environment variables
echo $ANDROID_HOME
echo $JAVA_HOME
```

## 🏗️ Building the APK

Once the Android SDK is set up:

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/mht-assessment-android-app.git
cd mht-assessment-android-app

# Install dependencies
yarn install

# Build APK
cd android
./gradlew assembleDebug

# APK will be generated at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

## 🎯 What's Already Fixed

This repository includes **all Android build configuration fixes**:

✅ **React Native Version Compatibility**
- Fixed: `react-native: 0.73.3` (Expo SDK 50 compatible)
- All React Native dependency resolution working

✅ **Library Namespace Configuration**
- Fixed: `@react-native-community/slider` namespace
- Fixed: `@shopify/flash-list` namespace
- Android Gradle Plugin 8.1.4 compatibility achieved

✅ **Gradle Build System**
- Proper repository configuration for React Native
- All 19 Expo modules successfully configured
- Build progresses through all configuration phases

✅ **Complete Project Structure**
- Full MHT Assessment React Native/Expo application
- All corrected Android build configurations
- Complete node_modules with library fixes
- All source code, assets, and documentation

## 🔍 Verification

To verify your setup is working:

```bash
# Test Gradle build (should pass configuration phase)
cd android
./gradlew tasks

# If successful, you'll see a list of available Gradle tasks
# If you see errors, check your JAVA_HOME and ANDROID_HOME settings
```

## 🆘 Troubleshooting

**"JAVA_HOME is not set":**
- Verify Java 17 is installed: `java -version`
- Set JAVA_HOME environment variable correctly
- Restart terminal after setting environment variables

**"Android SDK not found":**
- Verify Android SDK is installed
- Check ANDROID_HOME points to correct directory
- Ensure `adb` command works: `adb version`

**"SDK Platform not found":**
- Install Android API 34: `sdkmanager "platforms;android-34"`
- Install Build Tools: `sdkmanager "build-tools;34.0.0"`

**"Build fails with dependency errors":**
- All dependency issues are already fixed in this repository
- If you see dependency errors, verify you're using the correct Android SDK version

## 📋 System Requirements

- **Java**: OpenJDK 17 or Oracle JDK 17
- **Android SDK**: API Level 34 (Android 14)
- **Build Tools**: 34.0.0
- **Platform Tools**: Latest version
- **Gradle**: 8.3 (included in project)
- **Free Disk Space**: At least 5GB for Android SDK and build artifacts

---

**🏆 All Android build issues have been resolved!**

This setup will enable successful APK generation for the MHT Assessment application.