# MHT Assessment - Complete Post-Clone Setup Guide

## 📋 Overview
This guide provides step-by-step instructions to clone the MHT Assessment project from GitHub and set it up for local development and APK building.

**Repository**: `https://github.com/vaibhavshrivastavait/final-apk.git`
**Project Size**: ~28MB (optimized for GitHub)

## 🔧 Prerequisites

### Windows Users
1. **Node.js** (v18 or higher)
   ```powershell
   # Download from https://nodejs.org/
   # Or use winget
   winget install OpenJS.NodeJS
   ```

2. **Git**
   ```powershell
   winget install Git.Git
   ```

3. **Android Studio** (for APK building)
   - Download from https://developer.android.com/studio
   - Install Android SDK and platform tools

4. **Java Development Kit (JDK 17)**
   ```powershell
   winget install Eclipse.Temurin.17.JDK
   ```

### macOS/Linux Users
1. **Node.js** (v18 or higher)
   ```bash
   # macOS
   brew install node
   
   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Git**
   ```bash
   # macOS
   brew install git
   
   # Ubuntu/Debian
   sudo apt-get install git
   ```

3. **Android Studio** and **JDK 17**

## 📥 Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/vaibhavshrivastavait/final-apk.git

# Navigate to project directory
cd final-apk
```

## 📦 Step 2: Install Dependencies

```bash
# Install npm dependencies
npm install

# Or if you prefer yarn
yarn install
```

## 🔧 Step 3: Environment Setup

The project comes with pre-configured `.env` files. Verify they exist:
- `.env` (in root directory)

```bash
# Check if .env exists
ls -la .env

# If missing, create from example
cp .env.example .env
```

## 🏗️ Step 4: Development Setup

### Start the Development Server
```bash
# Start Expo development server
npx expo start

# Or
npm start
```

### Test on Physical Device
1. Install **Expo Go** app on your phone
2. Scan the QR code displayed in terminal
3. The app should load with all AsyncStorage fixes applied

### Test on Web Browser
```bash
# Start web version
npx expo start --web
```

## 📱 Step 5: Building APK

### Method 1: EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo account
eas login

# Configure build
eas build:configure

# Build APK
eas build --platform android --profile preview
```

### Method 2: Local Build
```bash
# Prebuild Android project
npx expo prebuild --platform android

# Build using Gradle (from android directory)
cd android
./gradlew assembleDebug

# APK will be in: android/app/build/outputs/apk/debug/app-debug.apk
```

## 🔍 Step 6: Verification

### Test Key Features
1. **Home Screen** - Should load without crashes
2. **Patient List** - Should display "Add New Patient" option
3. **MHT Guidelines** - Should load guidelines sections
4. **Drug Interaction Checker** - Test with multiple medicines
5. **Demographics Screen** - Test form inputs

### Check for AsyncStorage Issues
If you encounter "unable to load list" errors:
1. The issue was in older APK builds
2. This repository contains all the fixes
3. Build a fresh APK using the steps above

## 🛠️ Troubleshooting

### Common Issues

1. **Metro bundler fails to start**
   ```bash
   npx expo start --clear
   ```

2. **Android build fails**
   ```bash
   cd android
   ./gradlew clean
   ./gradlew assembleDebug
   ```

3. **Dependencies issues**
   ```bash
   rm -rf node_modules
   npm install
   ```

4. **AsyncStorage crashes** (Should be fixed in this version)
   - All direct AsyncStorage calls have been replaced with crash-proof wrappers
   - SafeFlatList components prevent list rendering crashes

### Environment Variables
```env
# Default .env configuration
EXPO_PUBLIC_API_URL=http://localhost:8001
```

### Android Environment Setup
```bash
# Add to ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## 📋 Project Structure Overview

```
final-apk/
├── screens/           # All app screens
├── components/        # Reusable components
├── utils/            # Utility functions (includes crashProofStorage)
├── store/            # Zustand state management
├── assets/           # Images, icons, data files
├── android/          # Android-specific files
└── app.json          # Expo configuration
```

## 🎯 Key Features Implemented

✅ **Stability Fixes**
- AsyncStorage crash-proof wrapper
- SafeFlatList components
- Error boundaries

✅ **Drug Interaction Checker**
- 150+ drug combinations
- Color-coded severity levels
- Medical disclaimer

✅ **Core Functionality**
- Patient management
- Risk assessment
- Guidelines viewer
- Demographics collection

## 🔄 Next Steps After Setup

1. **Test the app thoroughly** on physical device
2. **Build and install APK** to verify all fixes
3. **Report any remaining issues** for further fixes
4. **Consider implementing** treatment plan generator
5. **Add automated tests** for stability

## 📞 Support

If you encounter any issues:
1. Check this guide's troubleshooting section
2. Verify all prerequisites are installed
3. Ensure you're using the latest code from this repository
4. Check that you've built a fresh APK (old APKs may still have issues)

---

**Important**: This repository contains all the AsyncStorage stability fixes. The "unable to load list" errors were present in older APK builds. Building a fresh APK from this codebase should resolve all known stability issues.