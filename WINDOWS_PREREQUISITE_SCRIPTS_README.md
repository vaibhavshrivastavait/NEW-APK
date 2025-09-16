# 🖥️ Windows Prerequisite Scripts - MHT Assessment

This directory contains comprehensive scripts and guides for setting up the Windows environment to build the MHT Assessment Android APK.

## 📁 **Files Overview**

### **🔍 Prerequisite Checkers**
1. **`windows-prerequisite-checker.ps1`** - **Comprehensive PowerShell Script**
   - Full system analysis with detailed reporting
   - Automatic issue detection and fix suggestions
   - Export capability for detailed reports
   - Color-coded output with progress indicators

2. **`windows-prerequisite-checker.bat`** - **Simple Batch Script**
   - Basic prerequisite checking for users who prefer batch files
   - Simplified output with essential checks only
   - Compatible with older Windows versions

### **📖 Documentation & Guides**
3. **`WINDOWS_SETUP_EXECUTION_ORDER.md`** - **Complete Setup Guide**
   - Step-by-step installation instructions
   - Exact execution order with time estimates
   - Troubleshooting section with common issues
   - Environment variable setup details

4. **`WINDOWS_QUICK_REFERENCE.md`** - **Quick Reference Card**
   - One-page summary of all essential commands
   - Quick verification steps
   - Emergency troubleshooting commands
   - Success criteria checklist

5. **`WINDOWS_PREREQUISITE_SCRIPTS_README.md`** - **This File**
   - Overview of all Windows setup resources
   - Usage instructions for each script
   - Feature comparison and recommendations

## 🚀 **Usage Instructions**

### **Option 1: Comprehensive Analysis (Recommended)**
```powershell
# Run full system check with detailed output
.\scripts\windows-prerequisite-checker.ps1 -Detailed

# Generate a detailed report file
.\scripts\windows-prerequisite-checker.ps1 -Detailed -ExportReport

# View the generated report
notepad prerequisite-check-report.txt
```

### **Option 2: Quick Check**
```cmd
# Simple batch script check
.\scripts\windows-prerequisite-checker.bat

# OR basic PowerShell check
.\scripts\windows-prerequisite-checker.ps1
```

### **Option 3: Follow Setup Guide**
```markdown
# Read the complete setup guide
WINDOWS_SETUP_EXECUTION_ORDER.md

# Use as a checklist while installing components
```

## 🔧 **Script Features Comparison**

| Feature | PowerShell Script | Batch Script |
|---------|------------------|-------------|
| **System Analysis** | ✅ Comprehensive | ⚠️ Basic |
| **Version Detection** | ✅ Full parsing | ⚠️ Simple |
| **Fix Suggestions** | ✅ Detailed | ⚠️ Basic |
| **Report Export** | ✅ Yes | ❌ No |
| **Color Output** | ✅ Full colors | ⚠️ Limited |
| **RAM/Disk Check** | ✅ Yes | ❌ No |
| **Network Test** | ✅ Yes | ❌ No |
| **Execution Policy** | ✅ Check & fix | ❌ No |
| **Windows Compatibility** | Windows 10/11 | All Windows |
| **Setup Time** | < 1 minute | < 30 seconds |

**Recommendation:** Use the **PowerShell script** for complete analysis, batch script for quick checks only.

## 📊 **Script Parameters**

### **PowerShell Script Parameters**
```powershell
# Show detailed information for each check
.\scripts\windows-prerequisite-checker.ps1 -Detailed

# Export results to a text file
.\scripts\windows-prerequisite-checker.ps1 -ExportReport

# Custom report file path
.\scripts\windows-prerequisite-checker.ps1 -ExportReport -ReportPath "my-report.txt"

# Attempt automatic fixes (future feature)
.\scripts\windows-prerequisite-checker.ps1 -Fix
```

### **Batch Script (No Parameters)**
```cmd
# Simple execution - no parameters supported
.\scripts\windows-prerequisite-checker.bat
```

## 🎯 **What Each Script Checks**

### **🔍 System Requirements**
- Windows version (10/11 required)
- PowerShell version (5.1+ required)
- Available RAM (4GB+ required, 8GB+ recommended)
- Available disk space (5GB+ required, 10GB+ recommended)

### **🟢 Node.js Environment**
- Node.js installation and version (18+ recommended)
- npm availability and version
- Yarn installation (optional but recommended)
- Package manager functionality

### **☕ Java Development Kit**
- Java JDK installation (17+ required)
- Java version compatibility
- JAVA_HOME environment variable
- Java PATH configuration

### **🤖 Android Development Environment**
- Android SDK installation
- ANDROID_HOME environment variable
- Platform Tools (adb)
- Command Line Tools
- Android API 34 platform
- Build Tools 34.0.0
- PATH configuration

### **🔧 Additional Tools**
- Git installation (optional)
- Python availability (for native modules)
- Visual Studio Build Tools (Windows-specific)
- Network connectivity (npm registry)
- PowerShell execution policy

## 📈 **Output Interpretation**

### **Status Indicators**
- ✅ **PASS** - Component properly installed and configured
- ⚠️ **WARN** - Component available but may need attention
- ❌ **FAIL** - Component missing or incorrectly configured
- ℹ️ **INFO** - Optional component or informational message

### **Overall Status**
- **🎉 READY TO BUILD!** - All critical components are properly set up
- **⚠️ ISSUES NEED ATTENTION** - Some components require fixes before building

## 🛠️ **Troubleshooting Common Issues**

### **PowerShell Execution Policy Error**
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### **Environment Variables Not Working**
```cmd
# Always open a NEW Command Prompt after setting environment variables
# OR restart your computer for system-wide changes
```

### **"Command not found" Errors**
```cmd
# Check if the tool is installed
where node
where java
where adb

# Check PATH variable
echo %PATH%
```

### **Android SDK Issues**
```cmd
# Verify SDK structure
dir C:\Android
dir C:\Android\cmdline-tools\latest\bin
dir C:\Android\platform-tools

# Reinstall SDK packages if needed
sdkmanager --list_installed
sdkmanager "platform-tools" "platforms;android-34"
```

## 🔄 **Update Procedures**

### **Updating Scripts**
Scripts are version-controlled. To get the latest version:
```cmd
# If you have the full project
git pull origin main

# Check script version (in PowerShell script header)
```

### **Updating Prerequisites**
```cmd
# Update Node.js: Download latest from nodejs.org
# Update Java: Download latest OpenJDK 17 from adoptium.net
# Update Android SDK: Use sdkmanager to update packages

sdkmanager --update
```

## 📞 **Getting Help**

### **If Scripts Don't Work**
1. **Check PowerShell version:** `$PSVersionTable.PSVersion`
2. **Run as Administrator** if permission issues occur
3. **Check execution policy:** `Get-ExecutionPolicy`
4. **Try the batch script** as a fallback

### **If Prerequisites Fail**
1. **Run with `-Detailed` flag** for more information
2. **Export report** with `-ExportReport` for detailed analysis
3. **Follow fix suggestions** provided in the output
4. **Check the setup guide** for step-by-step instructions

### **Common Solutions**
- **Restart Command Prompt** after installing each component
- **Run as Administrator** for system-wide installations
- **Check PATH variable** if commands aren't found
- **Verify downloads** weren't corrupted

## 📝 **Script Maintenance**

### **Adding New Checks**
To add new prerequisite checks to the PowerShell script:
```powershell
# Add check logic in the appropriate section
# Use Add-CheckResult function to record results
# Follow existing pattern for consistency
```

### **Updating Version Requirements**
Edit the version checks in both scripts when requirements change:
- Node.js minimum version
- Java JDK version requirements
- Android SDK API levels
- Build tools versions

## 🎯 **Success Workflow**

1. **Run prerequisite checker** → Identify missing components
2. **Follow setup guide** → Install components in correct order  
3. **Re-run checker** → Verify all components are properly installed
4. **Build APK** → Use the build scripts to create your APK
5. **Install on device** → Test the APK on Android devices

---

**💡 Pro Tip:** Bookmark the `WINDOWS_QUICK_REFERENCE.md` for fast access to common commands and troubleshooting steps!