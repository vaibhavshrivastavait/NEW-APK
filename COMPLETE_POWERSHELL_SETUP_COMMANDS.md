# 🚀 Complete PowerShell Setup Commands - MHT Assessment App

## Step 1: Clone the Repository

```powershell
# Open PowerShell as Administrator
# Navigate to your desired directory (e.g., C:\Projects)
cd C:\Projects

# Clone the repository
git clone https://github.com/vaibhavshrivastavait/mht-assessment-android-app.git

# Navigate into the project directory
cd mht-assessment-android-app
```

## Step 2: Run Comprehensive Dependency Checker

### Quick Check (Basic)
```powershell
# Set execution policy (if needed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run basic prerequisite check
powershell -ExecutionPolicy Bypass -File .\scripts\windows-prerequisite-checker.ps1
```

### Detailed Check (Comprehensive)
```powershell
# Run detailed check with full analysis
powershell -ExecutionPolicy Bypass -File .\scripts\windows-prerequisite-checker.ps1 -Detailed
```

### Full Report Generation
```powershell
# Generate detailed report and export to file
powershell -ExecutionPolicy Bypass -File .\scripts\windows-prerequisite-checker.ps1 -Detailed -ExportReport
```

## Step 3: Alternative NPM Script Commands

```powershell
# After cloning, you can also use these npm commands:

# Basic Windows check
npm run check:windows

# Detailed Windows check  
npm run check:windows-detailed

# Generate comprehensive report
npm run check:windows-report
```

## Step 4: Complete Windows Setup (If Dependencies Missing)

```powershell
# Run the complete setup script to install missing dependencies
powershell -ExecutionPolicy Bypass -File .\scripts\windows-complete-setup-fixed.ps1
```

## 📁 Script Locations in Project

```
mht-assessment-android-app/
├── scripts/
│   ├── windows-prerequisite-checker.ps1      # 🔍 Main dependency checker
│   ├── windows-prerequisite-checker.bat      # 🔍 Batch version
│   ├── windows-complete-setup.ps1            # 🛠️ Full setup installer
│   ├── windows-complete-setup-fixed.ps1      # 🛠️ Enhanced setup installer  
│   └── build-standalone-apk.ps1              # 📱 APK builder
└── package.json                              # 📦 Contains npm script shortcuts
```

## 🎯 What the Comprehensive Checker Validates

### Software Dependencies:
- ✅ Node.js (v18+ recommended)
- ✅ npm/yarn package manager
- ✅ Git version control
- ✅ Java Development Kit (JDK 17+)
- ✅ Android SDK and tools
- ✅ Gradle build system
- ✅ PowerShell version

### Project Structure:
- ✅ All required folders present
- ✅ Android build files
- ✅ Package.json configuration
- ✅ Essential assets and resources
- ✅ Build scripts availability

### Environment Variables:
- ✅ JAVA_HOME configuration
- ✅ ANDROID_HOME/ANDROID_SDK_ROOT
- ✅ PATH variables for all tools
- ✅ Gradle configuration

### Build Readiness:
- ✅ Dependencies installation status
- ✅ Android keystore availability
- ✅ Build tools compatibility
- ✅ Metro bundler configuration

## 📋 Expected Output Example

```
🔍 WINDOWS PREREQUISITE CHECKER - MHT Assessment
=====================================================

✅ Node.js: v20.10.0 (Compatible)
✅ npm: v10.2.3 (Compatible) 
✅ Git: v2.42.0 (Compatible)
✅ Java: openjdk 17.0.8 (Compatible)
✅ Android SDK: Found at C:\Users\...\Android\Sdk
✅ Gradle: v8.4 (Compatible)
✅ Project Structure: Complete
✅ Dependencies: All installed

🎉 RESULT: System is ready for APK generation!

📁 APK Build Commands Available:
   npm run build:apk:debug
   npm run build:apk:release
```

## 🚨 Troubleshooting

If you encounter execution policy issues:
```powershell
# Temporarily allow script execution
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# Or set for current user only
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

If clone fails due to authentication:
```powershell
# Use HTTPS with token (if repository is private)
git clone https://username:token@github.com/vaibhavshrivastavait/mht-assessment-android-app.git
```

## 🎯 Final Command Sequence (Copy & Paste)

```powershell
# Complete setup in one go
cd C:\Projects
git clone https://github.com/vaibhavshrivastavait/mht-assessment-android-app.git
cd mht-assessment-android-app
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
powershell -ExecutionPolicy Bypass -File .\scripts\windows-prerequisite-checker.ps1 -Detailed -ExportReport
```

This will clone the repo and run the comprehensive dependency checker with full reporting! 🚀