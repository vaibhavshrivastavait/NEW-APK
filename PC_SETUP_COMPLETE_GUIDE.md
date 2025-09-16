# 🚀 MHT Assessment - Complete PC Setup Guide

## 📋 Project Information
- **Repository:** https://github.com/vaibhavshrivastavait/MHT.git
- **App Name:** MHT Assessment
- **Version:** 1.0
- **Status:** ✅ Production Ready with Fixed Build Issues

---

## 💻 **PC Prerequisites Installation**

### **1. Install Node.js (18.x or higher)**
```bash
# Windows (using chocolatey)
choco install nodejs

# Or download from: https://nodejs.org/en/download/
# Choose LTS version (18.x or higher)
```

### **2. Install Java Development Kit (JDK 17)**
```bash
# Windows - Download from Oracle or use chocolatey:
choco install openjdk17

# Or download from: https://adoptium.net/temurin/releases/
# Choose JDK 17 LTS
```

### **3. Install Android Studio & SDK**
1. Download Android Studio: https://developer.android.com/studio
2. Install Android Studio
3. During installation, make sure to install:
   - Android SDK
   - Android SDK Platform-Tools
   - Android SDK Build-Tools
   - Android Virtual Device (AVD)

### **4. Set Environment Variables (Windows)**
Add these to your system environment variables:
```bash
ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot

# Add to PATH:
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\cmdline-tools\latest\bin
%ANDROID_HOME%\emulator
%JAVA_HOME%\bin
```

### **5. Install Global NPM Packages**
```bash
npm install -g @expo/cli
npm install -g eas-cli
npm install -g sharp-cli
```

---

## 📱 **Complete APK Build Process**

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/vaibhavshrivastavait/MHT.git
cd MHT
```

### **Step 2: Install Dependencies**
```bash
npm install
```

### **Step 3: Generate Android Project**
```bash
# Use the NEW Expo CLI (not legacy expo-cli)
npx expo prebuild --platform android --clean
```

### **Step 4: Build APK**

#### **Method A: Local Gradle Build (Recommended)**
```bash
cd android
.\gradlew.bat assembleRelease

# APK will be generated at:
# android\app\build\outputs\apk\release\app-release.apk
```

#### **Method B: EAS Cloud Build (Alternative)**
```bash
eas login
eas build -p android --profile preview
```

### **Step 5: Install APK on Device**
```bash
# Method 1: Transfer APK to device and install manually
# Method 2: Use ADB (if device connected)
adb install android\app\build\outputs\apk\release\app-release.apk
```

---

## 🛠️ **Troubleshooting Common Issues**

### **If you get "expo-cli deprecated" error:**
```bash
# Don't use: expo prebuild
# Use: npx expo prebuild
```

### **If you get image processing errors:**
```bash
# Install sharp for better image processing
npm install -g sharp-cli

# Clean and rebuild
npx expo prebuild --platform android --clean
```

### **If Gradle build fails:**
```bash
cd android
.\gradlew.bat clean
.\gradlew.bat assembleRelease
```

### **If memory issues during build:**
Create `android\gradle.properties` and add:
```properties
org.gradle.jvmargs=-Xmx4096m
org.gradle.daemon=true
org.gradle.parallel=true
```

### **If Android SDK not found:**
1. Open Android Studio
2. Go to Tools → SDK Manager
3. Install:
   - Android 14 (API 34)
   - Android SDK Build-Tools 34.0.0
   - Android SDK Platform-Tools

---

## 📊 **Expected Results**

### **After Successful Build:**
- **APK Location:** `android\app\build\outputs\apk\release\app-release.apk`
- **APK Size:** ~25-35 MB
- **App Features:**
  - ✅ Professional Medical UI
  - ✅ Drug Interaction Checker (150 combinations)
  - ✅ Single recommended medicine selection
  - ✅ Multiple optional medicine selection
  - ✅ Automatic interaction checking
  - ✅ Clinical disclaimers and severity legend
  - ✅ Version 1 display in About section

---

## 🔍 **Verification Steps**

### **1. Verify Node.js Installation:**
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

### **2. Verify Java Installation:**
```bash
java -version   # Should show Java 17
```

### **3. Verify Android SDK:**
```bash
adb version     # Should show Android Debug Bridge version
```

### **4. Test Expo CLI:**
```bash
npx expo --version  # Should show Expo CLI version
```

---

## 📱 **App Features Included**

### **🏥 Medical Interface:**
- Professional pink theme (#D81B60)
- Medical terminology and branding
- Clean, clinical design

### **💊 Enhanced Drug Interaction Checker:**
- **150 Evidence-based interactions**
- **10 Primary medicine categories**
- **15 Interaction categories**
- **3 Severity levels:** HIGH (Red), MODERATE (Orange), LOW (Green)
- **Automatic checking** - no button required
- **Professional disclaimers**
- **Clinical rationale** for each interaction
- **Recommended actions** for healthcare providers

### **📋 Additional Features:**
- **Version information** (Version 1)
- **About section** with app details
- **Responsive design** for mobile devices
- **Offline-capable** (no internet required for drug checking)

---

## 🎯 **Build Success Indicators**

### **Prebuild Success:**
```
✔ Finished prebuild
```

### **Gradle Build Success:**
```
BUILD SUCCESSFUL in XXs
XX actionable tasks: XX executed
```

### **APK Generated Successfully:**
- File exists: `android\app\build\outputs\apk\release\app-release.apk`
- File size: 25-35 MB
- Can be installed on Android device

---

## 📞 **Support & Additional Resources**

### **If Build Fails:**
1. Check all prerequisites are installed
2. Verify environment variables are set
3. Try cleaning and rebuilding
4. Check Android Studio SDK Manager

### **Alternative Build Methods:**
- **Expo Go:** For development testing
- **EAS Build:** For cloud-based builds
- **Android Studio:** Direct Gradle builds

### **Useful Commands:**
```bash
# Check Expo status
npx expo doctor

# Clean Metro cache
npx expo start --clear

# Check Android devices
adb devices
```

---

## ✅ **Final Checklist Before Building**

- [ ] Node.js 18+ installed and verified
- [ ] Java JDK 17 installed and verified
- [ ] Android Studio with SDK installed
- [ ] Environment variables set correctly
- [ ] Repository cloned successfully
- [ ] Dependencies installed (`npm install` completed)
- [ ] Expo CLI working (`npx expo --version`)

---

**Repository:** https://github.com/vaibhavshrivastavait/MHT.git
**Last Updated:** $(date)
**Status:** ✅ Ready for Production Build