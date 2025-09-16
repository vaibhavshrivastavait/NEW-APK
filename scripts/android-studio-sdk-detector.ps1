# ============================================================================
# Android Studio SDK Detection and Diagnostic Script
# ============================================================================
# Purpose: Detect and diagnose Android Studio SDK installation issues
# Compatible with: Windows 10/11, PowerShell 5.0+
# ============================================================================

param(
    [switch]$Detailed,              # Show detailed information
    [switch]$FixEnvironment         # Attempt to fix environment variables
)

# Colors for output
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Blue }
function Write-Step { param($Message) Write-Host "🔍 $Message" -ForegroundColor Cyan }

Write-Host "🔧 Android Studio SDK Detection & Diagnostic Tool" -ForegroundColor Magenta
Write-Host "=================================================" -ForegroundColor Magenta
Write-Host ""

# Step 1: Check current environment variables
Write-Step "Checking current environment variables..."
$envAndroidHome = $env:ANDROID_HOME
$envAndroidSdkRoot = $env:ANDROID_SDK_ROOT
$userAndroidHome = [System.Environment]::GetEnvironmentVariable("ANDROID_HOME", "User")
$machineAndroidHome = [System.Environment]::GetEnvironmentVariable("ANDROID_HOME", "Machine")
$userAndroidSdkRoot = [System.Environment]::GetEnvironmentVariable("ANDROID_SDK_ROOT", "User")
$machineAndroidSdkRoot = [System.Environment]::GetEnvironmentVariable("ANDROID_SDK_ROOT", "Machine")

Write-Info "Current session ANDROID_HOME: $envAndroidHome"
Write-Info "Current session ANDROID_SDK_ROOT: $envAndroidSdkRoot"
Write-Info "User ANDROID_HOME: $userAndroidHome"
Write-Info "Machine ANDROID_HOME: $machineAndroidHome"
Write-Info "User ANDROID_SDK_ROOT: $userAndroidSdkRoot"
Write-Info "Machine ANDROID_SDK_ROOT: $machineAndroidSdkRoot"
Write-Host ""

# Step 2: Search for Android SDK in common locations
Write-Step "Searching for Android SDK in common locations..."
$commonSdkPaths = @(
    "$env:LOCALAPPDATA\Android\Sdk",
    "$env:USERPROFILE\AppData\Local\Android\Sdk",
    "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk",
    "$env:PROGRAMFILES\Android\Sdk",
    "${env:ProgramFiles(x86)}\Android\Sdk",
    "C:\Android\Sdk",
    "D:\Android\Sdk"
)

$foundSdkPaths = @()
foreach ($path in $commonSdkPaths) {
    if ($path -and (Test-Path $path)) {
        $foundSdkPaths += $path
        Write-Success "Found Android SDK at: $path"
        
        if ($Detailed) {
            Write-Info "  Directory contents:"
            Get-ChildItem $path -Directory -ErrorAction SilentlyContinue | ForEach-Object {
                Write-Info "    - $($_.Name)"
            }
        }
    } else {
        if ($Detailed) {
            Write-Info "Not found: $path"
        }
    }
}

if ($foundSdkPaths.Count -eq 0) {
    Write-Error "No Android SDK found in common locations!"
    Write-Info "Please check if Android Studio is properly installed."
    exit 1
}

Write-Host ""

# Step 3: Analyze each found SDK
foreach ($sdkPath in $foundSdkPaths) {
    Write-Step "Analyzing SDK at: $sdkPath"
    
    # Check platform-tools
    $platformTools = Join-Path $sdkPath "platform-tools"
    if (Test-Path $platformTools) {
        Write-Success "  Platform Tools: Found"
        if ($Detailed) {
            $adbPath = Join-Path $platformTools "adb.exe"
            if (Test-Path $adbPath) {
                Write-Info "    ADB: Available"
            }
        }
    } else {
        Write-Warning "  Platform Tools: Missing"
    }
    
    # Check platforms
    $platforms = Join-Path $sdkPath "platforms"
    if (Test-Path $platforms) {
        $availablePlatforms = Get-ChildItem $platforms -Directory -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name | Sort-Object
        if ($availablePlatforms) {
            Write-Success "  Platforms: Found ($($availablePlatforms.Count) versions)"
            if ($Detailed) {
                foreach ($platform in $availablePlatforms) {
                    $status = if ($platform -eq "android-34") { "✓ TARGET" } else { "  " }
                    Write-Info "    $status $platform"
                }
            }
            
            # Check specifically for API 34
            if ($availablePlatforms -contains "android-34") {
                Write-Success "  Android API 34: Found ✓"
            } else {
                Write-Warning "  Android API 34: Missing (Available: $($availablePlatforms -join ', '))"
            }
        } else {
            Write-Warning "  Platforms: Directory exists but empty"
        }
    } else {
        Write-Warning "  Platforms: Missing"
    }
    
    # Check build-tools
    $buildTools = Join-Path $sdkPath "build-tools"
    if (Test-Path $buildTools) {
        $availableBuildTools = Get-ChildItem $buildTools -Directory -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name | Sort-Object {[version]$_} -Descending
        if ($availableBuildTools) {
            Write-Success "  Build Tools: Found ($($availableBuildTools.Count) versions)"
            if ($Detailed) {
                foreach ($buildTool in $availableBuildTools) {
                    $status = if ($buildTool -eq "34.0.0") { "✓ TARGET" } else { "  " }
                    Write-Info "    $status $buildTool"
                }
            }
            
            # Check specifically for 34.0.0
            if ($availableBuildTools -contains "34.0.0") {
                Write-Success "  Build Tools 34.0.0: Found ✓"
            } else {
                $latest = $availableBuildTools | Select-Object -First 1
                Write-Warning "  Build Tools 34.0.0: Missing (Latest available: $latest)"
            }
        } else {
            Write-Warning "  Build Tools: Directory exists but empty"
        }
    } else {
        Write-Warning "  Build Tools: Missing"
    }
    
    # Check NDK
    $ndk = Join-Path $sdkPath "ndk"
    if (Test-Path $ndk) {
        $availableNdks = Get-ChildItem $ndk -Directory -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name | Sort-Object -Descending
        if ($availableNdks) {
            Write-Success "  NDK: Found ($($availableNdks.Count) versions)"
            if ($Detailed) {
                foreach ($ndkVersion in $availableNdks) {
                    $status = if ($ndkVersion -eq "25.1.8937393") { "✓ TARGET" } else { "  " }
                    Write-Info "    $status $ndkVersion"
                }
            }
            
            # Check specifically for 25.1.8937393
            if ($availableNdks -contains "25.1.8937393") {
                Write-Success "  NDK 25.1.8937393: Found ✓"
            } else {
                $latest = $availableNdks | Select-Object -First 1
                Write-Info "  NDK 25.1.8937393: Missing (Latest available: $latest)"
            }
        } else {
            Write-Info "  NDK: Directory exists but empty (NDK is optional for most projects)"
        }
    } else {
        Write-Info "  NDK: Not installed (NDK is optional for most projects)"
    }
    
    Write-Host ""
}

# Step 4: Recommend best SDK path
if ($foundSdkPaths.Count -gt 1) {
    Write-Step "Multiple Android SDKs found. Recommended primary SDK:"
    
    # Prefer LOCALAPPDATA location
    $preferredPath = $foundSdkPaths | Where-Object { $_ -like "*$env:LOCALAPPDATA*" } | Select-Object -First 1
    if (-not $preferredPath) {
        $preferredPath = $foundSdkPaths[0]
    }
    
    Write-Success "Recommended: $preferredPath"
    $recommendedSdk = $preferredPath
} else {
    $recommendedSdk = $foundSdkPaths[0]
}

# Step 5: Environment variable recommendations
Write-Step "Environment Variable Status & Recommendations:"

$needsFixing = $false
if ($envAndroidHome -ne $recommendedSdk) {
    Write-Warning "ANDROID_HOME should be set to: $recommendedSdk"
    Write-Info "Current ANDROID_HOME: $envAndroidHome"
    $needsFixing = $true
}

if ($envAndroidSdkRoot -ne $recommendedSdk) {
    Write-Warning "ANDROID_SDK_ROOT should be set to: $recommendedSdk"
    Write-Info "Current ANDROID_SDK_ROOT: $envAndroidSdkRoot"
    $needsFixing = $true
}

# Check PATH
$currentPath = $env:PATH
$sdkToolsPaths = @(
    "$recommendedSdk\platform-tools",
    "$recommendedSdk\tools",
    "$recommendedSdk\tools\bin",
    "$recommendedSdk\cmdline-tools\latest\bin"
)

$missingPaths = @()
foreach ($toolPath in $sdkToolsPaths) {
    if ((Test-Path $toolPath) -and ($currentPath -notlike "*$toolPath*")) {
        $missingPaths += $toolPath
    }
}

if ($missingPaths.Count -gt 0) {
    Write-Warning "PATH missing Android SDK tools directories:"
    foreach ($path in $missingPaths) {
        Write-Info "  Missing: $path"
    }
    $needsFixing = $true
}

# Step 6: Fix environment if requested
if ($FixEnvironment -and $needsFixing) {
    Write-Step "Fixing environment variables..."
    
    try {
        if ($envAndroidHome -ne $recommendedSdk) {
            [System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $recommendedSdk, "User")
            $env:ANDROID_HOME = $recommendedSdk
            Write-Success "Set ANDROID_HOME to: $recommendedSdk"
        }
        
        if ($envAndroidSdkRoot -ne $recommendedSdk) {
            [System.Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $recommendedSdk, "User")
            $env:ANDROID_SDK_ROOT = $recommendedSdk
            Write-Success "Set ANDROID_SDK_ROOT to: $recommendedSdk"
        }
        
        if ($missingPaths.Count -gt 0) {
            $userPath = [System.Environment]::GetEnvironmentVariable("PATH", "User")
            foreach ($path in $missingPaths) {
                if ($userPath -notlike "*$path*") {
                    $userPath += ";$path"
                }
            }
            [System.Environment]::SetEnvironmentVariable("PATH", $userPath, "User")
            Write-Success "Added SDK tools to PATH"
            Write-Warning "You may need to restart your command prompt for PATH changes to take effect"
        }
        
    } catch {
        Write-Error "Failed to set environment variables: $($_.Exception.Message)"
        Write-Info "You may need to run this script as Administrator to modify system environment variables"
    }
}

# Step 7: Final recommendations
Write-Host ""
Write-Step "Final Recommendations:"

if (-not $needsFixing) {
    Write-Success "✓ Environment variables are correctly configured"
} else {
    Write-Info "To fix environment variables automatically, run:"
    Write-Info "  .\android-studio-sdk-detector.ps1 -FixEnvironment"
}

Write-Info "To install missing SDK components:"
Write-Info "1. Open Android Studio"
Write-Info "2. Go to Tools → SDK Manager"
Write-Info "3. Install missing components:"
Write-Info "   - SDK Platforms: Android 14 (API 34)"
Write-Info "   - SDK Tools: Android SDK Platform-Tools, Android SDK Build-Tools 34.0.0"
Write-Info "   - SDK Tools: NDK (Side by side) 25.1.8937393 (optional)"

Write-Host ""
Write-Success "✅ Android Studio SDK diagnostic complete!"

# Summary
Write-Host ""
Write-Host "SUMMARY:" -ForegroundColor Magenta
Write-Host "========" -ForegroundColor Magenta
Write-Success "Found $($foundSdkPaths.Count) Android SDK installation(s)"
Write-Info "Recommended SDK: $recommendedSdk"
if ($needsFixing) {
    Write-Warning "Environment variables need adjustment"
} else {
    Write-Success "Environment variables correctly configured"
}