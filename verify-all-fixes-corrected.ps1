# ==================================================
# MHT ASSESSMENT - COMPLETE FIXES VERIFICATION SCRIPT
# ==================================================

Write-Host "Verifying MHT Assessment - All Applied Fixes..." -ForegroundColor Green
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
            Write-Host "OK $FixName" -ForegroundColor Green
            $Global:FixesFound++
            return $true
        } else {
            Write-Host "MISSING $FixName - Pattern not found" -ForegroundColor Red
            $Global:MissingFixes += "$FixName in $FilePath"
            return $false
        }
    } else {
        Write-Host "MISSING $FixName - File not found: $FilePath" -ForegroundColor Red
        $Global:MissingFixes += "$FixName - File missing: $FilePath"
        return $false
    }
}

Write-Host "`nCHECKING ASYNCSTORAGE IMPORT FIXES..." -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor DarkGray

Test-FixInFile "utils\enhancedTreatmentEngine.ts" "import crashProofStorage from './asyncStorageUtils';" "Enhanced Treatment Engine - AsyncStorage Import Fix"
Test-FixInFile "utils\offlineTreatmentDataManager.ts" "import crashProofStorage from './asyncStorageUtils';" "Offline Treatment Manager - AsyncStorage Import Fix"
Test-FixInFile "screens\RobustTreatmentPlanScreen.tsx" "import crashProofStorage from '../utils/asyncStorageUtils';" "Robust Treatment Plan Screen - AsyncStorage Import Fix"

Write-Host "`nCHECKING DEBUG LOGGING ADDITIONS..." -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor DarkGray

Test-FixInFile "App.tsx" "AsyncStorage module check" "App.tsx - AsyncStorage Module Debug Check"
Test-FixInFile "App.tsx" "AsyncStorage.getItem type" "App.tsx - AsyncStorage getItem Type Check"
Test-FixInFile "screens\PatientListScreen.tsx" "PatientListScreen: Store data" "PatientListScreen - Store Data Debug Logging"
Test-FixInFile "components\SafeFlatList.tsx" "SafeFlatList render - data type" "SafeFlatList - Data Type Debug Logging"
Test-FixInFile "screens\GuidelinesScreen.tsx" "GuidelinesScreen: filteredSections" "GuidelinesScreen - Filtered Sections Debug Logging"

Write-Host "`nCHECKING ENHANCED ERROR HANDLING..." -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor DarkGray

Test-FixInFile "components\SafeFlatList.tsx" "SafeFlatList: data prop is null/undefined, using empty array" "SafeFlatList - Null/Undefined Data Handling"
Test-FixInFile "screens\PatientListScreen.tsx" "patients = []" "PatientListScreen - Safe Destructuring with Defaults"
Test-FixInFile "screens\GuidelinesScreen.tsx" "const sections = guidelines?.sections || [];" "GuidelinesScreen - Safe Guidelines Sections Access"

Write-Host "`nCHECKING STORE CONFIGURATION UPDATES..." -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor DarkGray

Test-FixInFile "store\assessmentStore.ts" "createJSONStorage" "Assessment Store - createJSONStorage Import"
Test-FixInFile "store\assessmentStore.ts" "safeStorage" "Assessment Store - SafeStorage Wrapper Implementation"

Write-Host "`nCHECKING JSON ASSET LOADING FIXES..." -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor DarkGray

Test-FixInFile "screens\GuidelinesScreen.tsx" "loadGuidelinesData" "GuidelinesScreen - APK-Compatible JSON Loading"
Test-FixInFile "screens\CmeScreen.tsx" "loadCmeContent" "CmeScreen - APK-Compatible JSON Loading"
Test-FixInFile "src\interaction-aggregator.ts" "loadDrugInteractionData" "Interaction Aggregator - APK-Compatible JSON Loading"
Test-FixInFile "components\SafeDrugInteractionChecker.tsx" "loadDrugInteractionData" "Safe Drug Interaction Checker - APK-Compatible JSON Loading"

Write-Host "`nCHECKING ADDITIONAL COMPONENT FIXES..." -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor DarkGray

Test-FixInFile "screens\CmeQuizScreen.tsx" "loadCmeContent" "CmeQuizScreen - APK-Compatible JSON Loading"
Test-FixInFile "screens\CmeCertificateScreen.tsx" "loadCmeContent" "CmeCertificateScreen - APK-Compatible JSON Loading"
Test-FixInFile "screens\CmeModuleScreen.tsx" "loadCmeContent" "CmeModuleScreen - APK-Compatible JSON Loading"

Write-Host "`nCHECKING MOBILE-SPECIFIC FILES..." -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor DarkGray

if (Test-Path "store\assessmentStoreSimple.ts") {
    Write-Host "OK Assessment Store Simple - Test Store Present" -ForegroundColor Green
    $FixesFound++
} else {
    Write-Host "OPTIONAL Assessment Store Simple - Test Store Not Present (Optional)" -ForegroundColor Yellow
}
$TotalFixes++

if (Test-Path "screens\PatientListScreenTest.tsx") {
    Write-Host "OK Patient List Screen Test - Test Screen Present" -ForegroundColor Green
    $FixesFound++
} else {
    Write-Host "OPTIONAL Patient List Screen Test - Test Screen Not Present (Optional)" -ForegroundColor Yellow
}
$TotalFixes++

Write-Host "`nCHECKING CRITICAL PROJECT FILES..." -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor DarkGray

$CriticalFiles = @(
    "package.json",
    "app.json", 
    "metro.config.js",
    "babel.config.js"
)

foreach ($File in $CriticalFiles) {
    $TotalFixes++
    if (Test-Path $File) {
        Write-Host "OK $File - Present" -ForegroundColor Green
        $FixesFound++
    } else {
        Write-Host "MISSING $File - Missing" -ForegroundColor Red
        $MissingFixes += "Critical file missing: $File"
    }
}

Write-Host "`nCHECKING ASSET FILES..." -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor DarkGray

$AssetFiles = @(
    "assets\guidelines.json",
    "assets\cme-content-merged.json",
    "assets\rules\drug_interactions.json"
)

foreach ($Asset in $AssetFiles) {
    $TotalFixes++
    if (Test-Path $Asset) {
        Write-Host "OK $Asset - Present" -ForegroundColor Green
        $FixesFound++
    } else {
        Write-Host "MISSING $Asset - Missing" -ForegroundColor Red
        $MissingFixes += "Asset file missing: $Asset"
    }
}

Write-Host "`nCHECKING BUILD CONFIGURATION..." -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor DarkGray

if (Test-Path "android\app\build.gradle") {
    $BuildGradle = Get-Content "android\app\build.gradle" -Raw
    $TotalFixes++
    if ($BuildGradle -match "enableHermes.*true") {
        Write-Host "OK Hermes Enabled in build.gradle" -ForegroundColor Green
        $FixesFound++
    } else {
        Write-Host "UNKNOWN Hermes Status Unknown in build.gradle" -ForegroundColor Yellow
        $MissingFixes += "Hermes configuration not confirmed"
    }
} else {
    Write-Host "MISSING android\app\build.gradle - Missing" -ForegroundColor Red
    $TotalFixes++
    $MissingFixes += "Android build configuration missing"
}

Write-Host "`n"
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "VERIFICATION SUMMARY" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan

$SuccessRate = [math]::Round(($FixesFound / $TotalFixes) * 100, 1)

if ($SuccessRate -ge 90) {
    Write-Host "EXCELLENT: $FixesFound/$TotalFixes fixes present ($SuccessRate percent)" -ForegroundColor Green
    Write-Host "Ready for comprehensive testing!" -ForegroundColor Green
} elseif ($SuccessRate -ge 75) {
    Write-Host "GOOD: $FixesFound/$TotalFixes fixes present ($SuccessRate percent)" -ForegroundColor Yellow
    Write-Host "Some fixes missing but should work partially" -ForegroundColor Yellow
} else {
    Write-Host "INCOMPLETE: $FixesFound/$TotalFixes fixes present ($SuccessRate percent)" -ForegroundColor Red
    Write-Host "Critical fixes missing - manual application required" -ForegroundColor Red
}

Write-Host "`nNEXT STEPS:" -ForegroundColor Cyan

if ($SuccessRate -ge 90) {
    Write-Host "1. All fixes verified - proceed with APK build" -ForegroundColor Green
    Write-Host "2. Run: npx expo run:android --variant debug" -ForegroundColor White
    Write-Host "3. Test on device and collect logs" -ForegroundColor White
} elseif ($SuccessRate -ge 75) {
    Write-Host "1. Apply missing fixes manually (see list below)" -ForegroundColor Yellow
    Write-Host "2. Re-run this verification script" -ForegroundColor White
    Write-Host "3. Build APK after all fixes confirmed" -ForegroundColor White
} else {
    Write-Host "1. Major fixes missing - check repository sync" -ForegroundColor Red
    Write-Host "2. Re-clone from repository" -ForegroundColor White  
    Write-Host "3. Re-run this verification script" -ForegroundColor White
}

if ($MissingFixes.Count -gt 0) {
    Write-Host "`nMISSING FIXES:" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor DarkGray
    foreach ($Missing in $MissingFixes) {
        Write-Host "   - $Missing" -ForegroundColor Red
    }
}

Write-Host "`nDEBUG LOG PATTERNS TO LOOK FOR:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor DarkGray
Write-Host "When testing APK, you should see:" -ForegroundColor White
Write-Host "- AsyncStorage module check: [object Object]" -ForegroundColor Gray
Write-Host "- AsyncStorage.getItem type: function" -ForegroundColor Gray  
Write-Host "- PatientListScreen: Store data: {...}" -ForegroundColor Gray
Write-Host "- SafeFlatList render - data type: object" -ForegroundColor Gray
Write-Host "- GuidelinesScreen: filteredSections - guidelines: {...}" -ForegroundColor Gray

Write-Host "`nVERIFICATION COMPLETE!" -ForegroundColor Green
Write-Host "Save this output and proceed based on the success rate above." -ForegroundColor White

# Save results to file
$ResultsFile = "verification-results-$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss').txt"
"MHT Assessment Fixes Verification Results`n" | Out-File $ResultsFile
"Success Rate: $SuccessRate percent ($FixesFound/$TotalFixes)`n" | Out-File $ResultsFile -Append
"Missing Fixes:`n" | Out-File $ResultsFile -Append
$MissingFixes | Out-File $ResultsFile -Append

Write-Host "`nResults saved to: $ResultsFile" -ForegroundColor Cyan