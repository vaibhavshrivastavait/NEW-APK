# PowerShell Script: rebuild-fix.ps1
# Purpose: Rebuild APK with JavaScript syntax fixes

Write-Host "MHT Assessment - Crash Fix Rebuild Script" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found. Please run this from the project root directory." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Cyan

# Step 1: Clean caches
Write-Host "`nStep 1: Cleaning caches..." -ForegroundColor Yellow
try {
    & npx expo r -c
    Write-Host "SUCCESS: Metro cache cleared" -ForegroundColor Green
} catch {
    Write-Host "WARNING: Could not clear Metro cache" -ForegroundColor Yellow
}

# Step 2: Install dependencies
Write-Host "`nStep 2: Installing dependencies..." -ForegroundColor Yellow
& npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 3: Clean Android build
Write-Host "`nStep 3: Cleaning Android build..." -ForegroundColor Yellow
if (Test-Path "android") {
    Push-Location android
    try {
        & ./gradlew clean
        Write-Host "SUCCESS: Android build cleaned" -ForegroundColor Green
    } catch {
        Write-Host "WARNING: Android clean failed" -ForegroundColor Yellow
    }
    Pop-Location
} else {
    Write-Host "WARNING: android directory not found" -ForegroundColor Yellow
}

# Step 4: Build APK
Write-Host "`nStep 4: Building APK..." -ForegroundColor Yellow
Write-Host "This may take 5-10 minutes..." -ForegroundColor Cyan

try {
    & npx expo run:android --variant release --clear
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nSUCCESS: APK built successfully!" -ForegroundColor Green
        Write-Host "The app should now install automatically on your connected device" -ForegroundColor Cyan
        Write-Host "Test the app to see if the crashes are resolved" -ForegroundColor Cyan
    } else {
        Write-Host "`nERROR: Build failed. Check the error messages above." -ForegroundColor Red
    }
} catch {
    Write-Host "`nERROR: Build process failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. If the app installed, test it thoroughly" -ForegroundColor White
Write-Host "2. If still crashing, run: adb logcat -s ReactNativeJS:* AndroidRuntime:E *:F" -ForegroundColor White
Write-Host "3. Share the new crash logs for further assistance" -ForegroundColor White

Read-Host "`nPress Enter to exit"