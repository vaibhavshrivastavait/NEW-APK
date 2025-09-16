# 🏠 MHT Assessment - Local PC Build Guide

## Overview
This guide shows how to build the MHT Assessment APK on your **local PC** (not in the Emergent environment).

## Prerequisites

### 1. Software Requirements
- **Node.js** (v16 or higher)
- **Android Studio** (latest version)
- **Java JDK 17** (required for Android builds)
- **Git** (for cloning repository)

### 2. Android Studio Setup
- Install Android SDK (API Level 33 or higher)
- Install Android SDK Build-Tools
- Install Android Emulator (optional, for testing)

## Step-by-Step Build Process

### Step 1: Clone Repository
```bash
# Clone from GitHub to your local PC
git clone https://github.com/vaibhavshrivastavait/mht-assessment-android-app.git
cd mht-assessment-android-app
```

### Step 2: Install Dependencies
```bash
# Install Node.js dependencies
npm install
# or
yarn install

# Install Expo CLI (if not already installed)
npm install -g @expo/cli
```

### Step 3: Android Studio Method (Recommended)

#### 3.1 Open Project
- Open Android Studio
- Choose "Open an Existing Project"
- Navigate to `mht-assessment-android-app/android/` folder
- Click "OK"

#### 3.2 Sync Gradle Files
- Android Studio will prompt to sync Gradle files
- Click "Sync Now"
- Wait for sync to complete

#### 3.3 Build APK
**For Debug APK (Development):**
- Menu: `Build → Build Bundle(s) / APK(s) → Build APK(s)`
- APK Location: `android/app/build/outputs/apk/debug/app-debug.apk`

**For Release APK (Production):**
- Menu: `Build → Generate Signed Bundle / APK`
- Choose "APK" → Next
- Create/Select keystore for signing
- APK Location: `android/app/build/outputs/apk/release/app-release.apk`

### Step 4: Command Line Method (Alternative)

#### 4.1 Development Build
```bash
# Build development APK
npx expo run:android --variant debug

# APK Location: android/app/build/outputs/apk/debug/
```

#### 4.2 Production Build
```bash
# Build production APK
npx expo run:android --variant release

# APK Location: android/app/build/outputs/apk/release/
```

## Troubleshooting

### JAVA_HOME Issues

**Windows:**
```cmd
# Set JAVA_HOME (example path)
setx JAVA_HOME "C:\Program Files\Java\jdk-17"

# Add to PATH
setx PATH "%PATH%;%JAVA_HOME%\bin"
```

**macOS:**
```bash
# Install Java 17
brew install openjdk@17

# Add to ~/.zshrc or ~/.bash_profile
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export PATH=$JAVA_HOME/bin:$PATH
```

**Linux:**
```bash
# Install Java 17
sudo apt install openjdk-17-jdk

# Add to ~/.bashrc
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH
```

### Gradle Issues
```bash
# Clean Gradle cache
cd android
./gradlew clean

# Rebuild
./gradlew assembleDebug
# or for release
./gradlew assembleRelease
```

### Dependency Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules
npm install
```

## APK Installation

### On Physical Device
1. Enable "Unknown Sources" in Android settings
2. Transfer APK to phone
3. Install APK file
4. Launch MHT Assessment app

### On Emulator
1. Open Android Studio
2. Start Android Emulator
3. Drag & drop APK onto emulator
4. APK installs automatically

## Build Outputs

### Debug APK
- **Location**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Purpose**: Development and testing
- **Size**: Larger (includes debug info)
- **Performance**: Slower (debug mode)

### Release APK
- **Location**: `android/app/build/outputs/apk/release/app-release.apk`
- **Purpose**: Production distribution
- **Size**: Smaller (optimized)
- **Performance**: Faster (release mode)
- **Signing**: Requires keystore for signing

## Network Requirements

### Development APK
- Requires Metro server running
- Needs network connection to development server
- Use for active development only

### Production APK
- **No Metro server required**
- **No network connection required**
- **Completely standalone**
- **Ready for distribution**

## Final Notes

1. **Always build on your local PC** - not in Emergent environment
2. **Use Production APK** for final distribution
3. **Test on physical device** before distribution
4. **Keep keystore safe** for release builds
5. **All fixes included** - single splash, visible buttons, working navigation

Your MHT Assessment app is ready for professional deployment! 🚀