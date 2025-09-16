# MHT Assessment - Android App

A comprehensive React Native (Expo) mobile application for Menopausal Hormone Therapy (MHT) clinical decision support.

## 🏥 Overview

The MHT Assessment app provides healthcare professionals with:
- **Patient Assessment Flow**: Complete clinical evaluation workflow
- **Risk Factor Analysis**: Comprehensive risk calculation algorithms  
- **MHT Recommendations**: Evidence-based treatment guidance
- **CME Mode**: Continuing Medical Education with certificates
- **Patient Records**: Local data management and export capabilities

## ✅ Recent Bug Fixes (All Resolved)

### 1. Splash Screen Transition
- **Issue**: App hanging on splash screen, not transitioning to Home
- **Fix**: Implemented guaranteed 1.5-second timeout with bulletproof animation
- **File**: `components/SplashScreen.tsx`

### 2. Patient Records Save/Delete
- **Issue**: Save/Delete buttons not functional, blank records screen
- **Fix**: Added complete AsyncStorage persistence with `deleteAllPatients()` function
- **Files**: `store/assessmentStore.ts`, `screens/PatientListScreen.tsx`

### 3. CME Quiz Close Button & Validation
- **Issue**: Close button not working, answer validation showing both correct/wrong
- **Fix**: Fixed navigation to CME dashboard, corrected shuffling algorithm
- **File**: `screens/CmeQuizScreen.tsx`

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for APK builds)
- Yarn or npm

### Installation

```bash
# Clone repository
git clone https://github.com/[username]/mht-assessment-android-app.git
cd mht-assessment-android-app

# Install dependencies  
yarn install
# or
npm install

# Start development server
expo start
```

### Android APK Build

```bash
# Build for Android
expo build:android

# Or using EAS Build (recommended)
npx eas build --platform android
```

## 📱 Project Structure

```
├── components/          # Reusable UI components
│   └── SplashScreen.tsx # App loading animation
├── screens/            # Main application screens
│   ├── HomeScreen.tsx
│   ├── PatientListScreen.tsx
│   ├── CmeQuizScreen.tsx
│   └── ...
├── store/              # State management (Zustand)
│   └── assessmentStore.ts
├── assets/             # Images, fonts, and static files
├── App.tsx            # Main application component
└── package.json       # Dependencies and scripts
```

## 🔧 Technical Stack

- **Framework**: React Native with Expo SDK 50
- **State Management**: Zustand with AsyncStorage persistence
- **Navigation**: React Navigation 6
- **UI Components**: React Native built-in components
- **Local Storage**: AsyncStorage for patient data
- **Build Tool**: Expo CLI / EAS Build

## 📊 Features

### Assessment Flow
1. **Patient Intake** - Basic patient information
2. **Demographics** - Age, medical history, lifestyle factors  
3. **Symptoms** - Menopausal symptom evaluation
4. **Risk Factors** - Cardiovascular, cancer, VTE risk assessment
5. **Results** - MHT recommendations with rationale

### Data Management
- Patient records saved locally with AsyncStorage
- Export capabilities for clinical documentation
- Data persists across app restarts
- Individual and bulk delete options

### CME Mode
- Interactive educational modules
- Progress tracking and certificates
- Quiz validation with accurate scoring
- Continuing education credits

## 🛠️ Development

### Package Compatibility
- React Native: 0.73.6 (Expo SDK 50 compatible)
- expo-av: ~13.10.6
- expo-print: ~12.8.1
- @types/react: ~18.2.45

### Environment Variables
Create `.env` file with:
```
EXPO_PUBLIC_BACKEND_URL=your_backend_url
```

### Testing
```bash
# Run on iOS simulator
expo start --ios

# Run on Android emulator  
expo start --android

# Web development
expo start --web
```

## 📦 Deployment

### Android APK
1. Configure `app.json` with your app details
2. Run `expo build:android` or use EAS Build
3. Download APK from build dashboard
4. Install on Android devices for testing

### Production Build
- Use EAS Build for production-ready APKs
- Configure signing certificates
- Submit to Google Play Store

## 🔍 Troubleshooting

### Common Issues
- **Metro cache issues**: Run `expo r -c` to clear cache
- **Package conflicts**: Ensure all packages match Expo SDK 50
- **Android build fails**: Check Gradle and SDK versions

### Development Tips
- Use physical devices for accurate testing
- Clear Metro cache when switching between platforms
- Verify AsyncStorage data persistence after app restarts

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both platforms
5. Submit a pull request

## 📞 Support

For issues or questions regarding the MHT Assessment app, please open an issue in this repository.

---

**Status**: ✅ All critical bugs resolved, ready for production use
**Last Updated**: September 2025
**Build Status**: APK generation ready
