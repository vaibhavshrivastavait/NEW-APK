# 🚀 MHT Assessment - Enhanced GitHub Sync Guide

## Overview
The enhanced sync script ensures **ALL** project files and folders under 50MB are transferred from the Emergent platform to your GitHub repository.

## Usage

### Quick Sync (Recommended)
```bash
cd /app && ./sync.sh
```

### Direct Enhanced Sync
```bash
cd /app && ./enhanced_sync.sh
```

## What Gets Synced

### ✅ **INCLUDED (All Essential Files)**
- **Source Code**: All `.tsx`, `.ts`, `.js`, `.jsx` files
- **Configuration**: `app.json`, `package.json`, `.gradle`, `.xml`, `.properties`
- **Android Project**: Complete Android folder structure (excluding builds)
- **Assets**: Images, fonts, sounds, guidelines data
- **Documentation**: `README.md`, `*.md` files
- **Scripts**: All `.sh` utility scripts
- **Styles**: CSS, style configurations
- **Components**: All React Native components
- **Screens**: All application screens
- **Store**: State management files (Zustand)

### ❌ **EXCLUDED (Large/Generated Files)**
- `node_modules/` (593MB - can be restored with `yarn install`)
- Build outputs (`android/build/`, `ios/build/`)
- Cache directories (`.expo/`, `.metro-cache/`)
- Large binaries (`*.apk`, `*.ipa`, `*.aab`)
- Temporary files and logs

## Features

### 🔍 **Smart Analysis**
- Analyzes project structure before sync
- Identifies large files automatically
- Shows file count breakdown
- Calculates repository size

### 🛡️ **Size Protection**
- Enforces 50MB per file limit
- Optimizes total repository size < 100MB
- Automatically excludes oversized files
- Provides size breakdown reports

### 📊 **Comprehensive Reporting**
- Shows exactly what files are being synced
- Displays file counts and sizes
- Provides sync summary and status
- Lists repository details and URLs

## Sample Output

```
🚀 MHT Assessment - ENHANCED COMPREHENSIVE GitHub Sync
Repository: https://github.com/vaibhavshrivastavait/mht-assessment-android-app
Max File Size: 50M | Total Repo Limit: 100MB

📊 Analyzing project structure...
📁 Directory Structure:
./screens
./components  
./store
./android
./assets

📄 File Count Summary:
Total files (excluding node_modules): 147
TypeScript files: 23
JavaScript files: 15
JSON files: 8
Config files: 12

🔍 Checking for files larger than 50M...
✅ No files larger than 50M found

📊 Calculating repository size...
Estimated repository size: 11M

📁 Adding all project files...
Files to be committed:
screens/HomeScreen.tsx
screens/CmeScreen.tsx
components/SplashScreen.tsx
android/app/build.gradle
...
Total files: 147

📤 Pushing comprehensive update to GitHub...
✅ Successfully synced complete project to GitHub!

🎉 COMPREHENSIVE PROJECT SYNC COMPLETED!
```

## After Sync - How to Use

### 1. Clone Repository
```bash
git clone https://github.com/vaibhavshrivastavait/mht-assessment-android-app.git
cd mht-assessment-android-app
```

### 2. Install Dependencies
```bash
yarn install
# or
npm install
```

### 3. Open in Android Studio
- Open Android Studio
- Import project from `android/` folder
- Sync Gradle files
- Build APK

### 4. Run on Device/Emulator
```bash
npx expo run:android
# or build APK in Android Studio
```

## Troubleshooting

### If sync fails:
1. Check internet connection
2. Verify GitHub credentials
3. Ensure files are under 50MB
4. Check disk space

### If repository seems incomplete:
1. Run the enhanced sync again
2. Check the excluded files list
3. Verify .gitignore settings

## Repository Details
- **URL**: https://github.com/vaibhavshrivastavait/mht-assessment-android-app
- **Owner**: vaibhav Shrivastava
- **Size Limit**: < 100MB total
- **Status**: Production ready for APK builds

## Support
The enhanced sync script ensures complete project transfer while respecting GitHub's size limits. All essential files for building and running the MHT Assessment app are included.