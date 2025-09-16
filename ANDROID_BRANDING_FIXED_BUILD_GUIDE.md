# MHT Assessment - Android APK Build Guide with Fixed Branding

## ✅ BRANDING ISSUES RESOLVED

### Problems Fixed:
1. **App Icon Issue**: Generic Android dummy icon → Custom MHT logo
2. **Splash Screen Issue**: Missing custom splash → MHT branded splash screen

### Solutions Implemented:

#### 1. App Icon Configuration (app.json)
```json
{
  "expo": {
    "icon": "./assets/images/branding/mht_logo_primary.png",
    "android": {
      "icon": "./assets/images/branding/mht_logo_primary.png",
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/branding/mht_logo_primary.png",
        "backgroundColor": "#FDE7EF"
      }
    }
  }
}
```

#### 2. Splash Screen Configuration
```json
{
  "splash": {
    "image": "./assets/images/branding/mht_logo_primary.png",
    "resizeMode": "contain",
    "backgroundColor": "#FDE7EF"
  },
  "android": {
    "splash": {
      "image": "./assets/images/branding/mht_logo_primary.png",
      "resizeMode": "contain",
      "backgroundColor": "#FDE7EF",
      "mdpi": "./assets/images/branding/mht_logo_primary.png",
      "hdpi": "./assets/images/branding/mht_logo_primary.png",
      "xhdpi": "./assets/images/branding/mht_logo_primary.png",
      "xxhdpi": "./assets/images/branding/mht_logo_primary.png"
    }
  }
}
```

#### 3. Custom Splash Screen Component (App.tsx)
- Re-enabled splash screen for production APK builds
- Uses MHT logo with proper animation (fade-in + scale)
- Light pink background (#FDE7EF) matching app theme
- 1.5 second duration with smooth transition

## 🔧 BUILD INSTRUCTIONS

### Prerequisites
1. ✅ Android SDK installed
2. ✅ Java 17 JDK configured
3. ✅ Gradle build tools ready
4. ✅ MHT logo assets available in `assets/images/branding/`

### Build Commands

#### Option 1: EAS Build (Recommended)
```bash
# Install EAS CLI if not installed
npm install -g @expo/eas-cli

# Configure EAS (one-time setup)
eas build:configure

# Build APK
eas build --platform android --profile preview
```

#### Option 2: Local Build
```bash
# Generate Android project
npx expo prebuild --platform android --clean

# Build APK
cd android
./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

#### Option 3: Development Build
```bash
# For testing
npx expo run:android
```

## 📱 Expected Results

### App Icon
- ✅ Custom MHT logo instead of generic Android icon
- ✅ Adaptive icon with light pink background
- ✅ Proper scaling on all Android devices

### Splash Screen
- ✅ MHT logo with smooth fade-in animation
- ✅ Light pink background (#FDE7EF)
- ✅ 1.5 second duration
- ✅ Smooth transition to home screen

### Package Details
- **App Name**: MHT Assessment
- **Package**: com.mhtassessment
- **Version**: 1.0.0

## 🚀 Post-Build Verification

After building and installing the APK, verify:

1. **App Icon**: 
   - Check launcher/home screen for MHT logo
   - Verify adaptive icon behavior

2. **Splash Screen**:
   - Launch app and observe branded splash
   - Confirm smooth animation and transition

3. **AsyncStorage Fix**:
   - Test "Patient Records" navigation
   - Test "MHT Guidelines" navigation
   - Verify no crashes on these sections

## 📁 Key Files Modified

- `app.json` - Updated branding configuration
- `App.tsx` - Re-enabled splash screen
- `components/SplashScreen.tsx` - Already configured with MHT logo
- `utils/asyncStorageUtils.ts` - Added for crash prevention

## 🎯 Brand Consistency

The app now maintains consistent MHT branding:
- **Color Theme**: Light pink (#FDE7EF) background
- **Logo**: MHT Assessment primary logo
- **Typography**: Medical/clinical styling
- **Navigation**: Professional healthcare app design

## 📞 Support

If you encounter issues during the build process:
1. Ensure all asset files exist in the correct locations
2. Check Android SDK and Java versions
3. Clear build cache: `npx expo prebuild --clean`
4. Rebuild node_modules: `rm -rf node_modules && yarn install`

The APK built with these configurations will now display the proper MHT branding instead of generic Android placeholders.