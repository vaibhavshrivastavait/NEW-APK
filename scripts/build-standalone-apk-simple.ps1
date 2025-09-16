# MHT Assessment - Simple APK Build Script (PowerShell)
# Fixed version with proper PowerShell syntax

param(
    [string]$BuildType = "debug"
)

Write-Host "🚀 Building MHT Assessment - Standalone APK" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Check required tools
Write-Host "📋 Checking build requirements..." -ForegroundColor Blue

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check Java
try {
    $javaVersion = java -version 2>&1 | Select-Object -First 1
    Write-Host "✅ Java: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Java not found. Please install OpenJDK 17+" -ForegroundColor Red
    exit 1
}

# Check Android SDK
if (-not $env:ANDROID_HOME -and -not $env:ANDROID_SDK_ROOT) {
    Write-Host "❌ Android SDK not found. Please set ANDROID_HOME" -ForegroundColor Red
    Write-Host "   Download from: https://developer.android.com/studio/command-line-tools" -ForegroundColor Yellow
    exit 1
}

$androidSdk = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { $env:ANDROID_SDK_ROOT }
Write-Host "✅ Android SDK: $androidSdk" -ForegroundColor Green

Write-Host "📦 Build configuration: $BuildType" -ForegroundColor Blue

# Step 1: Install dependencies
Write-Host "📥 Installing dependencies..." -ForegroundColor Blue
try {
    if (Get-Command yarn -ErrorAction SilentlyContinue) {
        yarn install
    } else {
        npm install --legacy-peer-deps
    }
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Step 2: Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Blue
Remove-Item "android\app\src\main\assets\index.android.bundle" -ErrorAction SilentlyContinue
Remove-Item "android\app\src\main\res\drawable-*" -Recurse -ErrorAction SilentlyContinue
Remove-Item "android\app\src\main\res\raw" -Recurse -ErrorAction SilentlyContinue

Set-Location android
try {
    .\gradlew.bat clean --quiet
    Write-Host "✅ Build cleaned" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Gradle clean failed, continuing..." -ForegroundColor Yellow
}
Set-Location ..

# Step 3: Create assets directory
Write-Host "📁 Preparing asset directories..." -ForegroundColor Blue
New-Item -ItemType Directory -Force -Path "android\app\src\main\assets" | Out-Null
New-Item -ItemType Directory -Force -Path "android\app\src\main\res" | Out-Null
Write-Host "✅ Directories prepared" -ForegroundColor Green

# Step 4: Bundle JavaScript
Write-Host "⚡ Bundling JavaScript for Android..." -ForegroundColor Blue
Write-Host "   This may take 2-3 minutes..." -ForegroundColor Yellow

$devFlag = if ($BuildType -eq "release") { "false" } else { "false" }

try {
    npx react-native bundle --platform android --dev $devFlag --entry-file index.js --bundle-output android\app\src\main\assets\index.android.bundle --assets-dest android\app\src\main\res\ --reset-cache
    Write-Host "✅ JavaScript bundled successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ JavaScript bundling failed" -ForegroundColor Red
    Write-Host "   Trying alternative method..." -ForegroundColor Yellow
    
    try {
        npx expo export:embed --entry-file index.js --platform android --dev $devFlag --bundle-output android\app\src\main\assets\index.android.bundle --assets-dest android\app\src\main\res\ --reset-cache
        Write-Host "✅ JavaScript bundled with Expo CLI" -ForegroundColor Green
    } catch {
        Write-Host "❌ Both bundling methods failed" -ForegroundColor Red
        exit 1
    }
}

# Verify bundle was created
if (-not (Test-Path "android\app\src\main\assets\index.android.bundle")) {
    Write-Host "❌ Bundle file not found" -ForegroundColor Red
    exit 1
}

$bundleSize = (Get-Item "android\app\src\main\assets\index.android.bundle").Length
$bundleSizeFormatted = if ($bundleSize -gt 1MB) { "{0:N1} MB" -f ($bundleSize / 1MB) } else { "{0:N0} KB" -f ($bundleSize / 1KB) }
Write-Host "✅ Bundle created: $bundleSizeFormatted" -ForegroundColor Green

# Step 5: Build APK
Write-Host "🔨 Building Android APK..." -ForegroundColor Blue
Write-Host "   This may take 3-5 minutes..." -ForegroundColor Yellow

Set-Location android

# Set Android SDK environment (simplified)
$env:ANDROID_HOME = $androidSdk

try {
    if ($BuildType -eq "release") {
        Write-Host "   Building signed release APK..." -ForegroundColor Yellow
        .\gradlew.bat assembleRelease --stacktrace
        Write-Host "✅ Release APK built successfully" -ForegroundColor Green
    } else {
        Write-Host "   Building debug APK..." -ForegroundColor Yellow
        .\gradlew.bat assembleDebug --stacktrace
        Write-Host "✅ Debug APK built successfully" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ APK build failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

# Step 6: Locate and report APK
Write-Host "📱 Locating built APK..." -ForegroundColor Blue

$apkFile = Get-ChildItem -Path "android\app\build\outputs\apk\$BuildType" -Filter "*.apk" | Select-Object -First 1

if (-not $apkFile) {
    Write-Host "❌ APK file not found" -ForegroundColor Red
    Get-ChildItem -Path "android\app\build\outputs" -Filter "*.apk" -Recurse
    exit 1
}

$apkSize = $apkFile.Length
$apkSizeFormatted = if ($apkSize -gt 1MB) { "{0:N1} MB" -f ($apkSize / 1MB) } else { "{0:N0} KB" -f ($apkSize / 1KB) }
$apkName = $apkFile.Name

Write-Host "✅ APK built successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Build Summary" -ForegroundColor Blue
Write-Host "=================="
Write-Host "  APK File: $apkName"
Write-Host "  APK Size: $apkSizeFormatted"
Write-Host "  Location: $($apkFile.FullName)"
Write-Host "  Build Type: $BuildType"
Write-Host ""

# Copy APK to project root
$finalApk = "mht-assessment-standalone-$BuildType.apk"
Copy-Item $apkFile.FullName $finalApk
Write-Host "✅ APK copied to: $finalApk" -ForegroundColor Green

# Installation instructions
Write-Host "📲 Installation Instructions" -ForegroundColor Blue
Write-Host "=============================="
Write-Host ""
Write-Host "Option 1: USB Debugging (Recommended)" -ForegroundColor Yellow
Write-Host "  1. Enable Developer Options on your Android device"
Write-Host "  2. Enable USB Debugging"
Write-Host "  3. Connect device via USB"
Write-Host "  4. Run: adb install $finalApk"
Write-Host ""
Write-Host "Option 2: Sideload via File Transfer" -ForegroundColor Yellow
Write-Host "  1. Copy $finalApk to your Android device"
Write-Host "  2. Enable 'Unknown Sources' in device settings"
Write-Host "  3. Open file manager and tap the APK to install"
Write-Host ""

Write-Host "🎉 Standalone APK build completed successfully!" -ForegroundColor Green
Write-Host "Build artifact: $finalApk" -ForegroundColor Blue