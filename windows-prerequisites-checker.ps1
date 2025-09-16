# 🔍 MHT Assessment - Windows Prerequisites Checker
# This script verifies all required dependencies before APK building

param(
    [switch]$Install,
    [switch]$Detailed,
    [switch]$Fix
)

# Colors for output
$Red = "Red"
$Green = "Green" 
$Yellow = "Yellow"
$Blue = "Cyan"
$White = "White"

# Global status tracking
$Global:AllChecksPassed = $true
$Global:IssuesFound = @()
$Global:InstallCommands = @()

function Write-Header {
    param([string]$Title)
    Write-Host "`n" -NoNewline
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor $Blue
    Write-Host "║" -ForegroundColor $Blue -NoNewline
    Write-Host (" {0,-60} " -f $Title) -ForegroundColor $White -NoNewline
    Write-Host "║" -ForegroundColor $Blue
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor $Blue
}

function Write-Step {
    param([string]$Message)
    Write-Host "`n🔍 $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor $Yellow
    $Global:IssuesFound += "WARNING: $Message"
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $Red
    $Global:AllChecksPassed = $false
    $Global:IssuesFound += "ERROR: $Message"
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor $Blue
}

function Test-CommandExists {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

function Test-EnvironmentVariable {
    param([string]$VarName)
    $value = [Environment]::GetEnvironmentVariable($VarName, "Machine")
    if (-not $value) {
        $value = [Environment]::GetEnvironmentVariable($VarName, "User")
    }
    return $value
}

function Test-DirectoryExists {
    param([string]$Path)
    return Test-Path $Path -PathType Container
}

function Test-FileExists {
    param([string]$Path)
    return Test-Path $Path -PathType Leaf
}

function Get-InstalledProgram {
    param([string]$ProgramName)
    
    $programs = @()
    
    # Check 64-bit registry
    try {
        $programs += Get-ItemProperty HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\* | 
                     Where-Object DisplayName -like "*$ProgramName*"
    } catch {}
    
    # Check 32-bit registry
    try {
        $programs += Get-ItemProperty HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* | 
                     Where-Object DisplayName -like "*$ProgramName*"
    } catch {}
    
    return $programs
}

function Check-NodeJS {
    Write-Step "Checking Node.js installation..."
    
    if (Test-CommandExists "node") {
        try {
            $nodeVersion = node --version
            $versionNumber = $nodeVersion -replace 'v', ''
            $majorVersion = [int]($versionNumber.Split('.')[0])
            
            if ($majorVersion -ge 18) {
                Write-Success "Node.js $nodeVersion installed (Required: 18+)"
                
                if (Test-CommandExists "npm") {
                    $npmVersion = npm --version
                    Write-Success "npm $npmVersion installed"
                } else {
                    Write-Error "npm not found (should come with Node.js)"
                    $Global:InstallCommands += "Reinstall Node.js from https://nodejs.org/"
                }
            } else {
                Write-Error "Node.js $nodeVersion is too old (Required: 18+)"
                $Global:InstallCommands += "choco upgrade nodejs"
            }
        }
        catch {
            Write-Error "Node.js found but version check failed"
            $Global:InstallCommands += "choco reinstall nodejs"
        }
    }
    else {
        Write-Error "Node.js not found"
        $Global:InstallCommands += "choco install nodejs --version=18.19.0"
        
        # Check if Chocolatey is available for easy installation
        if (-not (Test-CommandExists "choco")) {
            Write-Warning "Chocolatey not found - manual installation required"
            Write-Info "Install from: https://nodejs.org/"
        }
    }
}

function Check-Java {
    Write-Step "Checking Java JDK installation..."
    
    if (Test-CommandExists "java") {
        try {
            $javaOutput = java -version 2>&1
            $javaVersion = $javaOutput[0]
            
            if ($javaVersion -match '"(\d+)\.') {
                $majorVersion = [int]$matches[1]
            } elseif ($javaVersion -match '"(\d+)') {
                $majorVersion = [int]$matches[1]
            } else {
                $majorVersion = 0
            }
            
            if ($majorVersion -ge 17) {
                Write-Success "Java $majorVersion installed (Required: 17+)"
                
                # Check JAVA_HOME
                $javaHome = Test-EnvironmentVariable "JAVA_HOME"
                if ($javaHome) {
                    if (Test-DirectoryExists $javaHome) {
                        Write-Success "JAVA_HOME set to: $javaHome"
                        if (Test-FileExists "$javaHome\bin\java.exe") {
                            Write-Success "JAVA_HOME/bin/java.exe exists"
                        } else {
                            Write-Error "JAVA_HOME/bin/java.exe not found"
                        }
                    } else {
                        Write-Error "JAVA_HOME points to non-existent directory: $javaHome"
                    }
                } else {
                    Write-Error "JAVA_HOME environment variable not set"
                    $Global:InstallCommands += "Set JAVA_HOME environment variable"
                }
            } else {
                Write-Error "Java $majorVersion is too old (Required: 17+)"
                $Global:InstallCommands += "choco install openjdk17"
            }
        }
        catch {
            Write-Error "Java found but version check failed"
            $Global:InstallCommands += "choco reinstall openjdk17"
        }
    }
    else {
        Write-Error "Java not found"
        $Global:InstallCommands += "choco install openjdk17"
        
        # Look for Java installations
        $javaPrograms = Get-InstalledProgram "Java"
        if ($javaPrograms) {
            Write-Warning "Found Java installations but java command not in PATH:"
            foreach ($program in $javaPrograms) {
                Write-Info "  - $($program.DisplayName) $($program.DisplayVersion)"
            }
        }
    }
}

function Check-Git {
    Write-Step "Checking Git installation..."
    
    if (Test-CommandExists "git") {
        try {
            $gitVersion = git --version
            Write-Success "Git installed: $gitVersion"
            
            # Check git config
            try {
                $gitUser = git config --global user.name 2>$null
                $gitEmail = git config --global user.email 2>$null
                
                if ($gitUser -and $gitEmail) {
                    Write-Success "Git configured - User: $gitUser <$gitEmail>"
                } else {
                    Write-Warning "Git not configured with user name/email"
                    Write-Info "Run: git config --global user.name 'Your Name'"
                    Write-Info "Run: git config --global user.email 'your.email@example.com'"
                }
            }
            catch {
                Write-Warning "Could not check git configuration"
            }
        }
        catch {
            Write-Error "Git found but version check failed"
        }
    }
    else {
        Write-Error "Git not found"
        $Global:InstallCommands += "choco install git"
    }
}

function Check-AndroidSDK {
    Write-Step "Checking Android SDK installation..."
    
    $androidHome = Test-EnvironmentVariable "ANDROID_HOME"
    if (-not $androidHome) {
        $androidHome = Test-EnvironmentVariable "ANDROID_SDK_ROOT"
    }
    
    if ($androidHome) {
        Write-Success "ANDROID_HOME set to: $androidHome"
        
        if (Test-DirectoryExists $androidHome) {
            Write-Success "Android SDK directory exists"
            
            # Check for essential directories
            $cmdlineTools = "$androidHome\cmdline-tools\latest"
            $platformTools = "$androidHome\platform-tools"
            $platforms = "$androidHome\platforms"
            $buildTools = "$androidHome\build-tools"
            
            if (Test-DirectoryExists $cmdlineTools) {
                Write-Success "Command line tools found"
                
                # Check sdkmanager
                $sdkmanager = "$cmdlineTools\bin\sdkmanager.bat"
                if (Test-FileExists $sdkmanager) {
                    Write-Success "sdkmanager found"
                    
                    try {
                        # Check installed packages
                        $installedPackages = & $sdkmanager --list_installed 2>$null
                        if ($installedPackages -match "platforms;android-34") {
                            Write-Success "Android API 34 installed"
                        } else {
                            Write-Error "Android API 34 not installed"
                            $Global:InstallCommands += "sdkmanager 'platforms;android-34'"
                        }
                        
                        if ($installedPackages -match "build-tools;34.0.0") {
                            Write-Success "Build Tools 34.0.0 installed"
                        } else {
                            Write-Error "Build Tools 34.0.0 not installed"
                            $Global:InstallCommands += "sdkmanager 'build-tools;34.0.0'"
                        }
                        
                        if ($installedPackages -match "platform-tools") {
                            Write-Success "Platform Tools installed"
                        } else {
                            Write-Error "Platform Tools not installed"
                            $Global:InstallCommands += "sdkmanager 'platform-tools'"
                        }
                        
                        if ($installedPackages -match "ndk;25.1.8937393") {
                            Write-Success "Android NDK 25.1.8937393 installed"
                        } else {
                            Write-Warning "Android NDK 25.1.8937393 not installed (may be needed)"
                            $Global:InstallCommands += "sdkmanager 'ndk;25.1.8937393'"
                        }
                    }
                    catch {
                        Write-Warning "Could not check installed SDK packages"
                    }
                } else {
                    Write-Error "sdkmanager not found at expected location"
                }
            } else {
                Write-Error "Command line tools not found at: $cmdlineTools"
                $Global:InstallCommands += "Download Android SDK Command Line Tools"
            }
            
            if (Test-DirectoryExists $platformTools) {
                Write-Success "Platform tools directory found"
                
                # Check adb
                $adb = "$platformTools\adb.exe"
                if (Test-FileExists $adb) {
                    Write-Success "adb found"
                    
                    try {
                        $adbVersion = & $adb version
                        Write-Success "adb working: $($adbVersion[0])"
                    }
                    catch {
                        Write-Warning "adb found but not working properly"
                    }
                } else {
                    Write-Error "adb not found"
                }
            } else {
                Write-Warning "Platform tools directory not found"
            }
            
        } else {
            Write-Error "ANDROID_HOME points to non-existent directory: $androidHome"
            $Global:InstallCommands += "Download and extract Android SDK to correct location"
        }
    } else {
        Write-Error "ANDROID_HOME environment variable not set"
        $Global:InstallCommands += "Set ANDROID_HOME environment variable"
        $Global:InstallCommands += "Download Android SDK Command Line Tools"
    }
}

function Check-PATH {
    Write-Step "Checking PATH environment variable..."
    
    $path = $env:PATH
    $pathEntries = $path -split ';'
    
    # Check for required PATH entries
    $javaHome = Test-EnvironmentVariable "JAVA_HOME"
    $androidHome = Test-EnvironmentVariable "ANDROID_HOME"
    
    if ($javaHome) {
        $javaBinPath = "$javaHome\bin"
        if ($pathEntries -contains $javaBinPath) {
            Write-Success "Java bin directory in PATH"
        } else {
            Write-Error "Java bin directory not in PATH: $javaBinPath"
            $Global:InstallCommands += "Add $javaBinPath to PATH"
        }
    }
    
    if ($androidHome) {
        $androidPaths = @(
            "$androidHome\cmdline-tools\latest\bin",
            "$androidHome\platform-tools"
        )
        
        foreach ($androidPath in $androidPaths) {
            if ($pathEntries -contains $androidPath) {
                Write-Success "Android path in PATH: $androidPath"
            } else {
                Write-Error "Android path not in PATH: $androidPath"
                $Global:InstallCommands += "Add $androidPath to PATH"
            }
        }
    }
    
    # Check for common issues
    $nodeModulesGlobal = "$env:APPDATA\npm"
    if (Test-DirectoryExists $nodeModulesGlobal) {
        if ($pathEntries -contains $nodeModulesGlobal) {
            Write-Success "npm global packages path in PATH"
        } else {
            Write-Warning "npm global packages path not in PATH (may cause issues)"
        }
    }
}

function Check-Permissions {
    Write-Step "Checking permissions and access..."
    
    # Check if running as administrator
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
    
    if ($isAdmin) {
        Write-Success "Running with Administrator privileges"
    } else {
        Write-Warning "Not running as Administrator (may be needed for installations)"
        Write-Info "Right-click PowerShell and 'Run as Administrator' if needed"
    }
    
    # Check Windows version
    $osVersion = [Environment]::OSVersion.Version
    if ($osVersion.Major -ge 10) {
        Write-Success "Windows version: $($osVersion.Major).$($osVersion.Minor) (Compatible)"
    } else {
        Write-Warning "Windows version: $($osVersion.Major).$($osVersion.Minor) (May have compatibility issues)"
    }
    
    # Check available disk space
    try {
        $systemDrive = Get-WmiObject -Class Win32_LogicalDisk | Where-Object DeviceID -eq "C:"
        $freeSpaceGB = [math]::Round($systemDrive.FreeSpace / 1GB, 2)
        
        if ($freeSpaceGB -gt 10) {
            Write-Success "Available disk space: ${freeSpaceGB}GB (Sufficient)"
        } else {
            Write-Warning "Available disk space: ${freeSpaceGB}GB (May be insufficient)"
        }
    }
    catch {
        Write-Warning "Could not check disk space"
    }
}

function Check-InternetConnectivity {
    Write-Step "Checking internet connectivity..."
    
    $testUrls = @(
        "github.com",
        "nodejs.org", 
        "registry.npmjs.org"
    )
    
    $connectedCount = 0
    foreach ($url in $testUrls) {
        try {
            $result = Test-NetConnection -ComputerName $url -Port 443 -InformationLevel Quiet -WarningAction SilentlyContinue
            if ($result) {
                Write-Success "Can reach $url"
                $connectedCount++
            } else {
                Write-Warning "Cannot reach $url"
            }
        }
        catch {
            Write-Warning "Cannot test connection to $url"
        }
    }
    
    if ($connectedCount -eq $testUrls.Count) {
        Write-Success "Internet connectivity: All services reachable"
    } elseif ($connectedCount -gt 0) {
        Write-Warning "Internet connectivity: Partial (may cause issues)"
    } else {
        Write-Error "Internet connectivity: No services reachable"
    }
}

function Show-InstallationCommands {
    if ($Global:InstallCommands.Count -gt 0) {
        Write-Header "REQUIRED INSTALLATION COMMANDS"
        
        Write-Host "`n📋 Run these commands to fix issues:" -ForegroundColor $Yellow
        Write-Host "=" * 60 -ForegroundColor $Yellow
        
        # Group by type
        $chocoCommands = $Global:InstallCommands | Where-Object { $_ -like "choco *" }
        $sdkCommands = $Global:InstallCommands | Where-Object { $_ -like "sdkmanager *" }
        $envCommands = $Global:InstallCommands | Where-Object { $_ -like "*environment*" -or $_ -like "*PATH*" -or $_ -like "Set *" -or $_ -like "Add *" }
        $manualCommands = $Global:InstallCommands | Where-Object { $_ -notlike "choco *" -and $_ -notlike "sdkmanager *" -and $_ -notlike "*environment*" -and $_ -notlike "*PATH*" -and $_ -notlike "Set *" -and $_ -notlike "Add *" }
        
        if ($chocoCommands) {
            Write-Host "`n🍫 Chocolatey Commands (Run as Administrator):" -ForegroundColor $Blue
            foreach ($cmd in $chocoCommands) {
                Write-Host "   $cmd" -ForegroundColor $White
            }
        }
        
        if ($sdkCommands) {
            Write-Host "`n📱 Android SDK Commands:" -ForegroundColor $Blue
            foreach ($cmd in $sdkCommands) {
                Write-Host "   $cmd" -ForegroundColor $White
            }
        }
        
        if ($envCommands) {
            Write-Host "`n🔧 Environment Variable Commands:" -ForegroundColor $Blue
            foreach ($cmd in $envCommands) {
                Write-Host "   $cmd" -ForegroundColor $White
            }
        }
        
        if ($manualCommands) {
            Write-Host "`n📥 Manual Installation Required:" -ForegroundColor $Blue
            foreach ($cmd in $manualCommands) {
                Write-Host "   $cmd" -ForegroundColor $White
            }
        }
        
        Write-Host "`n" + "=" * 60 -ForegroundColor $Yellow
    }
}

function Show-QuickFixScript {
    Write-Header "AUTOMATED FIX SCRIPT"
    
    Write-Host @"
🚀 Quick Fix Script (Copy and run as Administrator):

# Install Chocolatey (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force
iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# Install required software
choco install nodejs --version=18.19.0 -y
choco install openjdk17 -y  
choco install git -y

# Set environment variables (adjust paths as needed)
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-17.0.10.7-hotspot", "Machine")
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Android", "Machine")

# Download Android SDK Command Line Tools manually:
# https://developer.android.com/studio/command-line-tools
# Extract to C:\Android\cmdline-tools\latest\

# Install Android SDK packages (after setting up command line tools):
# sdkmanager --licenses
# sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" "ndk;25.1.8937393"

Write-Host "🔄 Please restart PowerShell after running these commands!" -ForegroundColor Yellow
"@
}

function Show-ExecutionOrder {
    Write-Header "EXECUTION ORDER FOR MHT ASSESSMENT APK BUILD"
    
    Write-Host @"

📋 COMPLETE WINDOWS SETUP SEQUENCE:

1️⃣  PREREQUISITES CHECK
   └─> Run this script: .\windows-prerequisites-checker.ps1
   └─> Fix any issues found before proceeding

2️⃣  INSTALL SYSTEM DEPENDENCIES (If needed)
   └─> Install Chocolatey (package manager)
   └─> Install Node.js 18+, Java JDK 17+, Git
   └─> Download and setup Android SDK

3️⃣  SET ENVIRONMENT VARIABLES
   └─> JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot
   └─> ANDROID_HOME = C:\Android
   └─> Update PATH to include bin directories

4️⃣  INSTALL ANDROID SDK PACKAGES
   └─> Run: sdkmanager --licenses
   └─> Run: sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

5️⃣  VERIFY SETUP
   └─> Run this script again: .\windows-prerequisites-checker.ps1
   └─> All checks should pass ✅

6️⃣  GET MHT ASSESSMENT PROJECT
   └─> Extract: mht-assessment-github-transfer.tar.gz
   └─> Run: .\setup-github-local.bat (uploads to GitHub)
   └─> Or clone: git clone https://github.com/vaibhavshrivastavait/mht-assessment.git

7️⃣  BUILD APK
   └─> cd mht-assessment
   └─> npm install (downloads 60+ project dependencies)  
   └─> npm run build:apk (creates APK file)

8️⃣  INSTALL APK
   └─> Enable USB Debugging on Android device
   └─> Run: adb install app-debug.apk
   └─> Or transfer APK file to device and install manually

⏱️  ESTIMATED TIME:
   └─> Prerequisites setup: 30-45 minutes
   └─> Project setup & build: 5-10 minutes
   └─> APK installation: 2 minutes

🎉 RESULT: Working MHT Assessment app on Android device!

"@
}

function Show-Summary {
    Write-Header "PREREQUISITES CHECK SUMMARY"
    
    if ($Global:AllChecksPassed) {
        Write-Host "🎉 " -NoNewline -ForegroundColor $Green
        Write-Host "ALL PREREQUISITES CHECKS PASSED!" -ForegroundColor $Green
        Write-Host "✅ Your system is ready to build MHT Assessment APK" -ForegroundColor $Green
        
        Write-Host "`n📋 Next Steps:" -ForegroundColor $Blue
        Write-Host "1. Extract MHT Assessment project package" -ForegroundColor $White
        Write-Host "2. Run: .\setup-github-local.bat" -ForegroundColor $White
        Write-Host "3. Clone and build: git clone → npm install → npm run build:apk" -ForegroundColor $White
    } else {
        Write-Host "⚠️  " -NoNewline -ForegroundColor $Red
        Write-Host "PREREQUISITES CHECK FAILED" -ForegroundColor $Red
        Write-Host "❌ Please fix the issues listed above before building APK" -ForegroundColor $Red
        
        if ($Global:IssuesFound.Count -gt 0) {
            Write-Host "`n📋 Issues Summary:" -ForegroundColor $Yellow
            foreach ($issue in $Global:IssuesFound) {
                Write-Host "  • $issue" -ForegroundColor $White
            }
        }
    }
}

# ==========================================
# MAIN EXECUTION
# ==========================================

Clear-Host

Write-Header "MHT ASSESSMENT - WINDOWS PREREQUISITES CHECKER"

Write-Host @"
🎯 This script checks all requirements for building MHT Assessment APK:
   • System software (Node.js, Java, Git, Android SDK)
   • Environment variables (JAVA_HOME, ANDROID_HOME, PATH)  
   • Android SDK packages and tools
   • Permissions and connectivity

🔧 Available options:
   • Run without params: Full check
   • -Detailed: Show detailed information  
   • -Install: Show installation commands
   • -Fix: Show automated fix script

"@ -ForegroundColor $Blue

if ($Install -or $Fix) {
    Show-QuickFixScript
    Show-ExecutionOrder
    exit 0
}

# Run all checks
Check-NodeJS
Check-Java  
Check-Git
Check-AndroidSDK
Check-PATH
Check-Permissions
Check-InternetConnectivity

# Show results
Show-Summary

if (-not $Global:AllChecksPassed) {
    Show-InstallationCommands
    
    Write-Host "`n💡 " -NoNewline -ForegroundColor $Yellow
    Write-Host "Run with -Fix parameter to see automated installation script:" -ForegroundColor $Yellow
    Write-Host "   .\windows-prerequisites-checker.ps1 -Fix" -ForegroundColor $White
}

Show-ExecutionOrder

Write-Host "`n🚀 Ready to build professional medical assessment APK!" -ForegroundColor $Green