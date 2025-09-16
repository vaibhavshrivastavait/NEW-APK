# 🚀 MHT Assessment - Complete Local Development Guide

## 📦 Package Contents

This complete package includes:
- ✅ **Complete source code** (all screens, components, utilities)
- ✅ **node_modules/** (all dependencies pre-installed - ~448MB)
- ✅ **android/** (complete native Android project)
- ✅ **ios/** (complete native iOS project)
- ✅ **All assets** (medical data, icons, images)
- ✅ **Build configurations** (metro, babel, gradle)

## 🔧 System Requirements

### Windows Requirements:
- **Node.js**: 18.x or higher ([Download](https://nodejs.org/))
- **Java JDK**: 17 ([Download](https://adoptium.net/))
- **Android Studio**: Latest version ([Download](https://developer.android.com/studio))
- **Git**: For version control ([Download](https://git-scm.com/))

### macOS/Linux Requirements:
- **Node.js**: 18.x or higher
- **Java JDK**: 17
- **Android Studio**: Latest version
- **Xcode**: (macOS only, for iOS builds)

## 🚀 Quick Start - Web Preview

### 1. Extract Package
```bash
# Windows
tar -xzf MHT-Assessment-COMPLETE-WITH-DEPENDENCIES.tar.gz
cd MHT-Assessment

# Or if using 7-Zip on Windows
# Extract MHT-Assessment-COMPLETE-WITH-DEPENDENCIES.tar.gz
# cd MHT-Assessment
```

### 2. Start Metro Web Server (IMMEDIATE)
```bash
# No need to run npm install - dependencies are included!

# Start Metro bundler with web support
npx expo start --web
```

**Expected Output:**
```
Starting Metro Bundler
› Metro waiting on exp://192.168.1.100:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS).
› Press a │ open Android
› Press i │ open iOS simulator  
› Press w │ open web
› Press r │ reload app
› Press m │ toggle menu
```

### 3. Open Web App
- **Automatic**: Browser should open automatically at `http://localhost:19006`
- **Manual**: Open browser and go to `http://localhost:19006`
- **Alternative**: Press `w` in the Metro terminal

## 📱 Android APK Build Process

### 1. Environment Setup
```bash
# Set environment variables (Windows)
set JAVA_HOME=C:\Program Files\Java\jdk-17
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
set PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools

# Set environment variables (macOS/Linux)
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
export ANDROID_HOME=~/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools
```

### 2. Generate Android Project (if needed)
```bash
# Only run if android/ folder is missing or corrupted
npx expo prebuild --platform android --clean
```

### 3. Build APK
```bash
cd android

# Windows
gradlew.bat clean
gradlew.bat assembleDebug

# macOS/Linux  
chmod +x gradlew
./gradlew clean
./gradlew assembleDebug
```

### 4. Install APK on Device
```bash
# Debug APK location
android/app/build/outputs/apk/debug/app-debug.apk

# Install on connected device
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or install with replacement
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## 🌐 Web App Features (Local Metro)

When you run `npx expo start --web`, you'll have access to:

### ✅ Complete MHT Assessment Features:
- **Patient Assessment Tools**: ASCVD, Gail, FRAX risk calculators
- **Drug Interaction Checker**: 150+ HRT combinations with severity levels
- **CME Education System**: Interactive medical education modules
- **Evidence-Based Decision Support**: Treatment recommendations
- **Clinical Guidelines**: Medical reference content
- **Export Functions**: PDF and Excel report generation
- **Professional Medical UI**: Complete clinical interface

### 🔧 Development Features:
- **Hot Reload**: Changes reflect immediately
- **Error Overlays**: Detailed error information
- **Performance Monitor**: React DevTools integration
- **Network Inspector**: API call monitoring
- **Console Logs**: Real-time debugging

## 📋 Troubleshooting

### Web Preview Issues:
```bash
# Clear Metro cache
npx expo start --web --clear

# Reset Metro bundler
npx expo start --web --reset-cache

# Fix port conflicts
npx expo start --web --port 19007
```

### Android Build Issues:
```bash
# Clean everything
cd android
gradlew.bat clean
cd ..
npx expo prebuild --platform android --clean

# Fix Gradle wrapper permissions (macOS/Linux)
chmod +x android/gradlew

# Update Gradle wrapper
cd android
gradlew.bat wrapper --gradle-version 7.6
```

### Common Fixes:
```bash
# Node modules issues (if needed)
rm -rf node_modules
npm install

# Clear all caches
npx expo start --clear
cd android && gradlew.bat clean && cd ..

# Check Java version
java -version
# Should show Java 17

# Check Android SDK
echo $ANDROID_HOME
# Should point to Android SDK location
```

## 🎯 Expected Results

### Web Preview:
- **URL**: http://localhost:19006
- **Load Time**: 10-30 seconds initial load
- **Features**: All MHT Assessment screens and functionality
- **Hot Reload**: Changes reflect within 2-3 seconds

### Mobile APK:
- **Build Time**: 5-15 minutes (first build)
- **APK Size**: 25-50MB
- **Install Time**: 30-60 seconds
- **Launch Time**: 2-5 seconds

## 🏥 Medical App Verification

### Test Checklist:
- [ ] **Home Screen**: All 8 feature cards display and respond to clicks
- [ ] **Patient Assessment**: Risk calculators (ASCVD, Gail, FRAX) function
- [ ] **Drug Interaction Checker**: 150+ combinations with color-coded severity
- [ ] **CME Education**: Interactive quiz modules with scoring
- [ ] **Treatment Plans**: Evidence-based recommendations display
- [ ] **Export Functions**: PDF and Excel generation works
- [ ] **Navigation**: All screens accessible and back buttons work
- [ ] **Offline Mode**: App functions without internet connection

## 📊 Development Commands

### Useful Commands:
```bash
# Start development server
npx expo start

# Start with specific platform
npx expo start --web
npx expo start --android
npx expo start --ios

# Clear caches
npx expo start --clear

# Bundle for production
npx expo export --platform web

# Check dependencies
npm list
yarn list

# Update dependencies
npx expo install --fix

# Check Expo CLI version
npx expo --version
```

## 🔧 Advanced Configuration

### Metro Configuration:
The project includes optimized `metro.config.js` for:
- Medical data file handling
- Asset optimization
- TypeScript support
- Web compatibility

### Build Configuration:
- **Android**: Optimized for API 24+ (Android 7.0+)
- **iOS**: Ready for iOS 11+ deployment
- **Web**: Progressive Web App capabilities

## 🎉 Success Indicators

### Web Preview Working:
- Browser opens automatically
- MHT Assessment title displays
- All feature cards are clickable
- Navigation between screens works
- Medical calculators function
- Drug interaction checker displays properly

### Mobile APK Working:
- APK builds without errors
- App installs on device successfully
- All screens render properly
- Touch interactions work
- Medical features function offline
- No crashes during normal use

---

## 🏆 Complete Medical Assessment App

This package contains a **production-ready clinical decision support application** with:
- Evidence-based medical algorithms
- Comprehensive drug interaction database
- Professional medical UI/UX
- Offline-first architecture
- HIPAA-compliant local storage
- Complete error handling

**Package Date**: September 14, 2025  
**Version**: 1.0.0 (Production Release)  
**Dependencies**: All included (no internet required for build)