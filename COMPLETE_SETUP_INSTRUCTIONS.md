# 🚀 Complete Setup Instructions - MHT Assessment APK Build

## 📂 **Part 1: Update Your GitHub Repository**

### **Step 1: Download Updated Files from Emergent**

You need to copy these files from this Emergent environment to your local computer:

**📁 New Files to Copy:**
```
📄 scripts/build-standalone-apk.sh
📄 scripts/build-standalone-apk.ps1
📄 .github/workflows/build-apk.yml
📄 ANDROID_BUILD_README.md
📄 QUICK_BUILD_GUIDE.md
📄 LOCAL_PC_SETUP.md
📄 update-github-repo.sh
```

**📝 Modified Files to Update:**
```
📄 android/app/build.gradle (Universal APK configuration)
📄 package.json (New build scripts)
```

### **Step 2: Apply Changes to Your Local Repository**

**Option A: Manual File Copy (Recommended)**

1. **Clone/Pull your repository:**
   ```bash
   git clone https://github.com/yourusername/mht-assessment.git
   cd mht-assessment
   git pull origin main
   ```

2. **Create the new directories:**
   ```bash
   mkdir -p scripts
   mkdir -p .github/workflows
   ```

3. **Copy each file manually** from Emergent to your local repo:
   - Copy the content of each file I created
   - Save them in the correct locations in your local repo

4. **Update the modified files:**
   - Update `android/app/build.gradle` with the universal APK configuration
   - Update `package.json` with the new build scripts

**Option B: Use the Update Script**

1. **Copy the update script content** to your local repo:
   ```bash
   # Copy the content of update-github-repo.sh
   nano update-github-repo.sh
   chmod +x update-github-repo.sh
   ```

2. **Run the update script:**
   ```bash
   ./update-github-repo.sh
   ```

### **Step 3: Commit and Push Changes**

```bash
# Add all new files
git add scripts/
git add .github/
git add *.md
git add android/app/build.gradle
git add package.json

# Create commit
git commit -m "feat: Add self-contained Android APK build system

- Add build scripts for cross-platform APK building
- Configure universal APK (no ABI splits)
- Add GitHub Actions workflow for automated building
- Add comprehensive documentation and setup guides
- APK is fully self-contained (no Metro required)
- Universal compatibility across Android architectures"

# Push to GitHub
git push origin main
```

## 💻 **Part 2: Set Up Your Local PC**

### **Windows PC Setup**

**Step 1: Install Node.js**
1. Go to https://nodejs.org/
2. Download LTS version (18.x or higher)
3. Install with default settings
4. Open Command Prompt and verify:
   ```cmd
   node --version
   npm --version
   ```

**Step 2: Install Java JDK 17**
1. Go to https://adoptium.net/
2. Download OpenJDK 17 for Windows
3. Install to default location
4. Set environment variables:
   - Press Win+R, type `sysdm.cpl`, press Enter
   - Click "Environment Variables"
   - Under "System Variables" click "New":
     - Variable name: `JAVA_HOME`
     - Variable value: `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot`
   - Edit "Path" variable and add: `%JAVA_HOME%\bin`
5. Open new Command Prompt and verify:
   ```cmd
   java -version
   ```

**Step 3: Install Android SDK**
1. Download Android Command Line Tools:
   - Go to https://developer.android.com/studio/command-line-tools
   - Download "Command line tools only" for Windows
2. Extract to `C:\Android\cmdline-tools\latest\`
3. Set environment variables:
   - Add new system variable: `ANDROID_HOME` = `C:\Android`
   - Edit Path and add:
     - `%ANDROID_HOME%\cmdline-tools\latest\bin`
     - `%ANDROID_HOME%\platform-tools`
4. Open new Command Prompt as Administrator and run:
   ```cmd
   sdkmanager --licenses
   sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
   ```

**Step 4: Install Git (if needed)**
1. Download from https://git-scm.com/download/win
2. Install with default settings

### **macOS Setup**

**Step 1: Install Homebrew**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Step 2: Install Development Tools**
```bash
# Install Node.js
brew install node@18

# Install Java JDK 17
brew install openjdk@17

# Set JAVA_HOME in your shell profile
echo 'export JAVA_HOME=/opt/homebrew/opt/openjdk@17' >> ~/.zshrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

**Step 3: Install Android SDK**
```bash
# Download and setup Android SDK
cd ~/Downloads
curl -O https://dl.google.com/android/repository/commandlinetools-mac-11076708_latest.zip
unzip commandlinetools-mac-11076708_latest.zip
mkdir -p ~/Android/cmdline-tools
mv cmdline-tools ~/Android/cmdline-tools/latest

# Set environment variables
echo 'export ANDROID_HOME=~/Android' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools' >> ~/.zshrc
source ~/.zshrc

# Install SDK packages
sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

### **Linux (Ubuntu) Setup**

**Step 1: Install Prerequisites**
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install curl wget unzip git
```

**Step 2: Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Step 3: Install Java JDK 17**
```bash
sudo apt install openjdk-17-jdk

# Set JAVA_HOME
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
echo 'export PATH=$PATH:$JAVA_HOME/bin' >> ~/.bashrc
source ~/.bashrc
```

**Step 4: Install Android SDK**
```bash
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

# Fix file watcher limits
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## 📱 **Part 3: Build and Test APK**

### **Step 1: Clone Your Updated Repository**
```bash
git clone https://github.com/yourusername/mht-assessment.git
cd mht-assessment
```

### **Step 2: Install Project Dependencies**
```bash
npm install
# or if you prefer yarn
yarn install
```

### **Step 3: Build APK**

**Quick Build (Recommended):**
```bash
# Windows (PowerShell)
.\scripts\build-standalone-apk.ps1 -BuildType debug

# Linux/macOS
./scripts/build-standalone-apk.sh debug

# Or using NPM scripts
npm run build:apk
```

### **Step 4: Prepare Android Device**
1. **Enable Developer Options:**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
2. **Enable USB Debugging:**
   - Go to Settings → Developer Options
   - Enable "USB Debugging"
3. **Connect device via USB**
4. **Accept USB debugging prompt** on device

### **Step 5: Install APK**
```bash
# Check device is connected
adb devices

# Install the APK
adb install mht-assessment-standalone-debug.apk

# Launch the app
adb shell am start -n com.mht.assessment/.MainActivity
```

## ✅ **Verification Checklist**

After installation, verify the APK works correctly:

- [ ] **App launches** without errors
- [ ] **No Metro connection** attempts (check with `adb logcat`)
- [ ] **Offline functionality** works (disable WiFi/data)
- [ ] **Patient data** can be saved and loaded
- [ ] **CME quizzes** load and function properly
- [ ] **Risk calculators** work (ASCVD, FRAX, Gail models)
- [ ] **Navigation** between all screens works
- [ ] **Popular CME quizzes** are visible and functional

## 🎉 **Alternative: Use GitHub Actions (No Local Setup)**

If you don't want to set up locally, you can use GitHub Actions:

1. **Push the changes** to your GitHub repository
2. **Go to your repository** on GitHub.com
3. **Click "Actions" tab**
4. **Select "Build Android APK"** workflow
5. **Click "Run workflow"**
6. **Choose "debug"** as build type
7. **Wait for build to complete** (5-10 minutes)
8. **Download APK** from the "Artifacts" section

## 🆘 **Getting Help**

If you encounter issues:

1. **Check the logs:**
   ```bash
   adb logcat | grep -i "mht\|error\|exception"
   ```

2. **Verify environment:**
   ```bash
   node --version  # Should be 18+
   java -version   # Should be 17+
   adb --version   # Should work
   echo $ANDROID_HOME  # Should be set
   ```

3. **Common solutions:**
   - **"Command not found"** → Check PATH environment variables
   - **"Permission denied"** → Run as administrator (Windows) or use sudo (Linux)
   - **"Device not found"** → Enable USB debugging and install device drivers
   - **"Bundle failed"** → Clear Metro cache: `npx react-native start --reset-cache`

## 📋 **Summary of What You Get**

After following these steps, you'll have:

✅ **Self-contained APK** that works without Metro
✅ **Universal APK** compatible with all Android devices
✅ **Automated build scripts** for easy development
✅ **GitHub Actions workflow** for cloud building
✅ **Comprehensive documentation** for maintenance
✅ **Complete local development environment** for the MHT Assessment app

The APK will include all features:
- Patient data management (offline)
- CME quizzes with Popular CME section
- Risk calculators (ASCVD, FRAX, Gail, etc.)
- Assessment results and treatment plans
- Complete offline functionality