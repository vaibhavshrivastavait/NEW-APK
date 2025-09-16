# MHT Assessment - GitHub Repository Setup Guide

## 🎯 Project Overview

The **MHT Assessment** is a comprehensive React Native/Expo mobile application designed for clinical decision support in Menopause Hormone Therapy (MHT). This repository contains all essential project files under 50MB, ready for immediate development and deployment.

## 📊 Repository Statistics

- **Total Project Size**: ~50MB (excluding node_modules)
- **Files Included**: All essential source code, configurations, and assets
- **Ready for**: Development, building, and deployment on any machine
- **Platform Support**: iOS, Android, Web (React Native Web)

## 🏗️ Architecture Overview

### Core Technologies
- **React Native/Expo SDK 50**: Cross-platform mobile development
- **TypeScript**: Type safety and enhanced development experience
- **Zustand**: Lightweight state management
- **AsyncStorage**: Offline-first data persistence
- **FastAPI Backend**: Ready for integration (simple_backend.py)
- **MongoDB**: Database support configuration included

### Key Features Implemented
1. **AI-Powered Risk Assessment**
   - Framingham Risk Score
   - ASCVD Risk Calculator
   - Gail Model (Breast Cancer Risk)
   - Tyrer-Cuzick Model
   - Wells Score (VTE Risk)
   - FRAX Calculator (Fracture Risk)

2. **Drug Interaction Checker**
   - Dynamic category-based selection system
   - Real-time interaction analysis
   - Severity color coding (High/Moderate/Low)
   - Comprehensive drug rules engine

3. **Complete Assessment Workflow**
   - Demographics → Symptoms → Risk Factors → Results
   - Real-time BMI calculation
   - VAS (Visual Analog Scale) symptom rating
   - Evidence-based MHT recommendations

4. **Treatment Plan Generator**
   - Clinical decision support system
   - NICE/ACOG/Endocrine Society guidelines integration
   - Contraindication detection
   - PDF export functionality

5. **CME Learning System**
   - 6 comprehensive modules
   - Interactive quizzes with validation
   - Progress tracking and certificates
   - Offline-first architecture

## 📁 Directory Structure

```
mht-assessment/
├── 📱 Core App Files
│   ├── App.tsx                 # Main application component
│   ├── index.js               # Entry point
│   ├── package.json           # Dependencies and scripts
│   ├── app.json              # Expo configuration
│   └── metro.config.js       # Metro bundler configuration
│
├── 📂 Source Code (All under 50MB)
│   ├── components/           # Reusable UI components (92KB)
│   ├── screens/             # Application screens (900KB)
│   ├── utils/               # Utility functions and calculators (692KB)
│   ├── store/               # Zustand state management
│   ├── assets/              # Images, fonts, and static files (3.2MB)
│   ├── data/                # JSON configuration files (92KB)
│   └── mht_rules/           # Clinical decision rules (96KB)
│
├── 🔧 Build Configuration
│   ├── android/             # Android project files (13MB)
│   ├── ios/                 # iOS project files (1.9MB)
│   ├── scripts/             # Build and deployment scripts (288KB)
│   └── __tests__/           # Test files (36KB)
│
├── 📝 Configuration Files
│   ├── babel.config.js      # Babel transpiler configuration
│   ├── tsconfig.json        # TypeScript configuration
│   ├── jest.config.js       # Jest testing configuration
│   ├── webpack.config.js    # Webpack bundling configuration
│   └── .env                 # Environment variables
│
└── 📚 Documentation
    ├── README.md            # Main project documentation
    ├── *.md files           # Comprehensive guides and documentation
    └── test_result.md       # Testing protocols and results
```

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/vaibhavshrivastavait/mht-assessment.git
cd mht-assessment
```

### 2. Install Dependencies
```bash
# Using npm
npm install

# OR using yarn
yarn install
```

### 3. Start Development Server
```bash
# Start Expo development server
npm start
# or
yarn start

# For web development
npm run web
# or  
yarn web
```

### 4. Mobile Development

#### iOS Development
```bash
# Install iOS dependencies
cd ios && pod install && cd ..

# Run on iOS simulator
npm run ios
# or
yarn ios
```

#### Android Development
```bash
# Run on Android emulator/device
npm run android
# or
yarn android

# OR build APK directly
cd android
./gradlew assembleDebug
```

## 🔧 Available Scripts

```json
{
  "start": "expo start",
  "android": "expo start --android", 
  "ios": "expo start --ios",
  "web": "expo start --web",
  "build": "expo build",
  "test": "jest",
  "lint": "eslint ."
}
```

## 📦 Key Dependencies Included

### Core Framework
- `expo`: ~50.0.0
- `react-native`: 0.73.6
- `react`: 18.2.0
- `typescript`: ^5.1.3

### UI and Navigation
- `@react-navigation/native`: ^6.1.9
- `react-native-screens`: ~3.29.0
- `react-native-safe-area-context`: ~4.8.2
- `react-native-gesture-handler`: ~2.14.0

### State Management and Storage
- `zustand`: ^4.4.1
- `@react-native-async-storage/async-storage`: 1.21.0

### Forms and Validation
- `react-hook-form`: ^7.45.4

### Charts and Visualization
- `react-native-svg`: 14.1.0
- `react-native-chart-kit`: ^6.12.0

## 🧪 Testing Setup

### Running Tests
```bash
# Run all tests
npm test
# or
yarn test

# Run tests in watch mode
npm run test:watch
# or
yarn test:watch

# Generate coverage report
npm run test:coverage
# or
yarn test:coverage
```

### Test Coverage
- Unit tests for medical calculators
- Integration tests for drug interaction system
- CME quiz validation tests
- Component rendering tests

## 🏥 Medical Validation

All clinical calculations and recommendations are based on:
- **NICE Guidelines** (National Institute for Health and Care Excellence)
- **ACOG Guidelines** (American College of Obstetricians and Gynecologists)
- **Endocrine Society Guidelines**
- **IMS Guidelines** (International Menopause Society)
- **NAMS Guidelines** (North American Menopause Society)

## 🔒 Data Privacy and Security

- **Offline-first architecture**: No patient data transmitted to external servers
- **Local storage only**: All data stored using AsyncStorage
- **HIPAA considerations**: Designed with healthcare data privacy in mind
- **No external API dependencies**: All calculations performed locally

## 📱 Platform Compatibility

### Supported Platforms
- ✅ **iOS**: iPhone and iPad (iOS 11+)
- ✅ **Android**: Phones and tablets (API 21+)
- ✅ **Web**: Modern browsers with React Native Web

### Device Requirements
- **iOS**: Xcode 12+ for development
- **Android**: Android Studio 4.1+ with SDK 30+
- **Node.js**: 16+ required for development

## 🔄 Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and test
npm start
npm test

# Commit and push
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

### 2. Building for Production

#### Android APK
```bash
cd android
./gradlew assembleRelease
# APK location: android/app/build/outputs/apk/release/
```

#### iOS Archive
```bash
# Open in Xcode
open ios/MHTAssessment.xcworkspace

# Or use Expo build service
expo build:ios
```

## 📈 Performance Optimizations

- **Lazy loading**: Components loaded on demand
- **Memoization**: React.memo and useMemo for expensive calculations
- **Virtual lists**: FlatList for large datasets
- **Image optimization**: Compressed assets under 50MB total
- **Bundle splitting**: Code splitting for web builds

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler errors**
   ```bash
   npx react-native start --reset-cache
   ```

2. **iOS pod installation issues**
   ```bash
   cd ios && pod install --repo-update
   ```

3. **Android build failures**
   ```bash
   cd android && ./gradlew clean && ./gradlew assembleDebug
   ```

4. **TypeScript errors**
   ```bash
   npx tsc --noEmit
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For support and questions:
- Create an issue in the GitHub repository
- Check the comprehensive documentation in the `/docs` folder
- Review the `test_result.md` file for testing protocols

## 🔮 Future Enhancements

- [ ] Integration with EHR systems
- [ ] Advanced AI risk modeling
- [ ] Multi-language support
- [ ] Telehealth consultation features
- [ ] Advanced analytics dashboard
- [ ] Cloud synchronization options

---

**📱 Ready to develop the future of menopause healthcare!** 🎉