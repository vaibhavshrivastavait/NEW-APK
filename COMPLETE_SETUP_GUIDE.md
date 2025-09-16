# 🚀 MHT Assessment - Complete Setup Guide

## 📋 Project Status
- ✅ **Version:** 1
- ✅ **Status:** Production Ready
- ✅ **Features:** Complete with 150 drug interactions
- ✅ **UI:** Professional medical interface
- ✅ **Platform:** Web preview working, APK ready for build

---

## 🔄 GitHub Repository Sync

### Option 1: Manual GitHub Sync (Recommended)

1. **Download Project Files:**
   ```bash
   # From your local machine, clone the current state
   git clone https://github.com/vaibhavshrivastavait/MHT-FINAL.git
   cd MHT-FINAL
   ```

2. **Copy Files from Emergent Environment:**
   - Download the complete `/app` directory from this environment
   - Replace all files in your local repository
   - **Key Updated Files:**
     - `components/SafeDrugInteractionChecker.tsx` (Enhanced with 150 interactions)
     - `assets/rules/drug_interactions.json` (150 combinations)
     - `screens/SettingsScreen.tsx` (Added version 1)
     - `index.js` (Current entry point)

3. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "MHT Assessment v1 - Complete with 150 drug interactions"
   git push origin main
   ```

### Option 2: Direct Repository Update

If you have GitHub credentials configured:
```bash
cd /app
git remote set-url origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/vaibhavshrivastavait/MHT-FINAL.git
git push origin main
```

---

## 📱 APK Build Instructions for Local PC

### Prerequisites Installation

1. **Install Node.js (18.x or higher):**
   ```bash
   # Windows (using chocolatey)
   choco install nodejs

   # macOS (using homebrew)
   brew install node

   # Linux (Ubuntu/Debian)
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install Java Development Kit (JDK 17):**
   ```bash
   # Windows - Download from Oracle or use:
   choco install openjdk17

   # macOS
   brew install openjdk@17

   # Linux
   sudo apt install openjdk-17-jdk
   ```

3. **Install Android Studio & SDK:**
   - Download Android Studio from: https://developer.android.com/studio
   - Install Android SDK (API 34 recommended)
   - Set environment variables:
     ```bash
     export ANDROID_HOME=$HOME/Android/Sdk
     export PATH=$PATH:$ANDROID_HOME/emulator
     export PATH=$PATH:$ANDROID_HOME/platform-tools
     export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
     ```

4. **Install Expo CLI:**
   ```bash
   npm install -g @expo/cli
   npm install -g eas-cli
   ```

### Build Process

1. **Clone and Setup Project:**
   ```bash
   git clone https://github.com/vaibhavshrivastavait/MHT-FINAL.git
   cd MHT-FINAL
   npm install
   ```

2. **Configure for Production Build:**
   ```bash
   # Create app.json if not exists
   expo install
   ```

3. **Build APK (Local Build):**
   ```bash
   # Method 1: Local build (requires Android SDK)
   expo run:android --variant release

   # Method 2: EAS Build (cloud-based)
   eas login
   eas build -p android --profile preview
   ```

4. **Alternative: Direct APK Generation:**
   ```bash
   # Generate Android project
   expo prebuild --platform android

   # Navigate to android directory
   cd android

   # Build release APK
   ./gradlew assembleRelease

   # APK will be generated at:
   # android/app/build/outputs/apk/release/app-release.apk
   ```

### Environment Configuration

Create `.env` file in project root:
```env
EXPO_PUBLIC_API_URL=https://your-api-url.com
EXPO_PUBLIC_BACKEND_URL=https://your-backend-url.com
```

### Key Build Files

Ensure these files are properly configured:

1. **app.json:**
   ```json
   {
     "expo": {
       "name": "MHT Assessment",
       "slug": "mht-assessment",
       "version": "1.0.0",
       "platforms": ["ios", "android", "web"],
       "android": {
         "package": "com.mht.assessment",
         "versionCode": 1,
         "compileSdkVersion": 34,
         "targetSdkVersion": 34,
         "buildToolsVersion": "34.0.0"
       }
     }
   }
   ```

2. **package.json (Key Dependencies):**
   ```json
   {
     "dependencies": {
       "expo": "~50.0.0",
       "react": "18.2.0",
       "react-native": "0.73.6",
       "@react-navigation/native": "^6.1.9",
       "@react-navigation/native-stack": "^6.9.17",
       "react-native-safe-area-context": "4.8.2",
       "react-native-screens": "~3.29.0"
     }
   }
   ```

---

## 🏥 Current App Features

### ✅ Completed Features:
- **Professional Medical UI** with MHT branding
- **Drug Interaction Checker** with 150 evidence-based combinations
- **Single Recommended Medicine Selection** (radio button style)
- **Multiple Optional Medicine Selection** (highlight style)
- **Automatic Interaction Checking** (no button required)
- **Severity Legend** (Low, Moderate, High with clinical descriptions)
- **Professional Medical Disclaimer** (legal compliance)
- **Version Information** (Version 1 in About section)
- **Responsive Design** for mobile and web
- **Professional Color Scheme** (#D81B60 primary)

### 📊 Drug Interaction Database:
- **150 Total Interactions**
- **10 Primary Categories** (HRT, SERMs, Tibolone, etc.)
- **15 Interaction Categories** (Anticoagulants, Anticonvulsants, etc.)
- **3 Severity Levels** (HIGH, MODERATE, LOW)
- **Clinical Rationale** for each interaction
- **Recommended Actions** for healthcare providers

---

## 🐛 Troubleshooting

### Common Build Issues:

1. **Gradle Build Failure:**
   ```bash
   cd android
   ./gradlew clean
   ./gradlew assembleRelease
   ```

2. **Metro Bundle Error:**
   ```bash
   npx react-native start --reset-cache
   ```

3. **Android SDK Issues:**
   ```bash
   # Check SDK installation
   sdkmanager --list
   
   # Install required platforms
   sdkmanager "platforms;android-34"
   sdkmanager "build-tools;34.0.0"
   ```

4. **Memory Issues:**
   ```bash
   # Increase heap size in gradle.properties
   echo "org.gradle.jvmargs=-Xmx4096m" >> android/gradle.properties
   ```

### Build Optimization:

1. **Enable Proguard (Optional):**
   ```gradle
   // android/app/build.gradle
   buildTypes {
       release {
           minifyEnabled true
           proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
       }
   }
   ```

2. **Reduce APK Size:**
   ```gradle
   android {
       splits {
           abi {
               enable true
               reset()
               include "arm64-v8a", "armeabi-v7a"
           }
       }
   }
   ```

---

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Verify all prerequisites are installed
3. Ensure Android SDK environment variables are set
4. Try cleaning and rebuilding the project

**Final APK Location:** `android/app/build/outputs/apk/release/app-release.apk`

---

**Last Updated:** $(date)
**Version:** 1.0.0
**Status:** ✅ Production Ready