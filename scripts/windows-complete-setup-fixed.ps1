# MHT Assessment - Complete Windows Environment Setup Script
# This script sets up everything needed for APK building on Windows
# Run once, then just clone and build APKs forever!

param(
    [switch]$Force = $false
)

Write-Host "MHT Assessment - Complete Windows Environment Setup" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# Colors for output
function Write-Success { param($Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }
function Write-Warning { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Blue }
function Write-Step { param($Message) Write-Host "[STEP] $Message" -ForegroundColor Cyan }

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
        return $false
    }
    
    # Look for sdkmanager
    $sdkmanagerPaths = @(
        "$AndroidHome\cmdline-tools\latest\bin\sdkmanager.bat",
        "$AndroidHome\tools\bin\sdkmanager.bat"
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

# Function to download and setup Android SDK
function Download-AndroidSDK {
    param($AndroidHome)
    
    Write-Step "Downloading Android SDK Command Line Tools..."
    
    $cmdlineToolsUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
    $downloadPath = "$env:TEMP\android-cmdline-tools.zip"
    
    try {
        Write-Info "Downloading from Google..."
        Invoke-WebRequest -Uri $cmdlineToolsUrl -OutFile $downloadPath -UseBasicParsing
        
        Write-Info "Extracting to $AndroidHome..."
        New-Item -ItemType Directory -Force -Path "$AndroidHome\cmdline-tools" | Out-Null
        Expand-Archive -Path $downloadPath -DestinationPath "$AndroidHome\cmdline-tools" -Force
        
        # Move to correct structure
        if (Test-Path "$AndroidHome\cmdline-tools\cmdline-tools") {
            Move-Item "$AndroidHome\cmdline-tools\cmdline-tools" "$AndroidHome\cmdline-tools\latest"
        }
        
        Remove-Item $downloadPath -Force -ErrorAction SilentlyContinue
        Write-Success "Android SDK downloaded and installed"
        return $true
    } catch {
        Write-Error "Failed to download Android SDK: $_"
        return $false
    }
}

# Function to install Android SDK components
function Install-AndroidComponents {
    param($AndroidHome)
    
    Write-Info "Installing Android SDK components..."
    
    $sdkmanager = "$AndroidHome\cmdline-tools\latest\bin\sdkmanager.bat"
    
    if (-not (Test-Path $sdkmanager)) {
        Write-Error "sdkmanager not found at: $sdkmanager"
        return $false
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
        if (-not $currentPath) { $currentPath = "" }
        
        $pathsToAdd = @(
            "$JavaHome\bin",
            "$AndroidHome\cmdline-tools\latest\bin",
            "$AndroidHome\platform-tools"
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
        $env:PATH = "$env:PATH;$JavaHome\bin;$AndroidHome\cmdline-tools\latest\bin;$AndroidHome\platform-tools"
        
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
    
    return $allGood
}

# Function to create build script
function Create-BuildScript {
    $buildScript = @'
# MHT Assessment - Quick APK Build Script
Write-Host "Building MHT Assessment APK..." -ForegroundColor Cyan

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Blue
npm install --legacy-peer-deps

# Clean previous builds
Write-Host "Cleaning previous builds..." -ForegroundColor Blue
Remove-Item "android\app\src\main\assets\index.android.bundle" -ErrorAction SilentlyContinue

# Create directories
New-Item -ItemType Directory -Force -Path "android\app\src\main\assets" | Out-Null
New-Item -ItemType Directory -Force -Path "android\app\src\main\res" | Out-Null

# Bundle JavaScript
Write-Host "Bundling JavaScript..." -ForegroundColor Blue
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android\app\src\main\assets\index.android.bundle --assets-dest android\app\src\main\res\ --reset-cache

# Build APK
Write-Host "Building APK..." -ForegroundColor Blue
cd android
.\gradlew.bat assembleDebug
cd ..

# Find APK
$apk = Get-ChildItem -Path "android\app\build\outputs\apk\debug" -Filter "*.apk" | Select-Object -First 1
if ($apk) {
    $size = [math]::Round($apk.Length / 1MB, 2)
    Write-Host "APK built successfully!" -ForegroundColor Green
    Write-Host "APK: $($apk.Name) ($size MB)" -ForegroundColor Green
    Write-Host "Location: $($apk.FullName)" -ForegroundColor Green
    
    # Copy to easy location
    Copy-Item $apk.FullName "mht-assessment-debug.apk"
    Write-Host "Copied to: mht-assessment-debug.apk" -ForegroundColor Green
} else {
    Write-Host "APK build failed!" -ForegroundColor Red
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
    Write-Step "Android SDK not found. Downloading..."
    
    if (Download-AndroidSDK $androidHome) {
        if (-not (Setup-AndroidSDK $androidHome)) {
            Write-Error "Android SDK setup failed after download"
            exit 1
        }
    } else {
        Write-Error "Failed to download Android SDK"
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
Write-Host "Windows Environment Setup Complete!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "What has been set up:" -ForegroundColor Cyan
Write-Host "  - Java environment configured" -ForegroundColor White
Write-Host "  - Android SDK installed and configured" -ForegroundColor White
Write-Host "  - Environment variables set permanently" -ForegroundColor White
Write-Host "  - Build script created (quick-build.ps1)" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Close and reopen PowerShell" -ForegroundColor Yellow
Write-Host "2. Navigate to project: cd mht-assessment-android-app" -ForegroundColor Yellow
Write-Host "3. Build APK: .\quick-build.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "The APK will be self-contained and work offline!" -ForegroundColor Green