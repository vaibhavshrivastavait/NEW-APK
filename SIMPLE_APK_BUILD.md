# 🚀 Simple APK Build Steps

## After `npm install`, follow these steps:

### Method 1: EAS Build (Recommended - Easy)

```bash
# 1. Install EAS CLI
npm install -g @expo/eas-cli

# 2. Login (create account at expo.dev if needed)
eas login

# 3. Configure build
eas build:configure

# 4. Build APK
eas build --platform android --profile preview

# 5. Download APK from the link provided in terminal
```

**⏱️ Time:** 5-10 minutes (cloud build)  
**✅ Pros:** Easy, no Android Studio needed  
**❌ Cons:** Requires internet, expo account

---

### Method 2: Local Build (Advanced)

#### Prerequisites:
- Install Android Studio
- Set up Android SDK
- Install JDK 17

```bash
# 1. Generate Android code
npx expo prebuild --platform android

# 2. Go to Android directory
cd android

# 3. Build APK
./gradlew assembleDebug

# 4. APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

**⏱️ Time:** 2-10 minutes (local build)  
**✅ Pros:** No internet needed, faster rebuilds  
**❌ Cons:** Requires Android Studio setup

---

## 📱 Install APK on Phone

1. Copy APK file to your Android phone
2. Open file manager and tap the APK
3. Allow "Install unknown apps" if prompted
4. Install and open the MHT Assessment app

---

## ✅ Quick Verification

After installing, check:
- [ ] App opens without crashes
- [ ] Home screen shows Drug Interaction Checker button
- [ ] No Treatment Plan Generator button (removed)
- [ ] Patient List works
- [ ] All screens navigate properly

---

**Recommendation:** Start with Method 1 (EAS Build) as it's simpler and doesn't require Android Studio setup.