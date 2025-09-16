# MHT Assessment - Complete Windows Local Setup Guide

## 🚀 From Zero to APK in Minutes

This guide provides everything you need to set up a complete development environment on Windows and build the MHT Assessment Android APK locally.

## 📋 Quick Start

### Step 1: Run the Automated Environment Setup

1. **Download/Clone the Repository:**
   ```bash
   git clone <your-repo-url>
   cd mht-assessment
   ```

2. **Run the Complete Environment Setup (as Administrator):**
   ```powershell
   PowerShell -ExecutionPolicy Bypass -File .\scripts\windows-complete-environment-setup.ps1 -AutoInstall -Detailed
   ```

   This script will automatically:
   - ✅ Check system requirements (Windows 10+, RAM, disk space)
   - ✅ Install Node.js 20.19.5 (exact version from development environment)
   - ✅ Install Java JDK 17+ (required for Android builds)
   - ✅ Install Android SDK with API 34 and Build Tools 34.0.0
   - ✅ Install Git, Yarn 1.22.22, and other tools
   - ✅ Configure all environment variables (JAVA_HOME, ANDROID_HOME, PATH)
   - ✅ Verify installations and provide detailed reports

### Step 2: Build the APK

1. **Install Project Dependencies:**
   ```bash
   npm install
   # or if you have yarn:
   yarn install
   ```

2. **Build the Android Bundle:**
   ```bash
   npm run bundle:android
   ```

3. **Generate the APK:**
   ```bash
   cd android
   ./gradlew assembleDebug
   ```

4. **Find Your APK:**
   ```
   📱 APK Location: android/app/build/outputs/apk/debug/app-debug.apk
   ```

## 🔧 Exact Environment Specifications

The automated setup script installs exactly the same versions used in the development environment:

| Component | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 20.19.5 | JavaScript runtime |
| **npm** | 10.8.2 | Package manager (comes with Node.js) |
| **Yarn** | 1.22.22 | Alternative package manager (recommended) |
| **Java JDK** | 17+ | Required for Android builds |
| **Android SDK** | API 34 | Target Android version |
| **Build Tools** | 34.0.0 | Android build tools |
| **Gradle** | 8.3 | Build system (wrapper included) |
| **Expo CLI** | Latest | Development tools |

## 📂 What Gets Installed and Where

### Default Installation Paths:
- **Java JDK**: `C:\MHTDev\OpenJDK17\`
- **Android SDK**: `C:\MHTDev\Android\`
- **Node.js**: Standard Windows location (`C:\Program Files\nodejs\`)

### Environment Variables Configured:
```
JAVA_HOME=C:\MHTDev\OpenJDK17
ANDROID_HOME=C:\MHTDev\Android  
ANDROID_SDK_ROOT=C:\MHTDev\Android
PATH=... (updated to include all tools)
```

## 🛠️ Manual Installation (if needed)

If the automated script doesn't work for your setup, here's the manual process:

### 1. Install Node.js 20.19.5
```powershell
# Download from: https://nodejs.org/dist/v20.19.5/node-v20.19.5-x64.msi
# Or use Chocolatey:
choco install nodejs --version=20.19.5 -y
```

### 2. Install Java JDK 17+
```powershell
# Download from: https://adoptium.net/
# Or use Chocolatey:
choco install openjdk17 -y
```

### 3. Install Android SDK
```powershell
# Download Command Line Tools from:
# https://developer.android.com/studio/command-line-tools

# Extract to: C:\MHTDev\Android\cmdline-tools\latest\
# Set environment variables:
setx ANDROID_HOME "C:\MHTDev\Android"
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin"

# Install SDK packages:
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

### 4. Install Additional Tools
```powershell
npm install -g yarn@1.22.22
npm install -g @expo/cli
```

## 🔍 Verification Commands

After installation, verify everything works:

```bash
# Check versions
node --version          # Should show: v20.19.5
npm --version           # Should show: 10.8.2
yarn --version          # Should show: 1.22.22
java -version           # Should show: 17+ 
adb --version           # Should show ADB version

# Check environment variables
echo $env:JAVA_HOME     # Should show Java path
echo $env:ANDROID_HOME  # Should show Android SDK path
```

## 📱 Project-Specific Build Commands

The MHT Assessment app includes these helpful npm scripts:

```bash
# Development
npm start                    # Start Expo development server
npm run android             # Run on Android emulator/device
npm run web                 # Run in web browser

# Building
npm run bundle:android      # Create Android bundle
npm run build:apk          # Build debug APK (Linux/Mac)

# Environment checking
npm run check:windows              # Quick environment check
npm run check:windows-detailed     # Detailed environment check
npm run check:windows-report       # Generate environment report
```

## 🏗️ Build Process Explained

### The build process consists of:

1. **Metro Bundling**: JavaScript code is bundled into `index.android.bundle`
2. **Asset Processing**: Images and other assets are processed
3. **Gradle Build**: Android Studio's build system creates the APK
4. **Signing**: APK is signed with debug keystore for testing

### Build files and locations:
```
android/app/src/main/assets/index.android.bundle  # JS bundle
android/app/build/outputs/apk/debug/              # Final APK
android/app/src/main/res/                         # Processed assets
```

## 🔧 Troubleshooting

### Common Issues and Solutions:

#### "java: command not found"
```bash
# Check if JAVA_HOME is set:
echo $env:JAVA_HOME

# If not set, add to PATH:
setx PATH "%PATH%;%JAVA_HOME%\bin"
```

#### "adb: command not found"
```bash
# Add Android platform-tools to PATH:
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools"
```

#### "gradlew: permission denied"
```bash
# On Windows, use:
./gradlew.bat assembleDebug
# Or give permissions:
chmod +x gradlew
```

#### Metro bundler issues:
```bash
# Clear Metro cache:
npx react-native start --reset-cache

# Or clear node modules:
rm -rf node_modules
npm install
```

#### APK build fails:
```bash
# Clean and rebuild:
cd android
./gradlew clean
./gradlew assembleDebug
```

## 📊 System Requirements

### Minimum Requirements:
- **OS**: Windows 10 or later
- **RAM**: 4GB (8GB+ recommended)
- **Storage**: 10GB free (15GB+ recommended)
- **Internet**: For downloading dependencies

### Recommended Specifications:
- **OS**: Windows 11
- **RAM**: 16GB
- **Storage**: SSD with 20GB+ free space
- **CPU**: Multi-core processor for faster builds

## 🚀 Advanced Usage

### Development Mode:
```bash
# Start with tunnel for device testing:
expo start --tunnel

# Start with specific platform:
expo start --android
expo start --web
```

### Production Builds:
```bash
# Build release APK (requires signing setup):
cd android
./gradlew assembleRelease
```

### Testing on Device:
1. Enable Developer Options on Android device
2. Enable USB Debugging
3. Connect device via USB
4. Run: `adb devices` to verify connection
5. Install APK: `adb install app-debug.apk`

## 📋 Automated Scripts Reference

### Environment Setup Script Options:
```powershell
# Check only (no installation):
.\scripts\windows-complete-environment-setup.ps1

# Auto-install missing components:
.\scripts\windows-complete-environment-setup.ps1 -AutoInstall

# Detailed output:
.\scripts\windows-complete-environment-setup.ps1 -Detailed

# Export report:
.\scripts\windows-complete-environment-setup.ps1 -ExportReport

# Custom installation path:
.\scripts\windows-complete-environment-setup.ps1 -AutoInstall -InstallPath "C:\MyDev"
```

### GitHub Sync Script:
```bash
# Sync to GitHub:
./scripts/sync-to-github.sh -r https://github.com/username/repo.git

# Sync to specific branch:
./scripts/sync-to-github.sh -r <repo-url> -b develop

# Force push (use with caution):
./scripts/sync-to-github.sh -r <repo-url> -f
```

## 🎯 Success Indicators

You'll know everything is working when:

- ✅ All environment checks pass
- ✅ `npm install` completes without errors
- ✅ `npm run bundle:android` creates bundle successfully
- ✅ `./gradlew assembleDebug` creates APK
- ✅ APK file exists at expected location
- ✅ APK installs and runs on Android device

## 📞 Support

If you encounter issues:

1. **Re-run the environment setup script** with `-Detailed` flag
2. **Check the generated report** for specific missing components
3. **Verify system requirements** meet minimum specifications
4. **Try manual installation** for any failing components

## 🎉 You're Ready!

Once setup is complete, you have a fully functional Android development environment that can build the MHT Assessment APK locally on your Windows machine.

**Happy Building! 📱✨**