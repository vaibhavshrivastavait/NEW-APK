# MHT Assessment - Standalone APK Build Script (PowerShell)
# Produces self-contained APK that doesn't require Metro
# Windows PowerShell version

param(
    [string]$BuildType = "debug"  # debug or release
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

# Check npm/yarn
try {
    $yarnVersion = yarn --version 2>$null
    $packageManager = "yarn"
    Write-Host "✅ Yarn: $yarnVersion" -ForegroundColor Green
} catch {
    try {
        $npmVersion = npm --version
        $packageManager = "npm"
        Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Neither npm nor yarn found" -ForegroundColor Red
        exit 1
    }
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
$androidSdkPath = $env:ANDROID_HOME
if (-not $androidSdkPath) {
    $androidSdkPath = $env:ANDROID_SDK_ROOT
}

if (-not $androidSdkPath -or -not (Test-Path $androidSdkPath)) {
    Write-Host "❌ Android SDK not found. Please set ANDROID_HOME or ANDROID_SDK_ROOT" -ForegroundColor Red
    Write-Host "   Download from: https://developer.android.com/studio/command-line-tools" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Android SDK: $androidSdkPath" -ForegroundColor Green

# Build configuration
$outputDir = "android\app\build\outputs\apk\$BuildType"

Write-Host "📦 Build configuration" -ForegroundColor Blue
Write-Host "  Build Type: $BuildType"
Write-Host "  Output Dir: $outputDir"
Write-Host ""

# Step 1: Install dependencies
Write-Host "📥 Installing dependencies..." -ForegroundColor Blue
if ($packageManager -eq "yarn") {
    yarn install --frozen-lockfile
} else {
    npm ci
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Step 2: Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Blue
Remove-Item "android\app\src\main\assets\index.android.bundle" -ErrorAction SilentlyContinue
Remove-Item "android\app\src\main\res\drawable-*" -Recurse -ErrorAction SilentlyContinue
Remove-Item "android\app\src\main\res\raw" -Recurse -ErrorAction SilentlyContinue

Set-Location android
.\gradlew.bat clean --quiet
Set-Location ..
Write-Host "✅ Build cleaned" -ForegroundColor Green

# Step 3: Create assets directory
Write-Host "📁 Preparing asset directories..." -ForegroundColor Blue
New-Item -ItemType Directory -Force -Path "android\app\src\main\assets" | Out-Null
New-Item -ItemType Directory -Force -Path "android\app\src\main\res" | Out-Null
Write-Host "✅ Directories prepared" -ForegroundColor Green

# Step 4: Bundle JavaScript and assets
Write-Host "⚡ Bundling JavaScript for Android..." -ForegroundColor Blue
Write-Host "   This may take 2-3 minutes..." -ForegroundColor Yellow

# Set dev flag based on build type
$devFlag = "false"  # Even debug builds should be standalone (no Metro)

# Bundle with proper error handling
try {
    npx react-native bundle --platform android --dev $devFlag --entry-file index.js --bundle-output android\app\src\main\assets\index.android.bundle --assets-dest android\app\src\main\res\ --reset-cache
    Write-Host "✅ JavaScript bundled successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ JavaScript bundling failed" -ForegroundColor Red
    Write-Host "   Trying alternative method with Expo CLI..." -ForegroundColor Yellow
    
    try {
        npx expo export:embed --entry-file index.js --platform android --dev $devFlag --bundle-output android\app\src\main\assets\index.android.bundle --assets-dest android\app\src\main\res\ --reset-cache
        Write-Host "✅ JavaScript bundled with Expo CLI" -ForegroundColor Green
    } catch {
        Write-Host "❌ Both bundling methods failed" -ForegroundColor Red
        Write-Host "   Check Metro configuration and try manually:" -ForegroundColor Yellow
        Write-Host "   npx react-native start --reset-cache"
        exit 1
    }
}

# Verify bundle was created
if (-not (Test-Path "android\app\src\main\assets\index.android.bundle")) {
    Write-Host "❌ Bundle file not found: android\app\src\main\assets\index.android.bundle" -ForegroundColor Red
    exit 1
}

$bundleSize = (Get-Item "android\app\src\main\assets\index.android.bundle").Length
$bundleSizeFormatted = if ($bundleSize -gt 1MB) { "{0:N1} MB" -f ($bundleSize / 1MB) } else { "{0:N0} KB" -f ($bundleSize / 1KB) }
Write-Host "✅ Bundle created: $bundleSizeFormatted" -ForegroundColor Green

# Step 5: Build APK
Write-Host "🔨 Building Android APK..." -ForegroundColor Blue
Write-Host "   This may take 3-5 minutes..." -ForegroundColor Yellow

Set-Location android

# Set environment variables for build
$env:ANDROID_HOME = $androidSdkPath
$cmdlineTools = Join-Path $androidSdkPath "cmdline-tools\latest\bin"
$platformTools = Join-Path $androidSdkPath "platform-tools"
$env:PATH = "$env:PATH;$cmdlineTools;$platformTools"

# Build based on type
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
    exit 1
}

Set-Location ..

# Step 6: Locate and report APK
Write-Host "📱 Locating built APK..." -ForegroundColor Blue

$apkFile = Get-ChildItem -Path "android\app\build\outputs\apk\$BuildType" -Filter "*.apk" | Select-Object -First 1

if (-not $apkFile) {
    Write-Host "❌ APK file not found in expected location" -ForegroundColor Red
    Write-Host "   Searching in build outputs..." -ForegroundColor Yellow
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

# Step 7: Copy APK to project root for easy access
$finalApk = "mht-assessment-standalone-$BuildType.apk"
Copy-Item $apkFile.FullName $finalApk
Write-Host "✅ APK copied to: $finalApk" -ForegroundColor Green

# Step 8: Installation instructions
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
Write-Host "Option 3: Test with ADB (if device connected)" -ForegroundColor Yellow
Write-Host "  adb devices                    # Check connected devices"
Write-Host "  adb install $finalApk         # Install APK"
Write-Host "  adb shell am start -n com.mht.assessment/.MainActivity  # Launch app"
Write-Host ""

# Step 9: Verification checklist
Write-Host "✅ Verification Checklist" -ForegroundColor Blue
Write-Host "=========================="
Write-Host "  □ APK installs without errors"
Write-Host "  □ App launches without Metro connection"
Write-Host "  □ No 'Enable JavaScript' error messages"
Write-Host "  □ Patient data can be saved/loaded offline"
Write-Host "  □ CME quizzes work offline"
Write-Host "  □ Risk calculators function properly"
Write-Host "  □ App works without internet connection"
Write-Host ""

Write-Host "🎉 Standalone APK build completed successfully!" -ForegroundColor Green
Write-Host "Build artifact: $finalApk" -ForegroundColor Blue