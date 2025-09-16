# 📱 Standalone Debug APK - Best of Both Worlds!

## Overview
The **Standalone Debug APK** gives you the benefits of both Debug and Release builds:
- ✅ **Debug Features**: Better error messages, debugging capabilities
- ✅ **Standalone Operation**: Works without Metro server or WiFi
- ✅ **Offline Testing**: Test anywhere, anytime
- ✅ **Quick Installation**: Direct APK install on any device

## What Makes It Special?

### Traditional Debug APK (Normal)
- ❌ **Needs Metro Server**: Must keep running on your computer
- ❌ **Needs Network**: Phone and computer must be connected (WiFi/tunnel)
- ✅ **Debug Features**: Good error messages and debugging
- ❌ **Network Dependency**: Can't test offline

### Standalone Debug APK (Our Solution)
- ✅ **No Metro Server**: JavaScript is bundled into the APK
- ✅ **No Network**: Works completely offline
- ✅ **Debug Features**: All debugging capabilities preserved
- ✅ **Portable**: Test on any device, anywhere

### Release APK (Production)
- ✅ **No Metro Server**: JavaScript bundled
- ✅ **No Network**: Completely offline
- ❌ **Limited Debug Info**: Minimal error messages
- ✅ **Optimized**: Smaller size, better performance

## How It Works

### Configuration Change
Modified `android/app/build.gradle`:
```gradle
// BEFORE: Skips bundling for debug builds
debuggableVariants = ["debug"]

// AFTER: Enables bundling for debug builds  
debuggableVariants = []
```

This tells the build system to **include the JavaScript bundle in debug builds** instead of loading it from Metro.

### Build Process
1. **Bundle JavaScript**: All your React Native code gets compiled into a bundle
2. **Include in APK**: Bundle is packaged directly into the APK file
3. **Enable Debug Features**: Debug flags and error reporting remain active
4. **Create Standalone APK**: No external dependencies required

## Building on Your Local PC

### Method 1: Using Build Script (Recommended)
```bash
# In your cloned repository
cd mht-assessment-android-app
./build_standalone_debug.sh
```

### Method 2: Using Android Studio
1. **Open Android Studio**
2. **Import Project**: Open the `android/` folder
3. **Sync Gradle**: Let it sync with the modified configuration
4. **Build APK**: `Build → Build Bundle(s) / APK(s) → Build APK(s)`
5. **Result**: Standalone debug APK in `android/app/build/outputs/apk/debug/`

### Method 3: Direct Gradle Command
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

## APK Comparison

| Feature | Normal Debug | Standalone Debug | Release |
|---------|-------------|------------------|---------|
| **Metro Server** | Required ❌ | Not Required ✅ | Not Required ✅ |
| **Network** | Required ❌ | Not Required ✅ | Not Required ✅ |
| **Debug Features** | Full ✅ | Full ✅ | Limited ⚠️ |
| **Error Messages** | Detailed ✅ | Detailed ✅ | Basic ⚠️ |
| **File Size** | Small* | Medium | Small |
| **Performance** | Debug | Debug | Optimized |
| **Offline Testing** | No ❌ | Yes ✅ | Yes ✅ |

*Small because JS is loaded from Metro, not included in APK

## Use Cases

### Perfect For:
- ✅ **Field Testing**: Test the app away from your development machine
- ✅ **Device Testing**: Test on multiple phones without network setup
- ✅ **Demo Purposes**: Show the app to others without technical setup
- ✅ **Bug Reproduction**: Debug issues in offline scenarios
- ✅ **Travel Development**: Continue testing while traveling

### When To Use Each:
- **Expo Go (1)**: Rapid development with hot reloading
- **Normal Debug (2)**: Development with hot reloading but direct APK
- **Standalone Debug (3)**: Offline testing with debug features ⭐
- **Release APK (4)**: Final production builds for distribution

## Installation & Testing

### On Your Phone:
1. **Transfer APK**: Copy `app-debug.apk` to your phone
2. **Enable Unknown Sources**: Android Settings → Security → Unknown Sources
3. **Install APK**: Tap the APK file to install
4. **Launch App**: Open "MHT Assessment" from your app drawer
5. **Test Offline**: Turn off WiFi/mobile data - app still works!

### What You'll Get:
- ✅ **Single Splash Screen**: 1.5 seconds with MHT logo
- ✅ **Visible Back Buttons**: Clear arrows (←) on all screens
- ✅ **Working CME Quiz**: Visible cross (✕) button for exit
- ✅ **Full Functionality**: All features work offline
- ✅ **Debug Info**: Detailed error messages if issues occur

## Technical Details

### Bundle Inclusion:
- JavaScript bundle is compiled and included in APK
- All React Native code becomes part of the APK file
- No external dependencies on Metro server

### Debug Features Preserved:
- React Native development warnings
- Detailed error stack traces
- Debug logging and console output
- Component inspector capabilities

### Performance:
- Slightly larger APK size (includes JS bundle)
- Same runtime performance as normal debug builds
- Faster startup (no network requests to Metro)

## Troubleshooting

### If Build Fails:
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleDebug
```

### If APK Won't Install:
- Check "Unknown Sources" is enabled
- Uninstall any previous version first
- Ensure Android version compatibility (API 21+)

### If App Crashes:
- Check Android logs: `adb logcat | grep MHT`
- Debug features are still active - check console output
- Report issues with the debug information

## Summary

The **Standalone Debug APK** is the perfect solution for:
- Developers who want to test offline
- Testing on multiple devices without network setup  
- Demonstrating the app without technical requirements
- Debugging issues in offline scenarios

**It combines the debugging power of debug builds with the portability of release builds!** 🚀