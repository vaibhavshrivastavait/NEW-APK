# PowerShell Script: fix-syntax.ps1
# Purpose: Temporarily replace modern JS syntax with compatible alternatives

Write-Host "EMERGENCY JS SYNTAX FIX - MHT Assessment" -ForegroundColor Red
Write-Host "=========================================" -ForegroundColor Red

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found. Please run this from the project root." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "WARNING: This will modify your source files to remove modern JS syntax" -ForegroundColor Yellow
Write-Host "A backup will be created before making changes" -ForegroundColor Yellow
$confirm = Read-Host "Continue? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Operation cancelled" -ForegroundColor Yellow
    exit 0
}

# Create backup directory
$backupDir = "syntax-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Host "Creating backup directory: $backupDir" -ForegroundColor Cyan
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Define files to process (excluding node_modules and build directories)
$filesToProcess = Get-ChildItem -Path . -Include "*.js","*.jsx","*.ts","*.tsx" -Recurse | 
    Where-Object { $_.FullName -notmatch "node_modules|android\\build|\.expo" }

Write-Host "Found $($filesToProcess.Count) files to process" -ForegroundColor Cyan

$changedFiles = 0
$totalReplacements = 0

foreach ($file in $filesToProcess) {
    $relativePath = $file.FullName.Substring((Get-Location).Path.Length + 1)
    
    # Create backup
    $backupPath = Join-Path $backupDir $relativePath
    $backupDir = Split-Path $backupPath -Parent
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    }
    Copy-Item $file.FullName $backupPath -Force
    
    # Read content
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Count and replace optional chaining (?.) - be more careful about replacement
    $optionalChainingCount = ([regex]::Matches($content, '\?\.').Count)
    if ($optionalChainingCount -gt 0) {
        # Replace ?. with && pattern, but more carefully
        $content = $content -replace '(\w+)\?\.([\w\[\]]+)', '$1 && $1.$2'
        $content = $content -replace '(\))\?\.([\w\[\]]+)', '$1 && $1.$2'
        $content = $content -replace '(\])\?\.([\w\[\]]+)', '$1 && $1.$2'
        Write-Host "  $relativePath: $optionalChainingCount optional chaining operators" -ForegroundColor Yellow
    }
    
    # Replace nullish coalescing (??) with || operator
    $nullishCount = ([regex]::Matches($content, '\?\?').Count)
    if ($nullishCount -gt 0) {
        $content = $content -replace '\?\?', '||'
        Write-Host "  $relativePath: $nullishCount nullish coalescing operators" -ForegroundColor Yellow
    }
    
    if ($content -ne $originalContent) {
        Set-Content $file.FullName $content -NoNewline
        $changedFiles++
        $totalReplacements += ($optionalChainingCount + $nullishCount)
    }
}

Write-Host "`nSUMMARY:" -ForegroundColor Green
Write-Host "Files modified: $changedFiles" -ForegroundColor White
Write-Host "Total replacements: $totalReplacements" -ForegroundColor White
Write-Host "Backup created in: $backupDir" -ForegroundColor White

Write-Host "`nNow building APK with compatible syntax..." -ForegroundColor Cyan
try {
    & npx expo run:android --variant release --clear
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nSUCCESS: APK built with compatible syntax!" -ForegroundColor Green
        Write-Host "Test the app - it should no longer crash with syntax errors" -ForegroundColor Cyan
    } else {
        Write-Host "`nBuild failed. Check errors above." -ForegroundColor Red
    }
} catch {
    Write-Host "`nBuild failed: $($_.Exception.Message)" -ForegroundColor Red
}

Read-Host "`nPress Enter to exit"