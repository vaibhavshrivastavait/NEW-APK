@echo off
echo ========================================
echo MHT Assessment - APK Builder
echo ========================================
echo.

REM Check Java
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java is not installed or not in PATH
    echo Please install Java JDK 17 from https://adoptium.net/
    pause
    exit /b 1
)

echo Java version:
java -version
echo.

REM Check Android SDK
if not defined ANDROID_HOME (
    echo ERROR: ANDROID_HOME environment variable is not set
    echo Please install Android Studio and set ANDROID_HOME
    echo Example: set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
    pause
    exit /b 1
)

echo Android SDK: %ANDROID_HOME%
echo.

echo Building Android APK...
echo This may take 10-15 minutes for the first build
echo.

REM Generate Android project if needed
if not exist "android" (
    echo Generating Android project...
    npx expo prebuild --platform android --clean
)

REM Build APK
echo Building APK...
cd android
gradlew.bat clean
gradlew.bat assembleDebug

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo BUILD SUCCESSFUL!
    echo ========================================
    echo APK Location: android\app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo To install on device:
    echo adb install android\app\build\outputs\apk\debug\app-debug.apk
    echo.
) else (
    echo.
    echo BUILD FAILED!
    echo Check the error messages above
    echo.
)

pause