# MHT Assessment - Local Setup Guide

## 📱 Project Overview
This is the updated MHT Assessment app with the new Drug Interaction Checker featuring:
- ✅ 1:1 severity mapping between main and optional medicines
- ✅ Color-coded display (Yellow=LOW, Orange=MODERATE, Red=HIGH)
- ✅ Updated disclaimer as per requirements
- ✅ Fixed AsyncStorage crashes on Android devices
- ✅ Crash-safe error boundaries

## 🛠️ Prerequisites

### Required Software:
1. **Node.js** (v18 or later): https://nodejs.org/
2. **npm** or **yarn**: Comes with Node.js
3. **Git**: https://git-scm.com/
4. **Expo CLI**: `npm install -g @expo/cli`

### For Mobile Testing:
5. **Expo Go app** on iOS/Android: Download from App Store/Play Store
6. **Android Studio** (for Android emulator): https://developer.android.com/studio
7. **Xcode** (for iOS simulator, Mac only): https://developer.apple.com/xcode/

## 📂 Project Structure
```
mht-assessment/
├── components/           # React Native components
│   ├── SimpleDrugInteractionChecker.tsx  # Main Drug Interaction Checker
│   ├── SafeFlatList.tsx                  # Crash-safe FlatList wrapper
│   └── AppErrorBoundary.tsx              # App-level error boundary
├── src/
│   └── interaction-aggregator.ts         # Core interaction logic
├── assets/
│   └── drug_interactions.json            # Drug interaction data
├── screens/              # App screens
├── utils/
│   └── asyncStorageUtils.ts              # Crash-proof AsyncStorage
├── store/
│   └── assessmentStore.ts                # Zustand state management
├── tests/
│   └── interaction.test.ts               # Interaction tests
├── app.json              # Expo configuration
├── package.json          # Dependencies
└── README.md
```

## 🚀 Setup Instructions

### 1. Extract and Navigate
```bash
# Extract the downloaded archive
tar -xzf mht_assessment_updated_YYYYMMDD_HHMMSS.tar.gz
cd mht-assessment
```

### 2. Install Dependencies
```bash
# Install all required packages
npm install

# Or if you prefer yarn:
yarn install
```

### 3. Environment Setup
```bash
# The .env file is already configured, but verify it contains:
cat .env
```

Should contain:
```
EXPO_PACKAGER_PROXY_URL=http://localhost:3000
EXPO_PACKAGER_HOSTNAME=localhost
EXPO_PUBLIC_BACKEND_URL=http://localhost:3000
```

## 📱 Running the App

### Option 1: Web Preview (Recommended for Testing)
```bash
# Start the development server
npx expo start --web

# Or specify port explicitly
npx expo start --web --port 3000
```
Access at: http://localhost:3000

### Option 2: Mobile Device (Expo Go)
```bash
# Start with QR code for mobile
npx expo start

# Scan the QR code with:
# - iPhone: Camera app
# - Android: Expo Go app
```

### Option 3: iOS Simulator (Mac only)
```bash
# Start development server
npx expo start

# Press 'i' in terminal to open iOS simulator
# Or run: npx expo start --ios
```

### Option 4: Android Emulator
```bash
# Make sure Android emulator is running first
# Then start development server
npx expo start

# Press 'a' in terminal to open Android emulator
# Or run: npx expo start --android
```

## 🧪 Testing the Drug Interaction Checker

### 1. Navigate to Drug Interaction Checker:
1. Open the app
2. Start an assessment or navigate to "Results" screen
3. Look for "Drug Interaction Checker" button/modal
4. Tap to open the checker

### 2. Test the Functionality:
1. **Select Main Medicine**: Tap "Hormone Replacement Therapy (HRT)"
2. **Select Optional Medicines**: 
   - Tap "Anticoagulants" → Should show HIGH (Red)
   - Tap "NSAIDs" → Should show LOW (Yellow)
3. **Verify Results Section**: Should appear with "Checking" title
4. **Check Colors**: 
   - HIGH = Red (#F44336)
   - LOW = Yellow (#FFC107)
5. **Verify Disclaimer**: Should appear at bottom with exact text

### 3. Expected Behavior:
- ✅ Medicine name + severity shown together
- ✅ Color-coded severity indicators
- ✅ 1:1 mapping (not cumulative)
- ✅ Professional disclaimer at bottom
- ✅ No crashes when navigating

## 🔧 Troubleshooting

### Common Issues:

#### "Metro bundler error" or "Port in use"
```bash
# Clear cache and restart
npx expo start --clear
```

#### "Module not found" errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### App crashes on Android device
- The AsyncStorage crashes have been fixed with crash-proof wrappers
- If still occurring, check device logs: `adb logcat`

#### Web preview not loading
```bash
# Try different port
npx expo start --web --port 3001
```

#### Cannot find Expo CLI
```bash
# Install globally
npm install -g @expo/cli
```

## 📊 Verification Tests

### Test the Core Functionality:
```bash
# Run the interaction tests (if Jest is set up)
npm test

# Or test manually with Node.js:
node -e "
const interactions = require('./assets/drug_interactions.json');
console.log('Loaded', interactions.length, 'interaction rules');
interactions.forEach(rule => {
  console.log(rule.primary, '+', rule.interaction_with, '=', rule.severity);
});
"
```

### Expected Output:
```
Loaded 2 interaction rules
Hormone Replacement Therapy (HRT) + Anticoagulants = HIGH
Hormone Replacement Therapy (HRT) + NSAIDs = LOW
```

## 🏗️ Development Commands

### Useful Development Commands:
```bash
# Start with tunnel (for remote testing)
npx expo start --tunnel

# Start with specific platform
npx expo start --android
npx expo start --ios
npx expo start --web

# Clear all caches
npx expo start --clear

# Check for updates
npx expo install --check

# View project info
npx expo config
```

### Code Quality:
```bash
# If you have ESLint configured
npm run lint

# Format code (if Prettier is set up)
npm run format
```

## 📋 Key Files Updated

The following files contain the Drug Interaction Checker updates:

1. **`src/interaction-aggregator.ts`** - Core severity calculation logic
2. **`assets/drug_interactions.json`** - Interaction data (2 rules currently)
3. **`components/SimpleDrugInteractionChecker.tsx`** - Main UI component
4. **`tests/interaction.test.ts`** - Automated tests
5. **`utils/asyncStorageUtils.ts`** - Crash-proof storage wrapper

## 🎯 Success Criteria

Your app is working correctly if:
- ✅ App loads without crashes
- ✅ Drug Interaction Checker accessible from Results screen
- ✅ HRT + Anticoagulants shows HIGH (Red)
- ✅ HRT + NSAIDs shows LOW (Yellow)
- ✅ Medicine names appear with severities
- ✅ Disclaimer shows exact required text
- ✅ No crashes when navigating on Android devices

## 🆘 Support

If you encounter issues:
1. Check this guide first
2. Verify Node.js and Expo CLI versions
3. Try clearing cache: `npx expo start --clear`
4. Check console output for specific error messages
5. Test on different platforms (web, mobile, simulator)

## 🚀 Next Steps

After successful local setup:
1. Test all functionality thoroughly
2. Customize interaction data in `assets/drug_interactions.json`
3. Add more main medicines and optional medicines as needed
4. Expand test coverage in `tests/interaction.test.ts`
5. Deploy to production when ready

---

**Note**: This guide focuses on development and testing. Production builds and app store deployment require additional steps not covered here.