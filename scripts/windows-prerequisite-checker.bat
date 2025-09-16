@echo off
REM MHT Assessment - Windows Prerequisite Checker (Batch Version)
REM Simple batch script for users who prefer batch files over PowerShell
REM For full functionality, use the PowerShell version: windows-prerequisite-checker.ps1

setlocal enabledelayedexpansion

echo.
echo ======================================================
echo  MHT Assessment - Windows Build Environment Checker
echo ======================================================
echo  Simple batch version - For full features use PowerShell script
echo.

REM Color codes (limited in batch)
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

set "PASS_COUNT=0"
set "FAIL_COUNT=0"
set "OVERALL_STATUS=PASS"

echo %BLUE%Checking System Requirements...%RESET%
echo.

REM Check Windows version
ver | findstr /C:"Windows" >nul
if !errorlevel! equ 0 (
    echo %GREEN%✓ Windows: Compatible version detected%RESET%
    set /a PASS_COUNT+=1
) else (
    echo %RED%✗ Windows: Could not detect version%RESET%
    set /a FAIL_COUNT+=1
    set "OVERALL_STATUS=FAIL"
)

REM Check Node.js
echo %BLUE%Checking Node.js...%RESET%
node --version >nul 2>&1
if !errorlevel! equ 0 (
    for /f "tokens=*" %%i in ('node --version 2^>nul') do set "NODE_VERSION=%%i"
    echo %GREEN%✓ Node.js: !NODE_VERSION!%RESET%
    set /a PASS_COUNT+=1
) else (
    echo %RED%✗ Node.js: Not installed%RESET%
    echo   Install from: https://nodejs.org/
    set /a FAIL_COUNT+=1
    set "OVERALL_STATUS=FAIL"
)

REM Check npm
npm --version >nul 2>&1
if !errorlevel! equ 0 (
    for /f "tokens=*" %%i in ('npm --version 2^>nul') do set "NPM_VERSION=%%i"
    echo %GREEN%✓ npm: v!NPM_VERSION!%RESET%
    set /a PASS_COUNT+=1
) else (
    echo %RED%✗ npm: Not found%RESET%
    set /a FAIL_COUNT+=1
    set "OVERALL_STATUS=FAIL"
)

REM Check Yarn (optional)
yarn --version >nul 2>&1
if !errorlevel! equ 0 (
    for /f "tokens=*" %%i in ('yarn --version 2^>nul') do set "YARN_VERSION=%%i"
    echo %GREEN%✓ Yarn: v!YARN_VERSION! (Recommended)%RESET%
    set /a PASS_COUNT+=1
) else (
    echo %YELLOW%⚠ Yarn: Not installed (npm will be used)%RESET%
    echo   Optional: npm install -g yarn
)

echo.
echo %BLUE%Checking Java JDK...%RESET%

REM Check Java
java -version >nul 2>&1
if !errorlevel! equ 0 (
    for /f "tokens=*" %%i in ('java -version 2^>^&1 ^| findstr /C:"version"') do set "JAVA_VERSION=%%i"
    echo %GREEN%✓ Java JDK: !JAVA_VERSION!%RESET%
    set /a PASS_COUNT+=1
) else (
    echo %RED%✗ Java JDK: Not installed%RESET%
    echo   Install OpenJDK 17 from: https://adoptium.net/
    set /a FAIL_COUNT+=1
    set "OVERALL_STATUS=FAIL"
)

echo.
echo %BLUE%Checking Environment Variables...%RESET%

REM Check JAVA_HOME
if defined JAVA_HOME (
    if exist "%JAVA_HOME%\bin\java.exe" (
        echo %GREEN%✓ JAVA_HOME: %JAVA_HOME%%RESET%
        set /a PASS_COUNT+=1
    ) else (
        echo %RED%✗ JAVA_HOME: Set but invalid path%RESET%
        echo   Current: %JAVA_HOME%
        set /a FAIL_COUNT+=1
        set "OVERALL_STATUS=FAIL"
    )
) else (
    echo %RED%✗ JAVA_HOME: Not set%RESET%
    echo   Set JAVA_HOME environment variable
    set /a FAIL_COUNT+=1
    set "OVERALL_STATUS=FAIL"
)

REM Check Android SDK
if defined ANDROID_HOME (
    if exist "%ANDROID_HOME%" (
        echo %GREEN%✓ ANDROID_HOME: %ANDROID_HOME%%RESET%
        set /a PASS_COUNT+=1
        
        REM Check platform-tools
        if exist "%ANDROID_HOME%\platform-tools\adb.exe" (
            echo %GREEN%✓ Platform Tools: Found%RESET%
            set /a PASS_COUNT+=1
        ) else (
            echo %RED%✗ Platform Tools: Not found%RESET%
            echo   Install: sdkmanager "platform-tools"
            set /a FAIL_COUNT+=1
            set "OVERALL_STATUS=FAIL"
        )
        
        REM Check API 34
        if exist "%ANDROID_HOME%\platforms\android-34" (
            echo %GREEN%✓ Android API 34: Found%RESET%
            set /a PASS_COUNT+=1
        ) else (
            echo %RED%✗ Android API 34: Not found%RESET%
            echo   Install: sdkmanager "platforms;android-34"
            set /a FAIL_COUNT+=1
            set "OVERALL_STATUS=FAIL"
        )
        
        REM Check Build Tools
        if exist "%ANDROID_HOME%\build-tools\34.0.0" (
            echo %GREEN%✓ Build Tools 34.0.0: Found%RESET%
            set /a PASS_COUNT+=1
        ) else (
            echo %RED%✗ Build Tools 34.0.0: Not found%RESET%
            echo   Install: sdkmanager "build-tools;34.0.0"
            set /a FAIL_COUNT+=1
            set "OVERALL_STATUS=FAIL"
        )
        
    ) else (
        echo %RED%✗ ANDROID_HOME: Set but path doesn't exist%RESET%
        echo   Current: %ANDROID_HOME%
        set /a FAIL_COUNT+=1
        set "OVERALL_STATUS=FAIL"
    )
) else (
    echo %RED%✗ ANDROID_HOME: Not set%RESET%
    echo   Download Android SDK from: https://developer.android.com/studio/command-line-tools
    set /a FAIL_COUNT+=1
    set "OVERALL_STATUS=FAIL"
)

REM Check ADB
adb version >nul 2>&1
if !errorlevel! equ 0 (
    for /f "tokens=*" %%i in ('adb version 2^>nul ^| findstr /C:"Android Debug Bridge"') do set "ADB_VERSION=%%i"
    echo %GREEN%✓ ADB: !ADB_VERSION!%RESET%
    set /a PASS_COUNT+=1
) else (
    echo %RED%✗ ADB: Not found in PATH%RESET%
    echo   Add Android SDK platform-tools to PATH
    set /a FAIL_COUNT+=1
    set "OVERALL_STATUS=FAIL"
)

echo.
echo %BLUE%Checking Git...%RESET%

REM Check Git
git --version >nul 2>&1
if !errorlevel! equ 0 (
    for /f "tokens=*" %%i in ('git --version 2^>nul') do set "GIT_VERSION=%%i"
    echo %GREEN%✓ Git: !GIT_VERSION!%RESET%
    set /a PASS_COUNT+=1
) else (
    echo %YELLOW%⚠ Git: Not installed (optional)%RESET%
    echo   Install from: https://git-scm.com/
)

echo.
echo ======================================================
echo                      SUMMARY
echo ======================================================
echo.

echo Results Overview:
echo %GREEN%✓ PASSED: !PASS_COUNT! checks%RESET%
if !FAIL_COUNT! gtr 0 echo %RED%✗ FAILED: !FAIL_COUNT! checks%RESET%

echo.

if "!OVERALL_STATUS!"=="PASS" (
    echo %GREEN%🎉 OVERALL STATUS: READY TO BUILD!%RESET%
    echo Your system meets the basic requirements for building the MHT Assessment Android APK.
    echo.
    echo Next Steps:
    echo 1. Clone or download the MHT Assessment project
    echo 2. Navigate to the project directory
    echo 3. Run: .\scripts\build-standalone-apk.ps1 -BuildType debug
    echo 4. Install the generated APK on your Android device
) else (
    echo %RED%⚠ OVERALL STATUS: ISSUES NEED ATTENTION%RESET%
    echo Please address the failed checks before attempting to build.
    echo.
    echo %YELLOW%For detailed analysis and fixes, run the PowerShell version:%RESET%
    echo .\scripts\windows-prerequisite-checker.ps1 -Detailed
)

echo.
echo ======================================================
echo            RECOMMENDED INSTALLATION ORDER
echo ======================================================
echo.
echo 1. Node.js 18 LTS
echo    Download from: https://nodejs.org/
echo    Verify with: node --version
echo.
echo 2. Java JDK 17
echo    Download from: https://adoptium.net/
echo    Verify with: java -version
echo.
echo 3. Android SDK Command Line Tools
echo    Download from: https://developer.android.com/studio/command-line-tools
echo    Extract to: C:\Android\cmdline-tools\latest\
echo.
echo 4. Set Environment Variables
echo    JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot
echo    ANDROID_HOME = C:\Android
echo    PATH += %%JAVA_HOME%%\bin;%%ANDROID_HOME%%\platform-tools
echo.
echo 5. Install Android SDK Packages
echo    sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
echo    Verify with: adb --version
echo.
echo 6. Git (Optional)
echo    Download from: https://git-scm.com/
echo    Verify with: git --version
echo.
echo 7. Yarn (Optional but Recommended)
echo    Install with: npm install -g yarn
echo    Verify with: yarn --version
echo.

echo ======================================================
echo 💡 TIP: For detailed analysis, run the PowerShell version:
echo .\scripts\windows-prerequisite-checker.ps1 -Detailed -ExportReport
echo ======================================================

pause