# 📱 APK Build Steps - After npm install

## 🎯 Two Methods to Create APK

### Method 1: EAS Build (Recommended - Cloud Build)

#### Step 1: Install EAS CLI
```bash
npm install -g @expo/eas-cli
```

#### Step 2: Login to Expo
```bash
eas login
# Create account at expo.dev if you don't have one
```

#### Step 3: Configure Build
```bash
eas build:configure
# Select Android when prompted
# This creates eas.json configuration file
```

#### Step 4: Build APK
```bash
eas build --platform android --profile preview
# This builds in the cloud and provides download link
```

#### Step 5: Download APK
- Check your terminal for the build URL
- Or visit https://expo.dev/accounts/[username]/projects/[project]/builds
- Download the APK when build completes (usually 5-10 minutes)

---

### Method 2: Local Build (Advanced)

#### Prerequisites for Local Build
**Windows:**
```powershell
# Install Android Studio
# Download from: https://developer.android.com/studio

# Install Java Development Kit (JDK 17)
winget install Eclipse.Temurin.17.JDK

# Set environment variables:
# ANDROID_HOME = C:\Users\[Username]\AppData\Local\Android\Sdk
# Add to PATH: %ANDROID_HOME%\platform-tools
# Add to PATH: %ANDROID_HOME%\tools
```

**macOS/Linux:**
```bash
# Install Android Studio and JDK
brew install --cask android-studio
brew install openjdk@17

# Add to ~/.zshrc or ~/.bashrc:
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### Step 1: Generate Native Android Code
```bash
npx expo prebuild --platform android
# This creates the android/ directory with native code
```

#### Step 2: Navigate to Android Directory
```bash
cd android
```

#### Step 3: Build Debug APK
**Windows:**
```bash
.\gradlew assembleDebug
```

**macOS/Linux:**
```bash
./gradlew assembleDebug
```

#### Step 4: Find Your APK
```bash
# APK location:
android/app/build/outputs/apk/debug/app-debug.apk

# Copy to main directory (optional)
cp app/build/outputs/apk/debug/app-debug.apk ../mht-assessment-debug.apk
```

---

## 🚀 Complete Build Process (Local Method)

### After `npm install`, run these commands:

```bash
# 1. Generate Android project
npx expo prebuild --platform android

# 2. Navigate to Android directory
cd android

# 3. Build the APK
./gradlew assembleDebug

# 4. APK is ready at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📱 Installing APK on Device

### Method 1: ADB Install (USB)
```bash
# Enable USB Debugging on your Android device
# Connect device via USB

# Install APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or if copying to main directory:
adb install mht-assessment-debug.apk
```

### Method 2: File Transfer
1. Copy APK file to your phone
2. Open file manager on phone
3. Tap the APK file
4. Allow "Install unknown apps" if prompted
5. Install the app

---

## 🔧 Build Troubleshooting

### Issue 1: Gradle Build Fails
```bash
# Clean and retry
cd android
./gradlew clean
./gradlew assembleDebug
```

### Issue 2: Android SDK Not Found
```bash
# Verify ANDROID_HOME is set
echo $ANDROID_HOME  # Should point to Android SDK

# Install SDK components via Android Studio
# Open Android Studio > SDK Manager > Install latest SDK
```

### Issue 3: Java Version Issues
```bash
# Check Java version
java -version  # Should be Java 17

# Set JAVA_HOME if needed
export JAVA_HOME=/path/to/java17
```

### Issue 4: Permission Denied (macOS/Linux)
```bash
# Make gradlew executable
chmod +x gradlew
./gradlew assembleDebug
```

---

## ⚡ Quick Build Commands Summary

### For EAS Build (Easiest):
```bash
npm install -g @expo/eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

### For Local Build:
```bash
npx expo prebuild --platform android
cd android
./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🎯 Production APK (Release Build)

For production/release APK:

### EAS Build:
```bash
eas build --platform android --profile production
```

### Local Build:
```bash
cd android
./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release-unsigned.apk
# Note: Release APK needs to be signed for distribution
```

---

## 📋 Expected Build Times

- **EAS Build:** 5-15 minutes (cloud build)
- **Local Build:** 2-10 minutes (depending on hardware)
- **First build:** Longer due to dependency downloads
- **Subsequent builds:** Faster due to caching

---

## ✅ Success Indicators

**Build successful when:**
- ✅ No error messages in terminal
- ✅ APK file exists at specified location
- ✅ APK file size > 10MB (typically 20-50MB)
- ✅ APK installs on device without errors
- ✅ App opens and shows MHT Assessment home screen

---

## 🎉 Final Steps

After successful APK build:
1. **Test on device:** Install and verify all features work
2. **Share APK:** Transfer to other devices for testing
3. **Document version:** Keep track of build versions
4. **Backup APK:** Save APK file for distribution

Your MHT Assessment app APK is now ready for use!