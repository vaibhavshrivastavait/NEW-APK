# PowerShell Script: force-cache-clear.ps1
# Purpose: Force complete cache clear and rebuild

Write-Host "FORCE CACHE CLEAR - MHT Assessment" -ForegroundColor Red
Write-Host "=================================" -ForegroundColor Red

# Step 1: Kill all node processes
Write-Host "Step 1: Killing all Node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Step 2: Remove all cache directories
Write-Host "Step 2: Removing cache directories..." -ForegroundColor Yellow
$cacheDirs = @(
    ".expo",
    "node_modules\.cache",
    "android\build",
    "android\app\build",
    "android\.gradle",
    "%LOCALAPPDATA%\npm-cache",
    "%APPDATA%\npm-cache"
)

foreach ($dir in $cacheDirs) {
    if (Test-Path $dir) {
        Remove-Item -Recurse -Force $dir -ErrorAction SilentlyContinue
        Write-Host "Removed: $dir" -ForegroundColor Green
    }
}

# Step 3: Clear system caches
Write-Host "Step 3: Clearing system caches..." -ForegroundColor Yellow
& npm cache clean --force
& npx @react-native-community/cli clean

# Step 4: Reset Metro
Write-Host "Step 4: Resetting Metro..." -ForegroundColor Yellow
$metroCache = "$env:LOCALAPPDATA\Metro"
if (Test-Path $metroCache) {
    Remove-Item -Recurse -Force $metroCache -ErrorAction SilentlyContinue
    Write-Host "Metro cache cleared" -ForegroundColor Green
}

# Step 5: Clean Gradle thoroughly
Write-Host "Step 5: Thorough Gradle clean..." -ForegroundColor Yellow
if (Test-Path "android") {
    Push-Location "android"
    & ./gradlew clean
    & ./gradlew cleanBuildCache
    Pop-Location
}

# Step 6: Reinstall node modules
Write-Host "Step 6: Reinstalling node modules..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
& npm install

Write-Host "`nCACHE CLEAR COMPLETE!" -ForegroundColor Green
Write-Host "Now run: npx expo run:android --variant debug" -ForegroundColor Cyan

Read-Host "`nPress Enter to exit"