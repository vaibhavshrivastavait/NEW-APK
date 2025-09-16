# MHT Assessment - Professional Medical Assessment Application

## 🎯 Complete Project with Git LFS Support

This repository contains the complete MHT Assessment application with **Git Large File Storage (LFS)** support for efficient handling of large files while maintaining a complete project mirror.

---

## 📋 Prerequisites & Git LFS Setup

### 1. Install Git LFS
Git LFS is required to properly clone this repository with all large files.

#### Windows
```bash
# Download and install from: https://git-lfs.github.io/
# OR using Git for Windows (includes Git LFS)
git lfs install
```

#### macOS
```bash
# Using Homebrew
brew install git-lfs
git lfs install

# OR using MacPorts
sudo port install git-lfs
git lfs install
```

#### Linux (Ubuntu/Debian)
```bash
# Install Git LFS
curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash
sudo apt-get install git-lfs
git lfs install
```

#### Linux (CentOS/RHEL/Fedora)
```bash
# Install Git LFS
curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.rpm.sh | sudo bash
sudo yum install git-lfs  # CentOS/RHEL
# OR
sudo dnf install git-lfs  # Fedora
git lfs install
```

### 2. Clone Repository with LFS
```bash
# Clone the repository (Git LFS files download automatically)
git clone https://github.com/vaibhavshrivastavait/MHT-FINAL.git
cd MHT-FINAL

# Verify LFS files are present
git lfs ls-files

# Pull all LFS files (if needed)
git lfs pull
```

---

## 📦 Git LFS Configuration

### Files Tracked by LFS
This repository uses Git LFS to efficiently handle large files including:

#### Binary Files & Packages
- `*.apk` - Android APK files
- `*.ipa` - iOS application files  
- `*.zip`, `*.tar.gz` - Archive files
- `*.aar` - Android library files

#### Media Files
- `*.mp4`, `*.mov`, `*.avi`, `*.mkv` - Video files
- `*.png`, `*.jpg`, `*.jpeg`, `*.gif`, `*.webp`, `*.svg` - Image files
- `*.mp3`, `*.wav`, `*.flac`, `*.aac` - Audio files

#### Data & Documentation
- `*.json` - Large JSON configuration files
- `*.xml` - Large XML files
- `*.csv`, `*.tsv` - Data files
- `*.pdf`, `*.doc`, `*.docx` - Documentation files

#### Font Files
- `*.ttf`, `*.otf`, `*.woff`, `*.woff2` - Font files

#### Database Files
- `*.db`, `*.sqlite`, `*.sqlite3` - Database files

#### Large Log Files
- `*.log` - Large log files

### LFS Storage Limits
- **GitHub Free**: 1 GB LFS storage + 1 GB bandwidth/month
- **Paid Plans**: Additional data packs available
- **Enterprise**: Higher limits available

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
# OR
yarn install
```

### 2. Start Development Server
```bash
npm start
# OR
yarn start
```

### 3. Build for Production

#### Android APK
```bash
cd android
./gradlew assembleDebug
# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

#### iOS (macOS only)
```bash
cd ios
pod install
open MHTAssessment.xcworkspace
# Build using Xcode
```

---

## 🏥 Application Features

### Medical Assessment Tools
- **AI-Powered Risk Calculators**: 6 comprehensive calculators including Framingham Risk Score, ASCVD Risk Calculator, Gail Model, Tyrer-Cuzick Model, Wells Score, and FRAX Calculator
- **Drug Interaction Checker**: Dynamic category-based system with real-time analysis and severity color coding
- **Complete Assessment Workflow**: Demographics → Symptoms → Risk Factors → Results with evidence-based recommendations
- **Treatment Plan Generator**: Clinical decision support with NICE/ACOG/Endocrine Society guidelines integration

### Educational Components
- **CME Learning System**: 6 comprehensive modules with interactive quizzes and progress tracking
- **Evidence-Based Guidelines**: Integration with major medical society recommendations
- **Continuing Education Credits**: Professional development tracking

### Technical Excellence
- **Offline-First Architecture**: Complete functionality without internet dependency
- **Professional Medical UI**: Designed for clinical environments
- **PDF Export**: Generate professional treatment plans and patient reports
- **Data Persistence**: Secure local storage with AsyncStorage

---

## 🔧 Technical Architecture

### Core Technologies
- **React Native/Expo SDK 50**: Cross-platform mobile development
- **TypeScript**: Complete type safety and enhanced development experience
- **Zustand**: Lightweight state management
- **AsyncStorage**: Offline-first data persistence
- **React Navigation**: Professional navigation system

### Medical Compliance
- **NICE Guidelines**: National Institute for Health and Care Excellence
- **ACOG Guidelines**: American College of Obstetricians and Gynecologists  
- **Endocrine Society**: Clinical practice guidelines
- **IMS Guidelines**: International Menopause Society
- **NAMS Guidelines**: North American Menopause Society

---

## 📱 Platform Support
- **iOS**: iPhone and iPad (iOS 11+)
- **Android**: Phones and tablets (API 21+)
- **Web**: Modern browsers with React Native Web

---

## 🔍 Git LFS Verification

### Verify LFS Setup
```bash
# Check if Git LFS is installed
git lfs version

# List all LFS tracked files in repository
git lfs ls-files

# Show LFS file details
git lfs ls-files --debug

# Check LFS configuration
git lfs env
```

### Verify Large Files Are in LFS
```bash
# Check if specific file is in LFS
git lfs ls-files | grep "filename.apk"

# See LFS object information
git lfs pointer --file="android/app/build/outputs/apk/debug/app-debug.apk"

# Check LFS bandwidth and storage usage
git lfs fsck
```

### Troubleshooting LFS Issues
```bash
# If LFS files appear as pointers instead of actual files
git lfs pull

# If large files failed to upload to LFS
git lfs push --all origin main

# Reset LFS tracking (if needed)
git lfs untrack "*.apk"
git lfs track "*.apk"
git add .gitattributes
```

---

## 📊 Repository Statistics

### Project Structure
- **Complete Source Code**: All React Native components, screens, and utilities
- **Build Configurations**: Android Studio and Xcode project files
- **Assets**: Images, fonts, and media files (tracked via LFS)
- **Dependencies**: Complete node_modules (when present)
- **Documentation**: Comprehensive guides and README files

### LFS Usage Benefits
- **Efficient Cloning**: Large files don't slow down git operations
- **Version Control**: Full history maintained for all file types
- **Bandwidth Optimization**: Only download large files when needed
- **Complete Project Mirror**: All files included, none excluded

---

## 🚨 Important Notes

### Git LFS Limitations
- **Storage Quota**: 1 GB free per GitHub account (paid plans available)
- **Bandwidth Quota**: 1 GB per month (additional packs available)
- **File Size Limit**: 2 GB per individual file (Git LFS limit)

### Best Practices
1. **Always use `git lfs install`** before cloning
2. **Use `git lfs pull`** if files appear as pointers
3. **Check `git lfs ls-files`** to verify LFS tracking
4. **Monitor storage usage** in GitHub settings

---

## 🤝 Contributing

### For Contributors
1. Install Git LFS: `git lfs install`
2. Clone repository: `git clone [repo-url]`
3. Verify LFS files: `git lfs ls-files`
4. Make changes and commit normally
5. Large files automatically go to LFS based on `.gitattributes`

### Adding New File Types to LFS
```bash
# Track new file types in LFS
git lfs track "*.newfiletype"

# Commit .gitattributes changes
git add .gitattributes
git commit -m "Track .newfiletype files with Git LFS"
```

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🙋‍♂️ Support

For support and questions:
- Create an issue in the GitHub repository
- Check the comprehensive documentation in this README
- Review Git LFS documentation: https://git-lfs.github.io/

---

**🏥 Complete MHT Assessment project with Git LFS - Ready for professional medical use! 📱**