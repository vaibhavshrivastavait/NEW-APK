# 🖥️ Windows Setup Execution Order - MHT Assessment APK Build

This guide provides the **exact order** to install all prerequisites for building the MHT Assessment Android APK on Windows.

## 📋 **Before You Start**

### Check Prerequisites Script
Run this first to see what's already installed:
```powershell
# PowerShell (Recommended - Full analysis)
.\scripts\windows-prerequisite-checker.ps1 -Detailed

# OR Batch (Simple check)
.\scripts\windows-prerequisite-checker.bat
```

### System Requirements
- **Windows 10/11** (any edition)
- **4GB+ RAM** (8GB+ recommended)
- **5GB+ free disk space** (10GB+ recommended)
- **Administrator access** (for environment variables)

---

## 🔄 **EXECUTION ORDER (Critical - Follow Exactly)**

### **STEP 1: Install Node.js** 
**⏱️ Time: 5 minutes**

1. **Download Node.js 18 LTS:**
   - Go to: https://nodejs.org/
   - Click **"18.19.0 LTS"** (or latest 18.x)
   - Download **Windows Installer (.msi)**

2. **Install:**
   - Run the downloaded `.msi` file
   - ✅ Check **"Automatically install necessary tools"**
   - ✅ Check **"Add to PATH"**
   - Click **Install** → **Finish**

3. **Verify Installation:**
   ```cmd
   # Open new Command Prompt/PowerShell
   node --version
   # Should show: v18.19.0 (or similar)
   
   npm --version
   # Should show: 10.2.3 (or similar)
   ```

4. **Install Yarn (Optional but Recommended):**
   ```cmd
   npm install -g yarn
   yarn --version
   # Should show: 1.22.x
   ```

**✅ Success Check:** Both `node --version` and `npm --version` work

---

### **STEP 2: Install Java JDK 17**
**⏱️ Time: 5 minutes**

1. **Download OpenJDK 17:**
   - Go to: https://adoptium.net/
   - Select **OpenJDK 17 (LTS)**
   - Choose **Windows x64**
   - Download **.msi** installer

2. **Install:**
   - Run the downloaded `.msi` file
   - ✅ Check **"Set JAVA_HOME variable"**
   - ✅ Check **"JavaSoft (Oracle) registry keys"**
   - ✅ Check **"Add to PATH"**
   - Click **Install** → **Finish**

3. **Manual Environment Setup (If Auto-Setup Failed):**
   ```cmd
   # Find Java installation path
   where java
   # Usually: C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot\bin\java.exe
   ```

   **Set JAVA_HOME:**
   - Press `Win + R` → type `sysdm.cpl` → **Advanced** → **Environment Variables**
   - **System Variables** → **New**
   - Variable Name: `JAVA_HOME`
   - Variable Value: `C:\Program Files\Eclipse Adoptium\jdk-17.0.10-hotspot` (adjust version)
   - **OK** → **OK** → **OK**

4. **Verify Installation:**
   ```cmd
   # Open NEW Command Prompt (important!)
   java -version
   # Should show: openjdk version "17.x.x"
   
   echo %JAVA_HOME%
   # Should show: C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot
   ```

**✅ Success Check:** `java -version` shows version 17.x and `JAVA_HOME` is set

---

### **STEP 3: Download Android SDK Command Line Tools**
**⏱️ Time: 3 minutes**

1. **Download Android Command Line Tools:**
   - Go to: https://developer.android.com/studio/command-line-tools
   - Scroll to **"Command line tools only"**
   - Click **Windows** download
   - Save `commandlinetools-win-xxxxxxx_latest.zip`

2. **Extract to Correct Location:**
   ```cmd
   # Create directory structure
   mkdir C:\Android
   mkdir C:\Android\cmdline-tools
   mkdir C:\Android\cmdline-tools\latest
   
   # Extract the ZIP contents to C:\Android\cmdline-tools\latest\
   # You should have: C:\Android\cmdline-tools\latest\bin\sdkmanager.bat
   ```

3. **Verify Extraction:**
   ```cmd
   dir C:\Android\cmdline-tools\latest\bin
   # Should show: sdkmanager.bat, avdmanager.bat
   ```

**✅ Success Check:** `C:\Android\cmdline-tools\latest\bin\sdkmanager.bat` exists

---

### **STEP 4: Set Android Environment Variables**
**⏱️ Time: 3 minutes**

1. **Set ANDROID_HOME:**
   - Press `Win + R` → type `sysdm.cpl` → **Advanced** → **Environment Variables**
   - **System Variables** → **New**
   - Variable Name: `ANDROID_HOME`
   - Variable Value: `C:\Android`
   - **OK**

2. **Update PATH:**
   - In **System Variables**, find and select **Path** → **Edit**
   - **New** → Add: `%ANDROID_HOME%\cmdline-tools\latest\bin`
   - **New** → Add: `%ANDROID_HOME%\platform-tools`
   - **OK** → **OK** → **OK**

3. **Verify Environment:**
   ```cmd
   # Open NEW Command Prompt
   echo %ANDROID_HOME%
   # Should show: C:\Android
   
   # Test sdkmanager
   sdkmanager --version
   # Should show version number
   ```

**✅ Success Check:** `sdkmanager --version` works without errors

---

### **STEP 5: Install Android SDK Packages**
**⏱️ Time: 10 minutes (download time)**

1. **Accept Licenses:**
   ```cmd
   sdkmanager --licenses
   # Type 'y' for each license prompt (about 8-10 licenses)
   ```

2. **Install Required Packages:**
   ```cmd
   # Install platform tools (includes adb)
   sdkmanager "platform-tools"
   
   # Install Android API 34 (target platform)
   sdkmanager "platforms;android-34"
   
   # Install build tools
   sdkmanager "build-tools;34.0.0"
   
   # Verify installations
   sdkmanager --list_installed
   ```

3. **Verify ADB:**
   ```cmd
   # Open NEW Command Prompt
   adb --version
   # Should show: Android Debug Bridge version x.x.x
   ```

**✅ Success Check:** `adb --version` works and shows version

---

### **STEP 6: Install Git (Optional but Recommended)**
**⏱️ Time: 5 minutes**

1. **Download Git:**
   - Go to: https://git-scm.com/download/win
   - Download **64-bit Git for Windows Setup**

2. **Install:**
   - Run installer with **default settings**
   - Important: ✅ Keep **"Git from the command line and also from 3rd-party software"**

3. **Verify:**
   ```cmd
   git --version
   # Should show: git version 2.x.x
   ```

**✅ Success Check:** `git --version` works

---

### **STEP 7: Final Verification**
**⏱️ Time: 2 minutes**

Run the comprehensive check:
```powershell
.\scripts\windows-prerequisite-checker.ps1 -Detailed
```

**All should show ✅:**
- ✅ Node.js: v18.x.x
- ✅ npm: v10.x.x
- ✅ Java JDK: openjdk version "17.x.x"
- ✅ JAVA_HOME: C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot
- ✅ Android SDK: C:\Android
- ✅ Platform Tools: Found
- ✅ Android API 34: Found
- ✅ Build Tools 34.0.0: Found
- ✅ ADB: Android Debug Bridge version x.x.x

---

## 🚀 **Build Your First APK**

Once all prerequisites are installed:

```cmd
# 1. Clone/download the MHT Assessment project
git clone https://github.com/yourusername/mht-assessment.git
cd mht-assessment

# 2. Install project dependencies
yarn install
# OR: npm install

# 3. Build debug APK
.\scripts\build-standalone-apk.ps1 -BuildType debug

# 4. Install on Android device (if connected)
adb install mht-assessment-standalone-debug.apk
```

---

## 🐛 **Common Issues & Quick Fixes**

### ❌ **"'node' is not recognized"**
**Fix:** Restart Command Prompt after Node.js installation

### ❌ **"JAVA_HOME not set"**
**Fix:** 
```cmd
# Check current JAVA_HOME
echo %JAVA_HOME%

# If empty, set manually:
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.10-hotspot
```

### ❌ **"sdkmanager is not recognized"**
**Fix:** 
```cmd
# Check PATH includes cmdline-tools
echo %PATH% | findstr cmdline-tools

# If not found, add to PATH:
set PATH=%PATH%;%ANDROID_HOME%\cmdline-tools\latest\bin
```

### ❌ **"adb is not recognized"**
**Fix:**
```cmd
# Check if platform-tools installed
dir %ANDROID_HOME%\platform-tools

# If missing, install:
sdkmanager "platform-tools"

# Add to PATH:
set PATH=%PATH%;%ANDROID_HOME%\platform-tools
```

### ❌ **Build fails with "SDK not found"**
**Fix:** Verify all environment variables in a NEW command prompt:
```cmd
echo %JAVA_HOME%
echo %ANDROID_HOME%
echo %PATH%
```

---

## 📊 **Environment Variables Summary**

After complete setup, you should have:

```cmd
JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.10-hotspot
ANDROID_HOME=C:\Android

PATH includes:
%JAVA_HOME%\bin
%ANDROID_HOME%\cmdline-tools\latest\bin
%ANDROID_HOME%\platform-tools
```

---

## 🎯 **Success Criteria**

✅ **Ready to build when ALL these commands work:**

```cmd
node --version          # v18.x.x
npm --version           # 10.x.x
java -version           # openjdk version "17.x.x"
echo %JAVA_HOME%        # Shows JDK path
echo %ANDROID_HOME%     # Shows C:\Android
adb --version           # Shows ADB version
sdkmanager --version    # Shows SDK manager version
git --version           # Shows Git version (optional)
```

---

## 🔄 **Total Time Estimate**

- **Fresh Installation:** 30-45 minutes
- **Partial Installation:** 15-25 minutes  
- **Verification Only:** 5 minutes

---

## 📞 **Need Help?**

1. **Run diagnostic:** `.\scripts\windows-prerequisite-checker.ps1 -Detailed -ExportReport`
2. **Check the generated report:** `prerequisite-check-report.txt`
3. **Follow the specific fix actions** listed in the report

**Remember:** Always open a **NEW** Command Prompt/PowerShell after installing each component to refresh environment variables!