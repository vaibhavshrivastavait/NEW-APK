# ==================================================
# APPLY MISSING FIXES AUTOMATICALLY
# ==================================================

Write-Host "🔧 Applying Missing MHT Assessment Fixes..." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan

$FixesApplied = 0

# Function to apply a fix to a file
function Apply-Fix {
    param(
        [string]$FilePath,
        [string]$SearchPattern, 
        [string]$ReplacePattern,
        [string]$FixName,
        [string]$AddAtEnd = $null
    )

    if (-not (Test-Path $FilePath)) {
        Write-Host "❌ $FixName - File not found: $FilePath" -ForegroundColor Red
        return $false
    }

    try {
        $Content = Get-Content $FilePath -Raw
        
        if ($AddAtEnd -and $Content -notmatch [regex]::Escape($AddAtEnd)) {
            # Add content at the end of imports section or beginning
            if ($Content -match "import.*from.*;" -and $Content -match "(?s)(import.*?;)(\s*\n)") {
                $Content = $Content -replace "(import.*?;\s*\n)", "`$1`n$AddAtEnd`n"
            } else {
                $Content = "$AddAtEnd`n$Content"
            }
            $Content | Set-Content $FilePath -NoNewline
            Write-Host "✅ $FixName - Applied (Added)" -ForegroundColor Green
            $Global:FixesApplied++
            return $true
        }
        
        if ($SearchPattern -and $ReplacePattern -and $Content -match [regex]::Escape($SearchPattern)) {
            $Content = $Content -replace [regex]::Escape($SearchPattern), $ReplacePattern
            $Content | Set-Content $FilePath -NoNewline
            Write-Host "✅ $FixName - Applied (Replaced)" -ForegroundColor Green
            $Global:FixesApplied++
            return $true
        }
        
        if ($SearchPattern -and $Content -notmatch [regex]::Escape($SearchPattern)) {
            Write-Host "⚠️  $FixName - Pattern not found, manual fix needed" -ForegroundColor Yellow
            return $false
        }

        Write-Host "ℹ️  $FixName - Already present" -ForegroundColor Blue
        return $true
        
    } catch {
        Write-Host "❌ $FixName - Error applying fix: $_" -ForegroundColor Red
        return $false
    }
}

Write-Host "`n🔧 APPLYING ASYNCSTORAGE IMPORT FIXES..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

Apply-Fix "utils\enhancedTreatmentEngine.ts" "import { crashProofStorage } from './asyncStorageUtils';" "import crashProofStorage from './asyncStorageUtils';" "Enhanced Treatment Engine AsyncStorage Import"

Apply-Fix "utils\offlineTreatmentDataManager.ts" "import { crashProofStorage } from './asyncStorageUtils';" "import crashProofStorage from './asyncStorageUtils';" "Offline Treatment Manager AsyncStorage Import"

Apply-Fix "screens\RobustTreatmentPlanScreen.tsx" "import { crashProofStorage } from '../utils/asyncStorageUtils';" "import crashProofStorage from '../utils/asyncStorageUtils';" "Robust Treatment Plan Screen AsyncStorage Import"

Write-Host "`n🔍 APPLYING DEBUG LOGGING..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

# App.tsx debug logging
$AppDebugCode = @"
// 🔍 DEBUG: AsyncStorage availability check (ChatGPT suggestion)
import AsyncStorage from '@react-native-async-storage/async-storage';
console.log("🔍 AsyncStorage module check:", AsyncStorage);
console.log("🔍 AsyncStorage.getItem type:", typeof AsyncStorage?.getItem);
console.log("🔍 AsyncStorage.setItem type:", typeof AsyncStorage?.setItem);
"@

Apply-Fix "App.tsx" "" "" "App.tsx AsyncStorage Debug Logging" $AppDebugCode

# PatientListScreen.tsx debug logging
if (Test-Path "screens\PatientListScreen.tsx") {
    $PatientContent = Get-Content "screens\PatientListScreen.tsx" -Raw
    if ($PatientContent -notmatch "🔍 PatientListScreen: Store data") {
        # Apply the store data fix
        $PatientContent = $PatientContent -replace "const \{ patients, deletePatient, deleteAllPatients \} = useAssessmentStore\(\);", @"
// 🔧 CRITICAL FIX: Handle store initialization failures
  const storeData = useAssessmentStore();
  console.log("🔍 PatientListScreen: Store data:", storeData);
  
  const { 
    patients = [], 
    deletePatient = () => {}, 
    deleteAllPatients = () => {} 
  } = storeData || {};
"@
        $PatientContent | Set-Content "screens\PatientListScreen.tsx" -NoNewline
        Write-Host "✅ PatientListScreen Debug & Safe Store Access - Applied" -ForegroundColor Green
        $FixesApplied++
    } else {
        Write-Host "ℹ️  PatientListScreen Debug - Already present" -ForegroundColor Blue
    }
}

# SafeFlatList.tsx debug logging
if (Test-Path "components\SafeFlatList.tsx") {
    $SafeListContent = Get-Content "components\SafeFlatList.tsx" -Raw
    if ($SafeListContent -notmatch "🔍 SafeFlatList render") {
        # Apply the safe data handling
        $SafeDataCode = @"
    // 🔧 CRITICAL FIX: Handle completely undefined data prop
    console.log("🔍 SafeFlatList render - data type:", typeof this.props.data, "data:", this.props.data);
    
    // Ensure data is always an array to prevent crashes
    let safeData;
    if (this.props.data === undefined || this.props.data === null) {
      console.warn("🚨 SafeFlatList: data prop is null/undefined, using empty array");
      safeData = [];
    } else if (Array.isArray(this.props.data)) {
      safeData = this.props.data;
    } else {
      console.warn("🚨 SafeFlatList: data prop is not an array, converting:", typeof this.props.data);
      safeData = [];
    }

    const safeProps = {
      ...this.props,
      data: safeData
    };

    // Safely render FlatList - let React handle other errors naturally
    return <FlatList {...safeProps} />;
"@
        
        $SafeListContent = $SafeListContent -replace "// Ensure data is always an array to prevent crashes[\s\S]*?return <FlatList \{\.\.\.[^}]*\} />;", $SafeDataCode
        $SafeListContent | Set-Content "components\SafeFlatList.tsx" -NoNewline
        Write-Host "✅ SafeFlatList Safe Data Handling - Applied" -ForegroundColor Green
        $FixesApplied++
    } else {
        Write-Host "ℹ️  SafeFlatList Debug - Already present" -ForegroundColor Blue
    }
}

Write-Host "`n🛡️ APPLYING ENHANCED ERROR HANDLING..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

# GuidelinesScreen.tsx safe sections
if (Test-Path "screens\GuidelinesScreen.tsx") {
    $GuideContent = Get-Content "screens\GuidelinesScreen.tsx" -Raw
    if ($GuideContent -notmatch "🔍 GuidelinesScreen: filteredSections") {
        $SafeFilterCode = @"
  // Search functionality with safe fallback
  const filteredSections = useMemo(() => {
    // 🔧 CRITICAL FIX: Handle undefined guidelines.sections
    console.log("🔍 GuidelinesScreen: filteredSections - guidelines:", guidelines);
    console.log("🔍 GuidelinesScreen: guidelines.sections type:", typeof guidelines?.sections);
    
    const sections = guidelines?.sections || [];
    if (!searchQuery.trim()) return sections;
    
    const query = searchQuery.toLowerCase();
    return sections.filter(section =>
      section.title.toLowerCase().includes(query) ||
      section.body_md.toLowerCase().includes(query) ||
      section.bullets.some(bullet => bullet.toLowerCase().includes(query)) ||
      section.tables.some(table => 
        table.title.toLowerCase().includes(query) ||
        table.rows.some(row => row.some(cell => cell.toLowerCase().includes(query)))
      )
    );
  }, [searchQuery, guidelines?.sections]);
"@
        
        $GuideContent = $GuideContent -replace "// Search functionality[\s\S]*?\}, \[searchQuery, guidelines\.sections\]\);", $SafeFilterCode
        $GuideContent | Set-Content "screens\GuidelinesScreen.tsx" -NoNewline
        Write-Host "✅ GuidelinesScreen Safe Sections - Applied" -ForegroundColor Green
        $FixesApplied++
    } else {
        Write-Host "ℹ️  GuidelinesScreen Safe Sections - Already present" -ForegroundColor Blue
    }
}

Write-Host "`n📦 VERIFYING KEY FILES EXIST..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$KeyFiles = @(
    "package.json",
    "app.json",
    "assets\guidelines.json",
    "assets\rules\drug_interactions.json"
)

foreach ($File in $KeyFiles) {
    if (Test-Path $File) {
        Write-Host "✅ $File - Present" -ForegroundColor Green
    } else {
        Write-Host "❌ $File - MISSING (Critical)" -ForegroundColor Red
    }
}

Write-Host "`n" -NoNewline
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "🎯 FIXES APPLICATION SUMMARY" -ForegroundColor Green  
Write-Host "===================================================" -ForegroundColor Cyan

if ($FixesApplied -gt 0) {
    Write-Host "🎉 Applied $FixesApplied fixes successfully!" -ForegroundColor Green
    Write-Host "✅ Run verification: .\quick-fix-check.ps1" -ForegroundColor Green
    Write-Host "✅ Then build APK: npx expo run:android --variant debug" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No fixes needed to be applied" -ForegroundColor Blue
    Write-Host "✅ All fixes already present - ready to build!" -ForegroundColor Green
}

Write-Host "`n📋 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Run quick verification: .\quick-fix-check.ps1" -ForegroundColor White
Write-Host "2. Build and test APK" -ForegroundColor White
Write-Host "3. Look for debug logs starting with 🔍" -ForegroundColor White

Write-Host ""