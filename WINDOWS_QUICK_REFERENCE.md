# 🚀 Windows Build Quick Reference - MHT Assessment

## **⚡ One-Line Checker**
```powershell
.\scripts\windows-prerequisite-checker.ps1
```

## **📋 Required Software Versions**
| Software | Min Version | Recommended | Download |
|----------|-------------|-------------|----------|
| Node.js | 16.x | 18.x LTS | https://nodejs.org/ |
| Java JDK | 17.x | 17.x LTS | https://adoptium.net/ |
| Android SDK | API 34 | Latest | https://developer.android.com/studio/command-line-tools |
| Git | Any | Latest | https://git-scm.com/ |

## **🔧 Environment Variables**
```cmd
JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot
ANDROID_HOME=C:\Android
PATH += %JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin
```

## **⚡ Quick Install Commands**
```cmd
# After downloading installers manually:
# 1. Install Node.js 18 LTS (.msi)
# 2. Install OpenJDK 17 (.msi) 
# 3. Extract Android command-line-tools to C:\Android\cmdline-tools\latest\

# Then run:
sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
npm install -g yarn
```

## **🚀 Build Commands**
```cmd
# Quick build (debug)
.\scripts\build-standalone-apk.ps1

# Full build options
.\scripts\build-standalone-apk.ps1 -BuildType debug
.\scripts\build-standalone-apk.ps1 -BuildType release
```

## **✅ Verification Commands**
```cmd
node --version        # Should show v18.x.x
java -version         # Should show 17.x.x
adb --version         # Should show ADB version
echo %JAVA_HOME%      # Should show JDK path
echo %ANDROID_HOME%   # Should show C:\Android
```

## **🐛 Quick Fixes**
```cmd
# If command not found, restart Command Prompt
# If still not found, check PATH:
echo %PATH%

# Manual environment variable setup:
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.10-hotspot
set ANDROID_HOME=C:\Android
set PATH=%PATH%;%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools
```

## **📱 APK Installation**
```cmd
# Connect Android device with USB debugging enabled
adb devices
adb install mht-assessment-standalone-debug.apk
```

## **🆘 Emergency Commands**
```powershell
# Full system check with report
.\scripts\windows-prerequisite-checker.ps1 -Detailed -ExportReport

# Clean build
rmdir /s android\app\build
.\scripts\build-standalone-apk.ps1

# Reset Metro cache
npx react-native start --reset-cache
```

## **📊 Success Criteria**
All these should work without errors:
- ✅ `node --version`
- ✅ `java -version` 
- ✅ `adb --version`
- ✅ `echo %JAVA_HOME%`
- ✅ `echo %ANDROID_HOME%`

## **⏱️ Time Estimates**
- Fresh setup: 30-45 min
- Build APK: 5-10 min
- Install on device: 1-2 min

---
**💡 Pro Tip:** Always open a NEW Command Prompt after installing each component!