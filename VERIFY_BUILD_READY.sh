#!/bin/bash

echo "🔍 MHT Assessment - Build Verification Script"
echo "============================================"

echo ""
echo "📱 Checking Image Assets..."
if [ -f "/app/assets/icon.png" ]; then
    size=$(stat -c%s "/app/assets/icon.png")
    if [ $size -gt 1000 ]; then
        echo "✅ icon.png: $size bytes (Valid)"
    else
        echo "❌ icon.png: $size bytes (Too small/corrupted)"
    fi
else
    echo "❌ icon.png: Missing"
fi

if [ -f "/app/assets/adaptive-icon.png" ]; then
    size=$(stat -c%s "/app/assets/adaptive-icon.png")
    if [ $size -gt 1000 ]; then
        echo "✅ adaptive-icon.png: $size bytes (Valid)"
    else
        echo "❌ adaptive-icon.png: $size bytes (Too small/corrupted)"
    fi
else
    echo "❌ adaptive-icon.png: Missing"
fi

if [ -f "/app/assets/splash.png" ]; then
    size=$(stat -c%s "/app/assets/splash.png")
    if [ $size -gt 1000 ]; then
        echo "✅ splash.png: $size bytes (Valid)"
    else
        echo "❌ splash.png: $size bytes (Too small/corrupted)"
    fi
else
    echo "❌ splash.png: Missing"
fi

echo ""
echo "📋 Checking Configuration Files..."
if [ -f "/app/app.json" ]; then
    echo "✅ app.json: Present"
else
    echo "❌ app.json: Missing"
fi

if [ -f "/app/package.json" ]; then
    echo "✅ package.json: Present"
else
    echo "❌ package.json: Missing"
fi

echo ""
echo "🔧 Checking Android Project..."
if [ -d "/app/android" ]; then
    echo "✅ Android project: Generated"
    if [ -f "/app/android/gradlew" ]; then
        echo "✅ Gradle wrapper: Present"
    else
        echo "❌ Gradle wrapper: Missing"
    fi
else
    echo "❌ Android project: Not generated (run npx expo prebuild)"
fi

echo ""
echo "📊 Testing Prebuild Process..."
cd /app
if npx expo prebuild --platform android --clean > /dev/null 2>&1; then
    echo "✅ Prebuild: SUCCESS"
else
    echo "❌ Prebuild: FAILED"
fi

echo ""
echo "🎯 Build Readiness Status:"
echo "========================="

# Count successful checks
success_count=0
total_checks=6

# Check each component
[ -f "/app/assets/icon.png" ] && [ $(stat -c%s "/app/assets/icon.png") -gt 1000 ] && ((success_count++))
[ -f "/app/assets/adaptive-icon.png" ] && [ $(stat -c%s "/app/assets/adaptive-icon.png") -gt 1000 ] && ((success_count++))
[ -f "/app/assets/splash.png" ] && [ $(stat -c%s "/app/assets/splash.png") -gt 1000 ] && ((success_count++))
[ -f "/app/app.json" ] && ((success_count++))
[ -f "/app/package.json" ] && ((success_count++))
[ -d "/app/android" ] && ((success_count++))

echo "Passed: $success_count/$total_checks checks"

if [ $success_count -eq $total_checks ]; then
    echo ""
    echo "🎉 PROJECT IS READY FOR APK BUILD!"
    echo "Ready to proceed with gradle build on local PC"
    echo ""
    echo "Next steps for your local PC:"
    echo "1. git clone https://github.com/vaibhavshrivastavait/MHT-FINAL.git"
    echo "2. cd MHT-FINAL"
    echo "3. npm install"
    echo "4. npx expo prebuild --platform android --clean"
    echo "5. cd android && ./gradlew assembleRelease"
else
    echo ""
    echo "⚠️  Some issues found. Check the details above."
fi

echo ""
echo "📄 Generated Files:"
echo "- FIXED_APK_BUILD_GUIDE.md (Complete build instructions)"
echo "- COMPLETE_SETUP_GUIDE.md (Full setup guide)"
echo "- SYNC_GITHUB.sh (GitHub sync script)"