# MHT Assessment - Complete Windows APK Build Guide

## 🚀 Quick Start Guide

This guide provides complete instructions for setting up your Windows PC to build Android APKs for the MHT Assessment app.

### Prerequisites
- Windows 10/11
- PowerShell 5.0+
- Internet connection
- At least 8GB RAM (4GB minimum)
- 15GB free disk space

## 📋 Step-by-Step Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/mht-assessment.git
cd mht-assessment
```

### Step 2: Run the Environment Setup Script

**Option A: Automatic Installation (Recommended)**
```powershell
# Run PowerShell as Administrator
PowerShell -ExecutionPolicy Bypass -File .\scripts\windows-complete-apk-builder-setup.ps1 -AutoInstall -Detailed
```

**Option B: Check Only (No Installation)**
```powershell
# Regular PowerShell window
PowerShell -ExecutionPolicy Bypass -File .\scripts\windows-complete-apk-builder-setup.ps1 -Detailed
```

### Step 3: Install Project Dependencies

```bash
npm install
# or
yarn install
```

### Step 4: Build Android Bundle

```bash
npm run bundle:android
```

### Step 5: Generate APK

```bash
cd android
.\gradlew assembleDebug
```

### Step 6: Find Your APK

The APK will be located at:
```
android\app\build\outputs\apk\debug\app-debug.apk
```

## 🔧 Exact Version Requirements

The setup script checks for these exact versions used in the development environment:

| Component | Required Version | Purpose |
|-----------|------------------|---------|
| Node.js | 20.19.5 | JavaScript runtime |
| npm | 10.8.2 | Package manager |
| yarn | 1.22.22 | Alternative package manager |
| Java JDK | 17+ | Android compilation |
| Android SDK | API 34 | Target Android version |
| Build Tools | 34.0.0 | Android build tools |
| NDK | 25.1.8937393 | Native development kit |
| Gradle | 8.3+ | Build system |

## 📱 Installing APK on Android Device

### Method 1: USB Installation
```bash
# Enable USB debugging on your Android device
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

### Method 2: Direct Transfer
1. Copy the APK file to your Android device
2. Enable "Install from unknown sources"
3. Tap the APK file and install

## 🛠️ Advanced Usage

### Environment Setup Script Options

```powershell
# Full automatic installation with detailed report
.\scripts\windows-complete-apk-builder-setup.ps1 -AutoInstall -Detailed -ExportReport

# Force reinstall all components
.\scripts\windows-complete-apk-builder-setup.ps1 -AutoInstall -Force

# Check only with detailed report export
.\scripts\windows-complete-apk-builder-setup.ps1 -Detailed -ExportReport
```

### Build Variants

```bash
# Debug APK (development)
.\gradlew assembleDebug

# Release APK (production)
.\gradlew assembleRelease

# Clean build (if you encounter issues)
.\gradlew clean assembleDebug
```

## 📊 Project Structure

```
mht-assessment/
├── android/                 # Android project files
├── assets/                  # Images, fonts, sounds
├── components/              # Reusable UI components
├── data/                    # Static data files
├── mht_rules/              # Medical decision rules
├── screens/                # Application screens
├── scripts/                # Build and utility scripts
├── store/                  # State management
├── utils/                  # Utility functions
├── app.json               # Expo configuration
├── package.json           # Dependencies
└── README.md             # Documentation
```

## 🚨 Troubleshooting

### Common Issues

**1. Java Not Found**
```
Error: JAVA_HOME not set or invalid
```
**Solution:** Run the setup script with `-AutoInstall` flag

**2. Android SDK Missing**
```
Error: ANDROID_HOME not set
```
**Solution:** The setup script will install and configure Android SDK automatically

**3. Node.js Version Mismatch**
```
Warning: Node.js version different than expected
```
**Solution:** Use Node.js 20.19.5 for exact compatibility

**4. Build Failures**
```
Error: Could not find com.android.tools.build:gradle
```
**Solution:** Ensure Android SDK and build tools are properly installed

**5. Environment Variables Not Set**
**Solution:** Restart command prompt or system after running setup script

### Getting Help

1. **Check Setup Status:**
   ```powershell
   .\scripts\windows-complete-apk-builder-setup.ps1 -Detailed -ExportReport
   ```

2. **View Detailed Report:**
   Check `mht-apk-build-environment-report.txt` for comprehensive analysis

3. **Verify Installation:**
   ```bash
   node --version
   java -version
   adb --version
   ```

## 🎯 Success Indicators

Your environment is ready when you see:
- ✅ Node.js: v20.19.5 (Exact Match ✓)
- ✅ Java JDK: Compatible version (17+)
- ✅ Android SDK: Found with API 34
- ✅ Build Tools 34.0.0: Found
- ✅ ADB: Available

## 📱 App Features

The MHT Assessment app includes:
- **Patient Assessment Workflow**: Demographics, symptoms, risk factors
- **AI-Powered Risk Calculators**: ASCVD, Framingham, Gail, Wells, FRAX
- **Drug Interaction Checker**: HRT-specific interactions and contraindications
- **Treatment Plan Generator**: Evidence-based MHT recommendations
- **CME Learning Modules**: 6 interactive modules with quizzes
- **Export Functionality**: PDF reports and data sharing
- **Offline-First Architecture**: Works without internet connection

## 🔄 Updates and Maintenance

To update the project:
```bash
git pull origin main
npm install
npm run bundle:android
cd android && .\gradlew assembleDebug
```

## 📞 Support

If you encounter issues:
1. Review the troubleshooting section above
2. Check the generated report file for detailed diagnostics
3. Ensure all environment variables are properly set
4. Try restarting your system if components were installed but not recognized

---

**✅ You're now ready to build Android APKs for the MHT Assessment app on Windows!**