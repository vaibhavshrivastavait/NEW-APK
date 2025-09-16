#!/bin/bash

# Fix AsyncStorage imports in all remaining CME screens
echo "🔧 Fixing AsyncStorage imports in CME screens..."

# Fix CmeModuleScreen.tsx
sed -i 's/import AsyncStorage from '\''@react-native-async-storage\/async-storage'\'';/import crashProofStorage from '\''..\/utils\/asyncStorageUtils'\'';/g' /app/screens/CmeModuleScreen.tsx
sed -i 's/AsyncStorage\.getItem/crashProofStorage.getItem/g' /app/screens/CmeModuleScreen.tsx
sed -i 's/AsyncStorage\.setItem/crashProofStorage.setItem/g' /app/screens/CmeModuleScreen.tsx

# Fix CmeCertificateScreen.tsx
sed -i 's/import AsyncStorage from '\''@react-native-async-storage\/async-storage'\'';/import crashProofStorage from '\''..\/utils\/asyncStorageUtils'\'';/g' /app/screens/CmeCertificateScreen.tsx
sed -i 's/AsyncStorage\.getItem/crashProofStorage.getItem/g' /app/screens/CmeCertificateScreen.tsx
sed -i 's/AsyncStorage\.setItem/crashProofStorage.setItem/g' /app/screens/CmeCertificateScreen.tsx

echo "✅ All AsyncStorage references fixed!"
echo "🔄 Restarting Expo server..."

# Restart expo to apply changes
sudo supervisorctl restart expo

echo "✅ AsyncStorage crash fix completed!"