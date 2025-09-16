# 📱 Build Bundled Debug APK - Works Offline!

## What This Does
Creates a **Debug APK with bundled JavaScript** that:
- ✅ **Works WITHOUT WiFi** (no Metro server needed)
- ✅ **Debug features enabled** (better error messages)
- ✅ **Install anywhere** (completely standalone)
- ✅ **Best for testing** (debug + offline)

## Quick Build (Your Local PC)

### Step 1: Clone Repository (if not done)
```bash
git clone https://github.com/vaibhavshrivastavait/mht-assessment-android-app.git
cd mht-assessment-android-app
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Build Bundled Debug APK

#### Option A: Android Studio (Recommended)
1. **Open Android Studio**
2. **Import Project**: Choose `android/` folder
3. **Sync Gradle**: Let it sync
4. **Build APK**: `Build → Build Bundle(s) / APK(s) → Build APK(s)`

#### Option B: Command Line
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

### Step 4: Find Your APK
**Location**: `android/app/build/outputs/apk/debug/app-debug.apk`

## Install on Phone

1. **Transfer APK** to your phone
2. **Enable Unknown Sources** in Android settings
3. **Install APK** by tapping it
4. **Launch** MHT Assessment app
5. **Test offline** - turn off WiFi, app still works!

## APK Comparison

| Type | Metro Server | WiFi Needed | Debug Features | Use Case |
|------|-------------|-------------|----------------|----------|
| **Normal Debug** | Required ❌ | Required ❌ | Full ✅ | Development |
| **Bundled Debug** ⭐ | NOT Required ✅ | NOT Required ✅ | Full ✅ | **Testing** |
| **Release** | NOT Required ✅ | NOT Required ✅ | Limited ⚠️ | Production |

## What You Get

Your bundled debug APK includes:
- ✅ **Single splash screen** (1.5 seconds)
- ✅ **Visible back buttons** (← arrows)
- ✅ **Working CME quiz** with ✕ close button
- ✅ **All app functionality** working offline
- ✅ **Debug error messages** if issues occur

## Perfect For:
- Testing away from your computer
- Installing on multiple phones
- Demonstrating to others
- Debugging offline scenarios

**This is the ideal APK for development testing!** 🚀