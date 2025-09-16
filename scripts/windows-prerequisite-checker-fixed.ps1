param(
    [switch]$Detailed,
    [switch]$ExportReport
)

# Windows Prerequisite Checker - MHT Assessment (Fixed for PowerShell 5.1+)
# Compatible with PowerShell 5.1 and higher

$ErrorActionPreference = "SilentlyContinue"

# Global variables
$global:checkResults = @()
$global:warnings = @()
$global:errors = @()

# Color functions for PowerShell 5.1 compatibility
function Write-Success {
    param([string]$Message)
    Write-Host "[✓] $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[✗] $Message" -ForegroundColor Red
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "[!] $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "[i] $Message" -ForegroundColor Cyan
}

function Add-CheckResult {
    param(
        [string]$Component,
        [string]$Status,
        [string]$Details,
        [string]$Path = ""
    )
    $global:checkResults += [PSCustomObject]@{
        Component = $Component
        Status = $Status
        Details = $Details
        Path = $Path
    }
}

function Test-Command {
    param([string]$Command)
    try {
        $null = Get-Command $Command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

function Get-CommandVersion {
    param([string]$Command, [string]$VersionArg = "--version")
    try {
        $output = & $Command $VersionArg 2>$null
        if ($output) {
            return $output[0]
        }
        return "Unknown"
    } catch {
        return "Not found"
    }
}

# Header
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  🔍 WINDOWS PREREQUISITE CHECKER - MHT Assessment (Fixed)" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

# 1. Check Node.js
Write-Info "Checking Node.js..."
if (Test-Command "node") {
    $nodeVersion = Get-CommandVersion "node" "-v"
    Write-Success "Node.js: $nodeVersion"
    Add-CheckResult "Node.js" "PASS" "Node.js is installed" "Version: $nodeVersion"
} else {
    Write-Error-Custom "Node.js: Not found"
    Add-CheckResult "Node.js" "FAIL" "Node.js is not installed" ""
}

# 2. Check npm
Write-Info "Checking npm..."
if (Test-Command "npm") {
    $npmVersion = Get-CommandVersion "npm" "-v"
    Write-Success "npm: $npmVersion"
    Add-CheckResult "npm" "PASS" "npm is installed" "Version: $npmVersion"
} else {
    Write-Error-Custom "npm: Not found"
    Add-CheckResult "npm" "FAIL" "npm is not installed" ""
}

# 3. Check Git
Write-Info "Checking Git..."
if (Test-Command "git") {
    $gitVersion = Get-CommandVersion "git" "--version"
    Write-Success "Git: $gitVersion"
    Add-CheckResult "Git" "PASS" "Git is installed" "Version: $gitVersion"
} else {
    Write-Error-Custom "Git: Not found"
    Add-CheckResult "Git" "FAIL" "Git is not installed" ""
}

# 4. Check Java
Write-Info "Checking Java..."
if (Test-Command "java") {
    $javaVersion = Get-CommandVersion "java" "-version"
    Write-Success "Java: $javaVersion"
    Add-CheckResult "Java" "PASS" "Java is installed" "Version: $javaVersion"
    
    # Check JAVA_HOME
    if ($env:JAVA_HOME) {
        Write-Success "JAVA_HOME: $env:JAVA_HOME"
        Add-CheckResult "JAVA_HOME" "PASS" "JAVA_HOME is set" "Path: $env:JAVA_HOME"
    } else {
        Write-Warning-Custom "JAVA_HOME: Not set"
        Add-CheckResult "JAVA_HOME" "WARN" "JAVA_HOME environment variable is not set" ""
    }
} else {
    Write-Error-Custom "Java: Not found"
    Add-CheckResult "Java" "FAIL" "Java is not installed" ""
}

# 5. Check Android SDK
Write-Info "Checking Android SDK..."
$androidHome = $env:ANDROID_HOME
$androidSdkRoot = $env:ANDROID_SDK_ROOT

# PowerShell 5.1 compatible null coalescing
$androidSdkPath = if ($androidHome) { $androidHome } else { $androidSdkRoot }

if ($androidSdkPath -and (Test-Path $androidSdkPath)) {
    Write-Success "Android SDK: $androidSdkPath"
    Add-CheckResult "Android SDK" "PASS" "Android SDK found" "Path: $androidSdkPath"
    
    # Check for platform-tools
    $platformToolsPath = Join-Path $androidSdkPath "platform-tools"
    if (Test-Path $platformToolsPath) {
        Write-Success "Android Platform Tools: Found"
        Add-CheckResult "Platform Tools" "PASS" "Android platform-tools found" "Path: $platformToolsPath"
    } else {
        Write-Warning-Custom "Android Platform Tools: Not found"
        Add-CheckResult "Platform Tools" "WARN" "Android platform-tools not found" ""
    }
    
    # Check for build-tools
    $buildToolsPath = Join-Path $androidSdkPath "build-tools"
    if (Test-Path $buildToolsPath) {
        $buildToolsVersions = Get-ChildItem $buildToolsPath -Directory | Select-Object -ExpandProperty Name
        if ($buildToolsVersions) {
            Write-Success "Android Build Tools: $($buildToolsVersions -join ', ')"
            Add-CheckResult "Build Tools" "PASS" "Android build-tools found" "Versions: $($buildToolsVersions -join ', ')"
        }
    } else {
        Write-Warning-Custom "Android Build Tools: Not found"
        Add-CheckResult "Build Tools" "WARN" "Android build-tools not found" ""
    }
} else {
    Write-Error-Custom "Android SDK: Not found"
    Add-CheckResult "Android SDK" "FAIL" "Android SDK not found" ""
}

# 6. Check Gradle
Write-Info "Checking Gradle..."
if (Test-Command "gradle") {
    $gradleVersion = Get-CommandVersion "gradle" "-v"
    Write-Success "Gradle: $gradleVersion"
    Add-CheckResult "Gradle" "PASS" "Gradle is installed" "Version: $gradleVersion"
} else {
    Write-Warning-Custom "Gradle: Not found (will use project wrapper)"
    Add-CheckResult "Gradle" "WARN" "Gradle not globally installed (using wrapper)" ""
}

# 7. Check Project Structure
Write-Info "Checking project structure..."
$projectRoot = Split-Path $PSScriptRoot -Parent
$requiredFolders = @(
    "android",
    "android\app",
    "android\app\src",
    "assets",
    "screens",
    "utils"
)

$allFoldersExist = $true
foreach ($folder in $requiredFolders) {
    $folderPath = Join-Path $projectRoot $folder
    if (Test-Path $folderPath) {
        if ($Detailed) {
            Write-Success "Folder: $folder"
        }
    } else {
        Write-Error-Custom "Missing folder: $folder"
        $allFoldersExist = $false
    }
}

if ($allFoldersExist) {
    Write-Success "Project Structure: Complete"
    Add-CheckResult "Project Structure" "PASS" "All required folders present" ""
} else {
    Write-Error-Custom "Project Structure: Incomplete"
    Add-CheckResult "Project Structure" "FAIL" "Some required folders missing" ""
}

# 8. Check package.json
$packageJsonPath = Join-Path $projectRoot "package.json"
if (Test-Path $packageJsonPath) {
    Write-Success "package.json: Found"
    Add-CheckResult "package.json" "PASS" "package.json exists" "Path: $packageJsonPath"
    
    try {
        $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
        if ($packageJson.scripts."build:apk:debug") {
            Write-Success "Build Scripts: Available"
            Add-CheckResult "Build Scripts" "PASS" "APK build scripts found" ""
        }
    } catch {
        Write-Warning-Custom "package.json: Could not parse"
    }
} else {
    Write-Error-Custom "package.json: Not found"
    Add-CheckResult "package.json" "FAIL" "package.json not found" ""
}

# Summary
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "                            SUMMARY" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Magenta

$passCount = ($global:checkResults | Where-Object { $_.Status -eq "PASS" }).Count
$warnCount = ($global:checkResults | Where-Object { $_.Status -eq "WARN" }).Count
$failCount = ($global:checkResults | Where-Object { $_.Status -eq "FAIL" }).Count

Write-Host ""
Write-Host "✅ PASSED: $passCount checks" -ForegroundColor Green
if ($warnCount -gt 0) { Write-Host "⚠️  WARNINGS: $warnCount checks" -ForegroundColor Yellow }
if ($failCount -gt 0) { Write-Host "❌ FAILED: $failCount checks" -ForegroundColor Red }

Write-Host ""

if ($failCount -eq 0) {
    Write-Host "🎉 SYSTEM READY FOR APK GENERATION!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Available build commands:" -ForegroundColor Cyan
    Write-Host "   npm run build:apk:debug" -ForegroundColor White
    Write-Host "   npm run build:apk:release" -ForegroundColor White
} else {
    Write-Host "🚨 SETUP REQUIRED - Please install missing dependencies" -ForegroundColor Red
}

# Export detailed report if requested
if ($ExportReport) {
    $reportPath = Join-Path $projectRoot "prerequisite-check-report.txt"
    $report = @"
Windows Prerequisite Check Report - MHT Assessment
Generated: $(Get-Date)
=======================================================

System Information:
- Windows Version: $([Environment]::OSVersion.Version)
- PowerShell Version: $($PSVersionTable.PSVersion)

Check Results:
$($global:checkResults | ForEach-Object { "[$($_.Status)] $($_.Component): $($_.Details) $($_.Path)" } | Out-String)

Summary:
- Passed: $passCount
- Warnings: $warnCount  
- Failed: $failCount

Status: $(if ($failCount -eq 0) { "READY FOR BUILD" } else { "SETUP REQUIRED" })
"@
    
    $report | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Host ""
    Write-Host "📄 Report exported to: $reportPath" -ForegroundColor Cyan
}

Write-Host ""