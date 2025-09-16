# =========================================================
# Fix APK Build Issues - Windows PowerShell Version
# For createBundleDebugJsAndAssets errors
# =========================================================

Write-Host ""
Write-Host "=============================================="
Write-Host "  APK Build Error Fix - PowerShell Version"
Write-Host "=============================================="
Write-Host ""
Write-Host "This script provides multiple solutions for the APK build error:"
Write-Host '"Execution failed for task '':app:createBundleDebugJsAndAssets''"'
Write-Host ""

# Function to show menu and get choice
function Show-Menu {
    Write-Host "Choose solution:"
    Write-Host "1 = Clean Build (Recommended)"
    Write-Host "2 = Manual Bundle Creation"
    Write-Host "3 = Disable Bundle (Normal Debug APK)"
    Write-Host "4 = Try All Solutions"
    Write-Host ""
    
    do {
        $choice = Read-Host "Enter your choice (1-4)"
    } while ($choice -notmatch '^[1-4]$')
    
    return $choice
}

# Function for Clean Build
function Invoke-CleanBuild {
    Write-Host ""
    Write-Host "=========================================="
    Write-Host "  Solution 1: Clean Build & Cache Reset"
    Write-Host "=========================================="
    Write-Host ""
    
    Write-Host "Cleaning Android build..."
    Set-Location android
    & .\gradlew clean
    Set-Location ..
    
    Write-Host "Clearing React Native cache..."
    if (Test-Path "node_modules\.cache") { Remove-Item -Recurse -Force "node_modules\.cache" }
    if (Test-Path ".metro-cache") { Remove-Item -Recurse -Force ".metro-cache" }
    
    Write-Host "Clearing npm cache..."
    & npm cache clean --force
    
    Write-Host "Rebuilding APK..."
    Set-Location android
    & .\gradlew assembleDebug --stacktrace
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ BUILD SUCCESSFUL!" -ForegroundColor Green
        return $true
    } else {
        Write-Host ""
        Write-Host "❌ Build failed. Check the error above." -ForegroundColor Red
        return $false
    }
}

# Function for Manual Bundle
function Invoke-ManualBundle {
    Write-Host ""
    Write-Host "====================================="
    Write-Host "  Solution 2: Manual Bundle Creation"
    Write-Host "====================================="
    Write-Host ""
    
    Write-Host "Creating assets directory..."
    $assetsPath = "android\app\src\main\assets"
    if (!(Test-Path $assetsPath)) {
        New-Item -ItemType Directory -Force -Path $assetsPath | Out-Null
    }
    
    Write-Host "Creating bundle manually..."
    & npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android\app\src\main\assets\index.android.bundle --assets-dest android\app\src\main\res\
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Bundle created successfully!" -ForegroundColor Green
        Write-Host "Building APK..."
        Set-Location android
        & .\gradlew assembleDebug
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ BUILD SUCCESSFUL!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ APK build failed after bundle creation." -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "❌ Manual bundle creation failed. Check the error above." -ForegroundColor Red
        return $false
    }
}

# Function to Disable Bundle
function Invoke-DisableBundle {
    Write-Host ""
    Write-Host "======================================================="
    Write-Host "  Solution 3: Disable Bundle (Normal Debug APK)"
    Write-Host "======================================================="
    Write-Host ""
    
    Write-Host "Reverting to normal debug APK (requires Metro server)..."
    
    # Backup current build.gradle
    Copy-Item "android\app\build.gradle" "android\app\build.gradle.backup"
    
    # Modify build.gradle to enable debuggableVariants
    $content = Get-Content "android\app\build.gradle"
    $content = $content -replace 'debuggableVariants = \[\]', 'debuggableVariants = ["debug"]'
    $content | Set-Content "android\app\build.gradle"
    
    Write-Host "✅ Reverted to normal debug APK configuration" -ForegroundColor Green
    Write-Host "This APK will need Metro server running to work"
    
    Set-Location android
    & .\gradlew assembleDebug
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ BUILD SUCCESSFUL!" -ForegroundColor Green
        Write-Host ""
        Write-Host "To restore bundled debug APK later:"
        Write-Host "Copy-Item android\app\build.gradle.backup android\app\build.gradle"
        return $true
    } else {
        Write-Host "❌ Build failed." -ForegroundColor Red
        return $false
    }
}

# Function to Try All Solutions
function Invoke-TryAll {
    Write-Host ""
    Write-Host "==============================="
    Write-Host "  Solution 4: Try All Solutions"
    Write-Host "==============================="
    Write-Host ""
    
    Write-Host "Step 1: Clean build..."
    Set-Location android
    & .\gradlew clean
    Set-Location ..
    
    Write-Host "Step 2: Clear caches..."
    if (Test-Path "node_modules\.cache") { Remove-Item -Recurse -Force "node_modules\.cache" }
    if (Test-Path ".metro-cache") { Remove-Item -Recurse -Force ".metro-cache" }
    & npm cache clean --force
    
    Write-Host "Step 3: Try normal build..."
    Set-Location android
    & .\gradlew assembleDebug
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Normal build succeeded!" -ForegroundColor Green
        return $true
    } else {
        Write-Host "Normal build failed. Trying manual bundle..."
        Set-Location ..
        
        $assetsPath = "android\app\src\main\assets"
        if (!(Test-Path $assetsPath)) {
            New-Item -ItemType Directory -Force -Path $assetsPath | Out-Null
        }
        
        & npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android\app\src\main\assets\index.android.bundle --assets-dest android\app\src\main\res\
        
        Set-Location android
        & .\gradlew assembleDebug
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Manual bundle build succeeded!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ All methods failed. Check the errors above." -ForegroundColor Red
            return $false
        }
    }
}

# Function to show success message
function Show-Success {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  🎉 APK BUILD COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📁 APK Location:"
    Write-Host "android\app\build\outputs\apk\debug\app-debug.apk"
    Write-Host ""
    Write-Host "📱 This APK:"
    Write-Host "✅ Works without Metro server" -ForegroundColor Green
    Write-Host "✅ Works without WiFi connection" -ForegroundColor Green
    Write-Host "✅ Includes all debug features" -ForegroundColor Green
    Write-Host "✅ Ready for testing on any device" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 To install on your phone:"
    Write-Host "1. Transfer app-debug.apk to your phone"
    Write-Host "2. Enable 'Unknown Sources' in Android settings"
    Write-Host "3. Install the APK file"
    Write-Host "4. Launch MHT Assessment app"
}

# Main execution
try {
    $choice = Show-Menu
    $success = $false
    
    switch ($choice) {
        "1" { $success = Invoke-CleanBuild }
        "2" { $success = Invoke-ManualBundle }
        "3" { $success = Invoke-DisableBundle }
        "4" { $success = Invoke-TryAll }
    }
    
    if ($success) {
        Show-Success
    }
    
} catch {
    Write-Host "❌ An error occurred: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    # Return to original directory
    Set-Location $PSScriptRoot
    Write-Host ""
    Read-Host "Press Enter to exit"
}