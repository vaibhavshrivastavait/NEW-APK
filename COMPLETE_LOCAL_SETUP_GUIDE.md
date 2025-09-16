# 📱 MHT Assessment - Complete Local Setup Guide

## 🎯 **What You're Getting**
- ✅ **Complete MHT Assessment React Native/Expo app**
- ✅ **Drug Interaction Checker** with 130+ interaction rules from JSON
- ✅ **Fixed AsyncStorage crashes** on Android devices (PatientListScreen & GuidelinesScreen)
- ✅ **Improved UI spacing** for Drug Interaction Checker results
- ✅ **Comprehensive error boundaries** and crash protection
- ✅ **All dependencies and assets** included

---

## 🛠️ **Prerequisites (Install First)**

### **1. Node.js (Required)**
- **Download**: https://nodejs.org/
- **Version**: v18.x or v20.x (LTS recommended)
- **Verify**: `node --version` should show v18+ or v20+

### **2. Expo CLI (Required)**
```bash
npm install -g @expo/cli
```

### **3. Development Tools (Optional but Recommended)**
- **Git**: https://git-scm.com/
- **VS Code**: https://code.visualstudio.com/
- **Android Studio** (for Android emulator): https://developer.android.com/studio
- **Xcode** (Mac only, for iOS simulator): https://developer.apple.com/xcode/

### **4. Mobile Testing (Optional)**
- **Expo Go app** on your phone (iOS App Store / Google Play Store)

---

## 🚀 **Step-by-Step Setup**

### **Step 1: Extract Project**
```bash
# Windows: Right-click → Extract All
# Mac/Linux:
unzip mht-assessment-complete-final.zip
cd mht-assessment
```

### **Step 2: Install Dependencies**
```bash
# Install all required packages
npm install

# If you get errors, try:
npm install --legacy-peer-deps
```

### **Step 3: Start Development Server**
```bash
# Clear cache and start
npx expo start --clear

# Or if you prefer npm scripts:
npm start
```

### **Step 4: Choose Your Platform**

#### **🌐 Web Browser (Easiest for Testing)**
- Press **`w`** in terminal, or
- Open: **http://localhost:3000**
- Best for initial testing and development

#### **📱 Mobile Device (Real Testing)**
- Press **`c`** to show QR code
- **iPhone**: Scan with Camera app → Opens in Expo Go
- **Android**: Scan with Expo Go app
- Best for final testing and user experience

#### **🖥️ Emulator/Simulator**
- Press **`i`** for iOS Simulator (Mac only)
- Press **`a`** for Android Emulator
- Best for debugging without physical device

---

## 🧪 **Testing the Key Features**

### **1. Drug Interaction Checker**
1. Navigate: **Home → Results → Drug Interaction Checker**
2. Select **"Hormone Replacement Therapy (HRT)"** as main medicine
3. Select **"Anticoagulants"** → Should show **HIGH (Red)**
4. Select **"NSAIDs"** → Should show **LOW (Yellow)**
5. Verify **spacing** between badge and rationale text
6. Check **disclaimer** at bottom

### **2. Storage Access (Previously Crashing)**
1. Navigate to **"Patient Records"** → Should load without crashes
2. Add a test patient → Should save properly
3. Navigate to **"MHT Guidelines"** → Should load without crashes
4. Add bookmarks → Should persist properly
5. Close and reopen app → Data should be restored

### **3. Cross-Platform Testing**
- Test in **web browser** first (most reliable)
- Test on **mobile device** for real user experience
- Test **orientation changes** and **responsive layout**

---

## 📂 **Project Structure Overview**

```
mht-assessment/
├── components/
│   ├── SimpleDrugInteractionChecker.tsx  # Main Drug Interaction UI
│   ├── SafeFlatList.tsx                  # Crash-safe list component
│   └── AppErrorBoundary.tsx              # App-level error handling
├── src/
│   └── interaction-aggregator.ts         # Core interaction logic (async)
├── assets/
│   └── rules/
│       └── drug_interactions.json        # 130+ interaction rules
├── public/
│   └── assets/
│       └── rules/
│           └── drug_interactions.json    # Web version
├── screens/
│   ├── PatientListScreen.tsx             # Fixed storage crashes
│   ├── GuidelinesScreen.tsx              # Fixed storage crashes
│   └── [other screens]
├── store/
│   └── assessmentStore.ts                # Zustand store with hydration tracking
├── utils/
│   └── asyncStorageUtils.ts              # Crash-proof storage wrapper
├── tests/
│   └── interaction.test.ts               # Async unit tests
├── package.json                          # Dependencies
├── app.json                             # Expo configuration
└── README.md
```

---

## 🔧 **Development Commands**

### **Basic Commands**
```bash
# Start development server
npx expo start

# Start web only
npx expo start --web

# Start with cleared cache
npx expo start --clear

# Start specific platform
npx expo start --android
npx expo start --ios
npx expo start --web
```

### **Troubleshooting Commands**
```bash
# Clear all caches
npx expo start --clear

# Reset everything
rm -rf node_modules package-lock.json .expo
npm install
npx expo start --clear

# Use different port
npx expo start --web --port 3001

# Check for issues
npx expo doctor
```

### **Testing Commands**
```bash
# Run unit tests (if Jest is configured)
npm test

# Check TypeScript
npx tsc --noEmit

# Check project configuration
npx expo config
```

---

## 🔧 **Troubleshooting Common Issues**

### **"Module not found" Errors**
```bash
# Clear everything and reinstall
rm -rf node_modules package-lock.json .expo
npm install
npx expo start --clear
```

### **"Port 3000 already in use"**
```bash
# Use different port
npx expo start --web --port 3001

# Or kill existing processes
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -ti:3000 | xargs kill -9
```

### **"Expo CLI not found"**
```bash
# Install globally
npm install -g @expo/cli

# Or use npx
npx expo start
```

### **Bundle/Metro errors**
```bash
# Clear Metro cache
npx expo start --clear

# Reset Metro config
npx expo start --reset-cache

# For persistent issues
npx expo install --fix
```

### **Android/iOS specific issues**
```bash
# Android: Make sure emulator is running
# iOS: Make sure Xcode Command Line Tools installed
xcode-select --install

# Check device connection
adb devices  # Android
xcrun simctl list  # iOS
```

---

## 📱 **Local APK Generation (No EAS)**

### **For Android APK (Local Build Only)**

#### **Prerequisites:**
- Android Studio installed
- Android SDK configured
- Java Development Kit (JDK) 11+

#### **Steps:**
```bash
# 1. Generate Android project files
npx expo run:android

# 2. Build release APK (after first run)
cd android
./gradlew assembleRelease

# 3. Find APK at:
# android/app/build/outputs/apk/release/app-release.apk
```

#### **Alternative: Expo Build (Local)**
```bash
# Install build tools
npm install -g @expo/cli

# Create development build
npx expo build:android --type apk

# Note: This requires Expo account but builds locally
```

---

## 🎯 **Success Verification Checklist**

### **✅ App Launch**
- [ ] App loads without crashes
- [ ] Splash screen appears with MHT branding
- [ ] Navigation works between screens

### **✅ Drug Interaction Checker**
- [ ] Accessible from Results screen
- [ ] HRT + Anticoagulants shows HIGH (Red) with proper spacing
- [ ] HRT + NSAIDs shows LOW (Yellow) with proper spacing
- [ ] Rationale and action text display with 16px spacing from badge
- [ ] Disclaimer appears at bottom with exact required text
- [ ] Works on web, mobile, and emulator

### **✅ Storage Access (Critical Fix)**
- [ ] Patient Records screen loads without crashes
- [ ] Can add, edit, and delete patients
- [ ] MHT Guidelines screen loads without crashes
- [ ] Can add and remove bookmarks
- [ ] Data persists between app sessions
- [ ] No "getItem of undefined" errors

### **✅ Cross-Platform**
- [ ] Web browser: All features work
- [ ] Mobile device: Real user experience testing
- [ ] Android emulator: Performance testing
- [ ] iOS simulator: Cross-platform verification

---

## 🔍 **Debug Console Monitoring**

### **Expected Success Logs:**
```
✅ AssessmentStore: Hydration completed successfully
✅ PatientListScreen: Loaded X patients after hydration
✅ GuidelinesScreen: Initialization completed successfully
[interaction-aggregator] loaded mapping entries: 130
[interaction-aggregator] lookup HRT + Anticoagulants => HIGH
```

### **Error Logs to Watch For:**
```
❌ AssessmentStore: Hydration failed
❌ PatientListScreen: Store initialization failed
❌ TypeError: Cannot read property 'getItem' of undefined
```

---

## 📋 **Key Features Implemented**

### **🔧 Critical Fixes Applied:**
1. **AsyncStorage Crash Fix**: Comprehensive hydration tracking
2. **Drug Interaction Checker**: 130+ rules from JSON with proper spacing
3. **Error Boundaries**: App-level crash protection
4. **Responsive UI**: Improved spacing and mobile optimization
5. **Cross-Platform**: Works on web, iOS, Android

### **🚀 Ready Features:**
- Complete MHT assessment workflow
- Risk factor evaluation
- Treatment recommendations
- Patient data management
- Guidelines with bookmarking
- CME modules and quizzes
- PDF export functionality

---

## 🆘 **Getting Help**

### **If You Encounter Issues:**
1. **Check Node.js version**: `node --version` (should be 18+)
2. **Clear all caches**: `npx expo start --clear`
3. **Try web first**: `npx expo start --web` (most reliable)
4. **Check console output** for specific error messages
5. **Verify file extraction** completed successfully

### **Common Success Patterns:**
- **Windows**: Web browser works most reliably for development
- **Mac**: All platforms (web, iOS, Android) should work
- **Linux**: Web and Android emulator work best

### **Support Resources:**
- **Expo Docs**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **Troubleshooting**: https://docs.expo.dev/troubleshooting/

---

## 🎉 **You're All Set!**

Once you see the MHT Assessment app running and can test:
1. ✅ Drug Interaction Checker with color-coded results
2. ✅ Patient Records without crashes
3. ✅ MHT Guidelines without crashes
4. ✅ Proper UI spacing and responsive design

**Your MHT Assessment app is ready for development and testing!** 🏥📱

---

**Note**: This setup guide focuses on local development and testing. Production deployment and app store publishing require additional configuration not covered here.