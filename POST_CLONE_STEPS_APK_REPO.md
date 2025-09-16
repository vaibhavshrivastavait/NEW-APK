# MHT Assessment App - Post-Clone Setup Steps

## 🚀 Complete Setup Guide for https://github.com/vaibhavshrivastavait/apk.git

### 📋 Prerequisites (Install these first)

**For Windows:**
```powershell
# Install Node.js (v18 or higher)
winget install OpenJS.NodeJS

# Install Git
winget install Git.Git

# Install Android Studio (for APK building)
# Download from: https://developer.android.com/studio

# Install Java Development Kit (JDK 17)
winget install Eclipse.Temurin.17.JDK
```

**For macOS/Linux:**
```bash
# Install Node.js
brew install node  # macOS
# OR
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs  # Ubuntu

# Install Git
brew install git  # macOS
# OR
sudo apt-get install git  # Ubuntu

# Install Android Studio and JDK 17
```

---

## 🔧 Step-by-Step Setup Instructions

### Step 1: Clone the Repository
```bash
git clone https://github.com/vaibhavshrivastavait/apk.git
cd apk
```

### Step 2: Install Dependencies
```bash
# Install all required npm packages
npm install

# This will install:
# - React Native and Expo dependencies
# - Navigation libraries
# - AsyncStorage and other utilities
# - All UI components and icons
```

### Step 3: Verify Environment Configuration
```bash
# Check if .env file exists
ls -la .env

# The .env should contain:
# EXPO_PACKAGER_HOSTNAME=localhost
# EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
# EXPO_USE_FAST_RESOLVER="false"
```

### Step 4: Start the Development Server
```bash
# Start Expo development server
npx expo start

# Alternative commands:
npm start
# OR
npx expo start --web  # For web-only testing
```

### Step 5: Test the App

**Option A: Test on Physical Device (Recommended)**
1. Install **Expo Go** app on your phone:
   - iOS: Download from App Store
   - Android: Download from Google Play Store
2. Scan the QR code displayed in your terminal
3. The app should load on your device

**Option B: Test in Web Browser**
1. After running `npx expo start`, press `w` to open in web browser
2. Or visit `http://localhost:3000` directly

**Option C: Android Emulator**
1. Start Android Studio
2. Open AVD Manager and start an emulator
3. Press `a` in the Expo terminal to open on Android emulator

---

## 🏗️ Building APK (Android App)

### Method 1: EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo account (create one if needed)
eas login

# Configure build
eas build:configure

# Build APK for Android
eas build --platform android --profile preview

# Download APK when build completes
```

### Method 2: Local Build
```bash
# Generate native Android project
npx expo prebuild --platform android

# Navigate to Android directory
cd android

# Build debug APK (Windows)
./gradlew assembleDebug

# Build debug APK (macOS/Linux)
./gradlew assembleDebug

# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## ✅ Feature Testing Checklist

After setup, verify these features work:

### Core Features
- [ ] **Home Screen** loads without crashes
- [ ] **Patient List** shows "Add New Patient" option  
- [ ] **Drug Interaction Checker** opens and allows medicine selection
- [ ] **MHT Guidelines** loads and shows sections
- [ ] **CME Module** accessible and working
- [ ] **About Screen** displays app information

### Key Functionality  
- [ ] **Add New Patient** form works and saves data
- [ ] **Risk Calculations** (ASCVD, Wells, FRAX, Gail) work
- [ ] **Drug interactions** show proper warnings and colors
- [ ] **Guidelines search** finds relevant content
- [ ] **Data persistence** - app remembers patient data after restart

### Stability Tests
- [ ] **No crashes** when navigating between screens
- [ ] **No "unable to load list" errors**
- [ ] **AsyncStorage operations** work smoothly
- [ ] **Large data sets** don't cause performance issues

---

## 🐛 Troubleshooting Common Issues

### Issue 1: Metro bundler fails to start
```bash
# Clear caches and restart
npx expo start --clear
```

### Issue 2: Dependencies issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Issue 3: Android build fails
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleDebug
```

### Issue 4: Port 3000 already in use
```bash
# Start on different port
npx expo start --port 3001
```

### Issue 5: "Unable to load list" errors
**This should NOT happen in the latest version**, but if it does:
1. Check if you're using an old APK build
2. Build a fresh APK from the current code
3. All AsyncStorage issues have been fixed

---

## 📱 App Architecture Overview

### Key Components
- **HomeScreen.tsx** - Main dashboard with navigation buttons
- **PatientListScreen.tsx** - Patient management with SafeFlatList
- **GuidelinesScreen.tsx** - Clinical guidelines with search
- **CmeScreen.tsx** - Educational module
- **Drug Interaction Checker** - 150+ drug combinations

### Data Management
- **crashProofStorage** - Robust AsyncStorage wrapper
- **assessmentStore.ts** - Zustand state management  
- **SafeFlatList** - Crash-proof list rendering
- **Local JSON files** - Drug rules and guidelines

### Navigation
- **React Navigation** - Stack-based navigation
- **File-based routing** - Organized screen structure
- **Type-safe navigation** - TypeScript integration

---

## 🔄 Development Workflow

### Daily Development
```bash
# Start development
cd apk
npx expo start

# Make changes to files
# Hot reload will update automatically

# Test on device via Expo Go
# Or test in web browser
```

### Building for Testing
```bash
# Build APK for testing
npx expo prebuild --platform android
cd android && ./gradlew assembleDebug

# Install on device
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Code Structure
```
apk/
├── screens/           # All app screens
├── components/        # Reusable components  
├── utils/            # Utility functions
├── store/            # State management
├── assets/           # Images, icons, data
├── App.tsx           # Main app component
├── package.json      # Dependencies
└── .env              # Environment config
```

---

## 🎯 Production Deployment

### For Production APK
```bash
# Build production APK
cd android
./gradlew assembleRelease

# Sign APK (requires keystore)
# Follow Android signing documentation
```

### For App Store
```bash
# Use EAS Build for production
eas build --platform android --profile production
eas build --platform ios --profile production
```

---

## 📞 Getting Help

### If you encounter issues:

1. **Check the logs:**
   ```bash
   # Expo logs
   npx expo start --verbose
   
   # Android logs  
   adb logcat
   ```

2. **Common solutions:**
   - Clear Expo cache: `npx expo start --clear`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Restart Metro bundler: Kill terminal and run `npx expo start` again

3. **Verify setup:**
   - Node.js version: `node --version` (should be 18+)
   - npm version: `npm --version`
   - Expo CLI: `npx expo --version`

---

## 🎉 Success Indicators

**You'll know everything is working when:**
- ✅ Expo QR code appears in terminal
- ✅ App loads on your phone via Expo Go
- ✅ Home screen shows "Drug Interaction Checker" and "About" buttons
- ✅ No Treatment Plan Generator button (removed as requested)
- ✅ All screens navigate smoothly without crashes
- ✅ Patient data can be added and persists
- ✅ Drug interactions show properly with color coding

**The app is now ready for production use!**

---

## 📋 Quick Reference Commands

```bash
# Essential commands
npm install                    # Install dependencies
npx expo start                # Start development server  
npx expo start --web          # Start web-only version
npx expo start --clear        # Clear cache and start
npx expo prebuild            # Generate native code
cd android && ./gradlew assembleDebug  # Build APK

# Troubleshooting
rm -rf node_modules && npm install     # Clean reinstall
npx expo install --fix                 # Fix dependency issues
npx expo doctor                        # Check for issues
```

This comprehensive guide will get your MHT Assessment app running perfectly after cloning from the apk.git repository!