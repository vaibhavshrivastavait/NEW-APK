#!/bin/bash

# =========================================================
# MHT Assessment - Fix Device Bundle Loading Issue
# Resolves "Unable to load script" error on physical devices
# =========================================================

echo "🔧 MHT Assessment - Fixing Device Bundle Loading..."
echo "=================================================="

cd /app

echo "1️⃣ Cleaning cache and build artifacts..."
# Clean all caches
rm -rf .expo/
rm -rf .metro-cache/
rm -rf node_modules/.cache/
rm -rf android/app/build/
rm -rf android/build/

echo "2️⃣ Ensuring Metro configuration is correct..."
# Check if metro.config.js exists and is properly configured
if [ ! -f "metro.config.js" ]; then
    echo "📝 Creating proper metro.config.js..."
    cat > metro.config.js << 'EOL'
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
EOL
fi

echo "3️⃣ Ensuring proper entry point..."
# Make sure index.js exists
if [ ! -f "index.js" ]; then
    echo "📝 Creating index.js entry point..."
    cat > index.js << 'EOL'
import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in the Expo client or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
EOL
fi

echo "4️⃣ Verifying app.json configuration..."
# Ensure app.json has proper main entry
node -e "
const fs = require('fs');
const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
if (!appJson.expo.main) {
    appJson.expo.main = 'index.js';
    fs.writeFileSync('app.json', JSON.stringify(appJson, null, 2));
    console.log('✅ Fixed app.json main entry');
} else {
    console.log('✅ app.json main entry is correct');
}
"

echo "5️⃣ Starting Metro bundler for device..."
echo "📱 NEXT STEPS:"
echo "   • Keep this terminal open"
echo "   • On your phone, install Expo Go from Play Store"
echo "   • Scan the QR code that appears below"
echo "   • Make sure your phone and computer are on the same WiFi network"
echo

# Start Expo with tunnel for cross-network access
echo "🚀 Starting Expo with tunnel mode (modern CLI)..."
npx expo start --tunnel --clear