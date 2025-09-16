# Quick script to create the fixed PowerShell checker
$fixedContent = @'
param(
    [switch]$Detailed,
    [switch]$ExportReport
)

# Windows Prerequisite Checker - MHT Assessment (Fixed for PowerShell 5.1+)
$ErrorActionPreference = "SilentlyContinue"
$global:checkResults = @()

function Write-Success { param([string]$Message); Write-Host "[✓] $Message" -ForegroundColor Green }
function Write-Error-Custom { param([string]$Message); Write-Host "[✗] $Message" -ForegroundColor Red }
function Write-Warning-Custom { param([string]$Message); Write-Host "[!] $Message" -ForegroundColor Yellow }
function Write-Info { param([string]$Message); Write-Host "[i] $Message" -ForegroundColor Cyan }

function Add-CheckResult {
    param([string]$Component, [string]$Status, [string]$Details, [string]$Path = "")
    $global:checkResults += [PSCustomObject]@{ Component = $Component; Status = $Status; Details = $Details; Path = $Path }
}

function Test-Command { param([string]$Command); try { $null = Get-Command $Command -ErrorAction Stop; return $true } catch { return $false } }

function Get-CommandVersion {
    param([string]$Command, [string]$VersionArg = "--version")
    try { $output = & $Command $VersionArg 2>$null; if ($output) { return $output[0] }; return "Unknown" } catch { return "Not found" }
}

Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  🔍 WINDOWS PREREQUISITE CHECKER - MHT Assessment (Fixed)" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Magenta

# Check Node.js
Write-Info "Checking Node.js..."
if (Test-Command "node") { $nodeVersion = Get-CommandVersion "node" "-v"; Write-Success "Node.js: $nodeVersion"; Add-CheckResult "Node.js" "PASS" "Node.js is installed" "Version: $nodeVersion" } 
else { Write-Error-Custom "Node.js: Not found"; Add-CheckResult "Node.js" "FAIL" "Node.js is not installed" "" }

# Check npm
Write-Info "Checking npm..."
if (Test-Command "npm") { $npmVersion = Get-CommandVersion "npm" "-v"; Write-Success "npm: $npmVersion"; Add-CheckResult "npm" "PASS" "npm is installed" "Version: $npmVersion" }
else { Write-Error-Custom "npm: Not found"; Add-CheckResult "npm" "FAIL" "npm is not installed" "" }

# Check Git
Write-Info "Checking Git..."
if (Test-Command "git") { $gitVersion = Get-CommandVersion "git" "--version"; Write-Success "Git: $gitVersion"; Add-CheckResult "Git" "PASS" "Git is installed" "Version: $gitVersion" }
else { Write-Error-Custom "Git: Not found"; Add-CheckResult "Git" "FAIL" "Git is not installed" "" }

# Check Java
Write-Info "Checking Java..."
if (Test-Command "java") {
    $javaVersion = Get-CommandVersion "java" "-version"
    Write-Success "Java: $javaVersion"
    Add-CheckResult "Java" "PASS" "Java is installed" "Version: $javaVersion"
    if ($env:JAVA_HOME) { Write-Success "JAVA_HOME: $env:JAVA_HOME"; Add-CheckResult "JAVA_HOME" "PASS" "JAVA_HOME is set" "Path: $env:JAVA_HOME" }
    else { Write-Warning-Custom "JAVA_HOME: Not set"; Add-CheckResult "JAVA_HOME" "WARN" "JAVA_HOME environment variable is not set" "" }
} else { Write-Error-Custom "Java: Not found"; Add-CheckResult "Java" "FAIL" "Java is not installed" "" }

# Check Android SDK
Write-Info "Checking Android SDK..."
$androidSdkPath = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { $env:ANDROID_SDK_ROOT }
if ($androidSdkPath -and (Test-Path $androidSdkPath)) {
    Write-Success "Android SDK: $androidSdkPath"
    Add-CheckResult "Android SDK" "PASS" "Android SDK found" "Path: $androidSdkPath"
} else { Write-Error-Custom "Android SDK: Not found"; Add-CheckResult "Android SDK" "FAIL" "Android SDK not found" "" }

# Check Gradle
Write-Info "Checking Gradle..."
if (Test-Command "gradle") { $gradleVersion = Get-CommandVersion "gradle" "-v"; Write-Success "Gradle: $gradleVersion"; Add-CheckResult "Gradle" "PASS" "Gradle is installed" "Version: $gradleVersion" }
else { Write-Warning-Custom "Gradle: Not found (will use project wrapper)"; Add-CheckResult "Gradle" "WARN" "Gradle not globally installed (using wrapper)" "" }

# Check Project Structure
Write-Info "Checking project structure..."
$projectRoot = Split-Path $PSScriptRoot -Parent
$requiredFolders = @("android", "android\app", "android\app\src", "assets", "screens", "utils")
$allFoldersExist = $true
foreach ($folder in $requiredFolders) {
    $folderPath = Join-Path $projectRoot $folder
    if (!(Test-Path $folderPath)) { Write-Error-Custom "Missing folder: $folder"; $allFoldersExist = $false }
}
if ($allFoldersExist) { Write-Success "Project Structure: Complete"; Add-CheckResult "Project Structure" "PASS" "All required folders present" "" }
else { Write-Error-Custom "Project Structure: Incomplete"; Add-CheckResult "Project Structure" "FAIL" "Some required folders missing" "" }

# Summary
$passCount = ($global:checkResults | Where-Object { $_.Status -eq "PASS" }).Count
$warnCount = ($global:checkResults | Where-Object { $_.Status -eq "WARN" }).Count
$failCount = ($global:checkResults | Where-Object { $_.Status -eq "FAIL" }).Count

Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "                            SUMMARY" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Magenta

Write-Host "✅ PASSED: $passCount checks" -ForegroundColor Green
if ($warnCount -gt 0) { Write-Host "⚠️  WARNINGS: $warnCount checks" -ForegroundColor Yellow }
if ($failCount -gt 0) { Write-Host "❌ FAILED: $failCount checks" -ForegroundColor Red }

if ($failCount -eq 0) {
    Write-Host "`n🎉 SYSTEM READY FOR APK GENERATION!`n" -ForegroundColor Green
    Write-Host "📱 Available build commands:" -ForegroundColor Cyan
    Write-Host "   npm run build:apk:debug" -ForegroundColor White
    Write-Host "   npm run build:apk:release" -ForegroundColor White
} else { Write-Host "`n🚨 SETUP REQUIRED - Please install missing dependencies" -ForegroundColor Red }

if ($ExportReport) {
    $reportPath = Join-Path $projectRoot "prerequisite-check-report.txt"
    $report = "Windows Prerequisite Check Report - MHT Assessment`nGenerated: $(Get-Date)`n=======================================================`n`nSummary:`n- Passed: $passCount`n- Warnings: $warnCount`n- Failed: $failCount`n`nStatus: $(if ($failCount -eq 0) { 'READY FOR BUILD' } else { 'SETUP REQUIRED' })"
    $report | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Host "`n📄 Report exported to: $reportPath" -ForegroundColor Cyan
}
Write-Host ""
'@

# Save to the scripts directory
$scriptPath = ".\scripts\windows-prerequisite-checker-fixed.ps1"
$fixedContent | Out-File -FilePath $scriptPath -Encoding UTF8
Write-Host "✅ Fixed PowerShell script created at: $scriptPath" -ForegroundColor Green