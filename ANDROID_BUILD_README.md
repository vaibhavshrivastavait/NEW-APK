# MHT Assessment - Android APK Build Guide

This guide explains how to build a **self-contained Android APK** that doesn't require Metro bundler to run on devices.

## 🎯 **What You Get**

- **Self-contained APK**: No Metro server required on device
- **Universal APK**: Single APK works on all Android architectures (arm64-v8a, armeabi-v7a, x86, x86_64)
- **Offline functionality**: All features work without internet connection
- **Debug signing**: Ready for development and testing
- **Release ready**: Can be signed for production deployment

## 📋 **Prerequisites**

### Required Tools

1. **Node.js 18+**
   ```bash
   node --version  # Should be 18.0.0 or higher
   ```

2. **Java JDK 17+**
   ```bash
   java -version   # Should be 17.0.0 or higher
   ```

3. **Android SDK with Command Line Tools**
   - Download from: https://developer.android.com/studio/command-line-tools
   - Required components:
     - Platform Tools
     - Android API 34 (targetSdkVersion)
     - Build Tools 34.0.0

4. **Environment Variables**
   ```bash
   export JAVA_HOME=/path/to/java17
   export ANDROID_HOME=/path/to/android-sdk
   export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
   ```

### Verify Setup

```bash
# Check all tools are available
java -version
node --version
yarn --version  # or npm --version
adb --version
```

## 🚀 **Quick Build (Recommended)**

### Option 1: Using Build Scripts

**Linux/macOS:**
```bash
# Debug APK (recommended for testing)
./scripts/build-standalone-apk.sh debug

# Release APK (for production)
./scripts/build-standalone-apk.sh release
```

**Windows (PowerShell):**
```powershell
# Debug APK
.\scripts\build-standalone-apk.ps1 -BuildType debug

# Release APK
.\scripts\build-standalone-apk.ps1 -BuildType release
```

### Option 2: Using NPM Scripts

```bash
# Debug APK (default)
npm run build:apk

# Debug APK (explicit)
npm run build:apk:debug

# Release APK
npm run build:apk:release

# Just bundle JavaScript (for testing)
npm run bundle:android
```

## 🔧 **Manual Build Process**

If you prefer to understand each step or need to customize the build:

### Step 1: Install Dependencies
```bash
yarn install --frozen-lockfile
# or
npm ci
```

### Step 2: Clean Previous Builds
```bash
rm -rf android/app/src/main/assets/index.android.bundle
rm -rf android/app/src/main/res/drawable-*
rm -rf android/app/src/main/res/raw
cd android && ./gradlew clean && cd ..
```

### Step 3: Create Asset Directories
```bash
mkdir -p android/app/src/main/assets
mkdir -p android/app/src/main/res
```

### Step 4: Bundle JavaScript
```bash
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res/ \
  --reset-cache
```

### Step 5: Build APK
```bash
cd android

# For debug APK
./gradlew assembleDebug

# For release APK
./gradlew assembleRelease

cd ..
```

### Step 6: Locate APK
```bash
# Debug APK location
find android/app/build/outputs/apk/debug -name "*.apk"

# Release APK location
find android/app/build/outputs/apk/release -name "*.apk"
```

## 📱 **Installation & Testing**

### Install via ADB (Recommended)

1. **Enable Developer Options** on your Android device:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Enable "USB Debugging" in Developer Options

2. **Connect device and install:**
   ```bash
   adb devices  # Verify device is connected
   adb install mht-assessment-standalone-debug.apk
   ```

3. **Launch app:**
   ```bash
   adb shell am start -n com.mht.assessment/.MainActivity
   ```

### Install via File Transfer

1. **Copy APK to device** (USB, cloud storage, etc.)
2. **Enable "Unknown Sources"** in Android Settings
3. **Open file manager** and tap the APK to install

## ✅ **Verification Checklist**

After installation, verify the APK is truly self-contained:

- [ ] **App launches without Metro**: No connection to localhost:8081
- [ ] **No JavaScript errors**: No "Enable JavaScript" messages
- [ ] **Offline functionality**: Works without internet connection
- [ ] **Patient data**: Can save and load assessments
- [ ] **CME quizzes**: All quizzes load and function
- [ ] **Risk calculators**: ASCVD, FRAX, Gail models work
- [ ] **Navigation**: All screens accessible
- [ ] **Performance**: Smooth animations and interactions

### Debug Verification

```bash
# Monitor logs while testing
adb logcat | grep -i "metro\|packager\|localhost"

# Should show NO Metro/packager connection attempts
```

## 🔒 **Production Release Signing**

For production release, you'll need to sign the APK:

### Generate Release Keystore

```bash
keytool -genkey -v -keystore mht-release-key.keystore \
  -alias mht-assessment -keyalg RSA -keysize 2048 -validity 10000
```

### Configure Signing in android/app/build.gradle

```gradle
android {
    signingConfigs {
        release {
            storeFile file('../mht-release-key.keystore')
            storePassword 'your-store-password'
            keyAlias 'mht-assessment'
            keyPassword 'your-key-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            // ... other config
        }
    }
}
```

### Build Signed Release

```bash
cd android
./gradlew assembleRelease
cd ..
```

## 🤖 **Automated CI/CD**

The project includes GitHub Actions workflow for automated APK building:

- **Trigger**: Push to main/develop, tags, or manual dispatch
- **Outputs**: 
  - APK artifacts uploaded to GitHub Actions
  - Automatic releases on version tags
- **File**: `.github/workflows/build-apk.yml`

### Manual GitHub Actions Build

1. Go to your GitHub repository
2. Click "Actions" tab
3. Select "Build Android APK" workflow
4. Click "Run workflow"
5. Choose build type (debug/release)
6. Download APK from artifacts

## 🐛 **Troubleshooting**

### Common Issues

**"Bundle file not found"**
```bash
# Ensure bundling step completed successfully
ls -la android/app/src/main/assets/index.android.bundle
```

**"Java version incompatible"**
```bash
# Use Java 17
export JAVA_HOME=/path/to/java-17
java -version
```

**"Android SDK not found"**
```bash
# Set Android SDK path
export ANDROID_HOME=/path/to/android-sdk
echo $ANDROID_HOME
```

**"Metro bundling fails"**
```bash
# Clear caches
npm start -- --reset-cache
rm -rf node_modules/.cache
yarn install
```

**"APK too large"**
- Consider enabling Proguard for release builds
- Check if all assets are necessary
- Use APK Analyzer to identify large files

### File Watcher Limits (Linux)

If you encounter "ENOSPC" errors:
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## 📊 **Build Configuration Details**

### APK Configuration
- **Min SDK Version**: 23 (Android 6.0)
- **Target SDK Version**: 34 (Android 14)
- **Architecture**: Universal APK (all ABIs included)
- **JavaScript Engine**: Hermes (enabled)
- **Bundle Format**: JavaScript bundle embedded in assets

### Build Flags
- `--dev false`: Production-like bundle
- `--reset-cache`: Clean Metro cache
- Universal APK: No ABI splits (single APK for all architectures)

### Security Notes
- Debug keystore is included for development
- Production builds should use your own release keystore
- Never commit production keystores to version control

## 📞 **Support**

If you encounter issues:

1. **Check logs**: `adb logcat | grep MHTAssessment`
2. **Verify bundle**: Ensure `index.android.bundle` exists and has content
3. **Test on different devices**: Try various Android versions
4. **Clean build**: Delete `android/app/build` and rebuild

## 🎉 **Success!**

Once built successfully, you'll have:
- `mht-assessment-standalone-debug.apk` - Ready for development testing
- `mht-assessment-standalone-release.apk` - Ready for production (if signed)

The APK is completely self-contained and will run on any Android device without requiring Metro bundler or development environment.