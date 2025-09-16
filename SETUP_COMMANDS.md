# MHT Assessment - Setup Commands

## Prerequisites (Install these first)

1. **Node.js 18+**: Download from https://nodejs.org/
2. **Java 17**: Download from https://adoptium.net/temurin/releases/
3. **Android Studio**: Download from https://developer.android.com/studio
4. **Set Environment Variables**:
   - Windows: ANDROID_HOME = C:\Users\%USERNAME%\AppData\Local\Android\Sdk
   - Windows: JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot
   - Windows: Add to PATH: %ANDROID_HOME%\platform-tools
   - Linux/Mac: export ANDROID_HOME=$HOME/Android/Sdk
   - Linux/Mac: export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

## Setup Commands

```bash
# 1. Install global tools
npm install -g yarn @expo/cli

# 2. Install project dependencies
yarn install

# 3. Generate Android project
expo prebuild --platform android

# 4. Build APK (Windows)
cd android
gradlew.bat assembleDebug

# 4. Build APK (Linux/Mac)
cd android
chmod +x gradlew
./gradlew assembleDebug

# 5. Install APK on device
adb install app/build/outputs/apk/debug/app-debug.apk
```

## Expected Results

- APK file: android/app/build/outputs/apk/debug/app-debug.apk
- Size: ~25-50MB
- Features: 15 medicine categories, 150 drug interactions
- Target: Android 7.0+ devices

## Verify Installation

```bash
node --version    # Should show v18+
java --version    # Should show 17.x.x
adb version       # Should show Android Debug Bridge
```

## Troubleshooting

- **"expo command not found"**: Run `npm install -g @expo/cli`
- **"ANDROID_HOME not set"**: Set environment variables and restart terminal
- **"gradlew permission denied"**: Run `chmod +x gradlew`
- **Build fails**: Run `cd android && ./gradlew clean && ./gradlew assembleDebug`