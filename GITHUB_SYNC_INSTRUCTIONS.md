# 🚀 GitHub Sync Instructions for MHT Assessment

## 📋 Repository Information
- **Target Repository**: https://github.com/vaibhavshrivastavait/MHT.git
- **Status**: Ready for sync with AsyncStorage fixes applied
- **Size**: Optimized for GitHub (< 100MB)

## 🔧 Sync Process

### Step 1: Run the Sync Script
The sync script has been created and is ready to execute:

```bash
cd /app
./SYNC_TO_MHT_REPO.sh
```

### Step 2: GitHub Authentication
When prompted for authentication, you have 3 options:

#### Option A: Username & Password/Token (Recommended)
```
Username: vaibhavshrivastavait
Password: [Your GitHub Password or Personal Access Token]
```

#### Option B: Personal Access Token (Most Secure)
1. Go to GitHub.com → Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` permissions
3. Use token as password:
```bash
git remote set-url origin https://vaibhavshrivastavait:YOUR_TOKEN@github.com/vaibhavshrivastavait/MHT.git
git push origin main
```

#### Option C: SSH Key (If Configured)
```bash
git remote set-url origin git@github.com:vaibhavshrivastavait/MHT.git
git push origin main
```

## 📦 What Will Be Synced

### ✅ Included Files (All Essential)
- **Source Code**: All `.tsx`, `.ts`, `.js`, `.jsx` files
- **Components**: All React Native components
- **Screens**: Complete app screens with AsyncStorage fixes
- **Configuration**: `app.json`, `package.json`, Android configs
- **Assets**: Images, fonts, guidelines data, drug interaction database
- **Documentation**: Setup guides, README files
- **Android Project**: Complete native Android structure
- **Utilities**: All helper functions and crash-proof storage

### ❌ Excluded Files (Large/Generated)
- `node_modules/` (593MB - restored with `yarn install`)
- Build outputs (`android/build/`, cache directories)
- Large binaries and temporary files

## 🏥 MHT Assessment Features in Sync

### Core Application
✅ **Complete Patient Assessment Workflow**
✅ **Drug Interaction Checker** (150 combinations)
✅ **MHT Guidelines** (10 sections, fully functional)
✅ **CME Mode** (6 modules with certificates)
✅ **Risk Calculators** (BMI, ASCVD, Framingham, etc.)
✅ **Treatment Plan Generator**
✅ **Patient Records Management**

### Critical Fixes Applied
✅ **AsyncStorage Error Resolved**: GuidelinesScreen crash fixed
✅ **Crash-proof Storage Wrapper**: Safe data persistence
✅ **Complete Navigation**: All screens working properly
✅ **Guidelines Functional**: Bookmarks and offline capability
✅ **App Stability**: No hanging or loading issues

## 🖥️ Local PC Setup After Sync

Once synced to GitHub, follow these steps on your local PC:

### 1. Clone Repository
```bash
git clone https://github.com/vaibhavshrivastavait/MHT.git
cd MHT
```

### 2. Install Dependencies
```bash
# Install Node.js dependencies
yarn install
# or
npm install
```

### 3. Setup Android Development
- Install Android Studio
- Configure Android SDK
- Set up environment variables (ANDROID_HOME)

### 4. Run Application
```bash
# Start development server
yarn start

# Run on Android emulator/device
yarn android

# Run in web browser
yarn web
```

### 5. Generate APK
```bash
# Generate Android APK
npx expo run:android

# Or build in Android Studio:
# 1. npx expo prebuild --platform android
# 2. Open android/ folder in Android Studio
# 3. Build → Generate Signed Bundle/APK
```

## 📄 Documentation Included

The sync will include these comprehensive guides:
- **LOCAL_PC_SETUP_COMPLETE.md**: Complete local development setup
- **SYNC_GUIDE.md**: GitHub synchronization guide
- **APK_BUILD_INSTRUCTIONS.md**: Android APK generation
- **DEPLOYMENT_GUIDE.md**: Production deployment steps

## 🔧 Troubleshooting Sync Issues

### If Authentication Fails:
1. **Check Credentials**: Verify GitHub username and password
2. **Use Personal Access Token**: More secure than password
3. **Enable 2FA**: May require token instead of password
4. **Check Repository Access**: Ensure you have push permissions

### If Files Missing After Sync:
1. **Re-run Sync**: Execute `./SYNC_TO_MHT_REPO.sh` again
2. **Check .gitignore**: Verify files aren't excluded
3. **Manual Push**: Use git commands directly if needed

### Common Git Commands:
```bash
# Check status
git status

# View remote URL
git remote -v

# Force push (if needed)
git push origin main --force

# View commit history
git log --oneline
```

## ✅ Success Verification

After successful sync, your GitHub repository should contain:
- [ ] Complete MHT Assessment source code
- [ ] All screens including fixed GuidelinesScreen
- [ ] Android project files
- [ ] Assets and configuration files
- [ ] Documentation and setup guides
- [ ] Recent commit with AsyncStorage fix message

## 🎯 Next Steps After Sync

1. **Verify Repository**: Check GitHub.com to confirm all files uploaded
2. **Local Setup**: Follow LOCAL_PC_SETUP_COMPLETE.md on your PC
3. **Test Build**: Generate APK to ensure everything works
4. **Development**: Continue adding features or customizations
5. **Updates**: Use the sync script for future changes

---

## 📞 Quick Commands Summary

```bash
# Run sync to GitHub
cd /app && ./SYNC_TO_MHT_REPO.sh

# On your local PC after clone:
git clone https://github.com/vaibhavshrivastavait/MHT.git
cd MHT
yarn install
yarn start
yarn android  # Generate APK
```

**🏥 Your MHT Assessment app is ready for GitHub sync and local development!**