# MHT Assessment - Windows Prerequisite Checker & Build Environment Setup
# Comprehensive script to check all requirements before building Android APK
# Version: 1.0
# Compatible with: Windows 10/11, PowerShell 5.1+

param(
    [switch]$Fix,           # Attempt to fix issues automatically
    [switch]$Detailed,      # Show detailed information for each check
    [switch]$ExportReport,  # Export results to a file
    [string]$ReportPath = "prerequisite-check-report.txt"
)

# Color functions
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Blue }
function Write-Step { param($Message) Write-Host "🔍 $Message" -ForegroundColor Cyan }

# Initialize results
$Global:CheckResults = @()
$Global:OverallStatus = $true

function Add-CheckResult {
    param($Component, $Status, $Message, $Details = "", $FixAction = "")
    $Global:CheckResults += [PSCustomObject]@{
        Component = $Component
        Status = $Status
        Message = $Message
        Details = $Details
        FixAction = $FixAction
    }
    if ($Status -eq "FAIL") { $Global:OverallStatus = $false }
}

function Test-CommandExists {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Get-VersionFromOutput {
    param($Output)
    if ($Output -match '(\d+\.\d+(?:\.\d+)?)') {
        return $matches[1]
    }
    return "Unknown"
}

# Header
Clear-Host
Write-Host "🚀 MHT Assessment - Windows Build Environment Checker" -ForegroundColor Magenta -BackgroundColor Black
Write-Host "=====================================================" -ForegroundColor Magenta -BackgroundColor Black
Write-Host "This script will check all prerequisites for building the MHT Assessment Android APK" -ForegroundColor White
Write-Host "Run with -Fix to attempt automatic fixes | -Detailed for verbose output" -ForegroundColor Gray
Write-Host ""

# 1. SYSTEM REQUIREMENTS CHECK
Write-Step "Checking System Requirements..."

# Windows Version
$windowsVersion = [System.Environment]::OSVersion.Version
$windowsBuild = (Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion" -Name ReleaseId -ErrorAction SilentlyContinue).ReleaseId
if ($windowsVersion.Major -ge 10) {
    Write-Success "Windows Version: $($windowsVersion.Major).$($windowsVersion.Minor) (Build: $windowsBuild)"
    Add-CheckResult "Windows" "PASS" "Compatible Windows version detected" "Version: $($windowsVersion.Major).$($windowsVersion.Minor)"
} else {
    Write-Error "Windows Version: $($windowsVersion.Major).$($windowsVersion.Minor) - Minimum Windows 10 required"
    Add-CheckResult "Windows" "FAIL" "Unsupported Windows version" "Version: $($windowsVersion.Major).$($windowsVersion.Minor)" "Upgrade to Windows 10 or later"
}

# PowerShell Version
$psVersion = $PSVersionTable.PSVersion
if ($psVersion.Major -ge 5) {
    Write-Success "PowerShell Version: $($psVersion.Major).$($psVersion.Minor)"
    Add-CheckResult "PowerShell" "PASS" "Compatible PowerShell version" "Version: $($psVersion.Major).$($psVersion.Minor)"
} else {
    Write-Error "PowerShell Version: $($psVersion.Major).$($psVersion.Minor) - Minimum PowerShell 5.1 required"
    Add-CheckResult "PowerShell" "FAIL" "Outdated PowerShell version" "Version: $($psVersion.Major).$($psVersion.Minor)" "Upgrade PowerShell to 5.1 or later"
}

# RAM Check
$totalRAM = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 1)
if ($totalRAM -ge 8) {
    Write-Success "System RAM: ${totalRAM} GB"
    Add-CheckResult "RAM" "PASS" "Sufficient RAM available" "${totalRAM} GB total"
} elseif ($totalRAM -ge 4) {
    Write-Warning "System RAM: ${totalRAM} GB - Minimum met, but 8GB+ recommended for smooth builds"
    Add-CheckResult "RAM" "WARN" "Minimum RAM available" "${totalRAM} GB total" "Consider upgrading to 8GB+ for better performance"
} else {
    Write-Error "System RAM: ${totalRAM} GB - Insufficient for Android builds (minimum 4GB required)"
    Add-CheckResult "RAM" "FAIL" "Insufficient RAM" "${totalRAM} GB total" "Upgrade to at least 4GB RAM"
}

# Disk Space Check
$freeDisk = [math]::Round((Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'").FreeSpace / 1GB, 1)
if ($freeDisk -ge 10) {
    Write-Success "Available Disk Space: ${freeDisk} GB"
    Add-CheckResult "Disk Space" "PASS" "Sufficient disk space" "${freeDisk} GB available"
} elseif ($freeDisk -ge 5) {
    Write-Warning "Available Disk Space: ${freeDisk} GB - Minimum met, but more space recommended"
    Add-CheckResult "Disk Space" "WARN" "Limited disk space" "${freeDisk} GB available" "Free up more disk space for smoother builds"
} else {
    Write-Error "Available Disk Space: ${freeDisk} GB - Insufficient (minimum 5GB required)"
    Add-CheckResult "Disk Space" "FAIL" "Insufficient disk space" "${freeDisk} GB available" "Free up at least 5GB disk space"
}

Write-Host ""

# 2. NODE.JS AND PACKAGE MANAGERS CHECK
Write-Step "Checking Node.js and Package Managers..."

# Node.js Check
if (Test-CommandExists "node") {
    try {
        $nodeVersion = node --version 2>$null
        $nodeVersionNumber = $nodeVersion -replace '^v', ''
        $nodeMajor = [int]($nodeVersionNumber -split '\.')[0]
        
        if ($nodeMajor -ge 18) {
            Write-Success "Node.js: $nodeVersion"
            Add-CheckResult "Node.js" "PASS" "Compatible Node.js version" "Version: $nodeVersion"
        } elseif ($nodeMajor -ge 16) {
            Write-Warning "Node.js: $nodeVersion - Version 18+ recommended for best compatibility"
            Add-CheckResult "Node.js" "WARN" "Older Node.js version" "Version: $nodeVersion" "Consider upgrading to Node.js 18 LTS"
        } else {
            Write-Error "Node.js: $nodeVersion - Version 18+ required"
            Add-CheckResult "Node.js" "FAIL" "Outdated Node.js version" "Version: $nodeVersion" "Install Node.js 18 LTS from https://nodejs.org/"
        }
        
        if ($Detailed) {
            $nodePath = (Get-Command node).Source
            Write-Info "Node.js Location: $nodePath"
        }
    } catch {
        Write-Error "Node.js: Installed but not functioning properly"
        Add-CheckResult "Node.js" "FAIL" "Node.js not functioning" "Error: $($_.Exception.Message)" "Reinstall Node.js from https://nodejs.org/"
    }
} else {
    Write-Error "Node.js: Not installed"
    Add-CheckResult "Node.js" "FAIL" "Node.js not found" "" "Install Node.js 18 LTS from https://nodejs.org/"
}

# NPM Check
if (Test-CommandExists "npm") {
    try {
        $npmVersion = npm --version 2>$null
        Write-Success "npm: v$npmVersion"
        Add-CheckResult "npm" "PASS" "npm available" "Version: v$npmVersion"
        
        if ($Detailed) {
            $npmPath = (Get-Command npm).Source
            Write-Info "npm Location: $npmPath"
        }
    } catch {
        Write-Error "npm: Installed but not functioning properly"
        Add-CheckResult "npm" "FAIL" "npm not functioning" "Error: $($_.Exception.Message)" "Reinstall Node.js to fix npm"
    }
} else {
    Write-Error "npm: Not found (should come with Node.js)"
    Add-CheckResult "npm" "FAIL" "npm not found" "" "npm should be included with Node.js installation"
}

# Yarn Check (Optional but recommended)
if (Test-CommandExists "yarn") {
    try {
        $yarnVersion = yarn --version 2>$null
        Write-Success "Yarn: v$yarnVersion (Recommended)"
        Add-CheckResult "Yarn" "PASS" "Yarn available (recommended)" "Version: v$yarnVersion"
        
        if ($Detailed) {
            $yarnPath = (Get-Command yarn).Source
            Write-Info "Yarn Location: $yarnPath"
        }
    } catch {
        Write-Warning "Yarn: Installed but not functioning properly"
        Add-CheckResult "Yarn" "WARN" "Yarn not functioning" "Error: $($_.Exception.Message)" "Reinstall Yarn: npm install -g yarn"
    }
} else {
    Write-Warning "Yarn: Not installed (npm will be used instead)"
    Add-CheckResult "Yarn" "WARN" "Yarn not found" "npm will be used" "Optional: Install Yarn with 'npm install -g yarn'"
}

Write-Host ""

# 3. JAVA JDK CHECK
Write-Step "Checking Java JDK..."

if (Test-CommandExists "java") {
    try {
        $javaVersionOutput = java -version 2>&1
        $javaVersionLine = ($javaVersionOutput | Select-Object -First 1) -as [string]
        
        # Extract version number
        if ($javaVersionLine -match '"(\d+)\..*?"' -or $javaVersionLine -match '"(\d+)"') {
            $javaMajor = [int]$matches[1]
        } else {
            $javaMajor = 0
        }
        
        if ($javaMajor -ge 17) {
            Write-Success "Java JDK: $javaVersionLine"
            Add-CheckResult "Java JDK" "PASS" "Compatible Java version" "Version: $javaVersionLine"
        } elseif ($javaMajor -ge 11) {
            Write-Warning "Java JDK: $javaVersionLine - Java 17+ recommended"
            Add-CheckResult "Java JDK" "WARN" "Older Java version" "Version: $javaVersionLine" "Consider upgrading to OpenJDK 17 from https://adoptium.net/"
        } else {
            Write-Error "Java JDK: $javaVersionLine - Java 17+ required"
            Add-CheckResult "Java JDK" "FAIL" "Outdated Java version" "Version: $javaVersionLine" "Install OpenJDK 17 from https://adoptium.net/"
        }
        
        if ($Detailed) {
            $javaPath = (Get-Command java).Source
            Write-Info "Java Location: $javaPath"
        }
    } catch {
        Write-Error "Java JDK: Installed but not functioning properly"
        Add-CheckResult "Java JDK" "FAIL" "Java not functioning" "Error: $($_.Exception.Message)" "Reinstall OpenJDK 17 from https://adoptium.net/"
    }
} else {
    Write-Error "Java JDK: Not installed"
    Add-CheckResult "Java JDK" "FAIL" "Java not found" "" "Install OpenJDK 17 from https://adoptium.net/"
}

Write-Host ""

# 4. ENVIRONMENT VARIABLES CHECK
Write-Step "Checking Environment Variables..."

# JAVA_HOME Check
$javaHome = $env:JAVA_HOME
if ($javaHome -and (Test-Path $javaHome)) {
    Write-Success "JAVA_HOME: $javaHome"
    Add-CheckResult "JAVA_HOME" "PASS" "JAVA_HOME properly set" "Path: $javaHome"
    
    # Verify JAVA_HOME points to correct Java version
    $javaHomeBin = Join-Path $javaHome "bin\java.exe"
    if (Test-Path $javaHomeBin) {
        Write-Success "JAVA_HOME/bin/java.exe: Found"
        
        if ($Detailed) {
            try {
                $javaHomeVersion = & $javaHomeBin -version 2>&1 | Select-Object -First 1
                Write-Info "JAVA_HOME Java Version: $javaHomeVersion"
            } catch {
                Write-Warning "Could not verify JAVA_HOME Java version"
            }
        }
    } else {
        Write-Error "JAVA_HOME/bin/java.exe: Not found"
        Add-CheckResult "JAVA_HOME" "FAIL" "Invalid JAVA_HOME path" "java.exe not found in $javaHome\bin" "Set JAVA_HOME to correct JDK installation path"
    }
} else {
    Write-Error "JAVA_HOME: Not set or invalid path"
    Add-CheckResult "JAVA_HOME" "FAIL" "JAVA_HOME not set" "Current value: $javaHome" "Set JAVA_HOME environment variable to JDK path"
}

# PATH Check for Java
$pathEntries = $env:PATH -split ';'
$javaInPath = $pathEntries | Where-Object { $_ -like "*java*bin*" -or $_ -eq "%JAVA_HOME%\bin" }
if ($javaInPath) {
    Write-Success "Java in PATH: Yes"
    Add-CheckResult "Java PATH" "PASS" "Java available in PATH" "Entry: $($javaInPath -join ', ')"
} else {
    Write-Warning "Java in PATH: Not explicitly found (but java command works)"
    Add-CheckResult "Java PATH" "WARN" "Java PATH entry not clear" "" "Ensure %JAVA_HOME%\bin is in PATH"
}

Write-Host ""

# 5. ANDROID SDK CHECK
Write-Step "Checking Android SDK..."

# ANDROID_HOME Check
$androidHome = $env:ANDROID_HOME
$androidSdkRoot = $env:ANDROID_SDK_ROOT
$androidSdkPath = $androidHome ?? $androidSdkRoot

if ($androidSdkPath -and (Test-Path $androidSdkPath)) {
    Write-Success "Android SDK: $androidSdkPath"
    Add-CheckResult "Android SDK" "PASS" "Android SDK found" "Path: $androidSdkPath"
    
    # Check SDK structure
    $platformTools = Join-Path $androidSdkPath "platform-tools"
    $cmdlineTools = Join-Path $androidSdkPath "cmdline-tools\latest"
    $platforms = Join-Path $androidSdkPath "platforms"
    $buildTools = Join-Path $androidSdkPath "build-tools"
    
    if (Test-Path $platformTools) {
        Write-Success "Platform Tools: Found"
        Add-CheckResult "Platform Tools" "PASS" "Platform tools available" "Path: $platformTools"
    } else {
        Write-Error "Platform Tools: Not found"
        Add-CheckResult "Platform Tools" "FAIL" "Platform tools missing" "Expected: $platformTools" "Install platform-tools: sdkmanager 'platform-tools'"
    }
    
    if (Test-Path $cmdlineTools) {
        Write-Success "Command Line Tools: Found"
        Add-CheckResult "Command Line Tools" "PASS" "Command line tools available" "Path: $cmdlineTools"
    } else {
        Write-Error "Command Line Tools: Not found"
        Add-CheckResult "Command Line Tools" "FAIL" "Command line tools missing" "Expected: $cmdlineTools" "Download from https://developer.android.com/studio/command-line-tools"
    }
    
    if (Test-Path $platforms) {
        $platformVersions = Get-ChildItem $platforms -Directory | Select-Object -ExpandProperty Name
        if ($platformVersions -contains "android-34") {
            Write-Success "Android API 34: Found"
            Add-CheckResult "Android API 34" "PASS" "Target SDK platform available" "Platform: android-34"
        } else {
            Write-Warning "Android API 34: Not found (Available: $($platformVersions -join ', '))"
            Add-CheckResult "Android API 34" "FAIL" "Target SDK platform missing" "Available: $($platformVersions -join ', ')" "Install API 34: sdkmanager 'platforms;android-34'"
        }
    } else {
        Write-Error "Platforms Directory: Not found"
        Add-CheckResult "Platforms" "FAIL" "Platforms directory missing" "Expected: $platforms" "Install platforms: sdkmanager 'platforms;android-34'"
    }
    
    if (Test-Path $buildTools) {
        $buildToolVersions = Get-ChildItem $buildTools -Directory | Select-Object -ExpandProperty Name | Sort-Object {[version]$_} -Descending
        if ($buildToolVersions -contains "34.0.0") {
            Write-Success "Build Tools 34.0.0: Found"
            Add-CheckResult "Build Tools 34.0.0" "PASS" "Required build tools available" "Version: 34.0.0"
        } else {
            Write-Warning "Build Tools 34.0.0: Not found (Available: $($buildToolVersions -join ', '))"
            Add-CheckResult "Build Tools 34.0.0" "FAIL" "Required build tools missing" "Available: $($buildToolVersions -join ', ')" "Install build tools: sdkmanager 'build-tools;34.0.0'"
        }
    } else {
        Write-Error "Build Tools Directory: Not found"
        Add-CheckResult "Build Tools" "FAIL" "Build tools directory missing" "Expected: $buildTools" "Install build tools: sdkmanager 'build-tools;34.0.0'"
    }
    
} else {
    Write-Error "Android SDK: Not found or ANDROID_HOME/ANDROID_SDK_ROOT not set"
    Add-CheckResult "Android SDK" "FAIL" "Android SDK not found" "ANDROID_HOME: $androidHome, ANDROID_SDK_ROOT: $androidSdkRoot" "Download Android SDK from https://developer.android.com/studio/command-line-tools"
}

# ADB Check
if (Test-CommandExists "adb") {
    try {
        $adbVersion = adb version 2>$null | Select-Object -First 1
        Write-Success "ADB: $adbVersion"
        Add-CheckResult "ADB" "PASS" "ADB available" "Version: $adbVersion"
        
        if ($Detailed) {
            $adbPath = (Get-Command adb).Source
            Write-Info "ADB Location: $adbPath"
        }
    } catch {
        Write-Error "ADB: Installed but not functioning properly"
        Add-CheckResult "ADB" "FAIL" "ADB not functioning" "Error: $($_.Exception.Message)" "Ensure platform-tools are properly installed"
    }
} else {
    Write-Error "ADB: Not found in PATH"
    Add-CheckResult "ADB" "FAIL" "ADB not in PATH" "" "Add Android SDK platform-tools to PATH"
}

Write-Host ""

# 6. GIT CHECK
Write-Step "Checking Git..."

if (Test-CommandExists "git") {
    try {
        $gitVersion = git --version 2>$null
        Write-Success "Git: $gitVersion"
        Add-CheckResult "Git" "PASS" "Git available" "Version: $gitVersion"
        
        if ($Detailed) {
            $gitPath = (Get-Command git).Source
            Write-Info "Git Location: $gitPath"
            
            try {
                $gitConfig = git config --global --list 2>$null
                if ($gitConfig) {
                    Write-Info "Git Configuration: Set"
                } else {
                    Write-Warning "Git Configuration: Not set (may be needed for cloning repositories)"
                }
            } catch {
                Write-Warning "Could not check Git configuration"
            }
        }
    } catch {
        Write-Error "Git: Installed but not functioning properly"
        Add-CheckResult "Git" "FAIL" "Git not functioning" "Error: $($_.Exception.Message)" "Reinstall Git from https://git-scm.com/"
    }
} else {
    Write-Warning "Git: Not installed (optional, needed for cloning repositories)"
    Add-CheckResult "Git" "WARN" "Git not found" "" "Install Git from https://git-scm.com/ (optional)"
}

Write-Host ""

# 7. ADDITIONAL TOOLS CHECK
Write-Step "Checking Additional Build Tools..."

# Python Check (sometimes needed for native modules)
if (Test-CommandExists "python") {
    try {
        $pythonVersion = python --version 2>$null
        Write-Success "Python: $pythonVersion (Available for native modules)"
        Add-CheckResult "Python" "PASS" "Python available" "Version: $pythonVersion"
    } catch {
        Write-Warning "Python: Installed but not functioning properly"
        Add-CheckResult "Python" "WARN" "Python not functioning" "Error: $($_.Exception.Message)" "May be needed for some native modules"
    }
} else {
    Write-Info "Python: Not found (optional, may be needed for some native modules)"
    Add-CheckResult "Python" "INFO" "Python not found" "" "Optional: Install Python if build issues with native modules occur"
}

# Visual Studio Build Tools Check (Windows-specific for native modules)
$vsBuildTools = Get-CimInstance -ClassName Win32_Product | Where-Object { $_.Name -like "*Visual Studio*Build Tools*" -or $_.Name -like "*Microsoft Visual C++*" }
if ($vsBuildTools) {
    Write-Success "Visual Studio Build Tools: Found ($($vsBuildTools.Count) components)"
    Add-CheckResult "VS Build Tools" "PASS" "Visual Studio Build Tools available" "Components: $($vsBuildTools.Count)"
} else {
    Write-Info "Visual Studio Build Tools: Not found (optional, may be needed for some native modules)"
    Add-CheckResult "VS Build Tools" "INFO" "VS Build Tools not found" "" "Optional: Install if native module build issues occur"
}

Write-Host ""

# 8. NETWORK AND PERMISSIONS CHECK
Write-Step "Checking Network and Permissions..."

# Internet connectivity
try {
    $internetTest = Test-NetConnection -ComputerName "registry.npmjs.org" -Port 443 -WarningAction SilentlyContinue -ErrorAction Stop
    if ($internetTest.TcpTestSucceeded) {
        Write-Success "Internet Connectivity: Available (npm registry reachable)"
        Add-CheckResult "Internet" "PASS" "Internet connectivity available" "npm registry accessible"
    } else {
        Write-Warning "Internet Connectivity: Limited (npm registry not reachable)"
        Add-CheckResult "Internet" "WARN" "Limited internet connectivity" "npm registry not accessible" "Check firewall/proxy settings"
    }
} catch {
    Write-Warning "Internet Connectivity: Could not test (may be limited)"
    Add-CheckResult "Internet" "WARN" "Could not test connectivity" "Error: $($_.Exception.Message)" "Check network settings"
}

# Execution Policy
$executionPolicy = Get-ExecutionPolicy
if ($executionPolicy -eq "Restricted") {
    Write-Error "PowerShell Execution Policy: $executionPolicy (will prevent script execution)"
    Add-CheckResult "Execution Policy" "FAIL" "Restrictive execution policy" "Current: $executionPolicy" "Run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser"
} else {
    Write-Success "PowerShell Execution Policy: $executionPolicy"
    Add-CheckResult "Execution Policy" "PASS" "Suitable execution policy" "Current: $executionPolicy"
}

Write-Host ""

# 9. SUMMARY AND RECOMMENDATIONS
Write-Host "📊 SUMMARY AND RECOMMENDATIONS" -ForegroundColor Magenta -BackgroundColor Black
Write-Host "===============================" -ForegroundColor Magenta -BackgroundColor Black

$passCount = ($Global:CheckResults | Where-Object { $_.Status -eq "PASS" }).Count
$warnCount = ($Global:CheckResults | Where-Object { $_.Status -eq "WARN" }).Count
$failCount = ($Global:CheckResults | Where-Object { $_.Status -eq "FAIL" }).Count
$infoCount = ($Global:CheckResults | Where-Object { $_.Status -eq "INFO" }).Count

Write-Host ""
Write-Host "Results Overview:" -ForegroundColor White
Write-Success "✅ PASSED: $passCount checks"
if ($warnCount -gt 0) { Write-Warning "⚠️  WARNINGS: $warnCount checks" }
if ($failCount -gt 0) { Write-Error "❌ FAILED: $failCount checks" }
if ($infoCount -gt 0) { Write-Info "ℹ️  INFO: $infoCount checks" }

Write-Host ""

if ($Global:OverallStatus) {
    Write-Host "🎉 OVERALL STATUS: READY TO BUILD!" -ForegroundColor Green -BackgroundColor Black
    Write-Host "Your system meets all requirements for building the MHT Assessment Android APK." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor White
    Write-Host "1. Clone or download the MHT Assessment project" -ForegroundColor Gray
    Write-Host "2. Navigate to the project directory" -ForegroundColor Gray
    Write-Host "3. Run: .\scripts\build-standalone-apk.ps1 -BuildType debug" -ForegroundColor Gray
    Write-Host "4. Install the generated APK on your Android device" -ForegroundColor Gray
} else {
    Write-Host "⚠️  OVERALL STATUS: ISSUES NEED ATTENTION" -ForegroundColor Yellow -BackgroundColor Black
    Write-Host "Please address the failed checks before attempting to build." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Critical Issues to Fix:" -ForegroundColor Red
    $criticalIssues = $Global:CheckResults | Where-Object { $_.Status -eq "FAIL" }
    foreach ($issue in $criticalIssues) {
        Write-Host "❌ $($issue.Component): $($issue.Message)" -ForegroundColor Red
        if ($issue.FixAction) {
            Write-Host "   Fix: $($issue.FixAction)" -ForegroundColor Yellow
        }
        Write-Host ""
    }
}

# 10. EXECUTION ORDER RECOMMENDATIONS
Write-Host ""
Write-Host "📋 RECOMMENDED INSTALLATION ORDER" -ForegroundColor Magenta -BackgroundColor Black
Write-Host "=================================" -ForegroundColor Magenta -BackgroundColor Black
Write-Host ""

$installOrder = @(
    @{
        Step = 1
        Component = "Node.js 18 LTS"
        Description = "Install Node.js (includes npm)"
        URL = "https://nodejs.org/"
        Command = "Download installer from nodejs.org and run it"
        Verification = "node --version && npm --version"
    },
    @{
        Step = 2
        Component = "Java JDK 17"
        Description = "Install OpenJDK 17 (required for Android builds)"
        URL = "https://adoptium.net/"
        Command = "Download OpenJDK 17 installer and run it"
        Verification = "java -version"
    },
    @{
        Step = 3
        Component = "Android SDK Command Line Tools"
        Description = "Download and extract Android SDK"
        URL = "https://developer.android.com/studio/command-line-tools"
        Command = "Extract to C:\Android\cmdline-tools\latest\"
        Verification = "Set ANDROID_HOME and run sdkmanager --version"
    },
    @{
        Step = 4
        Component = "Environment Variables"
        Description = "Set required environment variables"
        URL = "System Properties > Environment Variables"
        Command = "Set JAVA_HOME, ANDROID_HOME, and update PATH"
        Verification = "echo `$env:JAVA_HOME && echo `$env:ANDROID_HOME"
    },
    @{
        Step = 5
        Component = "Android SDK Packages"
        Description = "Install required Android SDK components"
        URL = "Use sdkmanager"
        Command = 'sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"'
        Verification = "adb --version"
    },
    @{
        Step = 6
        Component = "Git (Optional)"
        Description = "Install Git for repository management"
        URL = "https://git-scm.com/"
        Command = "Download Git installer and run it"
        Verification = "git --version"
    },
    @{
        Step = 7
        Component = "Yarn (Optional but Recommended)"
        Description = "Install Yarn package manager"
        URL = "Use npm"
        Command = "npm install -g yarn"
        Verification = "yarn --version"
    }
)

foreach ($item in $installOrder) {
    Write-Host "Step $($item.Step): $($item.Component)" -ForegroundColor Cyan
    Write-Host "   Description: $($item.Description)" -ForegroundColor White
    Write-Host "   URL/Source: $($item.URL)" -ForegroundColor Gray
    Write-Host "   Command: $($item.Command)" -ForegroundColor Yellow
    Write-Host "   Verify: $($item.Verification)" -ForegroundColor Green
    Write-Host ""
}

# 11. EXPORT REPORT
if ($ExportReport) {
    Write-Host "📄 Exporting detailed report to: $ReportPath" -ForegroundColor Blue
    $reportContent = @"
MHT Assessment - Windows Build Environment Check Report
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
=======================================================

SYSTEM INFORMATION:
- Windows Version: $($windowsVersion.Major).$($windowsVersion.Minor) (Build: $windowsBuild)
- PowerShell Version: $($psVersion.Major).$($psVersion.Minor)
- Total RAM: ${totalRAM} GB
- Available Disk Space: ${freeDisk} GB

CHECK RESULTS:
==============
"@

    foreach ($result in $Global:CheckResults) {
        $reportContent += @"

Component: $($result.Component)
Status: $($result.Status)
Message: $($result.Message)
Details: $($result.Details)
Fix Action: $($result.FixAction)
"@
    }

    $reportContent += @"


OVERALL STATUS: $(if ($Global:OverallStatus) { "READY" } else { "NEEDS ATTENTION" })
SUMMARY: $passCount passed, $warnCount warnings, $failCount failed, $infoCount info

NEXT STEPS:
$(if ($Global:OverallStatus) {
    "1. Clone MHT Assessment project
2. Run: .\scripts\build-standalone-apk.ps1 -BuildType debug
3. Install APK on Android device"
} else {
    "Fix the failed checks listed above before attempting to build."
})
"@

    $reportContent | Out-File -FilePath $ReportPath -Encoding UTF8
    Write-Success "Report exported to: $ReportPath"
}

# 12. FINAL INSTRUCTIONS
Write-Host ""
Write-Host "🔧 QUICK FIXES" -ForegroundColor Magenta -BackgroundColor Black
Write-Host "==============" -ForegroundColor Magenta -BackgroundColor Black

if ($failCount -gt 0 -or $warnCount -gt 0) {
    Write-Host ""
    Write-Host "Common Quick Fixes:" -ForegroundColor White
    
    if ($Global:CheckResults | Where-Object { $_.Component -eq "PowerShell" -and $_.Status -eq "FAIL" }) {
        Write-Host "❌ PowerShell Execution Policy:" -ForegroundColor Red
        Write-Host "   Run as Administrator: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned" -ForegroundColor Yellow
        Write-Host ""
    }
    
    if ($Global:CheckResults | Where-Object { $_.Component -eq "JAVA_HOME" -and $_.Status -eq "FAIL" }) {
        Write-Host "❌ JAVA_HOME not set:" -ForegroundColor Red
        Write-Host "   1. Find Java installation: where java" -ForegroundColor Yellow
        Write-Host "   2. Set JAVA_HOME to JDK directory (not bin)" -ForegroundColor Yellow
        Write-Host "   3. Add %JAVA_HOME%\bin to PATH" -ForegroundColor Yellow
        Write-Host ""
    }
    
    if ($Global:CheckResults | Where-Object { $_.Component -eq "Android SDK" -and $_.Status -eq "FAIL" }) {
        Write-Host "❌ Android SDK not found:" -ForegroundColor Red
        Write-Host "   1. Download command line tools from https://developer.android.com/studio/command-line-tools" -ForegroundColor Yellow
        Write-Host "   2. Extract to C:\Android\cmdline-tools\latest\" -ForegroundColor Yellow
        Write-Host "   3. Set ANDROID_HOME=C:\Android" -ForegroundColor Yellow
        Write-Host "   4. Add %ANDROID_HOME%\platform-tools to PATH" -ForegroundColor Yellow
        Write-Host ""
    }
}

Write-Host ""
Write-Host "💡 TIP: Re-run this script after making changes to verify fixes" -ForegroundColor Blue
Write-Host "Command: .\windows-prerequisite-checker.ps1 -Detailed -ExportReport" -ForegroundColor Gray
Write-Host ""

# End
Write-Host "Script completed at $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Gray