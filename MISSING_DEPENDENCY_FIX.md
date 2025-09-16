# 🔧 Missing metro-minify-terser Dependency Fix

## Problem Confirmed
The `metro-minify-terser` module is actually missing from your node_modules directory, causing both `expo start --clear` and `gradlew assembleDebug` to fail.

## ✅ Direct Fix

### Step 1: Install Missing Dependency
Run this command in your MHT-Assessment directory:

**Windows:**
```cmd
cd F:\MHT-Assessment
npm install metro-minify-terser
```

**Or if you prefer yarn:**
```cmd
cd F:\MHT-Assessment
yarn add metro-minify-terser
```

### Step 2: Verify Installation
Check that the module was installed:
```cmd
dir node_modules\metro-minify-terser
```

### Step 3: Clear Cache and Retry Build
```cmd
# Clear Metro cache
npx expo start --clear
# Press Ctrl+C after cache clears

# Build APK
cd android
gradlew.bat clean
gradlew.bat assembleDebug
```

## Alternative: Complete Dependency Reinstall

If the above doesn't work, you may need to reinstall all dependencies:

```cmd
cd F:\MHT-Assessment

# Remove existing node_modules (this may take a few minutes)
rmdir /s node_modules
del package-lock.json

# Reinstall all dependencies
npm install
```

## Why This Happened
The provided archive may have had an incomplete node_modules directory. The `metro-minify-terser` package is a peer dependency of Metro bundler that's required for JavaScript minification during builds.

## Expected Results After Fix
- ✅ `npx expo start --clear` works without errors
- ✅ `gradlew.bat assembleDebug` completes successfully
- ✅ APK created in android/app/build/outputs/apk/debug/

## Quick Verification
After installing metro-minify-terser, test that Metro can start:
```cmd
cd F:\MHT-Assessment
npx expo start --clear
```

You should see Metro bundler start without the "Cannot find module" error.

## Build Time Expectations
- **Dependency install**: 2-5 minutes
- **Metro cache clear**: 30 seconds
- **APK build**: 5-15 minutes (first time)

## Troubleshooting
If you still get module errors after installing metro-minify-terser:

1. **Check Node.js version**: Ensure you're using Node.js 16+ 
   ```cmd
   node --version
   ```

2. **Check npm version**: Ensure npm is up to date
   ```cmd
   npm --version
   ```

3. **Try complete reinstall** if individual package install doesn't work

4. **Alternative package managers**: Try yarn instead of npm if issues persist

The missing dependency should resolve both the Metro bundler startup issue and the Android build process.