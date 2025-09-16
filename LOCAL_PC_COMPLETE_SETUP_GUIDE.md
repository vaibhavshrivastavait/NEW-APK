# 📱 MHT Assessment - Complete Local PC Setup Guide

## 📦 PROJECT DOWNLOAD

**Compressed File**: `MHT_Assessment_FIXED_SPLASH_PROJECT.tar.gz`
**Size**: 166MB (compressed)
**Location**: `/app/MHT_Assessment_FIXED_SPLASH_PROJECT.tar.gz`
**Format**: TAR.GZ compressed archive

## 💾 STEP 1: DOWNLOAD PROJECT

1. Download the file `MHT_Assessment_FIXED_SPLASH_PROJECT.tar.gz` from the Emergent platform
2. Save it to your preferred location (e.g., `C:\Projects\` or `~/Projects/`)

## 🛠️ STEP 2: INSTALL PREREQUISITES

### Required Software:

#### A. Node.js (v18 or higher)
```bash
# Download and install from: https://nodejs.org/
# Verify installation:
node --version
npm --version
```

#### B. Yarn Package Manager
```bash
# Install globally:
npm install -g yarn

# Verify installation:
yarn --version
```

#### C. Expo CLI
```bash
# Install globally:
npm install -g @expo/cli

# Verify installation:
npx expo --version
```

#### D. Git (Optional but recommended)
```bash
# Download from: https://git-scm.com/
# Verify installation:
git --version
```

### For Android APK Building (Optional):

#### E. Java 17 JDK
```bash
# Download from: https://adoptium.net/
# Set JAVA_HOME environment variable
# Verify: java --version
```

#### F. Android Studio
```bash
# Download from: https://developer.android.com/studio
# Install Android SDK through Android Studio
# Set ANDROID_HOME environment variable
```

## 📂 STEP 3: EXTRACT PROJECT

### Windows:
```cmd
# Using built-in Windows extractor or 7-Zip:
# Right-click → Extract All
# Or use command line:
tar -xzf MHT_Assessment_FIXED_SPLASH_PROJECT.tar.gz
```

### macOS/Linux:
```bash
tar -xzf MHT_Assessment_FIXED_SPLASH_PROJECT.tar.gz
```

This will create an `app` folder with the complete project.

## 🚀 STEP 4: PROJECT SETUP

### Navigate to Project Directory:
```bash
cd app
```

### Install Dependencies:
```bash
# Install all Node.js dependencies (this will take 5-10 minutes)
yarn install
```

**Expected Output:**
- Downloads ~678MB of node_modules
- Installs all React Native, Expo, and project dependencies
- Creates yarn.lock file

## ▶️ STEP 5: START DEVELOPMENT SERVER

```bash
# Start Expo development server
npx expo start

# Alternative command:
yarn start
```

**Expected Output:**
```
Starting project at /path/to/app
Starting Metro Bundler
› Port 19000 is running this app in development mode
› Port 19001 is running the bundler
Logs for your project will appear below.

QR Code will be displayed here

› Web: http://localhost:19006
› iOS: exp://192.168.x.x:19000
› Android: exp://192.168.x.x:19000
```

## 📱 STEP 6: TEST THE APPLICATION

### Option A: Web Browser Testing
1. Open the provided web URL (usually `http://localhost:19006`)
2. **Expected Result**:
   - Light pink splash screen with MHT logo
   - "MHT Assessment" and "Clinical Decision Support" text
   - Loading animation dots
   - Transition to home screen after 1 second

### Option B: Mobile Device Testing (Expo Go)
1. **Install Expo Go** on your phone:
   - iOS: App Store → "Expo Go"
   - Android: Google Play → "Expo Go"

2. **Connect to Same WiFi** as your PC

3. **Scan QR Code** displayed in terminal with Expo Go app

4. **Expected Result**:
   - App loads on your phone
   - Splash screen shows MHT branding
   - All features work (Patient Records, Guidelines, etc.)
   - No AsyncStorage crashes

### Option C: Android Emulator
1. **Open Android Studio**
2. **Start AVD Manager** → Create/Start emulator
3. **In terminal, press 'a'** to open on Android emulator
4. **Test splash screen and functionality**

## 🔨 STEP 7: BUILD APK FOR PHYSICAL DEVICE

### Method 1: EAS Build (Recommended)
```bash
# Install EAS CLI if not already installed
npm install -g @expo/eas-cli

# Login to Expo account (create free account if needed)
eas login

# Configure build (one-time setup)
eas build:configure

# Build APK
eas build --platform android --profile preview

# Wait for build to complete (10-15 minutes)
# Download APK when ready
```

### Method 2: Local Android Build
```bash
# Prerequisites: Android Studio, Android SDK, Java 17

# Generate Android project
npx expo prebuild --platform android --clean

# Navigate to Android directory
cd android

# Build APK (Windows)
.\gradlew assembleRelease

# Build APK (macOS/Linux)
./gradlew assembleRelease

# APK Location: android/app/build/outputs/apk/release/app-release.apk
```

## ✅ STEP 8: VERIFICATION CHECKLIST

### Development Server:
- [ ] Expo development server starts without errors
- [ ] Web preview loads with MHT splash screen
- [ ] QR code displays for mobile testing
- [ ] Hot reloading works when making changes

### Splash Screen (Fixed):
- [ ] Light pink background (#FDE7EF)
- [ ] Circular MHT logo in brand pink
- [ ] "MHT Assessment" title text
- [ ] "Clinical Decision Support" subtitle
- [ ] Loading animation dots
- [ ] Smooth transition to home screen

### Core Functionality:
- [ ] Home screen loads with all navigation options
- [ ] Patient Records navigation works (no AsyncStorage crash)
- [ ] MHT Guidelines navigation works (no AsyncStorage crash)
- [ ] Assessment flow: Demographics → Symptoms → Risk Factors → Results
- [ ] All data saves properly

### APK Testing (After Build):
- [ ] Custom MHT logo as app icon (not generic Android)
- [ ] Native splash screen with branding
- [ ] App launches without crashes
- [ ] Works offline in airplane mode
- [ ] All features functional on physical device

## 🛠️ TROUBLESHOOTING

### Common Issues:

#### 1. "Command not found" errors
```bash
# Ensure Node.js and Yarn are installed
node --version
yarn --version

# Reinstall if needed
```

#### 2. Port already in use
```bash
# Kill existing processes
npx expo start --clear

# Or specify different port
npx expo start --port 19001
```

#### 3. Expo Go connection issues
- Ensure PC and phone are on same WiFi network
- Try tunnel mode: `npx expo start --tunnel`
- Check firewall settings

#### 4. Dependencies installation fails
```bash
# Clear cache and reinstall
rm -rf node_modules
rm yarn.lock
yarn install
```

#### 5. Android build fails
```bash
# Verify Android environment
echo $ANDROID_HOME
java --version

# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleRelease
```

## 📁 PROJECT STRUCTURE

```
app/
├── android/                    # Android native project
│   └── app/src/main/res/      # Generated Android assets
├── assets/                    # App assets and branding
├── components/                # React components
│   └── SplashScreen.tsx      # Fixed splash screen
├── screens/                   # App screens
├── store/                     # State management
├── utils/                     # Utility functions
│   └── asyncStorageUtils.ts  # Safe AsyncStorage wrapper
├── app.json                  # Expo configuration
├── package.json             # Dependencies
└── .env                     # Environment variables
```

## 🎯 EXPECTED TIMELINE

- **Download**: 2-5 minutes (depending on internet speed)
- **Prerequisites Installation**: 15-30 minutes (first time)
- **Project Extraction**: 1 minute
- **Dependencies Installation**: 5-10 minutes
- **Development Server Start**: 1-2 minutes
- **APK Build**: 10-15 minutes (EAS) or 5-10 minutes (local)

**Total Setup Time**: ~30-60 minutes for complete setup and testing

## 🎉 SUCCESS INDICATORS

You'll know everything is working when:
1. ✅ Development server runs without errors
2. ✅ Splash screen shows MHT logo and branding (not just pink background)
3. ✅ App transitions smoothly to home screen
4. ✅ Patient Records and Guidelines don't crash
5. ✅ APK installs and runs on Android device
6. ✅ Custom app icon appears in launcher

## 📞 SUPPORT

If you encounter issues:
1. Check error messages in terminal
2. Verify all prerequisites are installed correctly
3. Ensure network connectivity for dependencies
4. Try clearing cache: `npx expo start --clear`
5. Check firewall/antivirus settings

The project is now ready for local development with all fixes implemented:
- ✅ Splash screen displays MHT branding
- ✅ AsyncStorage crashes prevented
- ✅ Android assets generated
- ✅ Offline functionality ready
- ✅ Production APK buildable

**You're all set to build and test the MHT Assessment app! 🚀**