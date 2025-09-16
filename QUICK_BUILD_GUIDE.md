# 🚀 Quick APK Build Guide - MHT Assessment

## **TL;DR - Build APK in 3 Commands**

```bash
# 1. Install dependencies
yarn install

# 2. Build self-contained debug APK
./scripts/build-standalone-apk.sh debug

# 3. Install on Android device
adb install mht-assessment-standalone-debug.apk
```

## **Prerequisites (5 minutes setup)**

1. **Install Java 17**:
   ```bash
   # Ubuntu/Debian
   sudo apt install openjdk-17-jdk
   
   # macOS
   brew install openjdk@17
   
   # Windows
   # Download from: https://adoptium.net/
   ```

2. **Install Android SDK**:
   ```bash
   # Download command line tools from:
   # https://developer.android.com/studio/command-line-tools
   
   # Extract and set environment
   export ANDROID_HOME=/path/to/android-sdk
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

3. **Install SDK packages**:
   ```bash
   sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
   ```

## **Build Options**

### Option 1: Automated Script (Recommended)
```bash
# Debug APK (for testing)
./scripts/build-standalone-apk.sh debug

# Release APK (for production)
./scripts/build-standalone-apk.sh release
```

### Option 2: NPM Scripts
```bash
# Debug APK
npm run build:apk

# Release APK  
npm run build:apk:release
```

### Option 3: GitHub Actions (No local setup needed!)
1. Fork the repository
2. Go to Actions → "Build Android APK" → Run workflow
3. Download APK from artifacts

## **Installation**

### Method 1: ADB (Developer)
```bash
adb install mht-assessment-standalone-debug.apk
```

### Method 2: Sideload (End User)
1. Copy APK to Android device
2. Enable "Unknown Sources" in Settings
3. Tap APK file to install

## **Verification**

✅ **The APK should:**
- Install without errors
- Launch without Metro connection
- Work completely offline
- Save patient data
- Run CME quizzes
- Calculate risk scores

❌ **If you see:**
- "Enable JavaScript to run this app" → Bundle failed
- App connects to localhost:8081 → Not self-contained
- White screen on launch → Check adb logcat for errors

## **Build Artifacts**

After successful build:
- `mht-assessment-standalone-debug.apk` (20-30 MB)
- Universal APK (works on all Android architectures)
- Self-contained (no Metro server required)
- Signed with debug keystore (ready for testing)

## **Troubleshooting**

**"Java not found"** → Install OpenJDK 17+
**"Android SDK not found"** → Set ANDROID_HOME environment variable  
**"Bundle failed"** → Run `npm start -- --reset-cache` first
**"APK not found"** → Check `android/app/build/outputs/apk/debug/`

## **Production Ready**

For production release:
1. Generate release keystore
2. Configure signing in `android/app/build.gradle`
3. Run `./scripts/build-standalone-apk.sh release`
4. Upload to Google Play Store

---

**Need help?** See the full [ANDROID_BUILD_README.md](ANDROID_BUILD_README.md) for detailed instructions.