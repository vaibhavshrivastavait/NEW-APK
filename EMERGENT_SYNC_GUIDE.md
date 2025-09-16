# 🚀 Emergent to GitHub Sync Guide

## Overview
This script syncs your **MHT Assessment project** from the **Emergent platform** to your **GitHub repository** using the in-built Emergent terminal.

## Quick Usage

### Simple Sync (Recommended)
```bash
cd /app && ./sync_to_github.sh
```

### Detailed Sync (Advanced)
```bash
cd /app && ./emergent_to_github_sync.sh
```

## What the Script Does

### 🔧 **Automatic Configuration**
- ✅ Configures Git for Emergent environment
- ✅ Sets up GitHub credentials and repository
- ✅ Handles container environment issues (HOME directory, etc.)

### 📊 **Project Analysis**
- ✅ Verifies all key project files are present
- ✅ Counts React Native screens, components, config files
- ✅ Shows project statistics before sync

### 🧹 **Smart Cleanup**
- ✅ Removes large files (`node_modules`, build artifacts)
- ✅ Keeps all essential source code and configurations
- ✅ Optimizes for GitHub's file size limits

### 📤 **Intelligent Sync**
- ✅ Creates comprehensive commit messages
- ✅ Handles both new projects and updates
- ✅ Provides detailed sync summary

## Sample Output

```
🚀 EMERGENT TO GITHUB SYNC - MHT Assessment App
================================================================
📂 Source: Emergent.sh Platform
📂 Target: https://github.com/vaibhavshrivastavait/mht-assessment-android-app
📂 Project: MHT Assessment React Native App

🔧 Configuring Git for Emergent environment...
✅ Git configured successfully

📊 Analyzing MHT Assessment project structure...
🔍 Checking key project files:
  ✅ App.tsx
  ✅ screens
  ✅ components
  ✅ android
  ✅ app.json

📈 Project Statistics:
  • Total files (excluding node_modules): 172
  • React Native screens: 8
  • Components: 3
  • Configuration files: 12

🧹 Cleaning up large files for GitHub compatibility...
✅ Cleanup completed

📝 Creating optimized .gitignore for React Native...
✅ .gitignore created

📦 Setting up Git repository...
✅ Git repository configured

📤 Syncing to GitHub...
📊 Files to sync: 168
🚀 Pushing to GitHub...
✅ Successfully synced to GitHub!

🎉 EMERGENT TO GITHUB SYNC COMPLETED SUCCESSFULLY!
================================================================
🔗 GitHub URL: https://github.com/vaibhavshrivastavait/mht-assessment-android-app
```

## What Gets Synced

### ✅ **INCLUDED**
- **All Source Code**: `*.tsx`, `*.ts`, `*.js` files
- **React Native Screens**: All screen components
- **Components**: Reusable UI components
- **Android Project**: Complete Android build structure
- **Configuration**: `app.json`, `package.json`, gradle files
- **Assets**: Images, fonts, data files
- **Documentation**: README, guides, scripts

### ❌ **EXCLUDED (Auto-cleaned)**
- `node_modules/` (593MB - restored with `npm install`)
- Build outputs (`android/build/`, cache directories)
- Large binaries and temporary files
- IDE specific files

## Repository Information

- **URL**: https://github.com/vaibhavshrivastavait/mht-assessment-android-app
- **Owner**: vaibhav Shrivastava
- **Size**: Optimized < 100MB
- **Contents**: Complete React Native project ready for build

## After Sync - How to Use

### 1. Clone on Your Local PC
```bash
git clone https://github.com/vaibhavshrivastavait/mht-assessment-android-app.git
cd mht-assessment-android-app
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Build APK
```bash
# Open Android Studio and import android/ folder
# OR use Gradle directly:
cd android
./gradlew assembleDebug  # For bundled debug APK (works offline)
./gradlew assembleRelease  # For production APK
```

## Features Included in Sync

Your GitHub repository includes all the fixes and features:
- ✅ **Single splash screen** (1.5 seconds, no duplicates)
- ✅ **Bundled Debug APK** configuration (works without WiFi)
- ✅ **Visible back buttons** (← arrows on all screens)
- ✅ **Working CME quiz** with ✕ close button
- ✅ **Fixed MaterialIcons** rendering
- ✅ **Enhanced Android stability**

## Troubleshooting

### If Script Fails
1. **Check Directory**: Make sure you're in `/app`
2. **Check Network**: Ensure internet connection is stable
3. **Check Token**: Verify GitHub token has push permissions
4. **Re-run Script**: Most issues resolve with a second run

### If GitHub Push Fails
```bash
# Check git status
git status

# Manual push if needed
git push origin main --force
```

### If Files Missing
- The script excludes large files automatically
- All essential source code is always included
- Dependencies can be restored with `npm install`

## Multiple Syncs
- ✅ **Safe to run multiple times**
- ✅ **Incremental updates** - only syncs changes
- ✅ **Overwrites previous versions** safely
- ✅ **Maintains commit history**

## Perfect For
- ✅ **Regular backups** of your Emergent project
- ✅ **Sharing with team members**
- ✅ **Building on local machines**
- ✅ **Deploying to production**

Your MHT Assessment project is now fully synchronized and ready for professional deployment! 🎉