# 💻 Local PC Setup Guide - MHT Assessment APK Build

This guide helps you set up your local PC to build self-contained Android APKs for the MHT Assessment app.

## 🎯 **Prerequisites Overview**

You'll need to install:
1. **Node.js 18+** - JavaScript runtime
2. **Java JDK 17+** - Android build requirement  
3. **Android SDK** - Android development tools
4. **Git** - Version control (if not already installed)

## 🖥️ **Windows Setup**

### **Step 1: Install Node.js**
1. Go to https://nodejs.org/
2. Download **LTS version** (18.x or higher)
3. Run installer with default settings
4. Verify installation:
   ```cmd
   node --version
   npm --version
   ```

### **Step 2: Install Java JDK 17**
1. Go to https://adoptium.net/
2. Download **OpenJDK 17** for Windows
3. Run installer
4. Set JAVA_HOME environment variable:
   - Open "Environment Variables" in Windows
   - Add `JAVA_HOME` = `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot`
   - Add to PATH: `%JAVA_HOME%\bin`
5. Verify installation:
   ```cmd
   java -version
   ```

### **Step 3: Install Android SDK**
1. Download Android Command Line Tools:
   - Go to https://developer.android.com/studio/command-line-tools
   - Download "Command line tools only" for Windows
2. Extract to `C:\Android\cmdline-tools\latest\`
3. Set environment variables:
   - `ANDROID_HOME` = `C:\Android`
   - Add to PATH: `%ANDROID_HOME%\cmdline-tools\latest\bin`
   - Add to PATH: `%ANDROID_HOME%\platform-tools`
4. Install required SDK packages:
   ```cmd
   sdkmanager --licenses
   sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
   ```

### **Step 4: Install Git (if needed)**
1. Download from https://git-scm.com/download/win
2. Install with default settings

### **Step 5: Clone and Setup Project**
```cmd
# Clone your repository
git clone https://github.com/yourusername/mht-assessment.git
cd mht-assessment

# Install project dependencies
npm install
# or if you have yarn
yarn install
```

## 🍎 **macOS Setup**

### **Step 1: Install Homebrew (if not installed)**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### **Step 2: Install Node.js**
```bash
brew install node@18
node --version  # Should be 18.x or higher
```

### **Step 3: Install Java JDK 17**
```bash
brew install openjdk@17

# Set JAVA_HOME in your shell profile (.zshrc or .bash_profile)
echo 'export JAVA_HOME=/opt/homebrew/opt/openjdk@17' >> ~/.zshrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.zshrc
source ~/.zshrc

java -version  # Verify installation
```

### **Step 4: Install Android SDK**
```bash
# Download Android command line tools
cd ~/Downloads
wget https://dl.google.com/android/repository/commandlinetools-mac-11076708_latest.zip
unzip commandlinetools-mac-11076708_latest.zip

# Create Android SDK directory
mkdir -p ~/Android/cmdline-tools
mv cmdline-tools ~/Android/cmdline-tools/latest

# Set environment variables in ~/.zshrc
echo 'export ANDROID_HOME=~/Android' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools' >> ~/.zshrc
source ~/.zshrc

# Install SDK packages
sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

### **Step 5: Clone and Setup Project**
```bash
# Clone your repository
git clone https://github.com/yourusername/mht-assessment.git
cd mht-assessment

# Install dependencies
yarn install
```

## 🐧 **Linux (Ubuntu/Debian) Setup**

### **Step 1: Update Package Manager**
```bash
sudo apt update && sudo apt upgrade -y
```

### **Step 2: Install Node.js**
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### **Step 3: Install Java JDK 17**
```bash
sudo apt install openjdk-17-jdk

# Set JAVA_HOME
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
echo 'export PATH=$PATH:$JAVA_HOME/bin' >> ~/.bashrc
source ~/.bashrc

java -version  # Verify installation
```

### **Step 4: Install Android SDK**
```bash
# Install required tools
sudo apt install wget unzip

# Download Android command line tools
cd ~/Downloads
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip commandlinetools-linux-11076708_latest.zip

# Setup Android SDK
mkdir -p ~/Android/cmdline-tools
mv cmdline-tools ~/Android/cmdline-tools/latest

# Set environment variables
echo 'export ANDROID_HOME=~/Android' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools' >> ~/.bashrc
source ~/.bashrc

# Install SDK packages
yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# Fix file watcher limits (common issue)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### **Step 5: Clone and Setup Project**
```bash
# Install git if needed
sudo apt install git

# Clone your repository
git clone https://github.com/yourusername/mht-assessment.git
cd mht-assessment

# Install dependencies
npm install
```

## ✅ **Verification Steps**

After setup, verify everything works:

```bash
# Check all tools are installed
node --version    # Should be 18.x+
java -version     # Should be 17.x+
adb --version     # Should show Android Debug Bridge version

# Check environment variables
echo $JAVA_HOME
echo $ANDROID_HOME

# Test project setup
cd mht-assessment
npm run build:apk  # This should start the build process
```

## 📱 **Enable Android Device for Testing**

### **On Your Android Device:**
1. Go to **Settings → About Phone**
2. Tap **Build Number** 7 times to enable Developer Options
3. Go to **Settings → Developer Options**
4. Enable **USB Debugging**
5. Connect device to PC via USB
6. Accept the "Allow USB Debugging" prompt

### **Verify Device Connection:**
```bash
adb devices
# Should show your device listed
```

## 🚀 **Build and Install APK**

### **Method 1: Quick Build**
```bash
# Build debug APK
npm run build:apk

# Install on connected device
adb install mht-assessment-standalone-debug.apk
```

### **Method 2: Using Build Scripts**

**Windows (PowerShell):**
```powershell
.\scripts\build-standalone-apk.ps1 -BuildType debug
```

**Linux/macOS:**
```bash
./scripts/build-standalone-apk.sh debug
```

### **Method 3: Manual Step-by-Step**
```bash
# 1. Install dependencies
npm install

# 2. Clean previous builds
rm -rf android/app/src/main/assets/index.android.bundle

# 3. Create asset directories
mkdir -p android/app/src/main/assets
mkdir -p android/app/src/main/res

# 4. Bundle JavaScript
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output android/app/src/main/assets/index.android.bundle \
  --assets-dest android/app/src/main/res/ \
  --reset-cache

# 5. Build APK
cd android
./gradlew assembleDebug  # Linux/macOS
# or
.\gradlew.bat assembleDebug  # Windows
cd ..

# 6. Install APK
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## 🐛 **Common Issues & Solutions**

### **"JAVA_HOME not set"**
```bash
# Windows
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot

# Linux/macOS
export JAVA_HOME=/path/to/java-17
```

### **"Android SDK not found"**
```bash
# Windows
set ANDROID_HOME=C:\Android

# Linux/macOS
export ANDROID_HOME=~/Android
```

### **"adb: command not found"**
Add platform-tools to PATH:
```bash
# Add to your shell profile
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### **"Bundle build failed"**
```bash
# Clear Metro cache
npx react-native start --reset-cache
rm -rf node_modules/.cache
npm install
```

### **"Device not found"**
1. Enable USB Debugging on device
2. Install device drivers (Windows)
3. Try different USB cable
4. Run `adb devices` to verify connection

### **File Watcher Limit (Linux)**
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## 📋 **Build Environment Summary**

After successful setup, you should have:

- ✅ **Node.js 18+** for JavaScript development
- ✅ **Java JDK 17+** for Android compilation
- ✅ **Android SDK API 34** for app building
- ✅ **Build Tools 34.0.0** for APK generation
- ✅ **Platform Tools (ADB)** for device communication
- ✅ **Project Dependencies** installed via npm/yarn

## 🎉 **You're Ready!**

Once setup is complete, you can:

1. **Build APKs locally** using the provided scripts
2. **Install and test** on Android devices
3. **Develop and iterate** on the MHT Assessment app
4. **Create production builds** for deployment

The APK will be fully self-contained and work on any Android device without requiring Metro or development tools.