# 🪟 Windows APK Build Guide - Fix Script

## Overview
Windows-compatible scripts to fix the APK build error:
`Execution failed for task ':app:createBundleDebugJsAndAssets'`

## 📋 Quick Start Instructions

### STEP 1: Clone Repository
```cmd
git clone https://github.com/vaibhavshrivastavait/mht-assessment-android-app.git
cd mht-assessment-android-app
```

### STEP 2: Install Dependencies
```cmd
# Using NPM
npm install

# OR using Yarn (your preference)
yarn install
```

### STEP 3: Run Windows Fix Script

#### Option A: Command Prompt (.bat file)
```cmd
fix_apk_build.bat
```

#### Option B: PowerShell (.ps1 file)
```powershell
.\fix_apk_build.ps1
```

## 🎯 Complete Command Sequence

### For Command Prompt Users:
```cmd
git clone https://github.com/vaibhavshrivastavait/mht-assessment-android-app.git
cd mht-assessment-android-app
yarn install
fix_apk_build.bat
```
**Choose option 1** when prompted

### For PowerShell Users:
```powershell
git clone https://github.com/vaibhavshrivastavait/mht-assessment-android-app.git
cd mht-assessment-android-app
yarn install
.\fix_apk_build.ps1
```
**Choose option 1** when prompted

## 🔧 Script Options

### Option 1: Clean Build (Recommended First Try)
- Cleans Android build cache
- Clears React Native cache
- Clears npm/yarn cache
- Rebuilds APK with fresh environment

### Option 2: Manual Bundle Creation
- Creates JavaScript bundle manually
- Places bundle in correct Android assets folder
- Builds APK with pre-created bundle

### Option 3: Disable Bundle (Quick Alternative)
- Temporarily reverts to normal debug APK
- APK will need Metro server to work
- Good for quick testing

### Option 4: Try All Solutions
- Automatically tries all solutions in sequence
- Best when you're not sure which will work

## 📱 Expected Results

After successful build:
```
✅ BUILD SUCCESSFUL!

📁 APK Location:
android\app\build\outputs\apk\debug\app-debug.apk

📱 This APK:
✅ Works without Metro server
✅ Works without WiFi connection
✅ Includes all debug features
✅ Ready for testing on any device
```

## ⚠️ PowerShell Execution Policy

If PowerShell script doesn't run, you may need to change execution policy:

```powershell
# Check current policy
Get-ExecutionPolicy

# If it shows "Restricted", temporarily allow scripts:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run the script
.\fix_apk_build.ps1

# Restore policy after use (optional)
Set-ExecutionPolicy -ExecutionPolicy Restricted -Scope CurrentUser
```

## 🔍 Manual Commands (If Scripts Don't Work)

### Clean Build (Manual):
```cmd
cd android
gradlew clean
cd ..
npm cache clean --force
cd android
gradlew assembleDebug --stacktrace
```

### Manual Bundle Creation:
```cmd
mkdir android\app\src\main\assets
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android\app\src\main\assets\index.android.bundle --assets-dest android\app\src\main\res\
cd android
gradlew assembleDebug
```

## 🎯 What You Get

Your final APK includes all our fixes:
- ✅ **Single splash screen** (1.5 seconds, no duplicates)
- ✅ **Bundled Debug APK** (works offline without WiFi)
- ✅ **Visible back buttons** (← arrows on all screens)
- ✅ **Working CME quiz** with ✕ close button
- ✅ **Fixed MaterialIcons** rendering

## 📂 File Structure

After cloning, you'll have:
```
mht-assessment-android-app/
├── fix_apk_build.bat     ← Command Prompt script
├── fix_apk_build.ps1     ← PowerShell script
├── android/              ← Android project folder
├── screens/              ← React Native screens
├── components/           ← UI components
└── package.json          ← Dependencies
```

## 🚀 Installation on Phone

1. **Find APK**: `android\app\build\outputs\apk\debug\app-debug.apk`
2. **Transfer to phone** (USB, email, cloud storage)
3. **Enable Unknown Sources** in Android settings
4. **Install APK** by tapping it
5. **Launch** MHT Assessment app

**Your bundled debug APK will work completely offline with all features!** 🎉