# PowerShell Script: emergency-build-fix.ps1
# Purpose: Emergency fix for build issues

Write-Host "EMERGENCY BUILD FIX - MHT Assessment" -ForegroundColor Red
Write-Host "===================================" -ForegroundColor Red

# Step 1: Restore backup if available
$backups = Get-ChildItem -Directory -Name "syntax-backup-*" | Sort-Object -Descending
if ($backups.Count -gt 0) {
    $backupDir = $backups[0]
    Write-Host "Restoring from backup: $backupDir" -ForegroundColor Cyan
    
    Get-ChildItem -Path $backupDir -Recurse -File | ForEach-Object {
        $relativePath = $_.FullName.Substring((Get-Location).Path.Length + $backupDir.Length + 2)
        $targetDir = Split-Path $relativePath -Parent
        if ($targetDir -and -not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }
        Copy-Item $_.FullName $relativePath -Force
    }
    Write-Host "Files restored successfully" -ForegroundColor Green
}

# Step 2: Force disable Hermes completely
Write-Host "`nStep 2: Forcing Hermes disable..." -ForegroundColor Yellow

# Update android/gradle.properties
$gradleProps = Get-Content "android\gradle.properties" -Raw
$gradleProps = $gradleProps -replace "hermesEnabled=true", "hermesEnabled=false"
if ($gradleProps -notmatch "hermesEnabled=false") {
    $gradleProps += "`nhermesEnabled=false`n"
}
Set-Content "android\gradle.properties" $gradleProps -NoNewline

# Step 3: Clean everything aggressively
Write-Host "`nStep 3: Aggressive cleanup..." -ForegroundColor Yellow
& npx expo r -c

if (Test-Path "android") {
    Push-Location "android"
    & ./gradlew clean
    Pop-Location
}

# Step 4: Try debug build first (much more likely to succeed)
Write-Host "`nStep 4: Attempting DEBUG build (safer)..." -ForegroundColor Cyan
try {
    & npx expo run:android --variant debug
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nSUCCESS: Debug build completed!" -ForegroundColor Green
        Write-Host "Test the app with this debug version first" -ForegroundColor Cyan
        Read-Host "`nPress Enter to continue to Release build, or Ctrl+C to stop here"
        
        # If debug worked, try release
        Write-Host "`nStep 5: Attempting RELEASE build..." -ForegroundColor Cyan
        & npx expo run:android --variant release
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`nSUCCESS: Release build also completed!" -ForegroundColor Green
        } else {
            Write-Host "`nRelease build failed, but DEBUG version should work" -ForegroundColor Yellow
        }
    } else {
        Write-Host "`nDebug build failed. Trying alternative approach..." -ForegroundColor Yellow
        
        # Alternative: Try building JavaScript bundle separately
        Write-Host "Trying to build JS bundle separately..." -ForegroundColor Cyan
        & npx expo export:embed --platform android --dev true
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "JS bundle created successfully, trying build again..." -ForegroundColor Green
            & npx expo run:android --variant debug --no-build-cache
        }
    }
} catch {
    Write-Host "`nBuild failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Check the error messages above for specific issues" -ForegroundColor Yellow
}

Read-Host "`nPress Enter to exit"