# MHT Assessment - Local PC Setup Guide

## 📦 Project Archive Details

**File Name**: `MHT_Assessment_Complete_Project.tar.gz`
**Size**: ~180MB (compressed)
**Location**: `/app/MHT_Assessment_Complete_Project.tar.gz`
**Contents**: Complete MHT Assessment project with all Android assets, branding, and AsyncStorage fixes

## 💻 Prerequisites for Local PC

### Required Software
1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **Yarn Package Manager**
   - Install: `npm install -g yarn`
   - Verify: `yarn --version`

3. **Git** (for version control)
   - Download: https://git-scm.com/
   - Verify: `git --version`

4. **Android Development Environment** (for APK builds)
   - **Android Studio**: https://developer.android.com/studio
   - **Java 17 JDK**: https://adoptium.net/
   - **Android SDK** (install via Android Studio)

5. **Expo CLI**
   - Install: `npm install -g @expo/cli`
   - Verify: `npx expo --version`

## 📱 Setup Instructions

### Step 1: Download and Extract Project
```bash
# Download the MHT_Assessment_Complete_Project.tar.gz file from the Emergent platform

# Extract the project (Windows)
tar -xzf MHT_Assessment_Complete_Project.tar.gz

# Or use 7-Zip, WinRAR, or Windows built-in extraction

# Navigate to project directory
cd app
```

### Step 2: Install Dependencies
```bash
# Install all Node.js dependencies
yarn install

# This will install all packages listed in package.json
# Size: ~678MB (node_modules folder)
```

### Step 3: Configure Environment
```bash
# The .env file is already included with proper configuration
# No additional environment setup required

# Verify .env file exists and contains:
# EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
# (and other required variables)
```

### Step 4: Start Development Server
```bash
# Start Expo development server
npx expo start

# Or use yarn
yarn start

# This will:
# - Start Metro bundler
# - Generate QR code for mobile testing
# - Provide web preview URL
# - Show development menu
```

### Step 5: Test the Application

#### Option A: Web Browser
1. Open the web preview URL (usually http://localhost:19006)
2. Test all functionality in browser
3. Verify AsyncStorage fixes work
4. Check branding and navigation

#### Option B: Mobile Device (Expo Go)
1. Install Expo Go app on your phone
2. Scan QR code from terminal
3. Test on actual mobile device
4. Verify all features work correctly

#### Option C: Android Emulator
1. Open Android Studio
2. Create/start Android emulator
3. Press 'a' in Expo terminal to open on Android
4. Test app in emulator environment

## 🔨 Building APK for Physical Device

### Method 1: EAS Build (Recommended)
```bash
# Install EAS CLI if not already installed
npm install -g @expo/eas-cli

# Login to Expo account (create free account if needed)
eas login

# Configure EAS build (one-time setup)
eas build:configure

# Build APK
eas build --platform android --profile preview

# Download APK when build completes
# Install on your Android device for testing
```

### Method 2: Local Android Build
```bash
# Prerequisites: Android Studio, Android SDK, Java 17

# Generate Android project
npx expo prebuild --platform android --clean

# Navigate to Android project
cd android

# Build APK
./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

## ✅ Verification Checklist

After setup, verify the following work correctly:

### Core Functionality
- [ ] App starts without crashes
- [ ] Home screen displays with MHT branding
- [ ] Navigation to all sections works
- [ ] Patient Records screen loads (no AsyncStorage crash)
- [ ] MHT Guidelines screen loads (no AsyncStorage crash)
- [ ] Assessment flow works (Demographics → Symptoms → Risk Factors → Results)

### Android APK Specific
- [ ] Custom MHT logo appears as app icon (not generic Android icon)
- [ ] Branded splash screen shows on app launch
- [ ] App runs offline without internet connection
- [ ] All features work on physical Android device

### Development Environment
- [ ] Hot reloading works during development
- [ ] Error messages display clearly
- [ ] Console logs show helpful debugging info
- [ ] Build process completes without errors

## 📂 Project Structure Overview

```
app/
├── android/                     # Android native project
│   └── app/src/main/res/        # Generated Android assets
│       ├── mipmap-*/            # App icons (all densities)
│       └── drawable-*/          # Splash screens (all densities)
├── assets/                      # App assets
│   ├── images/branding/         # MHT logos
│   └── play-store/             # Play Store icon (512x512)
├── components/                  # Reusable components
│   └── SplashScreen.tsx        # Branded splash screen
├── screens/                     # App screens
│   ├── PatientListScreen.tsx   # Fixed AsyncStorage issue
│   └── GuidelinesScreen.tsx    # Fixed AsyncStorage issue
├── store/                       # State management
│   └── assessmentStore.ts      # Fixed AsyncStorage integration
├── utils/                      # Utility functions
│   └── asyncStorageUtils.ts    # Safe AsyncStorage wrapper
├── app.json                    # Expo configuration with branding
├── package.json               # Dependencies and scripts
└── .env                       # Environment variables
```

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### 1. "Cannot resolve module" errors
```bash
# Clear cache and reinstall
rm -rf node_modules
yarn install
npx expo start --clear
```

#### 2. Android build fails
```bash
# Ensure Java 17 is installed and configured
java --version

# Verify Android SDK path
echo $ANDROID_HOME

# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleRelease
```

#### 3. Expo Go app won't connect
- Ensure both PC and mobile device are on same WiFi network
- Try tunnel mode: `npx expo start --tunnel`
- Check firewall settings on your PC

#### 4. AsyncStorage errors (should be fixed)
- Already fixed with SafeAsyncStorage wrapper
- If issues persist, check browser developer console
- Verify utils/asyncStorageUtils.ts is properly imported

## 📞 Support

If you encounter issues:
1. Check the generated documentation files in the project
2. Review build logs for specific error messages
3. Ensure all prerequisites are correctly installed
4. Try cleaning and rebuilding the project

## 🚀 Next Steps After Setup

1. **Test Thoroughly**: Verify all functionality works on your local setup
2. **Build APK**: Generate APK for physical device testing  
3. **Customize**: Make any additional changes needed
4. **Deploy**: Prepare for production deployment to Google Play Store

The project is now ready for local development with all branding assets, AsyncStorage fixes, and proper Android configuration!