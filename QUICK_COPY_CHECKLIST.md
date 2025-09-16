# ✅ Quick Copy Checklist - Update Your MHT Assessment Repository

## 📁 **Files to Copy from Emergent to Your Local Repository**

### **1. New Files to Create:**

**📄 scripts/build-standalone-apk.sh**
- Location: `scripts/build-standalone-apk.sh`
- Description: Linux/macOS build script
- Copy the entire file content

**📄 scripts/build-standalone-apk.ps1**
- Location: `scripts/build-standalone-apk.ps1`
- Description: Windows PowerShell build script
- Copy the entire file content

**📄 .github/workflows/build-apk.yml**
- Location: `.github/workflows/build-apk.yml`
- Description: GitHub Actions workflow for automated APK building
- Copy the entire file content

**📄 ANDROID_BUILD_README.md**
- Location: `ANDROID_BUILD_README.md`
- Description: Comprehensive build documentation
- Copy the entire file content

**📄 QUICK_BUILD_GUIDE.md**
- Location: `QUICK_BUILD_GUIDE.md`
- Description: Quick start guide
- Copy the entire file content

**📄 LOCAL_PC_SETUP.md**
- Location: `LOCAL_PC_SETUP.md`
- Description: Local PC setup instructions
- Copy the entire file content

**📄 COMPLETE_SETUP_INSTRUCTIONS.md**
- Location: `COMPLETE_SETUP_INSTRUCTIONS.md`
- Description: Complete setup guide
- Copy the entire file content

### **2. Files to Update:**

**📝 android/app/build.gradle**
- Add this section before `packagingOptions`:
```gradle
// Ensure universal APK (no ABI splits) for maximum compatibility
splits {
    abi {
        enable false
    }
}
```

**📝 package.json**
- Add these scripts to the `"scripts"` section:
```json
"build:apk:debug": "bash ./scripts/build-standalone-apk.sh debug",
"build:apk:release": "bash ./scripts/build-standalone-apk.sh release",
"build:apk": "bash ./scripts/build-standalone-apk.sh debug",
"bundle:android": "npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/ --reset-cache"
```

## 🚀 **Quick Update Commands**

### **Step 1: Create Directories**
```bash
mkdir -p scripts
mkdir -p .github/workflows
```

### **Step 2: Copy Files**
Copy each file from Emergent environment to your local repository in the correct locations.

### **Step 3: Make Scripts Executable**
```bash
chmod +x scripts/build-standalone-apk.sh
```

### **Step 4: Commit Changes**
```bash
git add .
git commit -m "feat: Add self-contained Android APK build system

- Add cross-platform build scripts (Linux/macOS/Windows)
- Configure universal APK build (no ABI splits)
- Add GitHub Actions workflow for automated building
- Add comprehensive documentation and setup guides
- APK is fully self-contained (no Metro required)
- Universal compatibility across Android architectures"
git push origin main
```

## 🎯 **Local PC Setup (Quick Commands)**

### **Windows (PowerShell as Administrator):**
```powershell
# Install Chocolatey (package manager)
Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install tools
choco install nodejs openjdk17 android-sdk git -y

# Set environment variables (adjust paths as needed)
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot", "Machine")
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Android", "Machine")

# Restart PowerShell and install SDK components
sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

### **macOS:**
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install tools
brew install node@18 openjdk@17

# Setup Android SDK
cd ~/Downloads
curl -O https://dl.google.com/android/repository/commandlinetools-mac-11076708_latest.zip
unzip commandlinetools-mac-11076708_latest.zip
mkdir -p ~/Android/cmdline-tools
mv cmdline-tools ~/Android/cmdline-tools/latest

# Add to ~/.zshrc
echo 'export JAVA_HOME=/opt/homebrew/opt/openjdk@17' >> ~/.zshrc
echo 'export ANDROID_HOME=~/Android' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools' >> ~/.zshrc
source ~/.zshrc

# Install SDK components
sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

### **Linux (Ubuntu/Debian):**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Java
sudo apt install openjdk-17-jdk wget unzip git

# Setup Android SDK
cd ~/Downloads
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip commandlinetools-linux-11076708_latest.zip
mkdir -p ~/Android/cmdline-tools
mv cmdline-tools ~/Android/cmdline-tools/latest

# Add to ~/.bashrc
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
echo 'export ANDROID_HOME=~/Android' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools' >> ~/.bashrc
source ~/.bashrc

# Install SDK components
yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# Fix file watcher limits
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## 📱 **Build & Install APK (Quick Commands)**

### **Build APK:**
```bash
# Clone your updated repo
git clone https://github.com/yourusername/mht-assessment.git
cd mht-assessment

# Install dependencies
npm install

# Build APK (choose one method)
npm run build:apk                           # NPM script
./scripts/build-standalone-apk.sh debug    # Direct script (Linux/macOS)
.\scripts\build-standalone-apk.ps1 debug   # PowerShell (Windows)
```

### **Install on Device:**
```bash
# Connect Android device with USB debugging enabled
adb devices

# Install APK
adb install mht-assessment-standalone-debug.apk

# Launch app
adb shell am start -n com.mht.assessment/.MainActivity
```

## ✅ **Verification Commands:**
```bash
# Check tools are installed
node --version    # Should be 18+
java -version     # Should be 17+
adb --version     # Should work

# Check environment variables
echo $JAVA_HOME
echo $ANDROID_HOME

# Test device connection
adb devices

# Monitor app logs
adb logcat | grep -i mht
```

## 🎉 **You're Done!**

After following these steps, you'll have:
- ✅ Self-contained APK that works without Metro
- ✅ Universal APK compatible with all Android devices  
- ✅ Automated build scripts for easy development
- ✅ GitHub Actions for cloud building
- ✅ Complete local development environment

**The APK is fully functional offline and ready for production use!**