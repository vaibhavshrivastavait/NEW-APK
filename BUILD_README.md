# MHT Assessment - React Native/Expo Android Build Guide

## 📱 App Overview

**MHT Assessment** is a comprehensive React Native/Expo mobile application for healthcare professionals to assess Menopause Hormone Therapy (MHT) suitability for patients.

### Key Features
- **Patient Assessment Flow**: Demographics, Symptoms, Risk Factors, Results
- **CME Mode**: 6 learning modules with interactive quizzes and certificates
- **MHT Guidelines**: Evidence-based clinical guidelines with search and bookmarks
- **Offline-First**: All content works without internet connection
- **Progress Tracking**: Persistent data storage with AsyncStorage
- **Export Functionality**: PDF generation and sharing capabilities

## 🏗️ Build Artifacts

This package contains the following Android build artifacts:

### 1. Debug APK (Installable)
- **File**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Purpose**: Development and testing
- **Signing**: Debug keystore (automatically signed)
- **Install**: `adb install android/app/build/outputs/apk/debug/app-debug.apk`

### 2. Release AAB (Play Store)
- **File**: `android/app/build/outputs/bundle/release/app-release.aab`
- **Purpose**: Google Play Store distribution
- **Signing**: Production keystore required
- **Upload**: Via Google Play Console

### 3. Unsigned Release APK (Optional)
- **File**: `android/app/build/outputs/apk/release/app-release-unsigned.apk`
- **Purpose**: Manual distribution after signing
- **Signing**: Requires manual signing with production keystore

## 🔧 Prerequisites

Before building, ensure you have:

- **Node.js**: v18.0.0 or later
- **npm/yarn**: Latest version
- **Android Studio**: Latest version with Android SDK
- **Java**: JDK 17
- **Expo CLI**: `npm install -g @expo/cli`
- **EAS CLI**: `npm install -g eas-cli` (for EAS builds)

## 🚀 Build Instructions

### Option 1: EAS Build (Recommended for Production)

#### Development APK
```bash
# Install dependencies
npm install

# Login to Expo (if needed)
npx expo login

# Login to EAS
npx eas login

# Build development APK
eas build --platform android --profile development
```

#### Production AAB
```bash
# Build production AAB for Play Store
eas build --platform android --profile production
```

### Option 2: Local Gradle Build

#### Setup Android Project
```bash
# Install dependencies
npm install

# Generate Android project (requires working Expo CLI)
npx expo prebuild --platform android --clean

# Navigate to Android directory
cd android
```

#### Debug APK
```bash
# Build debug APK
./gradlew assembleDebug

# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

#### Release Bundle (AAB)
```bash
# Build release bundle
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

#### Release APK (Unsigned)
```bash
# Build unsigned release APK
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release-unsigned.apk
```

## 🔑 Keystore Setup for Local Builds

### Create Debug Keystore (Automatic)
The debug keystore is automatically created by Android SDK with these default values:
- **Store Password**: `android`
- **Key Alias**: `androiddebugkey`
- **Key Password**: `android`

### Create Production Keystore
```bash
# Generate production keystore
keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Add to gradle.properties (DO NOT COMMIT)
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=*****
MYAPP_UPLOAD_KEY_PASSWORD=*****
```

### Configure Gradle Signing
The `android/app/build.gradle` already includes signing configuration:

```gradle
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }
    release {
        if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
            storeFile file(MYAPP_UPLOAD_STORE_FILE)
            storePassword MYAPP_UPLOAD_STORE_PASSWORD
            keyAlias MYAPP_UPLOAD_KEY_ALIAS
            keyPassword MYAPP_UPLOAD_KEY_PASSWORD
        }
    }
}
```

## 📦 Project Structure

```
/frontend
├── android/                    # Generated Android project
│   ├── app/
│   │   ├── build.gradle       # App-level Gradle configuration
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       └── assets/        # Bundled JavaScript/assets
│   ├── build.gradle          # Project-level Gradle configuration
│   ├── gradle.properties     # Gradle properties and keystore config
│   └── settings.gradle       # Gradle settings
├── assets/                   # App assets (images, fonts, content)
├── components/              # Reusable React components
├── screens/                 # App screens
├── store/                   # Zustand state management
├── app.json                 # Expo configuration
├── eas.json                 # EAS build configuration
└── package.json            # Dependencies and scripts
```

## 🔧 Configuration Files

### app.json (Expo Configuration)
- **Package**: `com.mht.assessment`
- **Version**: `1.0.0`
- **Version Code**: `1`
- **Permissions**: External storage, notifications, alarms
- **Icons**: Custom branding with adaptive icons

### eas.json (EAS Build Configuration)
- **Development Profile**: Debug APK builds
- **Production Profile**: Release AAB builds
- **Preview Profile**: Preview APK builds

## 📱 Installation & Testing

### Install APK on Device
```bash
# Enable USB debugging on Android device
# Connect device via USB

# Install debug APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or install via file manager on device
# Transfer APK file and tap to install
```

### Test on Emulator
```bash
# Start Android emulator (API 29+)
# Install APK on emulator
adb -e install android/app/build/outputs/apk/debug/app-debug.apk
```

## 🔍 Verification Steps

### 1. Android Studio Integration
- Open `android/` folder in Android Studio
- Gradle sync should pass without errors
- Project builds successfully from IDE

### 2. APK Functionality
- App launches to Home screen
- Navigation works between all screens
- CME Mode loads with all 6 modules
- Quiz functionality works properly
- Progress tracking persists between sessions

### 3. Build Reproducibility
- Clean build produces identical results
- All dependencies resolve correctly
- No hardcoded paths or environment-specific issues

## 🚨 Troubleshooting

### Common Issues

#### Expo Prebuild Fails
```bash
# Clear caches and retry
expo r -c
rm -rf node_modules
npm install
npx expo prebuild --platform android --clean
```

#### Gradle Build Fails
```bash
# Clean Gradle caches
cd android
./gradlew clean
./gradlew build --refresh-dependencies
```

#### Keystore Issues
```bash
# Verify keystore
keytool -list -v -keystore my-upload-key.keystore

# Check gradle.properties path
ls -la android/gradle.properties
```

#### Memory Issues
```bash
# Increase Gradle memory in gradle.properties
org.gradle.jvmargs=-Xmx4g -XX:MaxPermSize=512m
```

## 📊 Build Outputs Summary

| Build Type | File | Purpose | Signing |
|------------|------|---------|---------|
| Debug APK | `app-debug.apk` | Development/Testing | Debug keystore |
| Release AAB | `app-release.aab` | Play Store | Production keystore |
| Release APK | `app-release-unsigned.apk` | Manual distribution | Unsigned |

## 🔐 Security Notes

- **Never commit keystores** to version control
- **Use environment variables** for sensitive build configuration
- **Validate APK** before distribution using `aapt dump badging`
- **Test on multiple devices** and Android versions

## 📞 Support

For build issues or questions:
1. Check this README for common solutions
2. Verify all prerequisites are installed correctly
3. Clean and rebuild if encountering caching issues
4. Test on fresh environment if possible

## 🎯 Quick Start Commands

```bash
# Complete build process (local)
npm install
npx expo prebuild --platform android
cd android
./gradlew assembleDebug

# Complete build process (EAS)
npm install
npx eas login
eas build --platform android --profile development
```

---

**Built with ❤️ for healthcare professionals using React Native, Expo, and Android.**