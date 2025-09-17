# PowerShell Script: rebuild-fix.ps1
# Purpose: Rebuild APK with JavaScript syntax fixes

Write-Host "🛠️ MHT Assessment - Crash Fix Rebuild Script" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this from the project root directory." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "📂 Current directory: $(Get-Location)" -ForegroundColor Cyan

# Step 1: Clean caches
Write-Host "`n🧹 Step 1: Cleaning caches..." -ForegroundColor Yellow
try {
    & npx expo r -c
    Write-Host "✅ Metro cache cleared" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Warning: Could not clear Metro cache" -ForegroundColor Yellow
}

# Step 2: Install dependencies
Write-Host "`n📦 Step 2: Installing dependencies..." -ForegroundColor Yellow
& npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 3: Clean Android build
Write-Host "`n🏗️ Step 3: Cleaning Android build..." -ForegroundColor Yellow
if (Test-Path "android") {
    Push-Location android
    try {
        & ./gradlew clean
        Write-Host "✅ Android build cleaned" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Warning: Android clean failed" -ForegroundColor Yellow
    }
    Pop-Location
} else {
    Write-Host "⚠️ Warning: android directory not found" -ForegroundColor Yellow
}

# Step 4: Build APK
Write-Host "`n🔨 Step 4: Building APK..." -ForegroundColor Yellow
Write-Host "This may take 5-10 minutes..." -ForegroundColor Cyan

try {
    & npx expo run:android --variant release --clear
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n🎉 SUCCESS: APK built successfully!" -ForegroundColor Green
        Write-Host "📱 The app should now install automatically on your connected device" -ForegroundColor Cyan
        Write-Host "🧪 Test the app to see if the crashes are resolved" -ForegroundColor Cyan
    } else {
        Write-Host "`n❌ Build failed. Check the error messages above." -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ Build process failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. If the app installed, test it thoroughly" -ForegroundColor White
Write-Host "2. If still crashing, run: adb logcat -s ReactNativeJS:* AndroidRuntime:E *:F" -ForegroundColor White
Write-Host "3. Share the new crash logs for further assistance" -ForegroundColor White

Read-Host "`nPress Enter to exit"