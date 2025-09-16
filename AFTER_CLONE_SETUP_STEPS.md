# 🚀 MHT Assessment - Complete Setup After GitHub Clone

## 📋 Prerequisites Check
Before proceeding, ensure you have these installed:
- [ ] **Node.js** (version 18.x or 20.x) - [Download here](https://nodejs.org/)
- [ ] **Android Studio** - [Download here](https://developer.android.com/studio)
- [ ] **Java JDK 17** - [Download here](https://adoptium.net/)
- [ ] **Git** - [Download here](https://git-scm.com/)

## 🔧 Step-by-Step Setup Process

### Step 1: Clone Repository (If Not Done Already)
```bash
git clone https://github.com/vaibhavshrivastavait/MHT.git
cd MHT
```

### Step 2: Install Dependencies
```bash
# Install project dependencies
yarn install

# Alternative using npm:
npm install

# This installs all packages from package.json including:
# - React Native & Expo SDK 50
# - Navigation libraries  
# - UI components
# - Development tools
```

### Step 3: Verify Installation
```bash
# Check if installation was successful
npx expo --version
node --version
yarn --version

# Should show versions without errors
```

### Step 4: Install Global Tools
```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Verify Expo CLI installation
expo --version
```

### Step 5: Configure Android Environment

#### 5a. Set Environment Variables

**Windows (PowerShell as Administrator):**
```powershell
# Set ANDROID_HOME environment variable
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

# Reload shell configuration
source ~/.bashrc
```

#### 5b. Accept Android SDK Licenses
```bash
# Accept all Android SDK licenses
$ANDROID_HOME/tools/bin/sdkmanager --licenses

# On Windows:
%ANDROID_HOME%\tools\bin\sdkmanager --licenses
```

### Step 6: Set Up Android Emulator (Optional)
1. Open Android Studio
2. Go to **Tools → AVD Manager**
3. Click **Create Virtual Device**
4. Choose **Pixel 4** or **Pixel 6**
5. Download **Android 13 (API 33)** system image
6. Create and start emulator

## 🚀 Running the Application

### Option 1: Development Server (Recommended)
```bash
# Start Expo development server
npx expo start

# This opens Expo DevTools in your browser
# Choose your preferred testing method:
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

# Opens in your default browser
# Great for UI development and testing
```

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

## 🏥 Testing MHT Assessment Features

After successful build, test these key features:

### Core Features to Test:
1. **Home Screen** - All navigation buttons work
2. **Patient Assessment** - Complete workflow: Demographics → Symptoms → Risk Factors → Results  
3. **MHT Guidelines** - 10 sections load (AsyncStorage fix applied)
4. **Drug Interaction Checker** - Search and select medicines, view interactions
5. **CME Mode** - Access modules, take quizzes, generate certificates
6. **Risk Calculators** - BMI, ASCVD, Framingham calculations work
7. **Patient Records** - Save and view patient data

### Critical Fixes Verification:
- [ ] **Guidelines Screen Loads** (no AsyncStorage error)
- [ ] **Bookmarks Work** in Guidelines
- [ ] **All Navigation Works** (back buttons, screen transitions)
- [ ] **No App Crashes** during normal usage

## 🔧 Development Commands

### Essential Commands:
```bash
# Start development server
npm start
# or
yarn start

# Install new package
npm install package-name
# or  
yarn add package-name

# Clear Metro cache (if issues)
npx expo start --clear

# Type checking
npx tsc --noEmit

# Run on specific platform
npx expo run:android    # Android
npx expo run:ios        # iOS (macOS only)
npx expo start --web    # Web browser
```

### Troubleshooting Commands:
```bash
# Reset Metro bundler cache
npx expo start --clear

# Fix dependency issues
npx expo install --fix

# Clean and reinstall dependencies
rm -rf node_modules
npm install
# or
yarn install

# Android build issues
cd android
./gradlew clean
cd ..
npx expo run:android
```

## 🚨 Common Issues & Solutions

### Issue 1: Metro Bundle Error
```bash
# Solution:
npx expo start --clear
rm -rf node_modules
npm install
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

### Issue 3: Dependency Version Conflicts
```bash
# Solution:
npx expo install --fix
npm install
```

### Issue 4: ANDROID_HOME Not Found
```bash
# Verify environment variables:
echo $ANDROID_HOME
# Should show path to Android SDK

# If empty, reconfigure environment variables (see Step 5a)
```

### Issue 5: Java Version Issues
```bash
# Check Java version
java --version
# Should show Java 17

# If wrong version, install JDK 17 and set JAVA_HOME
```

## 📊 Project Structure Overview
```
MHT/
├── screens/              # App screens
│   ├── HomeScreen.tsx    # Main navigation
│   ├── GuidelinesScreen.tsx  # Fixed AsyncStorage
│   ├── CmeScreen.tsx     # CME modules
│   └── ...
├── components/           # Reusable components  
├── store/               # State management (Zustand)
├── utils/               # Utility functions
│   └── asyncStorageUtils.ts  # Crash-proof storage
├── assets/              # Images, data files
├── android/             # Native Android project
├── package.json         # Dependencies
├── app.json            # Expo configuration
└── .env                # Environment variables
```

## ✅ Success Checklist

After completing setup, verify:
- [ ] Dependencies installed successfully (`node_modules` folder exists)
- [ ] Development server starts (`npm start` works)
- [ ] Android emulator/device connects
- [ ] App builds and runs without errors
- [ ] All main features accessible:
  - [ ] Assessment workflow works
  - [ ] Guidelines screen opens (AsyncStorage fixed)
  - [ ] Drug interaction checker functional
  - [ ] CME modules load
  - [ ] Patient records save/load
- [ ] APK generates successfully

## 🎯 Ready for Development!

Your MHT Assessment app is now fully set up for:
- ✅ **Local Development** - Make changes and see live updates
- ✅ **APK Generation** - Create installable Android apps  
- ✅ **Feature Testing** - All 7 major features working
- ✅ **Production Builds** - Ready for Play Store submission

### Next Steps:
1. **Customize Features** - Modify screens, add new functionality
2. **Test Thoroughly** - Verify all features work on target devices
3. **Generate Release APK** - For distribution
4. **Deploy** - Share with users or submit to app stores

**🏥 Your MHT Assessment app is production-ready with all critical fixes applied!**