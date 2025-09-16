# Complete MHT Assessment App - GitHub Transfer Guide

## Overview
This guide ensures you transfer **ALL files, folders, images, and assets** from your working Emergent environment to your GitHub repository.

## What You'll Get
- Complete React Native/Expo project
- All screen files and components  
- All images and branding assets
- Backend API files
- Configuration files
- Build files and scripts
- Dependencies and package files

## Method 1: Complete Manual Transfer (Recommended)

### Step 1: Create GitHub Repository
1. Go to GitHub.com and create new repository
2. Name it: `mht-assessment-app`
3. Make it Public or Private (your choice)
4. **DO NOT** initialize with README, .gitignore, or license
5. Copy the repository URL

### Step 2: Initialize Git in Emergent
```bash
cd /app/frontend
git init
git add .
git commit -m "Initial commit - Complete MHT Assessment App"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

### Step 3: Transfer Backend Files
```bash
cd /app
mkdir github-transfer
cp -r frontend/* github-transfer/
cp -r backend github-transfer/
cp package.json github-transfer/ 2>/dev/null || true
cp app.json github-transfer/ 2>/dev/null || true
cp README.md github-transfer/ 2>/dev/null || true

cd github-transfer
git init
git add .
git commit -m "Complete MHT Assessment App - Frontend + Backend"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## Method 2: Archive Download + Manual Upload

### Step 1: Create Complete Archive
```bash
cd /app
tar -czf MHT_Complete_App.tar.gz \
  frontend/ \
  backend/ \
  *.json \
  *.md \
  *.sh \
  *.txt
```

### Step 2: Download Archive
The archive `MHT_Complete_App.tar.gz` will contain everything. Download it and extract locally.

### Step 3: Upload to GitHub
1. Extract the archive locally
2. Initialize git in the extracted folder
3. Push to your GitHub repository

## Files and Folders Checklist

### ✅ Frontend Files (React Native/Expo)
- [ ] `/frontend/screens/` - All 15+ screen files
- [ ] `/frontend/components/` - SplashScreen and other components
- [ ] `/frontend/assets/` - All images, sounds, JSON files
- [ ] `/frontend/assets/images/branding/` - MHT logo files
- [ ] `/frontend/store/` - Zustand state management
- [ ] `/frontend/package.json` - All dependencies
- [ ] `/frontend/app.json` - Expo configuration
- [ ] `/frontend/eas.json` - Build configuration
- [ ] `/frontend/metro.config.js` - Metro bundler config
- [ ] `/frontend/babel.config.js` - Babel configuration
- [ ] `/frontend/tsconfig.json` - TypeScript config
- [ ] `/frontend/App.tsx` - Main app component
- [ ] `/frontend/index.js` - Entry point

### ✅ Assets and Resources
- [ ] `/frontend/assets/images/branding/mht_logo_primary.png`
- [ ] `/frontend/assets/images/branding/mht_logo_alt.png`
- [ ] `/frontend/assets/cme-content.json`
- [ ] `/frontend/assets/guidelines.json`
- [ ] `/frontend/assets/sounds/welcome_chime.mp3`
- [ ] `/frontend/assets/fonts/SpaceMono-Regular.ttf`

### ✅ Backend Files (FastAPI)
- [ ] `/backend/server.py` - Main FastAPI server
- [ ] `/backend/requirements.txt` - Python dependencies
- [ ] `/backend/.env` - Environment variables

### ✅ Configuration Files
- [ ] Root `package.json` (if exists)
- [ ] Root `app.json` (if exists)
- [ ] `README.md` files
- [ ] Build scripts and setup files

## Verification Steps

### 1. Check File Count
```bash
# In Emergent environment
find /app/frontend -type f | wc -l
find /app/backend -type f | wc -l

# Compare with your GitHub repository after transfer
```

### 2. Check Critical Files
Ensure these essential files are in your GitHub repo:
- `App.tsx` - Main app component
- `assets/images/branding/mht_logo_primary.png` - Logo
- `assets/cme-content.json` - CME data
- `assets/guidelines.json` - Guidelines data
- All screen files in `screens/` folder

### 3. Check Dependencies
Verify `package.json` contains all these critical dependencies:
- expo
- @react-navigation/native
- @react-navigation/native-stack
- zustand
- @react-native-async-storage/async-storage
- expo-print
- expo-sharing

## Troubleshooting Common Issues

### Missing Assets
If images don't show up:
```bash
# Ensure assets folder is fully copied
cp -r /app/frontend/assets/ your-local-repo/assets/
```

### Missing Dependencies
If app doesn't build locally:
```bash
# Copy the exact working package.json
cp /app/frontend/package.json your-local-repo/package.json
```

### Missing Configuration
If Expo doesn't recognize the project:
```bash
# Copy all config files
cp /app/frontend/app.json your-local-repo/
cp /app/frontend/eas.json your-local-repo/
cp /app/frontend/metro.config.js your-local-repo/
```

## Final Verification Commands

Run these in your local repository to ensure everything works:

```bash
# 1. Install dependencies
npm install
# or
yarn install

# 2. Start Expo development server
npx expo start

# 3. Verify all screens load without errors
# 4. Check that assets (logos, sounds) load properly
# 5. Test navigation between screens
```

## Expected File Structure in GitHub

```
your-mht-app-repo/
├── App.tsx
├── index.js
├── package.json
├── app.json
├── eas.json
├── metro.config.js
├── babel.config.js
├── tsconfig.json
├── assets/
│   ├── images/
│   │   └── branding/
│   │       ├── mht_logo_primary.png
│   │       └── mht_logo_alt.png
│   ├── cme-content.json
│   ├── guidelines.json
│   ├── sounds/
│   └── fonts/
├── screens/
│   ├── HomeScreen.tsx
│   ├── CmeScreen.tsx
│   ├── GuidelinesScreen.tsx
│   └── [all other screen files]
├── components/
│   └── SplashScreen.tsx
├── store/
│   └── assessmentStore.ts
└── backend/ (if included)
    ├── server.py
    └── requirements.txt
```

This structure ensures you have the complete, working MHT Assessment app that matches your Emergent preview.