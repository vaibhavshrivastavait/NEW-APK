# 🚀 MHT Assessment - Quick Start

## One-Command Setup (After Download)

```bash
# Extract and setup
tar -xzf mht_assessment_drug_checker_update_*.tar.gz
cd mht-assessment
npm install
npx expo start --web
```

Then open: **http://localhost:3000**

## 📱 Test Drug Interaction Checker

1. Navigate to **Results** screen
2. Open **Drug Interaction Checker** modal  
3. Select **HRT** as main medicine
4. Select **Anticoagulants** → Should show **HIGH (Red)**
5. Select **NSAIDs** → Should show **LOW (Yellow)**
6. Verify **disclaimer** at bottom

## ✅ What's New

- ✅ Fixed AsyncStorage crashes on Android
- ✅ Updated Drug Interaction Checker with exact requirements
- ✅ 1:1 severity mapping (not cumulative)
- ✅ Color-coded results (Yellow/Orange/Red)
- ✅ Professional disclaimer as requested
- ✅ Crash-safe error boundaries

## 🔧 Troubleshooting

**If you get "Module not found" errors:**
```bash
npx expo start --clear
```

**If port 3000 is busy:**
```bash
npx expo start --web --port 3001
```

For detailed setup instructions, see `LOCAL_SETUP_GUIDE.md` in the archive.