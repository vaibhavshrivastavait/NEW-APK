# 🏥 MHT Assessment - Complete Local PC Setup Guide

## 📋 Overview
This guide provides complete step-by-step instructions to set up the MHT Assessment app on your local PC for development and APK generation.

## 🔧 Prerequisites Installation

### 1. Install Node.js (Required)
**Windows:**
```cmd
# Download and install from https://nodejs.org/
# Recommended: LTS version (18.x or 20.x)
# Verify installation:
node --version
npm --version
```

**macOS:**
```bash
# Using Homebrew
brew install node

# Or download from https://nodejs.org/
# Verify installation:
node --version
npm --version
```

**Linux (Ubuntu/Debian):**
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation:
node --version
npm --version
```

### 2. Install Yarn (Recommended Package Manager)
```bash
npm install -g yarn
yarn --version
```

### 3. Install Git
**Windows:**
- Download from https://git-scm.com/download/win
- Install with default settings

**macOS:**
```bash
# Using Homebrew
brew install git

# Or install Xcode Command Line Tools
xcode-select --install
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install git
```

### 4. Install Android Development Environment

#### Install Java Development Kit (JDK)
**Windows/macOS/Linux:**
```bash
# Download and install JDK 17 from:
# https://adoptium.net/ or https://www.oracle.com/java/

# Verify installation:
java --version
javac --version
```

#### Install Android Studio
1. Download from https://developer.android.com/studio
2. Install with default settings
3. Open Android Studio and complete the setup wizard
4. Install Android SDK (API level 33 or higher)
5. Install Android SDK Build-Tools
6. Install Android NDK (if prompted)

#### Configure Environment Variables
**Windows:**
```cmd
# Add to System Environment Variables:
ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
ANDROID_SDK_ROOT=C:\Users\%USERNAME%\AppData\Local\Android\Sdk

# Add to PATH:
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
%ANDROID_HOME%\platform-tools
```

**macOS/Linux:**
```bash
# Add to ~/.bashrc or ~/.zshrc:
export ANDROID_HOME=$HOME/Android/Sdk
export ANDROID_SDK_ROOT=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Reload shell configuration:
source ~/.bashrc  # or ~/.zshrc
```

### 5. Install Expo CLI
```bash
npm install -g @expo/cli
expo --version
```

## 📥 Project Setup

### Step 1: Clone the Repository
```bash
# Clone the MHT Assessment repository
git clone https://github.com/vaibhavshrivastavait/MHT.git
cd MHT

# Verify files are present
ls -la
```

### Step 2: Install Dependencies
```bash
# Install all project dependencies
yarn install

# Alternative using npm:
npm install

# This will install all packages from package.json including:
# - React Native and Expo SDK
# - Navigation libraries
# - UI components
# - Development tools
```

### Step 3: Environment Configuration
```bash
# The .env file should already be included in the repository
# Verify it exists:
cat .env

# If missing, create .env file with:
echo "EXPO_PACKAGER_HOSTNAME=localhost" > .env
echo "EXPO_PUBLIC_BACKEND_URL=http://localhost:8001" >> .env
```

## 🚀 Running the Application

### Development Server (Expo)
```bash
# Start the Expo development server
npx expo start

# Or using yarn:
yarn start

# This will open Expo DevTools in your browser
# Scan QR code with Expo Go app on your phone for live testing
```

### Web Development (Browser)
```bash
# Start web version in browser
npx expo start --web

# Or press 'w' in the Expo DevTools terminal
```

### Android Emulator Setup
1. Open Android Studio
2. Go to Tools → AVD Manager
3. Create Virtual Device
4. Choose device (Pixel 4 recommended)
5. Download system image (API 33+)
6. Start emulator

```bash
# Run on Android emulator
npx expo start --android

# Or press 'a' in the Expo DevTools terminal
```

## 📱 APK Generation

### Method 1: Using Expo Build (Recommended)
```bash
# Generate development build
npx expo run:android

# This will:
# 1. Generate native Android code
# 2. Open Android Studio automatically
# 3. Build APK in Android Studio
```

### Method 2: Using Android Studio Directly
1. Generate Android project:
```bash
npx expo prebuild --platform android
```

2. Open Android Studio:
   - Open the `android` folder in Android Studio
   - Wait for Gradle sync to complete
   - Build → Generate Signed Bundle/APK
   - Choose APK
   - Select build variant (debug/release)
   - Build APK

3. APK Location:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Method 3: Command Line APK Build
```bash
# Navigate to android directory
cd android

# Clean and build
./gradlew clean
./gradlew assembleDebug

# APK will be generated at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

## 🏥 MHT Assessment Features Overview

### ✅ Core Features Available
- **Patient Assessment Workflow**: Demographics → Symptoms → Risk Factors → Results
- **Drug Interaction Checker**: 150+ drug combinations with severity ratings
- **MHT Guidelines**: 10 comprehensive clinical sections (offline-first)
- **CME Mode**: 6 learning modules with interactive quizzes and certificates
- **Risk Calculators**: BMI, ASCVD, Framingham, Gail, Wells, FRAX
- **Treatment Plan Generator**: Evidence-based MHT recommendations
- **Patient Records**: Save, view, and manage patient assessments

### ✅ Recent Critical Fixes
- **AsyncStorage Error Fixed**: No more crashes when accessing Guidelines
- **Crash-proof Storage**: Safe data persistence across all screens
- **Complete Navigation**: All back buttons and screen transitions working
- **Guidelines Functional**: 10 sections with bookmark capability
- **Stable App Performance**: No hanging or loading issues

## 🔧 Development Commands

### Essential Commands
```bash
# Start development server
yarn start

# Run on Android
yarn android

# Run on iOS (macOS only)
yarn ios

# Run on web
yarn web

# Install new package
yarn add package-name

# Install dev dependency
yarn add -D package-name

# Clear Metro cache
npx expo start --clear

# Reset project (if issues)
yarn install
npx expo install --fix
```

### Testing Commands
```bash
# Run tests (if configured)
yarn test

# Type checking
npx tsc --noEmit

# Lint code
npx expo lint
```

## 📊 Project Structure
```
MHT/
├── app/                    # Main app directory
├── screens/               # All app screens
│   ├── HomeScreen.tsx
│   ├── GuidelinesScreen.tsx
│   ├── CmeScreen.tsx
│   └── ...
├── components/            # Reusable components
│   ├── SafeDrugInteractionChecker.tsx
│   ├── SplashScreen.tsx
│   └── ...
├── store/                 # State management (Zustand)
├── utils/                 # Utility functions
├── assets/                # Images, fonts, data files
├── android/               # Android native project
├── package.json           # Dependencies and scripts
├── app.json              # Expo configuration
└── .env                  # Environment variables
```

## 🚨 Troubleshooting

### Common Issues & Solutions

#### 1. Metro Bundle Error
```bash
# Clear Metro cache
npx expo start --clear
rm -rf node_modules
yarn install
```

#### 2. Android Build Fails
```bash
# Clean Android build
cd android
./gradlew clean
cd ..
npx expo run:android
```

#### 3. Dependency Issues
```bash
# Fix dependency versions
npx expo install --fix
yarn install
```

#### 4. Java/Android Issues
- Ensure JDK 17 is installed and JAVA_HOME is set
- Verify Android SDK path in Android Studio
- Accept all Android SDK licenses:
```bash
$ANDROID_HOME/tools/bin/sdkmanager --licenses
```

#### 5. Expo CLI Issues
```bash
# Update Expo CLI
npm install -g @expo/cli@latest

# Login to Expo (if needed)
npx expo login
```

## 📱 Testing on Physical Device

### Android Testing
1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect device via USB
4. Run: `npx expo run:android --device`

### Expo Go Testing (Easier)
1. Install Expo Go from Play Store/App Store
2. Run: `npx expo start`
3. Scan QR code with Expo Go app

## 🏗️ Production Build

### For Google Play Store
```bash
# Generate production APK
cd android
./gradlew assembleRelease

# Or generate AAB (recommended for Play Store)
./gradlew bundleRelease
```

### Code Signing (for Release)
1. Generate keystore:
```bash
keytool -genkey -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. Configure in `android/gradle.properties`
3. Build signed APK/AAB

## 📞 Support & Resources

### Documentation Links
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Android Studio Guide](https://developer.android.com/studio/intro)

### MHT Assessment Specific
- All screens include comprehensive error handling
- AsyncStorage issues resolved with crash-proof wrapper
- Guidelines data included offline
- Drug interaction database pre-loaded
- CME content stored locally

## ✅ Success Checklist

After completing setup, verify:
- [ ] Node.js and Yarn installed
- [ ] Android Studio configured
- [ ] Environment variables set
- [ ] Repository cloned successfully
- [ ] Dependencies installed (`yarn install`)
- [ ] Development server starts (`yarn start`)
- [ ] App runs on emulator/device
- [ ] All main features accessible:
  - [ ] Home screen loads
  - [ ] Assessment workflow works
  - [ ] Guidelines screen opens (fixed AsyncStorage)
  - [ ] CME mode functional
  - [ ] Drug interaction checker works
- [ ] APK generates successfully

## 🎯 Next Steps

1. **Development**: Start building new features or customizing existing ones
2. **Testing**: Test thoroughly on different devices and screen sizes
3. **Deployment**: Generate production APK for distribution
4. **Updates**: Use the sync script to push changes back to GitHub

---

**🏥 MHT Assessment is now ready for local development and APK generation!**

For any issues, check the troubleshooting section or refer to the comprehensive documentation included in the project.