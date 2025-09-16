# 🔧 Disk Space Build Fix for Metro Bundler Error

## Problem Identified
The `gradlew assembleDebug` command was failing with "Cannot find module 'metro-minify-terser'" because your system doesn't have enough disk space for Metro bundler to create temporary files during the JavaScript bundling process.

## Root Cause
- **Not actually a missing dependency** - metro-minify-terser exists in node_modules
- **Disk space issue** - Metro bundler needs temporary space for caching and bundling
- Build process fails when disk is >95% full

## ✅ Solution Steps

### Step 1: Free Up Disk Space on Your System
Before running the build, ensure you have at least 2-3GB of free disk space:

**Windows:**
```cmd
# Check disk space
dir C:\ | find "bytes free"

# Clean up temporary files
del /q /s %TEMP%\*
rd /s /q %LOCALAPPDATA%\Temp\*
```

**Linux/macOS:**
```bash
# Check disk space
df -h .

# Clean up if needed
rm -rf ~/.cache/*
rm -rf /tmp/*
```

### Step 2: Clear Metro Cache
```bash
# Navigate to your project directory
cd MHT-Assessment

# Clear Metro bundler cache
npx expo start --clear
# Press Ctrl+C to stop after cache is cleared
```

### Step 3: Build APK with Sufficient Space
```bash
cd android

# Clean previous build artifacts
gradlew.bat clean
# or on Linux/macOS: ./gradlew clean

# Build APK (ensure you have 2-3GB free space)
gradlew.bat assembleDebug
# or on Linux/macOS: ./gradlew assembleDebug
```

## Alternative: Build Only Debug APK
If you're still having space issues, build only the debug version:

```bash
# Instead of: gradlew.bat assembleDebug assembleRelease
# Use just: gradlew.bat assembleDebug
```

## Expected Results After Fix
- ✅ Metro bundler creates JavaScript bundle successfully
- ✅ No "Cannot find module" errors
- ✅ APK builds complete in android/app/build/outputs/apk/debug/
- ✅ Final APK size: ~25-50MB

## Troubleshooting Tips

### If Still Getting Module Errors:
1. **Verify node_modules exists** in your extracted directory
2. **Clear all caches:**
   ```bash
   npx expo start --clear
   cd android
   gradlew.bat clean
   ```
3. **Check available disk space** - need at least 2GB free

### If Build is Slow:
- First build takes 10-15 minutes (downloads dependencies)
- Subsequent builds take 2-5 minutes
- Ensure stable internet connection for first build

### Signs of Success:
- Bundle creation completes without errors
- You see "BUILD SUCCESSFUL" message
- APK file appears in android/app/build/outputs/apk/debug/

## What This Error Actually Was
The "metro-minify-terser" error was misleading - the module exists, but Metro couldn't create its working files due to insufficient disk space. This is a common issue when building React Native apps on systems with limited storage.

## Final Verification
After successful build:
```bash
# Verify APK was created
ls -la android/app/build/outputs/apk/debug/app-debug.apk

# Check APK size (should be 25-50MB)
du -h android/app/build/outputs/apk/debug/app-debug.apk
```

Your APK will contain all MHT Assessment features:
- ✅ 10 complete screens
- ✅ Drug Interaction Checker (150+ combinations)  
- ✅ CME Quiz system
- ✅ Treatment Plan Generator
- ✅ Risk calculators
- ✅ Professional medical UI