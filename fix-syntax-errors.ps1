# PowerShell Script: fix-syntax-errors.ps1
# Purpose: Fix specific syntax errors and clear caches

Write-Host "SYNTAX ERROR FIX - MHT Assessment" -ForegroundColor Red
Write-Host "=================================" -ForegroundColor Red

# Step 1: Look for and fix malformed syntax patterns
Write-Host "Step 1: Checking for malformed syntax patterns..." -ForegroundColor Yellow

$fixedFiles = 0
$filesToCheck = Get-ChildItem -Path . -Include "*.js","*.jsx","*.ts","*.tsx" -Recurse | 
    Where-Object { $_.FullName -notmatch "node_modules|android\\build|\.expo" }

foreach ($file in $filesToCheck) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Fix specific malformed patterns
    # Pattern: someVar.[index] && ].property
    $content = $content -replace '(\w+)\.\[(\d+)\]\s*&&\s*\]\.(\w+)', '$1 && $1[$2] && $1[$2].$3'
    
    # Pattern: .[index] && ].property (missing variable reference)
    $content = $content -replace '\.\[(\d+)\]\s*&&\s*\]\.(\w+)', '[$1] && this[$1].$2'
    
    # Pattern: variable.&& (malformed)
    $content = $content -replace '(\w+)\.&&', '$1 &&'
    
    # Pattern: &&]. (malformed)
    $content = $content -replace '&&\s*\]\.', '&& obj.'
    
    if ($content -ne $originalContent) {
        Set-Content $file.FullName $content -NoNewline
        $relativePath = $file.FullName.Substring((Get-Location).Path.Length + 1)
        Write-Host "Fixed syntax in: $relativePath" -ForegroundColor Green
        $fixedFiles++
    }
}

Write-Host "Fixed $fixedFiles files with syntax errors" -ForegroundColor Cyan

# Step 2: Clear all possible caches
Write-Host "`nStep 2: Clearing all caches..." -ForegroundColor Yellow

# Clear Metro cache
try {
    & npx expo install --fix
    Write-Host "Expo dependencies fixed" -ForegroundColor Green
} catch {
    Write-Host "Warning: Could not fix expo dependencies" -ForegroundColor Yellow
}

# Clear npm cache
& npm cache clean --force
Write-Host "NPM cache cleared" -ForegroundColor Green

# Clear .expo folder
if (Test-Path ".expo") {
    Remove-Item -Recurse -Force ".expo"
    Write-Host ".expo folder cleared" -ForegroundColor Green
}

# Clear Android build folders
if (Test-Path "android\build") {
    Remove-Item -Recurse -Force "android\build"
    Write-Host "Android build folder cleared" -ForegroundColor Green
}

if (Test-Path "android\app\build") {
    Remove-Item -Recurse -Force "android\app\build"
    Write-Host "Android app build folder cleared" -ForegroundColor Green
}

# Clean Gradle
if (Test-Path "android") {
    Push-Location "android"
    & ./gradlew clean
    Write-Host "Gradle clean completed" -ForegroundColor Green
    Pop-Location
}

Write-Host "`nStep 3: Ready to build!" -ForegroundColor Green
Write-Host "Now run: npx expo run:android --variant debug --clear" -ForegroundColor Cyan

Read-Host "`nPress Enter to exit"