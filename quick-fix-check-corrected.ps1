# ==================================================
# QUICK FIX VERIFICATION - Essential Checks Only
# ==================================================

Write-Host "Quick Fix Verification for MHT Assessment" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan

$AllGood = $true

Write-Host "`nChecking Critical AsyncStorage Import Fixes..." -ForegroundColor Yellow

$CriticalFiles = @(
    @{File="utils\enhancedTreatmentEngine.ts"; Pattern="import crashProofStorage from './asyncStorageUtils';"; Name="Enhanced Treatment Engine"},
    @{File="utils\offlineTreatmentDataManager.ts"; Pattern="import crashProofStorage from './asyncStorageUtils';"; Name="Offline Treatment Manager"}, 
    @{File="screens\RobustTreatmentPlanScreen.tsx"; Pattern="import crashProofStorage from '../utils/asyncStorageUtils';"; Name="Robust Treatment Plan Screen"}
)

foreach ($Check in $CriticalFiles) {
    if (Test-Path $Check.File) {
        $Content = Get-Content $Check.File -Raw -ErrorAction SilentlyContinue
        if ($Content -match [regex]::Escape($Check.Pattern)) {
            Write-Host "OK $($Check.Name)" -ForegroundColor Green
        } else {
            Write-Host "MISSING $($Check.Name) - MISSING IMPORT FIX" -ForegroundColor Red
            $AllGood = $false
        }
    } else {
        Write-Host "MISSING $($Check.Name) - FILE NOT FOUND" -ForegroundColor Red
        $AllGood = $false
    }
}

Write-Host "`nChecking Essential Debug Logging..." -ForegroundColor Yellow

$DebugChecks = @(
    @{File="App.tsx"; Pattern="AsyncStorage module check"; Name="App.tsx AsyncStorage Debug"},
    @{File="screens\PatientListScreen.tsx"; Pattern="PatientListScreen: Store data"; Name="PatientListScreen Debug"},
    @{File="components\SafeFlatList.tsx"; Pattern="SafeFlatList render"; Name="SafeFlatList Debug"}
)

foreach ($Check in $DebugChecks) {
    if (Test-Path $Check.File) {
        $Content = Get-Content $Check.File -Raw -ErrorAction SilentlyContinue
        if ($Content -match [regex]::Escape($Check.Pattern)) {
            Write-Host "OK $($Check.Name)" -ForegroundColor Green
        } else {
            Write-Host "MISSING $($Check.Name) - MISSING DEBUG CODE" -ForegroundColor Red
            $AllGood = $false
        }
    } else {
        Write-Host "MISSING $($Check.Name) - FILE NOT FOUND" -ForegroundColor Red
        $AllGood = $false
    }
}

Write-Host "`n"
if ($AllGood) {
    Write-Host "SUCCESS: ALL CRITICAL FIXES PRESENT!" -ForegroundColor Green
    Write-Host "Ready to build APK and test" -ForegroundColor Green
    Write-Host "`nNext Steps:" -ForegroundColor Cyan
    Write-Host "1. Run: npx expo run:android --variant debug" -ForegroundColor White
    Write-Host "2. Look for debug logs with AsyncStorage module check" -ForegroundColor White
    Write-Host "3. Test Patient Records and MHT Guidelines screens" -ForegroundColor White
} else {
    Write-Host "CRITICAL FIXES MISSING!" -ForegroundColor Red
    Write-Host "Run the full verification script for details" -ForegroundColor Yellow
    Write-Host "Or apply fixes manually" -ForegroundColor Yellow
}

Write-Host ""