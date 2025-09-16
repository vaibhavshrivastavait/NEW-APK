# ==================================================
# MHT ASSESSMENT - COMPLETE FIXES VERIFICATION SCRIPT
# ==================================================

Write-Host "🔍 MHT Assessment - Verifying All Applied Fixes..." -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan

$FixesFound = 0
$TotalFixes = 0
$MissingFixes = @()

# Function to check if a pattern exists in a file
function Test-FixInFile {
    param(
        [string]$FilePath,
        [string]$Pattern,
        [string]$FixName
    )
    
    $Global:TotalFixes++
    
    if (Test-Path $FilePath) {
        $Content = Get-Content $FilePath -Raw -ErrorAction SilentlyContinue
        if ($Content -match [regex]::Escape($Pattern)) {
            Write-Host "✅ $FixName" -ForegroundColor Green
            $Global:FixesFound++
            return $true
        } else {
            Write-Host "❌ $FixName - Pattern not found" -ForegroundColor Red
            $Global:MissingFixes += "$FixName in $FilePath"
            return $false
        }
    } else {
        Write-Host "❌ $FixName - File not found: $FilePath" -ForegroundColor Red
        $Global:MissingFixes += "$FixName - File missing: $FilePath"
        return $false
    }
}

Write-Host "`n🔧 CHECKING ASYNCSTORAGE IMPORT FIXES..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

Test-FixInFile "utils\enhancedTreatmentEngine.ts" "import crashProofStorage from './asyncStorageUtils';" "Enhanced Treatment Engine - AsyncStorage Import Fix"
Test-FixInFile "utils\offlineTreatmentDataManager.ts" "import crashProofStorage from './asyncStorageUtils';" "Offline Treatment Manager - AsyncStorage Import Fix"
Test-FixInFile "screens\RobustTreatmentPlanScreen.tsx" "import crashProofStorage from '../utils/asyncStorageUtils';" "Robust Treatment Plan Screen - AsyncStorage Import Fix"

Write-Host "`n🔍 CHECKING DEBUG LOGGING ADDITIONS..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

Test-FixInFile "App.tsx" "🔍 AsyncStorage module check" "App.tsx - AsyncStorage Module Debug Check"
Test-FixInFile "App.tsx" "console.log(`"🔍 AsyncStorage.getItem type:`", typeof AsyncStorage?.getItem);" "App.tsx - AsyncStorage getItem Type Check"
Test-FixInFile "screens\PatientListScreen.tsx" "🔍 PatientListScreen: Store data" "PatientListScreen - Store Data Debug Logging"
Test-FixInFile "components\SafeFlatList.tsx" "🔍 SafeFlatList render - data type" "SafeFlatList - Data Type Debug Logging"
Test-FixInFile "screens\GuidelinesScreen.tsx" "🔍 GuidelinesScreen: filteredSections" "GuidelinesScreen - Filtered Sections Debug Logging"

Write-Host "`n🛡️ CHECKING ENHANCED ERROR HANDLING..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

Test-FixInFile "components\SafeFlatList.tsx" "🚨 SafeFlatList: data prop is null/undefined, using empty array" "SafeFlatList - Null/Undefined Data Handling"
Test-FixInFile "screens\PatientListScreen.tsx" "patients = []" "PatientListScreen - Safe Destructuring with Defaults"
Test-FixInFile "screens\GuidelinesScreen.tsx" "const sections = guidelines?.sections || [];" "GuidelinesScreen - Safe Guidelines Sections Access"

Write-Host "`n📦 CHECKING STORE CONFIGURATION UPDATES..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

Test-FixInFile "store\assessmentStore.ts" "import { persist, createJSONStorage } from 'zustand/middleware';" "Assessment Store - createJSONStorage Import"
Test-FixInFile "store\assessmentStore.ts" "safeStorage" "Assessment Store - SafeStorage Wrapper Implementation"

Write-Host "`n📄 CHECKING JSON ASSET LOADING FIXES..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

Test-FixInFile "screens\GuidelinesScreen.tsx" "loadGuidelinesData" "GuidelinesScreen - APK-Compatible JSON Loading"
Test-FixInFile "screens\CmeScreen.tsx" "loadCmeContent" "CmeScreen - APK-Compatible JSON Loading"
Test-FixInFile "src\interaction-aggregator.ts" "loadDrugInteractionData" "Interaction Aggregator - APK-Compatible JSON Loading"
Test-FixInFile "components\SafeDrugInteractionChecker.tsx" "loadDrugInteractionData" "Safe Drug Interaction Checker - APK-Compatible JSON Loading"

Write-Host "`n🔄 CHECKING ADDITIONAL COMPONENT FIXES..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

Test-FixInFile "screens\CmeQuizScreen.tsx" "loadCmeContent" "CmeQuizScreen - APK-Compatible JSON Loading"
Test-FixInFile "screens\CmeCertificateScreen.tsx" "loadCmeContent" "CmeCertificateScreen - APK-Compatible JSON Loading"
Test-FixInFile "screens\CmeModuleScreen.tsx" "loadCmeContent" "CmeModuleScreen - APK-Compatible JSON Loading"

Write-Host "`n📱 CHECKING MOBILE-SPECIFIC FILES..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

if (Test-Path "store\assessmentStoreSimple.ts") {
    Write-Host "✅ Assessment Store Simple - Test Store Present" -ForegroundColor Green
    $FixesFound++
} else {
    Write-Host "⚠️  Assessment Store Simple - Test Store Not Present (Optional)" -ForegroundColor Yellow
}
$TotalFixes++

if (Test-Path "screens\PatientListScreenTest.tsx") {
    Write-Host "✅ Patient List Screen Test - Test Screen Present" -ForegroundColor Green
    $FixesFound++
} else {
    Write-Host "⚠️  Patient List Screen Test - Test Screen Not Present (Optional)" -ForegroundColor Yellow
}
$TotalFixes++

Write-Host "`n📋 CHECKING CRITICAL PROJECT FILES..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$CriticalFiles = @(
    "package.json",
    "app.json", 
    "metro.config.js",
    "babel.config.js"
)

foreach ($File in $CriticalFiles) {
    $TotalFixes++
    if (Test-Path $File) {
        Write-Host "✅ $File - Present" -ForegroundColor Green
        $FixesFound++
    } else {
        Write-Host "❌ $File - Missing" -ForegroundColor Red
        $MissingFixes += "Critical file missing: $File"
    }
}

Write-Host "`n🎯 CHECKING ASSET FILES..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$AssetFiles = @(
    "assets\guidelines.json",
    "assets\cme-content-merged.json",
    "assets\rules\drug_interactions.json"
)

foreach ($Asset in $AssetFiles) {
    $TotalFixes++
    if (Test-Path $Asset) {
        Write-Host "✅ $Asset - Present" -ForegroundColor Green
        $FixesFound++
    } else {
        Write-Host "❌ $Asset - Missing" -ForegroundColor Red
        $MissingFixes += "Asset file missing: $Asset"
    }
}

Write-Host "`n🏗️ CHECKING BUILD CONFIGURATION..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

if (Test-Path "android\app\build.gradle") {
    $BuildGradle = Get-Content "android\app\build.gradle" -Raw
    $TotalFixes++
    if ($BuildGradle -match "enableHermes.*true") {
        Write-Host "✅ Hermes Enabled in build.gradle" -ForegroundColor Green
        $FixesFound++
    } else {
        Write-Host "⚠️  Hermes Status Unknown in build.gradle" -ForegroundColor Yellow
        $MissingFixes += "Hermes configuration not confirmed"
    }
} else {
    Write-Host "❌ android\app\build.gradle - Missing" -ForegroundColor Red
    $TotalFixes++
    $MissingFixes += "Android build configuration missing"
}

Write-Host "`n" -NoNewline
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "🎯 VERIFICATION SUMMARY" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan

$SuccessRate = [math]::Round(($FixesFound / $TotalFixes) * 100, 1)

if ($SuccessRate -ge 90) {
    Write-Host "🎉 EXCELLENT: $FixesFound/$TotalFixes fixes present ($SuccessRate%)" -ForegroundColor Green
    Write-Host "✅ Ready for comprehensive testing!" -ForegroundColor Green
} elseif ($SuccessRate -ge 75) {
    Write-Host "⚠️  GOOD: $FixesFound/$TotalFixes fixes present ($SuccessRate%)" -ForegroundColor Yellow
    Write-Host "⚠️  Some fixes missing but should work partially" -ForegroundColor Yellow
} else {
    Write-Host "❌ INCOMPLETE: $FixesFound/$TotalFixes fixes present ($SuccessRate%)" -ForegroundColor Red
    Write-Host "❌ Critical fixes missing - manual application required" -ForegroundColor Red
}

Write-Host "`n📋 NEXT STEPS:" -ForegroundColor Cyan

if ($SuccessRate -ge 90) {
    Write-Host "1. ✅ All fixes verified - proceed with APK build" -ForegroundColor Green
    Write-Host "2. 🏗️  Run: npx expo run:android --variant debug" -ForegroundColor White
    Write-Host "3. 📱 Test on device and collect logs starting with 🔍" -ForegroundColor White
} elseif ($SuccessRate -ge 75) {
    Write-Host "1. ⚠️  Apply missing fixes manually (see list below)" -ForegroundColor Yellow
    Write-Host "2. 🔄 Re-run this verification script" -ForegroundColor White
    Write-Host "3. 🏗️  Build APK after all fixes confirmed" -ForegroundColor White
} else {
    Write-Host "1. ❌ Major fixes missing - check repository sync" -ForegroundColor Red
    Write-Host "2. 📥 Re-clone from https://github.com/vaibhavshrivastavait/NEW-APK.git" -ForegroundColor White  
    Write-Host "3. 🔄 Re-run this verification script" -ForegroundColor White
}

if ($MissingFixes.Count -gt 0) {
    Write-Host "`n❌ MISSING FIXES:" -ForegroundColor Red
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    foreach ($Missing in $MissingFixes) {
        Write-Host "   • $Missing" -ForegroundColor Red
    }
}

Write-Host "`n🔍 DEBUG LOG PATTERNS TO LOOK FOR:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "When testing APK, you should see:" -ForegroundColor White
Write-Host "• 🔍 AsyncStorage module check: [object Object]" -ForegroundColor Gray
Write-Host "• 🔍 AsyncStorage.getItem type: function" -ForegroundColor Gray  
Write-Host "• 🔍 PatientListScreen: Store data: {...}" -ForegroundColor Gray
Write-Host "• 🔍 SafeFlatList render - data type: object" -ForegroundColor Gray
Write-Host "• 🔍 GuidelinesScreen: filteredSections - guidelines: {...}" -ForegroundColor Gray

Write-Host "`n🎯 VERIFICATION COMPLETE!" -ForegroundColor Green
Write-Host "Save this output and proceed based on the success rate above." -ForegroundColor White

# Save results to file
$ResultsFile = "verification-results-$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss').txt"
"MHT Assessment Fixes Verification Results`n" | Out-File $ResultsFile
"Success Rate: $SuccessRate% ($FixesFound/$TotalFixes)`n" | Out-File $ResultsFile -Append
"Missing Fixes:`n" | Out-File $ResultsFile -Append
$MissingFixes | Out-File $ResultsFile -Append

Write-Host "`n💾 Results saved to: $ResultsFile" -ForegroundColor Cyan