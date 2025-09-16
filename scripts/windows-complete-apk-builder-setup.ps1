# ============================================================================
# MHT Assessment - Complete Windows APK Builder Setup & Dependency Checker
# ============================================================================
# Version: 3.0 - Enhanced with exact version matching and comprehensive auto-install
# Compatible with: Windows 10/11, PowerShell 5.0+
# Purpose: Check, install, and configure ALL dependencies for Android APK generation
#
# EXACT VERSION REQUIREMENTS (from current Emergent environment):
# - Node.js: 20.19.5
# - npm: 10.8.2
# - yarn: 1.22.22
# - Java JDK: 17+ (OpenJDK 17 recommended)
# - Android SDK: API 34
# - Build Tools: 34.0.0
# - NDK: 25.1.8937393
# - Gradle: 8.3+
# - Target SDK: 34
# - Min SDK: 23
# - Compile SDK: 34
# ============================================================================

param(
    [switch]$AutoInstall,           # Attempt to install missing components automatically
    [switch]$Detailed,              # Show detailed information for each check
    [switch]$ExportReport,          # Export results to a detailed report file
    [switch]$SkipVerification,      # Skip post-installation verification
    [switch]$Force,                 # Force reinstall even if components exist
    [string]$ReportPath = "mht-apk-build-environment-report.txt",
    [string]$InstallPath = "C:\MHTDev",  # Base installation path
    [string]$AndroidSdkPath = "C:\MHTDev\Android",
    [string]$JavaPath = "C:\MHTDev\OpenJDK17"
)

# ============================================================================
# INITIALIZATION & FUNCTIONS
# ============================================================================

# Require Administrator privileges for installations
if ($AutoInstall -and -not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ Administrator privileges required for auto-installation." -ForegroundColor Red
    Write-Host "   Please run PowerShell as Administrator or use -AutoInstall flag." -ForegroundColor Yellow
    Write-Host "   Current mode: Check-only (no installations will be performed)" -ForegroundColor Gray
    $AutoInstall = $false
}

# Color and output functions
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Blue }
function Write-Step { param($Message) Write-Host "🔍 $Message" -ForegroundColor Cyan }
function Write-Install { param($Message) Write-Host "⬇️  $Message" -ForegroundColor Magenta }
function Write-Configure { param($Message) Write-Host "⚙️  $Message" -ForegroundColor DarkYellow }

# Initialize results tracking
$Global:CheckResults = @()
$Global:OverallStatus = $true
$Global:InstallQueue = @()
$Global:EnvironmentUpdates = @()

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
    param($Component, $Action, $InstallFunction, $Priority = "Normal")
    $Global:InstallQueue += [PSCustomObject]@{
        Component = $Component
        Action = $Action
        InstallFunction = $InstallFunction
        Priority = $Priority
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

function Add-EnvironmentVariable {
    param($Name, $Value, $Scope = "Machine")
    [Environment]::SetEnvironmentVariable($Name, $Value, $Scope)
    $Global:EnvironmentUpdates += "$Name = $Value"
}

function Refresh-EnvironmentVariables {
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
    $env:JAVA_HOME = [System.Environment]::GetEnvironmentVariable("JAVA_HOME", "Machine")
    $env:ANDROID_HOME = [System.Environment]::GetEnvironmentVariable("ANDROID_HOME", "Machine")
    $env:ANDROID_SDK_ROOT = [System.Environment]::GetEnvironmentVariable("ANDROID_SDK_ROOT", "Machine")
}

# ============================================================================
# INSTALLATION FUNCTIONS
# ============================================================================

function Install-Chocolatey {
    Write-Install "Installing Chocolatey package manager..."
    try {
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        
        # Wait for choco to be available
        Start-Sleep -Seconds 5
        Refresh-EnvironmentVariables
        
        if (Test-CommandExists "choco") {
            Write-Success "Chocolatey installed successfully"
            return $true
        } else {
            Write-Error "Chocolatey installation completed but command not available"
            return $false
        }
    } catch {
        Write-Error "Failed to install Chocolatey: $($_.Exception.Message)"
        return $false
    }
}

function Install-NodeJS {
    Write-Install "Installing Node.js 20.19.5 (LTS)..."
    try {
        if (Test-CommandExists "choco") {
            Write-Info "Using Chocolatey to install Node.js..."
            $result = & choco install nodejs --version=20.19.5 -y --force
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Node.js installed via Chocolatey"
            } else {
                Write-Warning "Chocolatey install failed, trying manual installation..."
                return Install-NodeJSManual
            }
        } else {
            return Install-NodeJSManual
        }
        
        Refresh-EnvironmentVariables
        Start-Sleep -Seconds 3
        
        # Verify installation
        if (Test-CommandExists "node") {
            $nodeVersion = & node --version
            Write-Success "Node.js installation verified: $nodeVersion"
            return $true
        } else {
            Write-Error "Node.js installation failed verification"
            return $false
        }
    } catch {
        Write-Error "Failed to install Node.js: $($_.Exception.Message)"
        return $false
    }
}

function Install-NodeJSManual {
    Write-Install "Installing Node.js manually..."
    try {
        $nodeUrl = "https://nodejs.org/dist/v20.19.5/node-v20.19.5-x64.msi"
        $nodeInstaller = "$env:TEMP\nodejs-20.19.5-installer.msi"
        
        Write-Install "Downloading Node.js installer..."
        Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller -UseBasicParsing
        
        Write-Install "Installing Node.js (this may take a few minutes)..."
        $installArgs = @('/I', $nodeInstaller, '/quiet', '/norestart')
        Start-Process msiexec.exe -Wait -ArgumentList $installArgs -NoNewWindow
        
        Remove-Item $nodeInstaller -ErrorAction SilentlyContinue
        Write-Success "Node.js manual installation completed"
        return $true
    } catch {
        Write-Error "Manual Node.js installation failed: $($_.Exception.Message)"
        return $false
    }
}

function Install-Yarn {
    Write-Install "Installing Yarn 1.22.22..."
    try {
        if (Test-CommandExists "npm") {
            Write-Info "Installing Yarn via npm..."
            & npm install -g yarn@1.22.22
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Yarn installed successfully"
                return $true
            } else {
                Write-Error "Failed to install Yarn via npm"
                return $false
            }
        } else {
            Write-Error "npm not available for Yarn installation"
            return $false
        }
    } catch {
        Write-Error "Failed to install Yarn: $($_.Exception.Message)"
        return $false
    }
}

function Install-OpenJDK {
    Write-Install "Installing OpenJDK 17..."
    try {
        if (Test-CommandExists "choco") {
            Write-Info "Using Chocolatey to install OpenJDK 17..."
            & choco install openjdk17 -y --force
            if ($LASTEXITCODE -eq 0) {
                Write-Success "OpenJDK 17 installed via Chocolatey"
            } else {
                Write-Warning "Chocolatey install failed, trying manual installation..."
                return Install-OpenJDKManual
            }
        } else {
            return Install-OpenJDKManual
        }
        
        # Find and set JAVA_HOME
        $possibleJavaPaths = @(
            "C:\Program Files\Eclipse Adoptium\jdk-17*",
            "C:\Program Files\OpenJDK\jdk-17*",
            "C:\Program Files\Java\jdk-17*"
        )
        
        foreach ($pathPattern in $possibleJavaPaths) {
            $javaPath = Get-ChildItem $pathPattern -Directory -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1
            if ($javaPath) {
                Add-EnvironmentVariable "JAVA_HOME" $javaPath.FullName
                $currentPath = [System.Environment]::GetEnvironmentVariable("PATH", "Machine")
                if ($currentPath -notlike "*$($javaPath.FullName)\bin*") {
                    Add-EnvironmentVariable "PATH" "$currentPath;$($javaPath.FullName)\bin"
                }
                break
            }
        }
        
        Refresh-EnvironmentVariables
        return $true
    } catch {
        Write-Error "Failed to install OpenJDK: $($_.Exception.Message)"
        return $false
    }
}

function Install-OpenJDKManual {
    Write-Install "Installing OpenJDK 17 manually..."
    try {
        $jdkUrl = "https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_windows-x64_bin.zip"
        $jdkZip = "$env:TEMP\openjdk-17.zip"
        
        Write-Install "Downloading OpenJDK 17..."
        Invoke-WebRequest -Uri $jdkUrl -OutFile $jdkZip -UseBasicParsing
        
        Write-Install "Extracting OpenJDK..."
        New-Item -ItemType Directory -Path $JavaPath -Force | Out-Null
        Expand-Archive -Path $jdkZip -DestinationPath $InstallPath -Force
        
        # Move extracted contents to cleaner path
        $extractedPath = Get-ChildItem "$InstallPath\jdk-*" -Directory | Select-Object -First 1
        if ($extractedPath -and $extractedPath.FullName -ne $JavaPath) {
            Move-Item "$($extractedPath.FullName)\*" $JavaPath -Force
            Remove-Item $extractedPath.FullName -Recurse -Force -ErrorAction SilentlyContinue
        }
        
        Remove-Item $jdkZip -ErrorAction SilentlyContinue
        
        # Set environment variables
        Add-EnvironmentVariable "JAVA_HOME" $JavaPath
        $currentPath = [System.Environment]::GetEnvironmentVariable("PATH", "Machine")
        if ($currentPath -notlike "*$JavaPath\bin*") {
            Add-EnvironmentVariable "PATH" "$currentPath;$JavaPath\bin"
        }
        
        Write-Success "OpenJDK 17 manual installation completed"
        return $true
    } catch {
        Write-Error "Manual OpenJDK installation failed: $($_.Exception.Message)"
        return $false
    }
}

function Install-AndroidSDK {
    Write-Install "Installing Android SDK..."
    try {
        $cmdlineToolsPath = "$AndroidSdkPath\cmdline-tools\latest"
        
        # Create directory structure
        New-Item -ItemType Directory -Path $cmdlineToolsPath -Force | Out-Null
        
        # Download command line tools
        $cmdlineUrl = "https://dl.google.com/android/repository/commandlinetools-win-10406996_latest.zip"
        $cmdlineZip = "$env:TEMP\android-cmdline-tools.zip"
        
        Write-Install "Downloading Android SDK Command Line Tools..."
        Invoke-WebRequest -Uri $cmdlineUrl -OutFile $cmdlineZip -UseBasicParsing
        
        Write-Install "Extracting Command Line Tools..."
        $extractPath = "$env:TEMP\cmdline-extract"
        Expand-Archive -Path $cmdlineZip -DestinationPath $extractPath -Force
        
        # Move contents to proper location
        if (Test-Path "$extractPath\cmdline-tools") {
            Move-Item "$extractPath\cmdline-tools\*" $cmdlineToolsPath -Force
        }
        
        # Cleanup
        Remove-Item $cmdlineZip -ErrorAction SilentlyContinue
        Remove-Item $extractPath -Recurse -ErrorAction SilentlyContinue
        
        # Set environment variables
        Add-EnvironmentVariable "ANDROID_HOME" $AndroidSdkPath
        Add-EnvironmentVariable "ANDROID_SDK_ROOT" $AndroidSdkPath
        
        $currentPath = [System.Environment]::GetEnvironmentVariable("PATH", "Machine")
        $androidPaths = @(
            "$AndroidSdkPath\platform-tools",
            "$AndroidSdkPath\tools",
            "$AndroidSdkPath\tools\bin",
            "$cmdlineToolsPath\bin"
        )
        
        foreach ($androidPath in $androidPaths) {
            if ($currentPath -notlike "*$androidPath*") {
                $currentPath += ";$androidPath"
            }
        }
        Add-EnvironmentVariable "PATH" $currentPath
        
        Refresh-EnvironmentVariables
        
        Write-Install "Installing Android SDK packages..."
        
        # Accept licenses first
        $sdkmanager = "$cmdlineToolsPath\bin\sdkmanager.bat"
        if (Test-Path $sdkmanager) {
            Write-Install "Accepting Android SDK licenses..."
            echo "y" | & $sdkmanager --licenses 2>$null
            
            Write-Install "Installing platform tools..."
            & $sdkmanager "platform-tools"
            
            Write-Install "Installing Android API 34..."
            & $sdkmanager "platforms;android-34"
            
            Write-Install "Installing Build Tools 34.0.0..."
            & $sdkmanager "build-tools;34.0.0"
            
            Write-Install "Installing NDK 25.1.8937393..."
            & $sdkmanager "ndk;25.1.8937393"
            
            Write-Success "Android SDK installation completed"
            return $true
        } else {
            Write-Error "SDK Manager not found at expected location"
            return $false
        }
    } catch {
        Write-Error "Failed to install Android SDK: $($_.Exception.Message)"
        return $false
    }
}

function Install-Git {
    Write-Install "Installing Git..."
    try {
        if (Test-CommandExists "choco") {
            Write-Info "Using Chocolatey to install Git..."
            & choco install git -y --force
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Git installed via Chocolatey"
                Refresh-EnvironmentVariables
                return $true
            } else {
                Write-Warning "Chocolatey install failed, trying manual installation..."
                return Install-GitManual
            }
        } else {
            return Install-GitManual
        }
    } catch {
        Write-Error "Failed to install Git: $($_.Exception.Message)"
        return $false
    }
}

function Install-GitManual {
    Write-Install "Installing Git manually..."
    try {
        $gitUrl = "https://github.com/git-for-windows/git/releases/download/v2.42.0.windows.2/Git-2.42.0.2-64-bit.exe"
        $gitInstaller = "$env:TEMP\git-installer.exe"
        
        Write-Install "Downloading Git installer..."
        Invoke-WebRequest -Uri $gitUrl -OutFile $gitInstaller -UseBasicParsing
        
        Write-Install "Installing Git (this may take a few minutes)..."
        Start-Process $gitInstaller -Wait -ArgumentList '/VERYSILENT', '/NORESTART', '/NOCANCEL', '/SP-', '/CLOSEAPPLICATIONS', '/RESTARTAPPLICATIONS'
        
        Remove-Item $gitInstaller -ErrorAction SilentlyContinue
        Refresh-EnvironmentVariables
        
        Write-Success "Git manual installation completed"
        return $true
    } catch {
        Write-Error "Manual Git installation failed: $($_.Exception.Message)"
        return $false
    }
}

function Install-ExpoTools {
    Write-Install "Installing Expo CLI and related tools..."
    try {
        if (Test-CommandExists "npm") {
            Write-Install "Installing Expo CLI globally..."
            & npm install -g @expo/cli@latest
            
            if (Test-CommandExists "yarn") {
                Write-Install "Installing EAS CLI globally..."
                & npm install -g eas-cli@latest
            }
            
            Write-Success "Expo tools installed successfully"
            return $true
        } else {
            Write-Error "npm not available for Expo tools installation"
            return $false
        }
    } catch {
        Write-Error "Failed to install Expo tools: $($_.Exception.Message)"
        return $false
    }
}

# ============================================================================
# MAIN SCRIPT EXECUTION
# ============================================================================

Clear-Host
Write-Host "🚀 MHT Assessment - Complete Windows APK Builder Setup" -ForegroundColor Magenta -BackgroundColor Black
Write-Host "============================================================================" -ForegroundColor Magenta -BackgroundColor Black
Write-Host "Enhanced version 3.0 - Comprehensive dependency checker and auto-installer" -ForegroundColor White
Write-Host "Exact versions for MHT Assessment: Node.js 20.19.5, Java 17+, Android SDK 34" -ForegroundColor Gray
Write-Host ""

if ($AutoInstall) {
    Write-Host "🔧 AUTO-INSTALL MODE: Will install missing components automatically" -ForegroundColor Green
} else {
    Write-Host "🔍 CHECK-ONLY MODE: Will only report missing components" -ForegroundColor Yellow
    Write-Host "   Use -AutoInstall flag to enable automatic installation" -ForegroundColor Gray
}
Write-Host ""

# Create installation directories
if ($AutoInstall) {
    New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
    New-Item -ItemType Directory -Path $AndroidSdkPath -Force | Out-Null
    Write-Info "Created installation directories"
}

# ============================================================================
# SYSTEM REQUIREMENTS CHECK
# ============================================================================
Write-Step "Checking System Requirements..."

# Windows Version Check
$windowsVersion = [System.Environment]::OSVersion.Version
$windowsBuild = (Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion" -Name ReleaseId -ErrorAction SilentlyContinue).ReleaseId
if ($windowsVersion.Major -ge 10) {
    Write-Success "Windows Version: $($windowsVersion.Major).$($windowsVersion.Minor) (Build: $windowsBuild)"
    Add-CheckResult "Windows" "PASS" "Compatible Windows version" "Version: $($windowsVersion.Major).$($windowsVersion.Minor)" "" "10+" "$($windowsVersion.Major).$($windowsVersion.Minor)"
} else {
    Write-Error "Windows Version: $($windowsVersion.Major).$($windowsVersion.Minor) - Windows 10+ required"
    Add-CheckResult "Windows" "FAIL" "Unsupported Windows version" "Version: $($windowsVersion.Major).$($windowsVersion.Minor)" "Upgrade to Windows 10 or later" "10+" "$($windowsVersion.Major).$($windowsVersion.Minor)"
}

# PowerShell Version Check
$psVersion = $PSVersionTable.PSVersion
if ($psVersion.Major -ge 5) {
    Write-Success "PowerShell Version: $($psVersion.Major).$($psVersion.Minor)"
    Add-CheckResult "PowerShell" "PASS" "Compatible PowerShell version" "Version: $($psVersion.Major).$($psVersion.Minor)" "" "5.0+" "$($psVersion.Major).$($psVersion.Minor)"
} else {
    Write-Error "PowerShell Version: $($psVersion.Major).$($psVersion.Minor) - PowerShell 5.0+ required"
    Add-CheckResult "PowerShell" "FAIL" "Unsupported PowerShell version" "Version: $($psVersion.Major).$($psVersion.Minor)" "Upgrade to PowerShell 5.0+" "5.0+" "$($psVersion.Major).$($psVersion.Minor)"
}

# RAM Check
$totalRAM = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 1)
if ($totalRAM -ge 8) {
    Write-Success "System RAM: ${totalRAM} GB"
    Add-CheckResult "RAM" "PASS" "Sufficient RAM" "${totalRAM} GB total" "" "8GB+" "${totalRAM} GB"
} elseif ($totalRAM -ge 4) {
    Write-Warning "System RAM: ${totalRAM} GB - Minimum met, 8GB+ recommended"
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

# ============================================================================
# NODE.JS AND NPM CHECK
# ============================================================================
Write-Step "Checking Node.js Environment (Required: Node.js 20.19.5, npm 10.8.2)..."

# Node.js Check
if (Test-CommandExists "node") {
    try {
        $nodeVersion = (& node --version).Trim()
        $nodeVersionClean = $nodeVersion -replace '^v', ''
        
        if ($nodeVersionClean -eq "20.19.5") {
            Write-Success "Node.js: $nodeVersion (Exact Match ✓)"
            Add-CheckResult "Node.js" "PASS" "Exact version match" "Version: $nodeVersion" "" "20.19.5" $nodeVersionClean
        } elseif ($nodeVersionClean -like "20.*") {
            Write-Warning "Node.js: $nodeVersion - v20.19.5 recommended for exact compatibility"
            Add-CheckResult "Node.js" "WARN" "Compatible but not exact version" "Version: $nodeVersion" "Consider upgrading to 20.19.5" "20.19.5" $nodeVersionClean
        } else {
            Write-Error "Node.js: $nodeVersion - Version 20.19.5 required"
            Add-CheckResult "Node.js" "FAIL" "Incompatible version" "Version: $nodeVersion" "Install Node.js 20.19.5" "20.19.5" $nodeVersionClean
            if ($AutoInstall) { Add-InstallItem "Node.js" "Install" "Install-NodeJS" "High" }
        }
    } catch {
        Write-Error "Node.js: Installed but not functioning"
        Add-CheckResult "Node.js" "FAIL" "Node.js not functioning" "Error: $($_.Exception.Message)" "Reinstall Node.js" "20.19.5" "Error"
        if ($AutoInstall) { Add-InstallItem "Node.js" "Reinstall" "Install-NodeJS" "High" }
    }
} else {
    Write-Error "Node.js: Not installed"
    Add-CheckResult "Node.js" "FAIL" "Node.js not found" "" "Install Node.js 20.19.5" "20.19.5" "Not installed"
    if ($AutoInstall) { Add-InstallItem "Node.js" "Install" "Install-NodeJS" "High" }
}

# npm Check
if (Test-CommandExists "npm") {
    try {
        $npmVersion = (& npm --version).Trim()
        if ($npmVersion -eq "10.8.2") {
            Write-Success "npm: v$npmVersion (Exact Match ✓)"
            Add-CheckResult "npm" "PASS" "Exact version match" "Version: v$npmVersion" "" "10.8.2" $npmVersion
        } elseif ($npmVersion -like "10.*") {
            Write-Warning "npm: v$npmVersion - v10.8.2 expected with Node 20.19.5"
            Add-CheckResult "npm" "WARN" "Different version" "Version: v$npmVersion" "Comes with Node.js installation" "10.8.2" $npmVersion
        } else {
            Write-Warning "npm: v$npmVersion - Different version than expected"
            Add-CheckResult "npm" "WARN" "Different version" "Version: v$npmVersion" "Should come with Node.js 20.19.5" "10.8.2" $npmVersion
        }
    } catch {
        Write-Error "npm: Not functioning properly"
        Add-CheckResult "npm" "FAIL" "npm not functioning" "Error: $($_.Exception.Message)" "Reinstall Node.js" "10.8.2" "Error"
    }
} else {
    Write-Error "npm: Not found"
    Add-CheckResult "npm" "FAIL" "npm not found" "" "Install Node.js (includes npm)" "10.8.2" "Not installed"
}

# Yarn Check
if (Test-CommandExists "yarn") {
    try {
        $yarnVersion = (& yarn --version).Trim()
        if ($yarnVersion -eq "1.22.22") {
            Write-Success "Yarn: v$yarnVersion (Exact Match ✓)"
            Add-CheckResult "Yarn" "PASS" "Exact version match" "Version: v$yarnVersion" "" "1.22.22" $yarnVersion
        } else {
            Write-Warning "Yarn: v$yarnVersion - v1.22.22 used in development"
            Add-CheckResult "Yarn" "WARN" "Different version" "Version: v$yarnVersion" "npm install -g yarn@1.22.22" "1.22.22" $yarnVersion
            if ($AutoInstall) { Add-InstallItem "Yarn" "Install" "Install-Yarn" "Normal" }
        }
    } catch {
        Write-Warning "Yarn: Not functioning properly"
        Add-CheckResult "Yarn" "WARN" "Yarn not functioning" "Error: $($_.Exception.Message)" "npm install -g yarn@1.22.22" "1.22.22" "Error"
        if ($AutoInstall) { Add-InstallItem "Yarn" "Install" "Install-Yarn" "Normal" }
    }
} else {
    Write-Warning "Yarn: Not installed (npm will be used as fallback)"
    Add-CheckResult "Yarn" "WARN" "Yarn not found" "Using npm instead" "npm install -g yarn@1.22.22 (optional)" "1.22.22" "Not installed"
    if ($AutoInstall) { Add-InstallItem "Yarn" "Install" "Install-Yarn" "Normal" }
}

Write-Host ""

# ============================================================================
# JAVA JDK CHECK
# ============================================================================
Write-Step "Checking Java JDK (Required: Java 17+)..."

if (Test-CommandExists "java") {
    try {
        $javaVersionOutput = (& java -version 2>&1)[0]
        
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
            if ($AutoInstall) { Add-InstallItem "Java JDK" "Upgrade" "Install-OpenJDK" "High" }
        } else {
            Write-Error "Java JDK: $javaVersionOutput - Java 17+ required"
            Add-CheckResult "Java JDK" "FAIL" "Outdated Java version" "Version: $javaVersionOutput" "Install Java 17" "17+" "$javaMajor"
            if ($AutoInstall) { Add-InstallItem "Java JDK" "Install" "Install-OpenJDK" "High" }
        }
    } catch {
        Write-Error "Java JDK: Not functioning properly"
        Add-CheckResult "Java JDK" "FAIL" "Java not functioning" "Error: $($_.Exception.Message)" "Install Java 17" "17+" "Error"
        if ($AutoInstall) { Add-InstallItem "Java JDK" "Install" "Install-OpenJDK" "High" }
    }
} else {
    Write-Error "Java JDK: Not installed"
    Add-CheckResult "Java JDK" "FAIL" "Java not found" "" "Install Java 17" "17+" "Not installed"
    if ($AutoInstall) { Add-InstallItem "Java JDK" "Install" "Install-OpenJDK" "High" }
}

Write-Host ""

# ============================================================================
# ENVIRONMENT VARIABLES CHECK
# ============================================================================
Write-Step "Checking Environment Variables..."

# JAVA_HOME Check
$javaHome = [System.Environment]::GetEnvironmentVariable("JAVA_HOME", "Machine")
if ($javaHome -and (Test-Path $javaHome)) {
    Write-Success "JAVA_HOME: $javaHome"
    Add-CheckResult "JAVA_HOME" "PASS" "JAVA_HOME properly set" "Path: $javaHome" "" "Set" "Set"
} else {
    Write-Error "JAVA_HOME: Not set or invalid path"
    Add-CheckResult "JAVA_HOME" "FAIL" "JAVA_HOME not set" "Current: $javaHome" "Set JAVA_HOME to JDK path" "Set" "Not set"
}

# ANDROID_HOME/ANDROID_SDK_ROOT Check
Write-Step "Detecting Android SDK installation..."

# Get the user's Android SDK path - try multiple sources
$androidSdkPath = $null

# Priority order for SDK path detection
$possibleSdkPaths = @(
    $env:ANDROID_HOME,
    $env:ANDROID_SDK_ROOT,
    [System.Environment]::GetEnvironmentVariable("ANDROID_HOME", "User"),
    [System.Environment]::GetEnvironmentVariable("ANDROID_SDK_ROOT", "User"),
    [System.Environment]::GetEnvironmentVariable("ANDROID_HOME", "Machine"),
    [System.Environment]::GetEnvironmentVariable("ANDROID_SDK_ROOT", "Machine"),
    "$env:LOCALAPPDATA\Android\Sdk",
    "$env:USERPROFILE\AppData\Local\Android\Sdk",
    "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk",
    "$env:PROGRAMFILES\Android\Sdk",
    "${env:ProgramFiles(x86)}\Android\Sdk",
    "$InstallPath\Android\Sdk",
    "$AndroidSdkPath"
)

# Find the first valid SDK path
foreach ($path in $possibleSdkPaths) {
    if ($path -and (Test-Path $path -PathType Container)) {
        # Additional validation - check if it contains key SDK directories
        $platformsDir = Join-Path $path "platforms"
        $buildToolsDir = Join-Path $path "build-tools"
        
        if ((Test-Path $platformsDir) -or (Test-Path $buildToolsDir)) {
            $androidSdkPath = $path
            Write-Success "Android SDK found at: $androidSdkPath"
            break
        }
    }
}

if ($androidSdkPath) {
    # Normalize the path
    $androidSdkPath = (Resolve-Path $androidSdkPath).Path
    
    # Set environment variables if they're not already set correctly
    if (-not $env:ANDROID_HOME -or $env:ANDROID_HOME -ne $androidSdkPath) {
        Add-EnvironmentVariable "ANDROID_HOME" $androidSdkPath
        $env:ANDROID_HOME = $androidSdkPath
        Write-Success "Set ANDROID_HOME to: $androidSdkPath"
    }
    if (-not $env:ANDROID_SDK_ROOT -or $env:ANDROID_SDK_ROOT -ne $androidSdkPath) {
        Add-EnvironmentVariable "ANDROID_SDK_ROOT" $androidSdkPath
        $env:ANDROID_SDK_ROOT = $androidSdkPath
        Write-Success "Set ANDROID_SDK_ROOT to: $androidSdkPath"
    }
    
    Add-CheckResult "Android SDK" "PASS" "Android SDK found and configured" "Path: $androidSdkPath" "" "Set" "Set"
    
    # Add SDK tools to PATH if not already there
    $sdkToolsPaths = @(
        "$androidSdkPath\platform-tools",
        "$androidSdkPath\tools",
        "$androidSdkPath\tools\bin",
        "$androidSdkPath\cmdline-tools\latest\bin"
    )
    
    $currentPath = [System.Environment]::GetEnvironmentVariable("PATH", "Machine")
    $pathUpdated = $false
    
    foreach ($toolPath in $sdkToolsPaths) {
        if ((Test-Path $toolPath) -and ($currentPath -notlike "*$toolPath*")) {
            $currentPath += ";$toolPath"
            $pathUpdated = $true
        }
    }
    
    if ($pathUpdated) {
        Add-EnvironmentVariable "PATH" $currentPath
        $env:PATH = $currentPath
        Write-Success "Android SDK tools added to PATH"
    }
} else {
    Write-Error "Android SDK: Not found in any common locations"
    Write-Info "Searched locations:"
    foreach ($path in $possibleSdkPaths) {
        if ($path) {
            Write-Info "  - $path"
        }
    }
    Add-CheckResult "Android SDK" "FAIL" "Android SDK not found" "Searched multiple locations" "Install Android SDK via Android Studio" "Set" "Not found"
    if ($AutoInstall) { Add-InstallItem "Android SDK" "Install" "Install-AndroidSDK" "High" }
}

Write-Host ""

# ============================================================================
# ANDROID SDK COMPONENTS CHECK
# ============================================================================
Write-Step "Checking Android SDK Components (SDK 34, Build Tools 34.0.0, NDK 25.1.8937393)..."

if ($androidSdkPath -and (Test-Path $androidSdkPath)) {
    Write-Success "Found Android SDK at: $androidSdkPath"
    
    # Platform Tools Check
    $platformTools = Join-Path $androidSdkPath "platform-tools"
    if (Test-Path $platformTools) {
        Write-Success "Platform Tools: Found"
        Add-CheckResult "Platform Tools" "PASS" "Platform tools available" "Path: $platformTools" "" "Required" "Installed"
    } else {
        Write-Error "Platform Tools: Not found"
        Add-CheckResult "Platform Tools" "FAIL" "Platform tools missing" "Expected: $platformTools" "Install via Android Studio SDK Manager" "Required" "Missing"
    }
    
    # Android API 34 Check (with fallback to other versions)
    $platforms = Join-Path $androidSdkPath "platforms"
    $api34Path = Join-Path $platforms "android-34"
    if (Test-Path $api34Path) {
        Write-Success "Android API 34: Found"
        Add-CheckResult "Android API 34" "PASS" "Target SDK available" "Platform: android-34" "" "API 34" "API 34"
    } else {
        # Check for any available platforms
        $availablePlatforms = if (Test-Path $platforms) { 
            (Get-ChildItem $platforms -Directory -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name | Sort-Object -Descending) -join ', '
        } else { "None" }
        
        if ($availablePlatforms -ne "None") {
            # Check if we have a compatible API level
            $compatiblePlatforms = Get-ChildItem $platforms -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -match "android-(\d+)" } | ForEach-Object {
                if ([int]$matches[1] -ge 30) { $_.Name }
            }
            
            if ($compatiblePlatforms) {
                Write-Warning "Android API 34: Not found, but compatible versions available: $($compatiblePlatforms -join ', ')"
                Add-CheckResult "Android API 34" "WARN" "Compatible API available" "Available: $availablePlatforms" "Install API 34 via Android Studio SDK Manager for exact match" "API 34" "Compatible versions found"
            } else {
                Write-Error "Android API 34: Not found (Available: $availablePlatforms)"
                Add-CheckResult "Android API 34" "FAIL" "Target SDK missing" "Available: $availablePlatforms" "Install API 34 via Android Studio SDK Manager" "API 34" "Missing"
            }
        } else {
            Write-Error "Android API 34: Not found (Available: None)"
            Add-CheckResult "Android API 34" "FAIL" "No platforms found" "Platforms directory: $platforms" "Install Android SDK platforms via Android Studio" "API 34" "Missing"
        }
    }
    
    # Build Tools Check (with version flexibility)
    $buildTools = Join-Path $androidSdkPath "build-tools"
    $buildTools34 = Join-Path $buildTools "34.0.0"
    if (Test-Path $buildTools34) {
        Write-Success "Build Tools 34.0.0: Found"
        Add-CheckResult "Build Tools 34.0.0" "PASS" "Required build tools available" "Version: 34.0.0" "" "34.0.0" "34.0.0"
    } else {
        # Check for any available build tools
        $availableBuildTools = if (Test-Path $buildTools) {
            (Get-ChildItem $buildTools -Directory -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name | Sort-Object {[version]$_} -Descending) -join ', '
        } else { "None" }
        
        if ($availableBuildTools -ne "None") {
            # Check for compatible versions (30.0.0+)
            $compatibleBuildTools = Get-ChildItem $buildTools -Directory -ErrorAction SilentlyContinue | Where-Object { 
                $_.Name -match "(\d+)\.(\d+)\.(\d+)" -and [int]$matches[1] -ge 30
            } | Sort-Object {[version]$_.Name} -Descending | Select-Object -First 1
            
            if ($compatibleBuildTools) {
                Write-Warning "Build Tools 34.0.0: Not found, but compatible version available: $($compatibleBuildTools.Name)"
                Add-CheckResult "Build Tools 34.0.0" "WARN" "Compatible build tools available" "Available: $availableBuildTools" "Install 34.0.0 via Android Studio SDK Manager for exact match" "34.0.0" "Compatible: $($compatibleBuildTools.Name)"
            } else {
                Write-Error "Build Tools 34.0.0: Not found (Available: $availableBuildTools)"
                Add-CheckResult "Build Tools 34.0.0" "FAIL" "Required build tools missing" "Available: $availableBuildTools" "Install Build Tools 34.0.0 via Android Studio SDK Manager" "34.0.0" "Incompatible versions"
            }
        } else {
            Write-Error "Build Tools 34.0.0: Not found (Available: None)"
            Add-CheckResult "Build Tools 34.0.0" "FAIL" "No build tools found" "Build tools directory: $buildTools" "Install Android Build Tools via Android Studio" "34.0.0" "Missing"
        }
    }
    
    # NDK Check (with version flexibility)
    $ndk = Join-Path $androidSdkPath "ndk"
    $ndk25 = Join-Path $ndk "25.1.8937393"
    if (Test-Path $ndk25) {
        Write-Success "NDK 25.1.8937393: Found"
        Add-CheckResult "NDK 25.1.8937393" "PASS" "Required NDK available" "Version: 25.1.8937393" "" "25.1.8937393" "25.1.8937393"
    } else {
        # Check for any available NDK versions
        $availableNdks = if (Test-Path $ndk) {
            (Get-ChildItem $ndk -Directory -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name | Sort-Object -Descending) -join ', '
        } else { "None" }
        
        if ($availableNdks -ne "None") {
            # Check for compatible NDK versions (24.0+)
            $compatibleNdks = Get-ChildItem $ndk -Directory -ErrorAction SilentlyContinue | Where-Object { 
                $_.Name -match "(\d+)\.(\d+)" -and [int]$matches[1] -ge 24
            } | Sort-Object {[version]($_.Name -replace '\.(\d+)$', '.$1')} -Descending | Select-Object -First 1
            
            if ($compatibleNdks) {
                Write-Warning "NDK 25.1.8937393: Not found, but compatible version available: $($compatibleNdks.Name)"
                Add-CheckResult "NDK 25.1.8937393" "WARN" "Compatible NDK available" "Available: $availableNdks" "Install NDK 25.1.8937393 via Android Studio SDK Manager for exact match" "25.1.8937393" "Compatible: $($compatibleNdks.Name)"
            } else {
                Write-Warning "NDK 25.1.8937393: Not found (Available: $availableNdks)"
                Add-CheckResult "NDK 25.1.8937393" "WARN" "NDK versions available but may be incompatible" "Available: $availableNdks" "Install NDK 25.1.8937393 via Android Studio SDK Manager" "25.1.8937393" "Different versions"
            }
        } else {
            Write-Info "NDK 25.1.8937393: Not found (NDK is optional for most React Native projects)"
            Add-CheckResult "NDK 25.1.8937393" "INFO" "NDK not found (optional)" "NDK directory: $ndk" "Install NDK via Android Studio SDK Manager if needed" "25.1.8937393 (optional)" "Not installed"
        }
    }
} else {
    Write-Error "Android SDK components check skipped - SDK not found"
}

# ADB Check
if (Test-CommandExists "adb") {
    try {
        $adbVersion = (& adb version 2>$null)[0]
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

# ============================================================================
# ADDITIONAL TOOLS CHECK
# ============================================================================
Write-Step "Checking Additional Tools..."

# Git Check
if (Test-CommandExists "git") {
    try {
        $gitVersion = & git --version
        Write-Success "Git: $gitVersion"
        Add-CheckResult "Git" "PASS" "Git available" "Version: $gitVersion" "" "Any version" "Available"
    } catch {
        Write-Warning "Git: Not functioning properly"
        Add-CheckResult "Git" "WARN" "Git not functioning" "Error: $($_.Exception.Message)" "Reinstall Git" "Any version" "Error"
        if ($AutoInstall) { Add-InstallItem "Git" "Install" "Install-Git" "Normal" }
    }
} else {
    Write-Warning "Git: Not installed (needed for cloning repositories)"
    Add-CheckResult "Git" "WARN" "Git not found" "" "Install Git from git-scm.com" "Any version" "Not installed"
    if ($AutoInstall) { Add-InstallItem "Git" "Install" "Install-Git" "Normal" }
}

# Expo CLI Check
if (Test-CommandExists "expo") {
    try {
        $expoVersion = & expo --version
        Write-Success "Expo CLI: v$expoVersion"
        Add-CheckResult "Expo CLI" "PASS" "Expo CLI available" "Version: v$expoVersion" "" "Latest" $expoVersion
    } catch {
        Write-Warning "Expo CLI: Not functioning properly"
        Add-CheckResult "Expo CLI" "WARN" "Expo CLI not functioning" "Error: $($_.Exception.Message)" "npm install -g @expo/cli" "Latest" "Error"
        if ($AutoInstall) { Add-InstallItem "Expo Tools" "Install" "Install-ExpoTools" "Normal" }
    }
} else {
    Write-Warning "Expo CLI: Not installed"
    Add-CheckResult "Expo CLI" "WARN" "Expo CLI not found" "" "npm install -g @expo/cli (will be installed with project)" "Latest" "Not installed"
    if ($AutoInstall) { Add-InstallItem "Expo Tools" "Install" "Install-ExpoTools" "Normal" }
}

Write-Host ""

# ============================================================================
# AUTO-INSTALLATION PROCESS
# ============================================================================
if ($AutoInstall -and $Global:InstallQueue.Count -gt 0) {
    Write-Host "🔧 AUTO-INSTALLATION PROCESS" -ForegroundColor Magenta -BackgroundColor Black
    Write-Host "============================" -ForegroundColor Magenta -BackgroundColor Black
    Write-Host ""
    
    # Sort installation queue by priority
    $sortedQueue = $Global:InstallQueue | Sort-Object @{Expression={
        switch($_.Priority) {
            "High" { 1 }
            "Normal" { 2 }
            default { 3 }
        }
    }}
    
    # Install Chocolatey first if needed
    $needsChoco = $false
    foreach ($item in $sortedQueue) {
        if ($item.Component -in @("Node.js", "Java JDK", "Git") -and -not (Test-CommandExists "choco")) {
            $needsChoco = $true
            break
        }
    }
    
    if ($needsChoco) {
        Write-Step "Installing Chocolatey for easier package management..."
        if (Install-Chocolatey) {
            Write-Success "Chocolatey installed successfully"
        } else {
            Write-Warning "Chocolatey installation failed, continuing with manual installations"
        }
        Write-Host ""
    }
    
    # Process installation queue
    foreach ($item in $sortedQueue) {
        Write-Install "Installing $($item.Component)..."
        try {
            $installFunction = Get-Command $item.InstallFunction -ErrorAction Stop
            $success = & $installFunction
            
            if ($success -and -not $SkipVerification) {
                Write-Install "Verifying $($item.Component) installation..."
                Start-Sleep -Seconds 3
                Refresh-EnvironmentVariables
                
                # Component-specific verification
                switch ($item.Component) {
                    "Node.js" {
                        if (Test-CommandExists "node") {
                            $nodeVersion = & node --version
                            Write-Success "Verification: Node.js $nodeVersion installed"
                        } else {
                            Write-Warning "Node.js installed but not immediately available (restart may be required)"
                        }
                    }
                    "Java JDK" {
                        if (Test-CommandExists "java") {
                            $javaVersion = (& java -version 2>&1)[0]
                            Write-Success "Verification: Java installed - $javaVersion"
                        } else {
                            Write-Warning "Java installed but not immediately available (restart may be required)"
                        }
                    }
                    "Android SDK" {
                        if (Test-CommandExists "adb") {
                            $adbVersion = (& adb version 2>$null)[0]
                            Write-Success "Verification: Android SDK installed - $adbVersion"
                        } else {
                            Write-Warning "Android SDK installed but ADB not immediately available (restart may be required)"
                        }
                    }
                    "Git" {
                        if (Test-CommandExists "git") {
                            $gitVersion = & git --version
                            Write-Success "Verification: Git installed - $gitVersion"
                        } else {
                            Write-Warning "Git installed but not immediately available (restart may be required)"
                        }
                    }
                    "Yarn" {
                        if (Test-CommandExists "yarn") {
                            $yarnVersion = & yarn --version
                            Write-Success "Verification: Yarn v$yarnVersion installed"
                        } else {
                            Write-Warning "Yarn installation may require restart"
                        }
                    }
                    "Expo Tools" {
                        if (Test-CommandExists "expo") {
                            $expoVersion = & expo --version
                            Write-Success "Verification: Expo CLI v$expoVersion installed"
                        } else {
                            Write-Warning "Expo CLI installation may require restart"
                        }
                    }
                }
            }
        } catch {
            Write-Error "Failed to install $($item.Component): $($_.Exception.Message)"
        }
        Write-Host ""
    }
    
    if ($Global:EnvironmentUpdates.Count -gt 0) {
        Write-Host "⚠️  IMPORTANT: Environment variables have been updated!" -ForegroundColor Yellow -BackgroundColor Black
        Write-Host "   You may need to restart your command prompt or system for all changes to take effect!" -ForegroundColor Yellow
        Write-Host ""
        Write-Info "Environment variable changes made:"
        foreach ($update in $Global:EnvironmentUpdates) {
            Write-Host "   • $update" -ForegroundColor Gray
        }
        Write-Host ""
    }
}

# ============================================================================
# FINAL SUMMARY AND INSTRUCTIONS
# ============================================================================
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
    Write-Host "🏗️  Android Studio Integration:" -ForegroundColor White
    Write-Host "Since you have Android Studio installed, you can easily install missing components:" -ForegroundColor Gray
    Write-Host "1. Open Android Studio" -ForegroundColor Gray
    Write-Host "2. Go to Tools → SDK Manager" -ForegroundColor Gray
    Write-Host "3. In SDK Platforms tab: Install 'Android API 34'" -ForegroundColor Gray
    Write-Host "4. In SDK Tools tab: Install 'Android SDK Platform-Tools', 'Android SDK Build-Tools 34.0.0', and 'NDK 25.1.8937393'" -ForegroundColor Gray
    Write-Host "5. Apply changes and wait for installation" -ForegroundColor Gray
    Write-Host "6. Restart this script to verify installation" -ForegroundColor Gray
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
    Write-Host ".\scripts\windows-complete-apk-builder-setup.ps1 -AutoInstall -Detailed" -ForegroundColor Gray
}

# ============================================================================
# EXPORT DETAILED REPORT
# ============================================================================
if ($ExportReport) {
    Write-Host ""
    Write-Host "📄 Exporting detailed report..." -ForegroundColor Blue
    
    $reportContent = @"
MHT Assessment - Complete Windows APK Builder Setup Report
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Script Version: 3.0 Enhanced
===========================================================

EXACT VERSION REQUIREMENTS (from Emergent environment):
- Node.js: 20.19.5
- npm: 10.8.2
- yarn: 1.22.22
- Java JDK: 17+ (OpenJDK 17 recommended)
- Android SDK: API 34
- Build Tools: 34.0.0
- NDK: 25.1.8937393
- Gradle: 8.3+
- Target SDK: 34
- Min SDK: 23
- Compile SDK: 34

SYSTEM INFORMATION:
- Windows: $($windowsVersion.Major).$($windowsVersion.Minor) (Build: $windowsBuild)
- PowerShell: $($psVersion.Major).$($psVersion.Minor)
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


OVERALL STATUS: $(if ($Global:OverallStatus -or $failCount -eq 0) { "READY FOR APK BUILD" } else { "NEEDS ATTENTION" })
SUMMARY: $passCount passed, $warnCount warnings, $failCount failed

ENVIRONMENT VARIABLE UPDATES MADE:
=================================
"@

    if ($Global:EnvironmentUpdates.Count -gt 0) {
        foreach ($update in $Global:EnvironmentUpdates) {
            $reportContent += "$update`n"
        }
    } else {
        $reportContent += "No environment variable updates were made during this run.`n"
    }

    $reportContent += @"

INSTALLATION COMMANDS (manual installation if needed):
====================================================
# Install Chocolatey (run as Administrator):
Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install all components via Chocolatey:
choco install nodejs --version=20.19.5 -y
choco install openjdk17 -y
choco install git -y

# Install Yarn and Expo CLI:
npm install -g yarn@1.22.22
npm install -g @expo/cli@latest
npm install -g eas-cli@latest

# Android SDK Setup (manual):
# 1. Download from: https://developer.android.com/studio/command-line-tools
# 2. Extract to: $AndroidSdkPath\cmdline-tools\latest\
# 3. Set ANDROID_HOME=$AndroidSdkPath
# 4. Run: sdkmanager --licenses
# 5. Run: sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" "ndk;25.1.8937393"

APK BUILD COMMANDS:
==================
git clone <repository-url>
cd mht-assessment
npm install  # or yarn install
npm run bundle:android
cd android
./gradlew assembleDebug

APK Output Location: android/app/build/outputs/apk/debug/app-debug.apk

TROUBLESHOOTING:
===============
- If commands are not recognized after installation, restart your command prompt or system
- For permission errors, run PowerShell as Administrator
- For build errors, ensure all environment variables are set correctly
- For ADB not found errors, ensure platform-tools is in your PATH
- For Java errors, ensure JAVA_HOME points to correct JDK 17+ installation

SUPPORT:
========
If you encounter issues:
1. Run this script again with -Detailed flag for more information
2. Check that all environment variables are properly set
3. Restart your system if components were installed but not recognized
4. Ensure Windows Defender/antivirus is not blocking installations
"@

    $reportContent | Out-File -FilePath $ReportPath -Encoding UTF8
    Write-Success "Report exported to: $ReportPath"
}

Write-Host ""
Write-Host "Script completed at $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Gray
Write-Host "Usage examples:" -ForegroundColor Gray
Write-Host "  .\scripts\windows-complete-apk-builder-setup.ps1 -AutoInstall" -ForegroundColor Gray
Write-Host "  .\scripts\windows-complete-apk-builder-setup.ps1 -Detailed -ExportReport" -ForegroundColor Gray
Write-Host "  .\scripts\windows-complete-apk-builder-setup.ps1 -AutoInstall -Force" -ForegroundColor Gray
Write-Host ""
Write-Success "MHT Assessment APK Builder Setup Script Complete!"