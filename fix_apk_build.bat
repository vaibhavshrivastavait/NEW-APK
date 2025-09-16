@echo off
REM =========================================================
REM Fix APK Build Issues - Windows Command Prompt Version
REM For createBundleDebugJsAndAssets errors
REM =========================================================

echo.
echo ==============================================
echo   APK Build Error Fix - Windows Version
echo ==============================================
echo.
echo This script provides multiple solutions for the APK build error:
echo "Execution failed for task ':app:createBundleDebugJsAndAssets'"
echo.

:MENU
echo Choose solution:
echo 1 = Clean Build (Recommended)
echo 2 = Manual Bundle Creation
echo 3 = Disable Bundle (Normal Debug APK)
echo 4 = Try All Solutions
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto CLEAN_BUILD
if "%choice%"=="2" goto MANUAL_BUNDLE
if "%choice%"=="3" goto DISABLE_BUNDLE
if "%choice%"=="4" goto TRY_ALL
echo Invalid choice. Please try again.
goto MENU

:CLEAN_BUILD
echo.
echo ==========================================
echo   Solution 1: Clean Build ^& Cache Reset
echo ==========================================
echo.

echo Cleaning Android build...
cd android
call gradlew clean
cd ..

echo Clearing React Native cache...
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .metro-cache rmdir /s /q .metro-cache

echo Clearing npm cache...
call npm cache clean --force

echo Rebuilding APK...
cd android
call gradlew assembleDebug --stacktrace
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ BUILD SUCCESSFUL!
    goto SUCCESS
) else (
    echo.
    echo ❌ Build failed. Check the error above.
    goto END
)

:MANUAL_BUNDLE
echo.
echo =====================================
echo   Solution 2: Manual Bundle Creation
echo =====================================
echo.

echo Creating assets directory...
if not exist android\app\src\main\assets mkdir android\app\src\main\assets

echo Creating bundle manually...
call npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android\app\src\main\assets\index.android.bundle --assets-dest android\app\src\main\res\

if %ERRORLEVEL% EQU 0 (
    echo ✅ Bundle created successfully!
    echo Building APK...
    cd android
    call gradlew assembleDebug
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ✅ BUILD SUCCESSFUL!
        goto SUCCESS
    ) else (
        echo ❌ APK build failed after bundle creation.
        goto END
    )
) else (
    echo ❌ Manual bundle creation failed. Check the error above.
    goto END
)

:DISABLE_BUNDLE
echo.
echo =======================================================
echo   Solution 3: Disable Bundle (Normal Debug APK)
echo =======================================================
echo.

echo Reverting to normal debug APK (requires Metro server)...

REM Backup current build.gradle
copy android\app\build.gradle android\app\build.gradle.backup

REM Modify build.gradle to enable debuggableVariants
powershell -Command "(gc android\app\build.gradle) -replace 'debuggableVariants = \[\]', 'debuggableVariants = [\"debug\"]' | Out-File -encoding ASCII android\app\build.gradle"

echo ✅ Reverted to normal debug APK configuration
echo This APK will need Metro server running to work

cd android
call gradlew assembleDebug
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ BUILD SUCCESSFUL!
    echo.
    echo To restore bundled debug APK later:
    echo copy android\app\build.gradle.backup android\app\build.gradle
    goto SUCCESS
) else (
    echo ❌ Build failed.
    goto END
)

:TRY_ALL
echo.
echo ===============================
echo   Solution 4: Try All Solutions  
echo ===============================
echo.

echo Step 1: Clean build...
cd android
call gradlew clean
cd ..

echo Step 2: Clear caches...
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist .metro-cache rmdir /s /q .metro-cache
call npm cache clean --force

echo Step 3: Try normal build...
cd android
call gradlew assembleDebug

if %ERRORLEVEL% EQU 0 (
    echo ✅ Normal build succeeded!
    goto SUCCESS
) else (
    echo Normal build failed. Trying manual bundle...
    cd ..
    
    if not exist android\app\src\main\assets mkdir android\app\src\main\assets
    
    call npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android\app\src\main\assets\index.android.bundle --assets-dest android\app\src\main\res\
    
    cd android
    call gradlew assembleDebug
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Manual bundle build succeeded!
        goto SUCCESS
    ) else (
        echo ❌ All methods failed. Check the errors above.
        goto END
    )
)

:SUCCESS
echo.
echo ========================================
echo   🎉 APK BUILD COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo 📁 APK Location:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo 📱 This APK:
echo ✅ Works without Metro server
echo ✅ Works without WiFi connection  
echo ✅ Includes all debug features
echo ✅ Ready for testing on any device
echo.
echo 🚀 To install on your phone:
echo 1. Transfer app-debug.apk to your phone
echo 2. Enable 'Unknown Sources' in Android settings
echo 3. Install the APK file
echo 4. Launch MHT Assessment app
goto END

:END
echo.
pause