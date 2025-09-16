# 🚀 UNIFIED BUILD GUIDE - EMERGENT PREVIEW + PHYSICAL PHONE

## ✅ **DUAL PLATFORM SUPPORT**

This app now works perfectly on **BOTH**:
- 🌐 **Emergent Built-in Preview** (Web version)
- 📱 **Physical Android Phones** (APK version)

---

## 🌐 **EMERGENT PREVIEW SETUP**

### **Already Configured:**
- ✅ **Metro Config**: React Native Web support enabled
- ✅ **Environment**: Localhost URLs for development
- ✅ **CORS**: Proper cross-origin configuration
- ✅ **Platform Detection**: Automatic web/native switching

### **How to Test:**
1. **Click Preview button** in Emergent interface
2. **App loads instantly** in web browser
3. **All features work** (navigation, forms, calculations)
4. **Real-time updates** when you make code changes

---

## 📱 **PHYSICAL PHONE APK BUILD**

### **Method 1: Android Studio (Recommended)**
```bash
# 1. Fresh clone (if needed)
git clone https://github.com/vaibhavshrivastavait/mht-assessment-android-app.git
cd mht-assessment-android-app

# 2. Install dependencies
npm install --force --legacy-peer-deps

# 3. Generate Android project
npx expo prebuild --platform android --clean

# 4. Open in Android Studio
# File → Open → mht-assessment-android-app/android
# Build → Build Bundle(s) / APK(s) → Build APK(s)
```

### **Method 2: Command Line**
```bash
cd android
.\gradlew clean
.\gradlew assembleRelease
```

### **APK Output:**
- **Location**: `android/app/build/outputs/apk/release/app-release.apk`
- **Size**: ~15-20MB (self-contained)
- **Compatibility**: All Android devices (API 23+)
- **Offline**: Works without internet connection

---

## 🔧 **TECHNICAL ARCHITECTURE**

### **Platform Detection:**
```javascript
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  // Emergent Preview behavior
} else {
  // Physical phone behavior  
}
```

### **Environment Variables:**
- **Development**: `localhost` URLs for preview
- **Production**: Embedded assets for APK
- **Auto-switching**: Based on platform detection

### **Asset Handling:**
- **Web**: Served via Metro bundler
- **Native**: Pre-bundled in APK assets
- **Universal**: Same codebase, different delivery

---

## 📊 **FEATURE COMPATIBILITY**

| Feature | Emergent Preview | Physical Phone |
|---------|------------------|----------------|
| **Navigation** | ✅ Full support | ✅ Full support |
| **Forms & Input** | ✅ Full support | ✅ Full support |
| **Calculations** | ✅ Full support | ✅ Full support |
| **Data Storage** | ✅ Web storage | ✅ Device storage |
| **Offline Mode** | ❌ Needs connection | ✅ Fully offline |
| **Performance** | ✅ Fast loading | ✅ Native speed |

---

## 🎯 **SUCCESS CRITERIA**

### **✅ Emergent Preview Should:**
- Load instantly when clicking Preview button
- Show MHT Assessment home screen
- Navigate between all screens smoothly
- Handle form inputs and calculations
- Display patient data and results

### **✅ Physical Phone APK Should:**
- Install without certificate errors
- Launch to home screen immediately
- Work completely offline
- Handle all app functionality
- Maintain data between sessions

---

## 🚨 **TROUBLESHOOTING**

### **Preview Not Loading:**
1. Check browser console for errors
2. Verify services are running (expo on port 3000)
3. Clear browser cache and refresh

### **APK Build Fails:**
1. Use Android Studio instead of command line
2. Clean project before building
3. Ensure all dependencies are installed

### **APK Doesn't Install:**
1. Enable "Unknown Sources" in Android settings
2. Check device has sufficient storage
3. Try building debug APK first

---

## 🎉 **EXPECTED RESULTS**

**Both platforms should provide identical user experience with:**
- Same UI/UX design and functionality
- Same navigation and screen flow  
- Same calculation results and data handling
- Same performance and responsiveness

**The only difference: Preview needs internet, APK works offline!**