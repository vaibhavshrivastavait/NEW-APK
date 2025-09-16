# MHT Assessment - Complete Windows Environment Setup & APK Builder
# Comprehensive script to check, install, and configure everything needed for Android APK generation
# Version: 2.0
# Compatible with: Windows 10/11, PowerShell 5.1+
# 
# Based on current Emergent environment analysis:
# - Node.js: v20.19.5
# - npm: 10.8.2
# - yarn: 1.22.22
# - Expo CLI: 6.3.12
# - Gradle: 8.3
# - Target SDK: 34
# - Build Tools: 34.0.0
# - Java requirement: 17+

param(
    [switch]$AutoInstall,     # Attempt to install missing components automatically
    [switch]$Detailed,        # Show detailed information for each check
    [switch]$ExportReport,    # Export results to a file
    [switch]$SkipVerification, # Skip post-installation verification
    [string]$ReportPath = "mht-environment-setup-report.txt",
    [string]$InstallPath = "C:\MHTDev"  # Base installation path
)

# Require Administrator privileges for installations
if ($AutoInstall -and -not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ Administrator privileges required for auto-installation. Please run as Administrator." -ForegroundColor Red
    Write-Host "   Or run without -AutoInstall flag to only check requirements." -ForegroundColor Yellow
    exit 1
}

# Color functions
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Blue }
function Write-Step { param($Message) Write-Host "🔍 $Message" -ForegroundColor Cyan }
function Write-Install { param($Message) Write-Host "⬇️  $Message" -ForegroundColor Magenta }
function Write-Configure { param($Message) Write-Host "⚙️  $Message" -ForegroundColor DarkYellow }

# Initialize results
$Global:CheckResults = @()
$Global:OverallStatus = $true
$Global:InstallQueue = @()

function Add-CheckResult {
    param($Component, $Status, $Message, $Details = "", $FixAction = "", $RequiredVersion = "", $CurrentVersion = "")
    $Global:CheckResults += [PSCustomObject]@{
        Component = $Component
        Status = $Status
        Message = $Message
        Details = $Details
        FixAction = $FixAction
        RequiredVersion = $RequiredVersion
        CurrentVersion = $CurrentVersion
    }
    if ($Status -eq "FAIL") { $Global:OverallStatus = $false }
}

function Add-InstallItem {
    param($Component, $Action, $DownloadUrl, $InstallCommand, $Verification)
    $Global:InstallQueue += [PSCustomObject]@{
        Component = $Component
        Action = $Action
        DownloadUrl = $DownloadUrl
        InstallCommand = $InstallCommand
        Verification = $Verification
    }
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

function Install-Chocolatey {
    Write-Install "Installing Chocolatey package manager..."
    try {
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        Write-Success "Chocolatey installed successfully"
        return $true
    } catch {
        Write-Error "Failed to install Chocolatey: $($_.Exception.Message)"
        return $false
    }
}

function Install-NodeJS {
    Write-Install "Installing Node.js 20.19.5 (LTS)..."
    try {
        if (Test-CommandExists "choco") {
            & choco install nodejs --version=20.19.5 -y
        } else {
            # Download and install manually
            $nodeUrl = "https://nodejs.org/dist/v20.19.5/node-v20.19.5-x64.msi"
            $nodeInstaller = "$env:TEMP\nodejs-installer.msi"
            Write-Install "Downloading Node.js installer..."
            Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller
            Write-Install "Installing Node.js..."
            Start-Process msiexec.exe -Wait -ArgumentList '/I', $nodeInstaller, '/quiet'
            Remove-Item $nodeInstaller -ErrorAction SilentlyContinue
        }
        
        # Refresh environment variables
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
        Write-Success "Node.js installation completed"
        return $true
    } catch {
        Write-Error "Failed to install Node.js: $($_.Exception.Message)"
        return $false
    }
}

function Install-OpenJDK {
    Write-Install "Installing OpenJDK 17..."
    try {
        if (Test-CommandExists "choco") {
            & choco install openjdk17 -y
        } else {
            # Download and install manually
            $jdkUrl = "https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_windows-x64_bin.zip"
            $jdkZip = "$env:TEMP\openjdk-17.zip"
            $jdkPath = "$InstallPath\OpenJDK17"
            
            Write-Install "Downloading OpenJDK 17..."
            Invoke-WebRequest -Uri $jdkUrl -OutFile $jdkZip -UseBasicParsing
            
            Write-Install "Extracting OpenJDK..."
            Expand-Archive -Path $jdkZip -DestinationPath $InstallPath -Force
            
            # Move to cleaner path name
            if (Test-Path "$InstallPath\jdk-17.0.2") {
                Move-Item "$InstallPath\jdk-17.0.2" $jdkPath -Force
            }
            
            Remove-Item $jdkZip -ErrorAction SilentlyContinue
            
            # Set JAVA_HOME
            [Environment]::SetEnvironmentVariable("JAVA_HOME", $jdkPath, "Machine")
            [Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";$jdkPath\bin", "Machine")
        }
        
        Write-Success "OpenJDK 17 installation completed"
        return $true
    } catch {
        Write-Error "Failed to install OpenJDK: $($_.Exception.Message)"
        return $false
    }
}

function Install-AndroidSDK {
    Write-Install "Installing Android SDK..."
    try {
        $androidPath = "$InstallPath\Android"
        $cmdlineToolsPath = "$androidPath\cmdline-tools\latest"
        
        # Create directory structure
        New-Item -ItemType Directory -Path $cmdlineToolsPath -Force | Out-Null
        
        # Download command line tools
        $cmdlineUrl = "https://dl.google.com/android/repository/commandlinetools-win-10406996_latest.zip"
        $cmdlineZip = "$env:TEMP\android-cmdline-tools.zip"
        
        Write-Install "Downloading Android SDK Command Line Tools..."
        Invoke-WebRequest -Uri $cmdlineUrl -OutFile $cmdlineZip -UseBasicParsing
        
        Write-Install "Extracting Command Line Tools..."
        Expand-Archive -Path $cmdlineZip -DestinationPath "$env:TEMP\cmdline-extract" -Force
        
        # Move contents to proper location
        Move-Item "$env:TEMP\cmdline-extract\cmdline-tools\*" $cmdlineToolsPath -Force
        
        Remove-Item $cmdlineZip -ErrorAction SilentlyContinue
        Remove-Item "$env:TEMP\cmdline-extract" -Recurse -ErrorAction SilentlyContinue
        
        # Set environment variables
        [Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidPath, "Machine")
        [Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $androidPath, "Machine")
        
        $newPath = $env:PATH + ";$androidPath\platform-tools;$androidPath\tools;$cmdlineToolsPath\bin"
        [Environment]::SetEnvironmentVariable("PATH", $newPath, "Machine")
        
        # Refresh current session environment
        $env:ANDROID_HOME = $androidPath
        $env:ANDROID_SDK_ROOT = $androidPath
        $env:PATH = $newPath
        
        Write-Install "Installing Android SDK packages..."
        
        # Accept licenses first
        & "$cmdlineToolsPath\bin\sdkmanager.bat" --licenses
        
        # Install required packages
        & "$cmdlineToolsPath\bin\sdkmanager.bat" "platform-tools"
        & "$cmdlineToolsPath\bin\sdkmanager.bat" "platforms;android-34"
        & "$cmdlineToolsPath\bin\sdkmanager.bat" "build-tools;34.0.0"
        & "$cmdlineToolsPath\bin\sdkmanager.bat" "ndk;25.1.8937393"
        
        Write-Success "Android SDK installation completed"
        return $true
    } catch {
        Write-Error "Failed to install Android SDK: $($_.Exception.Message)"
        return $false
    }
}

function Install-Git {
    Write-Install "Installing Git..."
    try {
        if (Test-CommandExists "choco") {
            & choco install git -y
        } else {
            $gitUrl = "https://github.com/git-for-windows/git/releases/download/v2.42.0.windows.2/Git-2.42.0.2-64-bit.exe"
            $gitInstaller = "$env:TEMP\git-installer.exe"
            Write-Install "Downloading Git installer..."
            Invoke-WebRequest -Uri $gitUrl -OutFile $gitInstaller -UseBasicParsing
            Write-Install "Installing Git..."
            Start-Process $gitInstaller -Wait -ArgumentList '/VERYSILENT', '/NORESTART'
            Remove-Item $gitInstaller -ErrorAction SilentlyContinue
        }
        
        Write-Success "Git installation completed"
        return $true
    } catch {
        Write-Error "Failed to install Git: $($_.Exception.Message)"
        return $false
    }
}

# Header
Clear-Host
Write-Host "🚀 MHT Assessment - Complete Windows Environment Setup & APK Builder" -ForegroundColor Magenta -BackgroundColor Black
Write-Host "============================================================================" -ForegroundColor Magenta -BackgroundColor Black
Write-Host "This script will check, install, and configure everything needed for building Android APKs" -ForegroundColor White
Write-Host "Exact versions from Emergent environment: Node.js 20.19.5, Gradle 8.3, SDK 34, Java 17+" -ForegroundColor Gray
Write-Host ""

if ($AutoInstall) {
    Write-Host "🔧 AUTO-INSTALL MODE: Will attempt to install missing components" -ForegroundColor Green
} else {
    Write-Host "🔍 CHECK-ONLY MODE: Will only report missing components (use -AutoInstall to install)" -ForegroundColor Yellow
}
Write-Host ""

# Create installation directory
if ($AutoInstall -and -not (Test-Path $InstallPath)) {
    New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
    Write-Info "Created installation directory: $InstallPath"
}

# 1. SYSTEM REQUIREMENTS CHECK
Write-Step "Checking System Requirements..."

# Windows Version
$windowsVersion = [System.Environment]::OSVersion.Version
$windowsBuild = (Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion" -Name ReleaseId -ErrorAction SilentlyContinue).ReleaseId
if ($windowsVersion.Major -ge 10) {
    Write-Success "Windows Version: $($windowsVersion.Major).$($windowsVersion.Minor) (Build: $windowsBuild)"
    Add-CheckResult "Windows" "PASS" "Compatible Windows version" "Version: $($windowsVersion.Major).$($windowsVersion.Minor)" "" "10+" "$($windowsVersion.Major).$($windowsVersion.Minor)"
} else {
    Write-Error "Windows Version: $($windowsVersion.Major).$($windowsVersion.Minor) - Minimum Windows 10 required"
    Add-CheckResult "Windows" "FAIL" "Unsupported Windows version" "Version: $($windowsVersion.Major).$($windowsVersion.Minor)" "Upgrade to Windows 10 or later" "10+" "$($windowsVersion.Major).$($windowsVersion.Minor)"
}

# RAM Check
$totalRAM = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 1)
if ($totalRAM -ge 8) {
    Write-Success "System RAM: ${totalRAM} GB"
    Add-CheckResult "RAM" "PASS" "Sufficient RAM" "${totalRAM} GB total" "" "8GB+" "${totalRAM} GB"
} elseif ($totalRAM -ge 4) {
    Write-Warning "System RAM: ${totalRAM} GB - Minimum met, but 8GB+ recommended"
    Add-CheckResult "RAM" "WARN" "Minimum RAM" "${totalRAM} GB total" "Consider upgrading to 8GB+" "8GB+ (recommended)" "${totalRAM} GB"
} else {
    Write-Error "System RAM: ${totalRAM} GB - Insufficient for Android builds"
    Add-CheckResult "RAM" "FAIL" "Insufficient RAM" "${totalRAM} GB total" "Upgrade to at least 4GB RAM" "4GB+ (minimum)" "${totalRAM} GB"
}

# Disk Space Check
$freeDisk = [math]::Round((Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'").FreeSpace / 1GB, 1)
if ($freeDisk -ge 15) {
    Write-Success "Available Disk Space: ${freeDisk} GB"
    Add-CheckResult "Disk Space" "PASS" "Sufficient disk space" "${freeDisk} GB available" "" "15GB+" "${freeDisk} GB"
} elseif ($freeDisk -ge 10) {
    Write-Warning "Available Disk Space: ${freeDisk} GB - Minimum met"
    Add-CheckResult "Disk Space" "WARN" "Limited disk space" "${freeDisk} GB available" "Free up more space for smoother operation" "15GB+ (recommended)" "${freeDisk} GB"
} else {
    Write-Error "Available Disk Space: ${freeDisk} GB - Insufficient"
    Add-CheckResult "Disk Space" "FAIL" "Insufficient disk space" "${freeDisk} GB available" "Free up at least 10GB disk space" "10GB+ (minimum)" "${freeDisk} GB"
}

Write-Host ""

# 2. NODE.JS CHECK (Required: v20.19.5)
Write-Step "Checking Node.js (Required: v20.19.5)..."

if (Test-CommandExists "node") {
    try {
        $nodeVersion = node --version 2>$null
        $nodeVersionClean = $nodeVersion -replace '^v', ''
        
        if ($nodeVersionClean -eq "20.19.5") {
            Write-Success "Node.js: $nodeVersion (Exact Match)"
            Add-CheckResult "Node.js" "PASS" "Exact version match" "Version: $nodeVersion" "" "20.19.5" $nodeVersionClean
        } elseif ($nodeVersionClean -like "20.*") {
            Write-Warning "Node.js: $nodeVersion - v20.19.5 recommended for exact compatibility"
            Add-CheckResult "Node.js" "WARN" "Compatible but not exact version" "Version: $nodeVersion" "Consider upgrading to 20.19.5" "20.19.5" $nodeVersionClean
        } else {
            Write-Error "Node.js: $nodeVersion - Version 20.19.5 required for exact compatibility"
            Add-CheckResult "Node.js" "FAIL" "Incompatible version" "Version: $nodeVersion" "Install Node.js 20.19.5" "20.19.5" $nodeVersionClean
            if ($AutoInstall) { Add-InstallItem "Node.js" "Install" "https://nodejs.org/" "Install-NodeJS" "node --version" }
        }
    } catch {
        Write-Error "Node.js: Installed but not functioning"
        Add-CheckResult "Node.js" "FAIL" "Node.js not functioning" "Error: $($_.Exception.Message)" "Reinstall Node.js" "20.19.5" "Error"
        if ($AutoInstall) { Add-InstallItem "Node.js" "Reinstall" "https://nodejs.org/" "Install-NodeJS" "node --version" }
    }
} else {
    Write-Error "Node.js: Not installed"
    Add-CheckResult "Node.js" "FAIL" "Node.js not found" "" "Install Node.js 20.19.5" "20.19.5" "Not installed"
    if ($AutoInstall) { Add-InstallItem "Node.js" "Install" "https://nodejs.org/" "Install-NodeJS" "node --version" }
}

# NPM Check (Should be 10.8.2 with Node 20.19.5)
if (Test-CommandExists "npm") {
    try {
        $npmVersion = npm --version 2>$null
        if ($npmVersion -eq "10.8.2") {
            Write-Success "npm: v$npmVersion (Exact Match)"
            Add-CheckResult "npm" "PASS" "Exact version match" "Version: v$npmVersion" "" "10.8.2" $npmVersion
        } else {
            Write-Warning "npm: v$npmVersion - v10.8.2 expected with Node 20.19.5"
            Add-CheckResult "npm" "WARN" "Different version" "Version: v$npmVersion" "Comes with Node.js installation" "10.8.2" $npmVersion
        }
    } catch {
        Write-Error "npm: Not functioning properly"
        Add-CheckResult "npm" "FAIL" "npm not functioning" "Error: $($_.Exception.Message)" "Reinstall Node.js" "10.8.2" "Error"
    }
} else {
    Write-Error "npm: Not found"
    Add-CheckResult "npm" "FAIL" "npm not found" "" "Install Node.js (includes npm)" "10.8.2" "Not installed"
}

Write-Host ""

# 3. JAVA JDK CHECK (Required: 17+)
Write-Step "Checking Java JDK (Required: Java 17+)..."

if (Test-CommandExists "java") {
    try {
        $javaVersionOutput = java -version 2>&1 | Select-Object -First 1
        
        # Extract version number (handles both old and new versioning)
        if ($javaVersionOutput -match '"(\d+)\..*?"' -or $javaVersionOutput -match '"(\d+)"') {
            $javaMajor = [int]$matches[1]
        } elseif ($javaVersionOutput -match '"1\.(\d+)\..*?"') {
            $javaMajor = [int]$matches[1]
        } else {
            $javaMajor = 0
        }
        
        if ($javaMajor -ge 17) {
            Write-Success "Java JDK: $javaVersionOutput"
            Add-CheckResult "Java JDK" "PASS" "Compatible Java version" "Version: $javaVersionOutput" "" "17+" "$javaMajor"
        } elseif ($javaMajor -ge 11) {
            Write-Warning "Java JDK: $javaVersionOutput - Java 17+ recommended"
            Add-CheckResult "Java JDK" "WARN" "Older Java version" "Version: $javaVersionOutput" "Upgrade to Java 17" "17+" "$javaMajor"
            if ($AutoInstall) { Add-InstallItem "Java JDK" "Upgrade" "https://adoptium.net/" "Install-OpenJDK" "java -version" }
        } else {
            Write-Error "Java JDK: $javaVersionOutput - Java 17+ required"
            Add-CheckResult "Java JDK" "FAIL" "Outdated Java version" "Version: $javaVersionOutput" "Install Java 17" "17+" "$javaMajor"
            if ($AutoInstall) { Add-InstallItem "Java JDK" "Install" "https://adoptium.net/" "Install-OpenJDK" "java -version" }
        }
    } catch {
        Write-Error "Java JDK: Not functioning properly"
        Add-CheckResult "Java JDK" "FAIL" "Java not functioning" "Error: $($_.Exception.Message)" "Install Java 17" "17+" "Error"
        if ($AutoInstall) { Add-InstallItem "Java JDK" "Install" "https://adoptium.net/" "Install-OpenJDK" "java -version" }
    }
} else {
    Write-Error "Java JDK: Not installed"
    Add-CheckResult "Java JDK" "FAIL" "Java not found" "" "Install Java 17" "17+" "Not installed"
    if ($AutoInstall) { Add-InstallItem "Java JDK" "Install" "https://adoptium.net/" "Install-OpenJDK" "java -version" }
}

Write-Host ""

# 4. ENVIRONMENT VARIABLES CHECK
Write-Step "Checking Environment Variables..."

# JAVA_HOME Check
$javaHome = $env:JAVA_HOME
if ($javaHome -and (Test-Path $javaHome)) {
    Write-Success "JAVA_HOME: $javaHome"
    Add-CheckResult "JAVA_HOME" "PASS" "JAVA_HOME properly set" "Path: $javaHome" "" "Set" "Set"
} else {
    Write-Error "JAVA_HOME: Not set or invalid"
    Add-CheckResult "JAVA_HOME" "FAIL" "JAVA_HOME not set" "Current: $javaHome" "Set JAVA_HOME to JDK path" "Set" "Not set"
}

# ANDROID_HOME Check
$androidHome = $env:ANDROID_HOME
$androidSdkRoot = $env:ANDROID_SDK_ROOT
$androidSdkPath = $androidHome ?? $androidSdkRoot

if ($androidSdkPath -and (Test-Path $androidSdkPath)) {
    Write-Success "Android SDK: $androidSdkPath"
    Add-CheckResult "Android SDK" "PASS" "Android SDK found" "Path: $androidSdkPath" "" "Set" "Set"
} else {
    Write-Error "Android SDK: Not found (ANDROID_HOME/ANDROID_SDK_ROOT not set)"
    Add-CheckResult "Android SDK" "FAIL" "Android SDK not found" "ANDROID_HOME: $androidHome" "Install Android SDK and set ANDROID_HOME" "Set" "Not set"
    if ($AutoInstall) { Add-InstallItem "Android SDK" "Install" "https://developer.android.com/studio/command-line-tools" "Install-AndroidSDK" "adb --version" }
}

Write-Host ""

# 5. ANDROID SDK COMPONENTS CHECK
Write-Step "Checking Android SDK Components (SDK 34, Build Tools 34.0.0)..."

if ($androidSdkPath -and (Test-Path $androidSdkPath)) {
    # Platform Tools Check
    $platformTools = Join-Path $androidSdkPath "platform-tools"
    if (Test-Path $platformTools) {
        Write-Success "Platform Tools: Found"
        Add-CheckResult "Platform Tools" "PASS" "Platform tools available" "Path: $platformTools" "" "Required" "Installed"
    } else {
        Write-Error "Platform Tools: Not found"
        Add-CheckResult "Platform Tools" "FAIL" "Platform tools missing" "Expected: $platformTools" "Install: sdkmanager 'platform-tools'" "Required" "Missing"
    }
    
    # Android API 34 Check
    $platforms = Join-Path $androidSdkPath "platforms"
    if (Test-Path $platforms) {
        if (Test-Path (Join-Path $platforms "android-34")) {
            Write-Success "Android API 34: Found"
            Add-CheckResult "Android API 34" "PASS" "Target SDK available" "Platform: android-34" "" "API 34" "API 34"
        } else {
            $availablePlatforms = (Get-ChildItem $platforms -Directory -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name) -join ', '
            Write-Error "Android API 34: Not found (Available: $availablePlatforms)"
            Add-CheckResult "Android API 34" "FAIL" "Target SDK missing" "Available: $availablePlatforms" "Install: sdkmanager 'platforms;android-34'" "API 34" "Missing"
        }
    } else {
        Write-Error "Platforms Directory: Not found"
        Add-CheckResult "Platforms" "FAIL" "Platforms directory missing" "Expected: $platforms" "Install Android SDK platforms" "Required" "Missing"
    }
    
    # Build Tools 34.0.0 Check
    $buildTools = Join-Path $androidSdkPath "build-tools"
    if (Test-Path $buildTools) {
        if (Test-Path (Join-Path $buildTools "34.0.0")) {
            Write-Success "Build Tools 34.0.0: Found"
            Add-CheckResult "Build Tools 34.0.0" "PASS" "Required build tools available" "Version: 34.0.0" "" "34.0.0" "34.0.0"
        } else {
            $availableBuildTools = (Get-ChildItem $buildTools -Directory -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name | Sort-Object {[version]$_} -Descending) -join ', '
            Write-Error "Build Tools 34.0.0: Not found (Available: $availableBuildTools)"
            Add-CheckResult "Build Tools 34.0.0" "FAIL" "Required build tools missing" "Available: $availableBuildTools" "Install: sdkmanager 'build-tools;34.0.0'" "34.0.0" "Missing"
        }
    } else {
        Write-Error "Build Tools Directory: Not found"
        Add-CheckResult "Build Tools" "FAIL" "Build tools directory missing" "Expected: $buildTools" "Install Android SDK build-tools" "Required" "Missing"
    }
}

# ADB Check
if (Test-CommandExists "adb") {
    try {
        $adbVersion = adb version 2>$null | Select-Object -First 1
        Write-Success "ADB: $adbVersion"
        Add-CheckResult "ADB" "PASS" "ADB available" "Version: $adbVersion" "" "Required" "Available"
    } catch {
        Write-Error "ADB: Not functioning properly"
        Add-CheckResult "ADB" "FAIL" "ADB not functioning" "Error: $($_.Exception.Message)" "Check platform-tools installation" "Required" "Error"
    }
} else {
    Write-Error "ADB: Not found in PATH"
    Add-CheckResult "ADB" "FAIL" "ADB not in PATH" "" "Add platform-tools to PATH" "Required" "Not in PATH"
}

Write-Host ""

# 6. ADDITIONAL TOOLS CHECK
Write-Step "Checking Additional Tools..."

# Yarn Check (Optional but recommended - should be 1.22.22)
if (Test-CommandExists "yarn") {
    try {
        $yarnVersion = yarn --version 2>$null
        if ($yarnVersion -eq "1.22.22") {
            Write-Success "Yarn: v$yarnVersion (Exact Match)"
            Add-CheckResult "Yarn" "PASS" "Exact version match" "Version: v$yarnVersion" "" "1.22.22" $yarnVersion
        } else {
            Write-Warning "Yarn: v$yarnVersion - v1.22.22 used in development"
            Add-CheckResult "Yarn" "WARN" "Different version" "Version: v$yarnVersion" "npm install -g yarn@1.22.22 for exact match" "1.22.22" $yarnVersion
        }
    } catch {
        Write-Warning "Yarn: Not functioning properly"
        Add-CheckResult "Yarn" "WARN" "Yarn not functioning" "Error: $($_.Exception.Message)" "npm install -g yarn@1.22.22" "1.22.22" "Error"
    }
} else {
    Write-Warning "Yarn: Not installed (npm will be used)"
    Add-CheckResult "Yarn" "WARN" "Yarn not found" "Using npm instead" "npm install -g yarn@1.22.22 (optional)" "1.22.22" "Not installed"
}

# Git Check
if (Test-CommandExists "git") {
    try {
        $gitVersion = git --version 2>$null
        Write-Success "Git: $gitVersion"
        Add-CheckResult "Git" "PASS" "Git available" "Version: $gitVersion" "" "Any version" "Available"
    } catch {
        Write-Warning "Git: Not functioning properly"
        Add-CheckResult "Git" "WARN" "Git not functioning" "Error: $($_.Exception.Message)" "Reinstall Git" "Any version" "Error"
    }
} else {
    Write-Warning "Git: Not installed (needed for cloning repositories)"
    Add-CheckResult "Git" "WARN" "Git not found" "" "Install Git from https://git-scm.com/" "Any version" "Not installed"
    if ($AutoInstall) { Add-InstallItem "Git" "Install" "https://git-scm.com/" "Install-Git" "git --version" }
}

# Expo CLI Check
if (Test-CommandExists "expo") {
    try {
        $expoVersion = expo --version 2>$null
        Write-Success "Expo CLI: v$expoVersion"
        Add-CheckResult "Expo CLI" "PASS" "Expo CLI available" "Version: v$expoVersion" "" "Any version" $expoVersion
    } catch {
        Write-Warning "Expo CLI: Not functioning properly"
        Add-CheckResult "Expo CLI" "WARN" "Expo CLI not functioning" "Error: $($_.Exception.Message)" "npm install -g @expo/cli" "Any version" "Error"
    }
} else {
    Write-Warning "Expo CLI: Not installed"
    Add-CheckResult "Expo CLI" "WARN" "Expo CLI not found" "" "npm install -g @expo/cli (will be installed with project)" "Any version" "Not installed"
}

Write-Host ""

# 7. AUTO-INSTALLATION PROCESS
if ($AutoInstall -and $Global:InstallQueue.Count -gt 0) {
    Write-Host "🔧 AUTO-INSTALLATION PROCESS" -ForegroundColor Magenta -BackgroundColor Black
    Write-Host "============================" -ForegroundColor Magenta -BackgroundColor Black
    Write-Host ""
    
    # Check if Chocolatey is available for easier installations
    $useChocolatey = $false
    if (-not (Test-CommandExists "choco")) {
        Write-Step "Installing Chocolatey for easier package management..."
        if (Install-Chocolatey) {
            $useChocolatey = $true
            # Refresh PATH to include choco
            $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
        }
    } else {
        $useChocolatey = $true
        Write-Success "Chocolatey already available"
    }
    
    Write-Host ""
    
    foreach ($item in $Global:InstallQueue) {
        Write-Install "Installing $($item.Component)..."
        try {
            switch ($item.Component) {
                "Node.js" { 
                    $success = Install-NodeJS
                    if ($success -and -not $SkipVerification) {
                        Start-Sleep -Seconds 3
                        $verification = & node --version 2>$null
                        Write-Success "Verification: Node.js $verification installed"
                    }
                }
                "Java JDK" { 
                    $success = Install-OpenJDK
                    if ($success -and -not $SkipVerification) {
                        Start-Sleep -Seconds 3
                        # Refresh environment
                        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
                        $env:JAVA_HOME = [System.Environment]::GetEnvironmentVariable("JAVA_HOME", "Machine")
                        try {
                            $verification = & java -version 2>&1 | Select-Object -First 1
                            Write-Success "Verification: Java installed - $verification"
                        } catch {
                            Write-Warning "Java installed but verification failed (may need system restart)"
                        }
                    }
                }
                "Android SDK" { 
                    $success = Install-AndroidSDK
                    if ($success -and -not $SkipVerification) {
                        Start-Sleep -Seconds 5
                        # Refresh environment
                        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
                        $env:ANDROID_HOME = [System.Environment]::GetEnvironmentVariable("ANDROID_HOME", "Machine")
                        try {
                            $verification = & adb --version 2>$null | Select-Object -First 1
                            Write-Success "Verification: Android SDK installed - $verification"
                        } catch {
                            Write-Warning "Android SDK installed but ADB not immediately available (may need system restart)"
                        }
                    }
                }
                "Git" { 
                    $success = Install-Git
                    if ($success -and -not $SkipVerification) {
                        Start-Sleep -Seconds 3
                        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
                        try {
                            $verification = & git --version 2>$null
                            Write-Success "Verification: Git installed - $verification"
                        } catch {
                            Write-Warning "Git installed but not immediately available (may need system restart)"
                        }
                    }
                }
                default {
                    Write-Warning "Unknown component: $($item.Component)"
                }
            }
        } catch {
            Write-Error "Failed to install $($item.Component): $($_.Exception.Message)"
        }
        Write-Host ""
    }
    
    Write-Host "⚠️  IMPORTANT: You may need to restart your command prompt or system for all changes to take effect!" -ForegroundColor Yellow -BackgroundColor Black
    Write-Host ""
}

# 8. SUMMARY AND FINAL INSTRUCTIONS
Write-Host "📊 FINAL SUMMARY" -ForegroundColor Magenta -BackgroundColor Black
Write-Host "================" -ForegroundColor Magenta -BackgroundColor Black

$passCount = ($Global:CheckResults | Where-Object { $_.Status -eq "PASS" }).Count
$warnCount = ($Global:CheckResults | Where-Object { $_.Status -eq "WARN" }).Count
$failCount = ($Global:CheckResults | Where-Object { $_.Status -eq "FAIL" }).Count

Write-Host ""
Write-Host "Results Overview:" -ForegroundColor White
Write-Success "✅ PASSED: $passCount checks"
if ($warnCount -gt 0) { Write-Warning "⚠️  WARNINGS: $warnCount checks" }
if ($failCount -gt 0) { Write-Error "❌ FAILED: $failCount checks" }

Write-Host ""

if ($Global:OverallStatus -or $failCount -eq 0) {
    Write-Host "🎉 READY FOR MHT ASSESSMENT APK BUILD!" -ForegroundColor Green -BackgroundColor Black
    Write-Host ""
    Write-Host "📋 NEXT STEPS TO BUILD APK:" -ForegroundColor White
    Write-Host "1. Clone the repository:" -ForegroundColor Gray
    Write-Host "   git clone <your-github-repo-url>" -ForegroundColor Yellow
    Write-Host "2. Navigate to project directory:" -ForegroundColor Gray
    Write-Host "   cd mht-assessment" -ForegroundColor Yellow
    Write-Host "3. Install project dependencies:" -ForegroundColor Gray
    Write-Host "   npm install  # or yarn install" -ForegroundColor Yellow
    Write-Host "4. Build the Android bundle:" -ForegroundColor Gray
    Write-Host "   npm run bundle:android" -ForegroundColor Yellow
    Write-Host "5. Build the APK:" -ForegroundColor Gray
    Write-Host "   cd android && ./gradlew assembleDebug" -ForegroundColor Yellow
    Write-Host "6. Find your APK at:" -ForegroundColor Gray
    Write-Host "   android/app/build/outputs/apk/debug/app-debug.apk" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📱 Install the APK on your Android device to test!" -ForegroundColor Green
} else {
    Write-Host "⚠️  ISSUES NEED ATTENTION" -ForegroundColor Yellow -BackgroundColor Black
    Write-Host ""
    Write-Host "Critical Issues:" -ForegroundColor Red
    $criticalIssues = $Global:CheckResults | Where-Object { $_.Status -eq "FAIL" }
    foreach ($issue in $criticalIssues) {
        Write-Host "❌ $($issue.Component): $($issue.Message)" -ForegroundColor Red
        if ($issue.FixAction) {
            Write-Host "   Fix: $($issue.FixAction)" -ForegroundColor Yellow
        }
    }
    Write-Host ""
    Write-Host "Run this script again with -AutoInstall flag to automatically install missing components:" -ForegroundColor Yellow
    Write-Host ".\windows-complete-environment-setup.ps1 -AutoInstall -Detailed" -ForegroundColor Gray
}

# 9. EXPORT REPORT
if ($ExportReport) {
    Write-Host ""
    Write-Host "📄 Exporting detailed report..." -ForegroundColor Blue
    
    $reportContent = @"
MHT Assessment - Complete Windows Environment Setup Report
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
===========================================================

EXACT VERSION REQUIREMENTS (from Emergent environment):
- Node.js: 20.19.5
- npm: 10.8.2  
- yarn: 1.22.22
- Java: 17+
- Android SDK: API 34
- Build Tools: 34.0.0
- Gradle: 8.3

SYSTEM INFORMATION:
- Windows: $($windowsVersion.Major).$($windowsVersion.Minor) (Build: $windowsBuild)
- RAM: ${totalRAM} GB
- Disk Space: ${freeDisk} GB available

DETAILED CHECK RESULTS:
======================
"@

    foreach ($result in $Global:CheckResults) {
        $reportContent += @"

Component: $($result.Component)
Status: $($result.Status)
Required Version: $($result.RequiredVersion)
Current Version: $($result.CurrentVersion)
Message: $($result.Message)
Details: $($result.Details)
Fix Action: $($result.FixAction)
---
"@
    }

    $reportContent += @"


OVERALL STATUS: $(if ($Global:OverallStatus -or $failCount -eq 0) { "READY" } else { "NEEDS ATTENTION" })
SUMMARY: $passCount passed, $warnCount warnings, $failCount failed

INSTALLATION COMMANDS (if needed):
=================================
# Install Chocolatey (run as Administrator):
Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install all components:
choco install nodejs --version=20.19.5 -y
choco install openjdk17 -y
choco install git -y

# Install Android SDK manually:
# Download from: https://developer.android.com/studio/command-line-tools
# Extract to: C:\MHTDev\Android\cmdline-tools\latest\
# Set ANDROID_HOME=C:\MHTDev\Android

# Install project dependencies:
npm install -g yarn@1.22.22
npm install -g @expo/cli

APK BUILD COMMANDS:
==================
git clone <repository-url>
cd mht-assessment
npm install
npm run bundle:android
cd android
./gradlew assembleDebug

APK Location: android/app/build/outputs/apk/debug/app-debug.apk
"@

    $reportContent | Out-File -FilePath $ReportPath -Encoding UTF8
    Write-Success "Report exported to: $ReportPath"
}

Write-Host ""
Write-Host "Script completed at $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Gray
Write-Host "Re-run with different flags for different modes:" -ForegroundColor Gray
Write-Host "  -AutoInstall     : Automatically install missing components" -ForegroundColor Gray
Write-Host "  -Detailed        : Show detailed information" -ForegroundColor Gray
Write-Host "  -ExportReport    : Export results to file" -ForegroundColor Gray
Write-Host "  -SkipVerification: Skip post-installation verification" -ForegroundColor Gray