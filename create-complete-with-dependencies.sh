#!/bin/bash

echo "🗜️ Creating COMPLETE MHT Assessment Archive (with node_modules)..."

# Set archive name with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ARCHIVE_NAME="MHT_Assessment_COMPLETE_With_Dependencies_${TIMESTAMP}"

echo "📁 Creating archive with dependencies..."

# Create complete archive including node_modules
tar -czf "${ARCHIVE_NAME}.tar.gz" \
  --exclude='.git' \
  --exclude='android/build' \
  --exclude='android/app/build' \
  --exclude='android/.gradle' \
  --exclude='ios/build' \
  --exclude='.expo' \
  --exclude='*.log' \
  --exclude='cmdline-tools*' \
  --exclude='.gradle' \
  --exclude='build' \
  .

# Get archive size
ARCHIVE_SIZE=$(du -h "${ARCHIVE_NAME}.tar.gz" | cut -f1)

echo "✅ Complete archive created!"
echo "📦 Archive: /app/${ARCHIVE_NAME}.tar.gz" 
echo "📊 Size: $ARCHIVE_SIZE"
echo "🔗 Includes: Complete app + ALL dependencies + node_modules"

# Create quick setup instructions
cat > "COMPLETE_ARCHIVE_SETUP.md" << 'EOF'
# MHT Assessment - Complete Archive Setup

## 📦 **What's Included:**
- ✅ Complete React Native/Expo MHT Assessment app
- ✅ ALL dependencies (node_modules included)
- ✅ Android build configuration
- ✅ iOS build configuration  
- ✅ Complete documentation

## 🚀 **Quick Setup (NO npm install needed):**

### **1. Extract Archive:**
```bash
tar -xzf MHT_Assessment_COMPLETE_With_Dependencies_[timestamp].tar.gz
cd MHT_Assessment_COMPLETE_With_Dependencies_[timestamp]
```

### **2. Start Immediately:**
```bash
npx expo start
```

### **3. Build APK:**
```bash
npx expo run:android
# or use EAS Build
eas build --platform android
```

## ✅ **Ready to Use - No Installation Required!**
All dependencies are pre-installed and ready to run.
EOF

echo -e "\n🎉 Complete archive ready: ${ARCHIVE_NAME}.tar.gz"
echo "📋 Includes EVERYTHING - just extract and run!"