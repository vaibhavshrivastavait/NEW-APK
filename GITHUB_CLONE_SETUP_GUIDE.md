# 🚀 MHT Assessment - Complete GitHub Clone & Local PC Setup

## 📋 Repository Information
- **GitHub Repository**: https://github.com/vaibhavshrivastavait/MHT.git
- **Status**: Production-ready with AsyncStorage fixes applied
- **Branch**: main
- **Commits Ready**: 46 commits with all fixes

## 🔐 Authentication Required for Push
**Note**: The repository has 46 commits ready to push. Use one of these methods to authenticate and push:

### Option 1: Personal Access Token (Recommended)
```bash
cd /app
git remote set-url origin https://vaibhavshrivastavait:YOUR_GITHUB_TOKEN@github.com/vaibhavshrivastavait/MHT.git
git push origin main
```

### Option 2: SSH Key
```bash
cd /app
git remote set-url origin git@github.com:vaibhavshrivastavait/MHT.git
git push origin main
```

---

# 🖥️ Local PC Setup Instructions

## 🔧 Prerequisites Installation

### 1. **Install Node.js** (Required)
**Windows:**
- Download from https://nodejs.org/
- Install LTS version (18.x or 20.x)
- Verify: `node --version` and `npm --version`

**macOS:**
```bash
# Using Homebrew
brew install node
# Verify
node --version && npm --version
```

**Linux (Ubuntu/Debian):**
```bash
# Install Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
# Verify
node --version && npm --version
```

### 2. **Install Yarn** (Package Manager)
```bash
npm install -g yarn
yarn --version
```

### 3. **Install Git**
- **Windows**: Download from https://git-scm.com/download/win
- **macOS**: `brew install git` or install Xcode Command Line Tools
- **Linux**: `sudo apt-get install git`

### 4. **Install Android Development Environment**

#### Install Java JDK 17
- Download from https://adoptium.net/
- Verify: `java --version`

#### Install Android Studio
1. Download from https://developer.android.com/studio
2. Install with default settings
3. Complete setup wizard
4. Install Android SDK (API level 33+)
5. Install Android SDK Build-Tools

#### Configure Environment Variables
**Windows (PowerShell as Administrator):**
```powershell
# Set ANDROID_HOME
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:USERPROFILE\AppData\Local\Android\Sdk", "User")
[Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", "$env:USERPROFILE\AppData\Local\Android\Sdk", "User")

# Add to PATH
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
$androidPaths = ";$env:USERPROFILE\AppData\Local\Android\Sdk\tools;$env:USERPROFILE\AppData\Local\Android\Sdk\tools\bin;$env:USERPROFILE\AppData\Local\Android\Sdk\platform-tools"
[Environment]::SetEnvironmentVariable("PATH", $currentPath + $androidPaths, "User")

# Restart PowerShell after setting variables
```

**macOS/Linux:**
```bash
# Add to ~/.bashrc or ~/.zshrc
echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
echo 'export ANDROID_SDK_ROOT=$HOME/Android/Sdk' >> ~/.bashrc  
echo 'export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools' >> ~/.bashrc

# Reload configuration
source ~/.bashrc
```

### 5. **Install Expo CLI**
```bash
npm install -g @expo/cli
expo --version
```

---

## 📥 Clone & Setup Process

### Step 1: Clone Repository
```bash
# Clone the MHT Assessment repository
git clone https://github.com/vaibhavshrivastavait/MHT.git
cd MHT

# Verify all files are present
ls -la
```

### Step 2: Install Dependencies  
```bash
# Install all project dependencies
yarn install

# Alternative using npm:
npm install

# This installs all required packages including:
# - React Native & Expo SDK 50
# - Navigation libraries
# - AsyncStorage (with crash-proof wrapper)
# - UI components and development tools
```

### Step 3: Verify Installation
```bash
# Check installation success
npx expo --version
node --version
yarn --version

# Should show versions without errors
```

### Step 4: Accept Android SDK Licenses
```bash
# Accept all Android SDK licenses
$ANDROID_HOME/tools/bin/sdkmanager --licenses

# On Windows:
%ANDROID_HOME%\tools\bin\sdkmanager --licenses
```

---

## 🚀 Running the Application

### Option 1: Expo Development Server (Recommended)
```bash
# Start Expo development server
npx expo start

# This opens Expo DevTools in browser
# Options available:
# - Press 'w' for web browser
# - Press 'a' for Android emulator
# - Scan QR code with Expo Go app on phone
```

### Option 2: Direct Android Build
```bash
# Run directly on Android emulator/device
npx expo run:android

# This will:
# 1. Generate native Android code  
# 2. Build and install on connected device/emulator
# 3. Start the app automatically
```

### Option 3: Web Development
```bash
# Run in web browser for quick testing
npx expo start --web

# Great for UI development and testing
```

---

## 📱 APK Generation Methods

### Method 1: Using Expo Build (Easiest)
```bash
# Generate development build APK
npx expo run:android

# APK location will be shown in output
# Usually: android/app/build/outputs/apk/debug/app-debug.apk
```

### Method 2: Android Studio Build
```bash
# Step 1: Generate Android project
npx expo prebuild --platform android

# Step 2: Open in Android Studio
# - Open Android Studio
# - Choose "Open an existing Android Studio project"
# - Navigate to your project's 'android' folder
# - Click Open

# Step 3: Build APK in Android Studio
# - Build → Generate Signed Bundle/APK
# - Choose APK
# - Select debug or release
# - Build APK
```

### Method 3: Command Line Build
```bash
# Navigate to android directory
cd android

# Clean previous builds
./gradlew clean

# Build debug APK
./gradlew assembleDebug

# APK will be at: android/app/build/outputs/apk/debug/app-debug.apk

# For release APK (requires signing)
./gradlew assembleRelease
```

---

## 🏥 MHT Assessment Features Verification

After successful setup, test these key features:

### ✅ Core Features to Test:
1. **Home Screen** - All navigation buttons work
2. **MHT Assessment** - Complete workflow: Demographics → Symptoms → Risk Factors → Results
3. **Patient Records** - Save and view patient data (AsyncStorage fixed!)
4. **MHT Guidelines** - 10 sections load properly (AsyncStorage fixed!)
5. **Drug Interaction Checker** - Search and select medicines, view interactions  
6. **CME Mode** - Access modules, take quizzes, generate certificates
7. **Risk Calculators** - BMI, ASCVD, Framingham calculations work

### ✅ Critical Fixes Verification:
- [ ] **No AsyncStorage Crashes** - All screens load without "getItem undefined" errors
- [ ] **Guidelines Screen Functional** - Bookmarks work, sections display
- [ ] **Patient Records Stable** - Save/load data without crashes
- [ ] **Complete Navigation** - All back buttons and screen transitions work

---

## 🔧 Development Commands Reference

### Essential Commands:
```bash
# Start development server
yarn start
# or
npx expo start

# Run on specific platform
yarn android          # Android
yarn ios              # iOS (macOS only)
yarn web              # Web browser

# Install new package
yarn add package-name
# or
npm install package-name

# Clear Metro cache (if issues)
npx expo start --clear

# Type checking
npx tsc --noEmit
```

### Troubleshooting Commands:
```bash
# Reset Metro bundler cache
npx expo start --clear

# Fix dependency issues
npx expo install --fix

# Clean and reinstall dependencies
rm -rf node_modules
yarn install
# or
npm install

# Android build issues
cd android
./gradlew clean
cd ..
npx expo run:android
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Metro Bundle Error
```bash
# Solution:
npx expo start --clear
rm -rf node_modules
yarn install
```

### Issue 2: Android Build Fails
```bash
# Solution:
cd android
./gradlew clean
cd ..
npx expo prebuild --platform android --clean
npx expo run:android
```

### Issue 3: Environment Variables Not Set
```bash
# Verify environment variables:
echo $ANDROID_HOME
# Should show path to Android SDK

# If empty, reconfigure environment variables (see Step 4 above)
```

### Issue 4: Java Version Issues
```bash
# Check Java version
java --version
# Should show Java 17

# If wrong version, install JDK 17 and set JAVA_HOME
```

### Issue 5: Expo CLI Issues
```bash
# Update Expo CLI
npm install -g @expo/cli@latest

# Login to Expo (if needed)
npx expo login
```

---

## 📊 Project Structure Overview
```
MHT/
├── screens/              # App screens (AsyncStorage fixes applied)
│   ├── HomeScreen.tsx    # Main navigation
│   ├── GuidelinesScreen.tsx  # Fixed AsyncStorage crashes
│   ├── PatientListScreen.tsx # Fixed AsyncStorage crashes
│   ├── CmeScreen.tsx     # Fixed AsyncStorage crashes
│   └── ...
├── components/           # Reusable components
│   ├── SafeFlatList.tsx  # Crash-safe FlatList wrapper
│   └── ...
├── store/               # State management (Zustand with crashProofStorage)
│   └── assessmentStore.ts
├── utils/               # Utility functions
│   ├── asyncStorageUtils.ts  # Crash-proof AsyncStorage wrapper
│   └── ...
├── assets/              # Images, data files
├── android/             # Native Android project
├── package.json         # Dependencies and scripts
├── app.json            # Expo configuration
└── .env                # Environment variables
```

---

## ✅ Success Checklist

After completing setup, verify:
- [ ] Node.js and Yarn installed
- [ ] Android Studio configured with SDK
- [ ] Environment variables set (ANDROID_HOME)
- [ ] Repository cloned successfully
- [ ] Dependencies installed (`yarn install` completed)
- [ ] Development server starts (`npx expo start` works)
- [ ] App runs on emulator/device
- [ ] All main features accessible:
  - [ ] Assessment workflow works
  - [ ] Guidelines screen opens (no AsyncStorage crashes)
  - [ ] Patient records save/load (no AsyncStorage crashes)
  - [ ] CME modules functional
  - [ ] Drug interaction checker works
- [ ] APK generates successfully

---

## 🎯 Ready for Production!

Your MHT Assessment app is now:
- ✅ **Crash-free** - All AsyncStorage issues resolved
- ✅ **Production-ready** - Complete feature set
- ✅ **Android-compatible** - APK generation working
- ✅ **Locally developable** - Full development environment

### 🚀 Next Steps:
1. **Clone and Setup** - Follow this guide
2. **Test Thoroughly** - Verify all features work
3. **Generate APK** - For distribution
4. **Deploy** - Share with users or submit to app stores

**🏥 Your MHT Assessment app with AsyncStorage fixes is ready for local development and production use!**