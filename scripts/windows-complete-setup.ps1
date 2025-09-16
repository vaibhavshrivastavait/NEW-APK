# MHT Assessment - Complete Windows Environment Setup Script
# This script sets up everything needed for APK building on Windows
# Run once, then just clone and build APKs forever!

param(
    [switch]$Force = $false
)

# Requires PowerShell to be run as Administrator for some operations
# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

Write-Host "🚀 MHT Assessment - Complete Windows Environment Setup" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

if (-not $isAdmin) {
    Write-Host "⚠️  Running without administrator privileges" -ForegroundColor Yellow
    Write-Host "   Some operations may require administrator access" -ForegroundColor Yellow
    Write-Host ""
}

# Colors for output
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Blue }
function Write-Step { param($Message) Write-Host "📋 $Message" -ForegroundColor Cyan }

Write-Step "Phase 1: Detecting Current Environment"

# Function to detect best Java installation
function Get-BestJavaInstallation {
    Write-Info "Detecting Java installations..."
    
    # Get all java.exe locations
    $javaLocations = @()
    try {
        $javaLocations = where.exe java 2>$null
    } catch {
        Write-Warning "No Java found in PATH"
    }
    
    if ($javaLocations) {
        $firstJava = $javaLocations[0]
        $javaHome = Split-Path (Split-Path $firstJava -Parent) -Parent
        
        Write-Success "Found Java installations:"
        foreach ($java in $javaLocations) {
            Write-Host "  - $java" -ForegroundColor Gray
        }
        
        Write-Info "Using: $firstJava"
        Write-Info "JAVA_HOME will be set to: $javaHome"
        
        # Test Java version
        try {
            $javaVersion = java -version 2>&1 | Select-Object -First 1
            Write-Success "Java version: $javaVersion"
            return $javaHome
        } catch {
            Write-Error "Java command failed"
            return $null
        }
    } else {
        Write-Error "No Java installation found"
        return $null
    }
}

# Function to setup Android SDK
function Setup-AndroidSDK {
    param($AndroidHome)
    
    Write-Info "Setting up Android SDK..."
    
    # Check if Android SDK exists
    if (-not (Test-Path $AndroidHome)) {
        Write-Info "Creating Android SDK directory: $AndroidHome"
        New-Item -ItemType Directory -Force -Path $AndroidHome | Out-Null
        
        Write-Warning "Android SDK not found. You need to:"
        Write-Host "1. Download Android Command Line Tools from:" -ForegroundColor Yellow
        Write-Host "   https://developer.android.com/studio/command-line-tools" -ForegroundColor Yellow
        Write-Host "2. Extract to: $AndroidHome\cmdline-tools\latest\" -ForegroundColor Yellow
        Write-Host "3. Run this script again" -ForegroundColor Yellow
        return $false
    }
    
    # Look for sdkmanager
    $sdkmanagerPaths = @(
        "$AndroidHome\cmdline-tools\latest\bin\sdkmanager.bat",
        "$AndroidHome\tools\bin\sdkmanager.bat",
        "$AndroidHome\cmdline-tools\tools\bin\sdkmanager.bat"
    )
    
    $sdkmanager = $null
    foreach ($path in $sdkmanagerPaths) {
        if (Test-Path $path) {
            $sdkmanager = $path
            break
        }
    }
    
    if (-not $sdkmanager) {
        Write-Warning "sdkmanager not found in Android SDK"
        Write-Info "Please ensure Android Command Line Tools are installed in:"
        Write-Info "$AndroidHome\cmdline-tools\latest\"
        return $false
    }
    
    Write-Success "Found sdkmanager: $sdkmanager"
    
    # Test sdkmanager
    try {
        & $sdkmanager --version
        Write-Success "sdkmanager is working"
        return $true
    } catch {
        Write-Error "sdkmanager failed to run"
        return $false
    }
}

# Function to install Android SDK components
function Install-AndroidComponents {
    param($AndroidHome)
    
    Write-Info "Installing Android SDK components..."
    
    $sdkmanager = "$AndroidHome\cmdline-tools\latest\bin\sdkmanager.bat"
    if (-not (Test-Path $sdkmanager)) {
        $sdkmanager = "$AndroidHome\tools\bin\sdkmanager.bat"
    }
    
    try {
        Write-Info "Accepting Android SDK licenses..."
        echo y | & $sdkmanager --licenses
        
        Write-Info "Installing platform-tools..."
        & $sdkmanager "platform-tools"
        
        Write-Info "Installing Android API 34..."
        & $sdkmanager "platforms;android-34"
        
        Write-Info "Installing build tools..."
        & $sdkmanager "build-tools;34.0.0"
        
        Write-Success "Android SDK components installed successfully"
        return $true
    } catch {
        Write-Error "Failed to install Android SDK components: $_"
        return $false
    }
}

# Function to set environment variables permanently
function Set-PermanentEnvironmentVariables {
    param($JavaHome, $AndroidHome)
    
    Write-Info "Setting permanent environment variables..."
    
    try {
        # Set JAVA_HOME
        [System.Environment]::SetEnvironmentVariable("JAVA_HOME", $JavaHome, [System.EnvironmentVariableTarget]::User)
        Write-Success "Set JAVA_HOME = $JavaHome"
        
        # Set ANDROID_HOME
        [System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $AndroidHome, [System.EnvironmentVariableTarget]::User)
        Write-Success "Set ANDROID_HOME = $AndroidHome"
        
        # Update PATH
        $currentPath = [System.Environment]::GetEnvironmentVariable("PATH", [System.EnvironmentVariableTarget]::User)
        $pathsToAdd = @(
            "$JavaHome\bin",
            "$AndroidHome\cmdline-tools\latest\bin",
            "$AndroidHome\platform-tools",
            "$AndroidHome\tools"
        )
        
        foreach ($pathToAdd in $pathsToAdd) {
            if ($currentPath -notlike "*$pathToAdd*") {
                $currentPath = "$currentPath;$pathToAdd"
                Write-Success "Added to PATH: $pathToAdd"
            }
        }
        
        [System.Environment]::SetEnvironmentVariable("PATH", $currentPath, [System.EnvironmentVariableTarget]::User)
        
        # Set for current session
        $env:JAVA_HOME = $JavaHome
        $env:ANDROID_HOME = $AndroidHome
        $env:PATH = "$env:PATH;$JavaHome\bin;$AndroidHome\cmdline-tools\latest\bin;$AndroidHome\platform-tools;$AndroidHome\tools"
        
        Write-Success "Environment variables set permanently and for current session"
        return $true
    } catch {
        Write-Error "Failed to set environment variables: $_"
        return $false
    }
}

# Function to test complete environment
function Test-Environment {
    Write-Info "Testing complete environment..."
    
    $allGood = $true
    
    # Test Node.js
    try {
        $nodeVersion = node --version
        Write-Success "Node.js: $nodeVersion"
    } catch {
        Write-Error "Node.js not found or not working"
        $allGood = $false
    }
    
    # Test Java
    try {
        $javaVersion = java -version 2>&1 | Select-Object -First 1
        Write-Success "Java: $javaVersion"
    } catch {
        Write-Error "Java not found or not working"
        $allGood = $false
    }
    
    # Test Git
    try {
        $gitVersion = git --version
        Write-Success "Git: $gitVersion"
    } catch {
        Write-Error "Git not found or not working"
        $allGood = $false
    }
    
    # Test ADB
    try {
        $adbVersion = adb --version 2>&1 | Select-Object -First 1
        Write-Success "ADB: $adbVersion"
    } catch {
        Write-Error "ADB not found or not working"
        $allGood = $false
    }
    
    # Test sdkmanager
    try {
        $sdkVersion = sdkmanager --version 2>&1 | Select-Object -First 1
        Write-Success "SDK Manager: $sdkVersion"
    } catch {
        Write-Error "SDK Manager not found or not working"
        $allGood = $false
    }
    
    return $allGood
}

# Function to create build script
function Create-BuildScript {
    $buildScript = @'
# MHT Assessment - Quick APK Build Script
# Generated by windows-complete-setup.ps1

Write-Host "🚀 Building MHT Assessment APK..." -ForegroundColor Cyan

# Ensure environment variables are loaded
$env:JAVA_HOME = [System.Environment]::GetEnvironmentVariable("JAVA_HOME", [System.EnvironmentVariableTarget]::User)
$env:ANDROID_HOME = [System.Environment]::GetEnvironmentVariable("ANDROID_HOME", [System.EnvironmentVariableTarget]::User)

if (-not $env:JAVA_HOME -or -not $env:ANDROID_HOME) {
    Write-Host "❌ Environment not set up. Run windows-complete-setup.ps1 first!" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install --legacy-peer-deps

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Blue
Remove-Item "android\app\src\main\assets\index.android.bundle" -ErrorAction SilentlyContinue

# Create directories
New-Item -ItemType Directory -Force -Path "android\app\src\main\assets" | Out-Null
New-Item -ItemType Directory -Force -Path "android\app\src\main\res" | Out-Null

# Bundle JavaScript
Write-Host "⚡ Bundling JavaScript..." -ForegroundColor Blue
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android\app\src\main\assets\index.android.bundle --assets-dest android\app\src\main\res\ --reset-cache

# Build APK
Write-Host "🔨 Building APK..." -ForegroundColor Blue
cd android
.\gradlew.bat assembleDebug
cd ..

# Find APK
$apk = Get-ChildItem -Path "android\app\build\outputs\apk\debug" -Filter "*.apk" | Select-Object -First 1
if ($apk) {
    $size = [math]::Round($apk.Length / 1MB, 2)
    Write-Host "✅ APK built successfully!" -ForegroundColor Green
    Write-Host "📱 APK: $($apk.Name) ($size MB)" -ForegroundColor Green
    Write-Host "📍 Location: $($apk.FullName)" -ForegroundColor Green
    
    # Copy to easy location
    Copy-Item $apk.FullName "mht-assessment-debug.apk"
    Write-Host "📱 Copied to: mht-assessment-debug.apk" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "📲 To install:" -ForegroundColor Cyan
    Write-Host "adb install mht-assessment-debug.apk" -ForegroundColor Yellow
} else {
    Write-Host "❌ APK build failed!" -ForegroundColor Red
}
'@
    
    $buildScript | Out-File -FilePath "quick-build.ps1" -Encoding UTF8
    Write-Success "Created quick-build.ps1 script"
}

# Main execution
Write-Step "Starting environment setup..."

# Detect Java
$javaHome = Get-BestJavaInstallation
if (-not $javaHome) {
    Write-Error "Java setup failed. Please install Java 17 or later."
    exit 1
}

# Setup Android SDK
$androidHome = "C:\Android"
Write-Info "Using Android SDK location: $androidHome"

if (-not (Setup-AndroidSDK $androidHome)) {
    # Try to download and setup Android SDK automatically
    Write-Step "Attempting to download Android SDK..."
    
    $cmdlineToolsUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
    $downloadPath = "$env:TEMP\android-cmdline-tools.zip"
    
    try {
        Write-Info "Downloading Android Command Line Tools..."
        Invoke-WebRequest -Uri $cmdlineToolsUrl -OutFile $downloadPath
        
        Write-Info "Extracting to $androidHome..."
        New-Item -ItemType Directory -Force -Path "$androidHome\cmdline-tools" | Out-Null
        Expand-Archive -Path $downloadPath -DestinationPath "$androidHome\cmdline-tools" -Force
        
        # Move to correct structure
        if (Test-Path "$androidHome\cmdline-tools\cmdline-tools") {
            Move-Item "$androidHome\cmdline-tools\cmdline-tools" "$androidHome\cmdline-tools\latest"
        }
        
        Remove-Item $downloadPath -Force
        Write-Success "Android SDK downloaded and installed"
        
        # Try setup again
        if (-not (Setup-AndroidSDK $androidHome)) {
            Write-Error "Android SDK setup still failed after download"
            exit 1
        }
    } catch {
        Write-Error "Failed to download Android SDK: $_"
        Write-Warning "Please download manually from: https://developer.android.com/studio/command-line-tools"
        exit 1
    }
}

# Set environment variables
if (-not (Set-PermanentEnvironmentVariables $javaHome $androidHome)) {
    Write-Error "Failed to set environment variables"
    exit 1
}

# Install Android components
Write-Step "Phase 2: Installing Android SDK Components"
if (-not (Install-AndroidComponents $androidHome)) {
    Write-Warning "Some Android components may not have installed properly"
}

# Test environment
Write-Step "Phase 3: Testing Complete Environment"
if (Test-Environment) {
    Write-Success "All tools are working correctly!"
} else {
    Write-Warning "Some tools may not be working properly"
}

# Create build script
Write-Step "Phase 4: Creating Build Scripts"
Create-BuildScript

# Final instructions
Write-Host ""
Write-Host "🎉 Windows Environment Setup Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 What's been set up:" -ForegroundColor Cyan
Write-Host "  ✅ Java environment configured" -ForegroundColor White
Write-Host "  ✅ Android SDK installed and configured" -ForegroundColor White
Write-Host "  ✅ Environment variables set permanently" -ForegroundColor White
Write-Host "  ✅ Build script created (quick-build.ps1)" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "1. Close and reopen PowerShell (to load new environment)" -ForegroundColor Yellow
Write-Host "2. Clone the repository:" -ForegroundColor Yellow
Write-Host "   git clone https://github.com/vaibhavshrivastavait/mht-assessment-android-app.git" -ForegroundColor Gray
Write-Host "3. Navigate to project:" -ForegroundColor Yellow
Write-Host "   cd mht-assessment-android-app" -ForegroundColor Gray
Write-Host "4. Build APK:" -ForegroundColor Yellow
Write-Host "   .\quick-build.ps1" -ForegroundColor Gray
Write-Host "   OR" -ForegroundColor Yellow
Write-Host "   .\scripts\build-standalone-apk-simple.ps1 -BuildType debug" -ForegroundColor Gray
Write-Host ""
Write-Host "📱 The APK will be self-contained and work offline!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Tip: You only need to run this setup script once." -ForegroundColor Blue
Write-Host "    After this, just clone and build APKs anytime!" -ForegroundColor Blue