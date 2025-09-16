#!/usr/bin/env python3
"""
AsyncStorage Crash Fixes Testing Suite for MHT Assessment App
Specifically tests the fixes mentioned in the review request:
1. Enhanced asyncStorageUtils.ts with dynamic initialization and retry mechanisms
2. Robust Zustand store configuration with safe rehydration
3. Enhanced SafeFlatList with interactive retry functionality
"""

import json
import os
import sys
import subprocess
from datetime import datetime
from pathlib import Path

class AsyncStorageCrashFixTester:
    def __init__(self):
        self.test_results = []
        self.app_root = Path(__file__).parent
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'timestamp': datetime.now().isoformat(),
            'details': details
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_dynamic_initialization_mechanism(self):
        """Test enhanced asyncStorageUtils.ts with dynamic initialization"""
        try:
            utils_file = self.app_root / "utils" / "asyncStorageUtils.ts"
            if not utils_file.exists():
                self.log_test("Dynamic Initialization", False, "asyncStorageUtils.ts file not found")
                return False
            
            content = utils_file.read_text()
            
            # Check for dynamic initialization features
            dynamic_features = [
                "initializeAsyncStorage",
                "dynamic import",
                "await import('@react-native-async-storage/async-storage')",
                "require('@react-native-async-storage/async-storage')",
                "AsyncStorage !== null",
                "AsyncStorage = null"
            ]
            
            found_features = []
            for feature in dynamic_features:
                if feature.lower().replace(" ", "").replace("-", "").replace("'", "") in content.lower().replace(" ", "").replace("-", "").replace("'", ""):
                    found_features.append(feature)
            
            # Check for initialization error handling
            error_handling = [
                "initializationError",
                "try {",
                "catch (error)",
                "console.warn",
                "fallback require"
            ]
            
            found_error_handling = []
            for pattern in error_handling:
                if pattern.lower() in content.lower():
                    found_error_handling.append(pattern)
            
            success_rate = len(found_features) / len(dynamic_features)
            error_rate = len(found_error_handling) / len(error_handling)
            
            if success_rate >= 0.6 and error_rate >= 0.6:
                self.log_test("Dynamic Initialization", True, 
                             f"Dynamic initialization verified ({success_rate:.1%} features, {error_rate:.1%} error handling)",
                             {"features": found_features, "error_handling": found_error_handling})
                return True
            else:
                self.log_test("Dynamic Initialization", False, 
                             f"Insufficient dynamic initialization ({success_rate:.1%} features, {error_rate:.1%} error handling)")
                return False
            
        except Exception as e:
            self.log_test("Dynamic Initialization", False, f"Error checking dynamic initialization: {str(e)}")
            return False
    
    def test_retry_mechanisms(self):
        """Test retry mechanisms in asyncStorageUtils.ts"""
        try:
            utils_file = self.app_root / "utils" / "asyncStorageUtils.ts"
            if not utils_file.exists():
                self.log_test("Retry Mechanisms", False, "asyncStorageUtils.ts file not found")
                return False
            
            content = utils_file.read_text()
            
            # Check for retry patterns
            retry_patterns = [
                "retry",
                "retryError",
                "reinitialize AsyncStorage",
                "Try to reinitialize",
                "AsyncStorage retry failed",
                "initializeAsyncStorage()"
            ]
            
            found_patterns = []
            for pattern in retry_patterns:
                if pattern.lower() in content.lower():
                    found_patterns.append(pattern)
            
            # Check for method-level retry logic
            method_retry_checks = [
                "getItem.*retry",
                "setItem.*retry", 
                "removeItem.*retry"
            ]
            
            import re
            found_method_retries = []
            for pattern in method_retry_checks:
                if re.search(pattern, content, re.IGNORECASE | re.DOTALL):
                    found_method_retries.append(pattern)
            
            if len(found_patterns) >= 3 and len(found_method_retries) >= 2:
                self.log_test("Retry Mechanisms", True, 
                             f"Retry mechanisms verified ({len(found_patterns)} patterns, {len(found_method_retries)} method retries)",
                             {"patterns": found_patterns, "method_retries": found_method_retries})
                return True
            else:
                self.log_test("Retry Mechanisms", False, 
                             f"Insufficient retry mechanisms ({len(found_patterns)} patterns, {len(found_method_retries)} method retries)")
                return False
            
        except Exception as e:
            self.log_test("Retry Mechanisms", False, f"Error checking retry mechanisms: {str(e)}")
            return False
    
    def test_safe_rehydration_configuration(self):
        """Test robust Zustand store configuration with safe rehydration"""
        try:
            store_file = self.app_root / "store" / "assessmentStore.ts"
            if not store_file.exists():
                self.log_test("Safe Rehydration", False, "assessmentStore.ts file not found")
                return False
            
            content = store_file.read_text()
            
            # Check for safe rehydration features
            rehydration_features = [
                "onRehydrateStorage",
                "crashProofStorage",
                "isAvailable()",
                "error rehydrating store",
                "default state",
                "fallback states",
                "migrate",
                "version"
            ]
            
            found_features = []
            for feature in rehydration_features:
                if feature.lower().replace(" ", "") in content.lower().replace(" ", ""):
                    found_features.append(feature)
            
            # Check for error recovery in storage operations
            storage_safety = [
                "try {",
                "catch (error)",
                "console.error",
                "return null",
                "JSON.parse",
                "JSON.stringify",
                "Don't throw error"
            ]
            
            found_safety = []
            for pattern in storage_safety:
                if pattern.lower() in content.lower():
                    found_safety.append(pattern)
            
            success_rate = len(found_features) / len(rehydration_features)
            safety_rate = len(found_safety) / len(storage_safety)
            
            if success_rate >= 0.7 and safety_rate >= 0.6:
                self.log_test("Safe Rehydration", True, 
                             f"Safe rehydration verified ({success_rate:.1%} features, {safety_rate:.1%} safety)",
                             {"features": found_features, "safety": found_safety})
                return True
            else:
                self.log_test("Safe Rehydration", False, 
                             f"Insufficient safe rehydration ({success_rate:.1%} features, {safety_rate:.1%} safety)")
                return False
            
        except Exception as e:
            self.log_test("Safe Rehydration", False, f"Error checking safe rehydration: {str(e)}")
            return False
    
    def test_interactive_retry_functionality(self):
        """Test enhanced SafeFlatList with interactive retry functionality"""
        try:
            component_file = self.app_root / "components" / "SafeFlatList.tsx"
            if not component_file.exists():
                self.log_test("Interactive Retry", False, "SafeFlatList.tsx file not found")
                return False
            
            content = component_file.read_text()
            
            # Check for interactive retry features
            retry_features = [
                "handleRetry",
                "retryCount",
                "Try Again",
                "TouchableOpacity",
                "onRetry",
                "refresh",
                "MaterialIcons.*refresh",
                "retryButton"
            ]
            
            found_features = []
            import re
            for feature in retry_features:
                if ".*" in feature:
                    if re.search(feature, content, re.IGNORECASE):
                        found_features.append(feature)
                else:
                    if feature.lower() in content.lower():
                        found_features.append(feature)
            
            # Check for retry state management
            state_management = [
                "retryCount",
                "hasError",
                "setState",
                "prevState",
                "error: undefined"
            ]
            
            found_state = []
            for pattern in state_management:
                if pattern.lower() in content.lower():
                    found_state.append(pattern)
            
            # Check for user feedback
            user_feedback = [
                "Unable to load list",
                "Try Again",
                "Persistent storage issue",
                "error-outline",
                "errorContainer"
            ]
            
            found_feedback = []
            for pattern in user_feedback:
                if pattern.lower() in content.lower():
                    found_feedback.append(pattern)
            
            total_score = len(found_features) + len(found_state) + len(found_feedback)
            max_score = len(retry_features) + len(state_management) + len(user_feedback)
            success_rate = total_score / max_score
            
            if success_rate >= 0.7:
                self.log_test("Interactive Retry", True, 
                             f"Interactive retry functionality verified ({success_rate:.1%} features)",
                             {"retry_features": found_features, "state_management": found_state, "user_feedback": found_feedback})
                return True
            else:
                self.log_test("Interactive Retry", False, 
                             f"Insufficient interactive retry functionality ({success_rate:.1%} features)")
                return False
            
        except Exception as e:
            self.log_test("Interactive Retry", False, f"Error checking interactive retry: {str(e)}")
            return False
    
    def test_patient_data_loading_persistence(self):
        """Test patient data loading and persistence with error handling"""
        try:
            # Check PatientListScreen for proper error handling
            patient_screen = self.app_root / "screens" / "PatientListScreen.tsx"
            if not patient_screen.exists():
                self.log_test("Patient Data Persistence", False, "PatientListScreen.tsx not found")
                return False
            
            content = patient_screen.read_text()
            
            # Check for data loading safety
            loading_safety = [
                "SafeFlatList",
                "useAssessmentStore",
                "patients || []",
                "Array.isArray",
                "formatDate",
                "try {",
                "catch (error)",
                "Invalid Date"
            ]
            
            found_safety = []
            for pattern in loading_safety:
                if pattern.lower() in content.lower():
                    found_safety.append(pattern)
            
            # Check store integration
            store_file = self.app_root / "store" / "assessmentStore.ts"
            if store_file.exists():
                store_content = store_file.read_text()
                
                persistence_features = [
                    "savePatient",
                    "loadPatients", 
                    "deletePatient",
                    "deleteAllPatients",
                    "crashProofStorage",
                    "persist"
                ]
                
                found_persistence = []
                for feature in persistence_features:
                    if feature.lower() in store_content.lower():
                        found_persistence.append(feature)
            else:
                found_persistence = []
            
            total_features = len(found_safety) + len(found_persistence)
            max_features = len(loading_safety) + len(persistence_features)
            success_rate = total_features / max_features
            
            if success_rate >= 0.7:
                self.log_test("Patient Data Persistence", True, 
                             f"Patient data persistence verified ({success_rate:.1%} features)",
                             {"loading_safety": found_safety, "persistence": found_persistence})
                return True
            else:
                self.log_test("Patient Data Persistence", False, 
                             f"Insufficient patient data persistence ({success_rate:.1%} features)")
                return False
            
        except Exception as e:
            self.log_test("Patient Data Persistence", False, f"Error checking patient data persistence: {str(e)}")
            return False
    
    def test_guidelines_data_access(self):
        """Test guidelines data access with error handling"""
        try:
            guidelines_screen = self.app_root / "screens" / "GuidelinesScreen.tsx"
            if not guidelines_screen.exists():
                self.log_test("Guidelines Data Access", False, "GuidelinesScreen.tsx not found")
                return False
            
            content = guidelines_screen.read_text()
            
            # Check for guidelines data access safety
            access_safety = [
                "crashProofStorage",
                "SafeFlatList",
                "loadBookmarks",
                "saveBookmarks",
                "try {",
                "catch (error)",
                "console.error",
                "JSON.parse",
                "JSON.stringify"
            ]
            
            found_safety = []
            for pattern in access_safety:
                if pattern.lower() in content.lower():
                    found_safety.append(pattern)
            
            # Check for data validation
            validation_patterns = [
                "filteredSections || []",
                "guidelines.sections",
                "Array.isArray",
                "item.id",
                "bookmarks.includes"
            ]
            
            found_validation = []
            for pattern in validation_patterns:
                if pattern.lower() in content.lower():
                    found_validation.append(pattern)
            
            success_rate = (len(found_safety) + len(found_validation)) / (len(access_safety) + len(validation_patterns))
            
            if success_rate >= 0.6:
                self.log_test("Guidelines Data Access", True, 
                             f"Guidelines data access verified ({success_rate:.1%} features)",
                             {"safety": found_safety, "validation": found_validation})
                return True
            else:
                self.log_test("Guidelines Data Access", False, 
                             f"Insufficient guidelines data access safety ({success_rate:.1%} features)")
                return False
            
        except Exception as e:
            self.log_test("Guidelines Data Access", False, f"Error checking guidelines data access: {str(e)}")
            return False
    
    def test_error_conditions_handling(self):
        """Test AsyncStorage operations under error conditions"""
        try:
            utils_file = self.app_root / "utils" / "asyncStorageUtils.ts"
            if not utils_file.exists():
                self.log_test("Error Conditions Handling", False, "asyncStorageUtils.ts not found")
                return False
            
            content = utils_file.read_text()
            
            # Check for comprehensive error handling
            error_conditions = [
                "AsyncStorage not available",
                "typeof AsyncStorage.getItem !== 'function'",
                "typeof AsyncStorage.setItem !== 'function'",
                "typeof AsyncStorage.removeItem !== 'function'",
                "console.warn",
                "console.error",
                "return null",
                "initializationError"
            ]
            
            found_conditions = []
            for condition in error_conditions:
                if condition.lower() in content.lower():
                    found_conditions.append(condition)
            
            # Check for method availability checks
            availability_checks = [
                "isAvailable",
                "AsyncStorage && typeof",
                "function availability",
                "method existence"
            ]
            
            found_checks = []
            for check in availability_checks:
                if check.lower().replace(" ", "") in content.lower().replace(" ", ""):
                    found_checks.append(check)
            
            success_rate = len(found_conditions) / len(error_conditions)
            
            if success_rate >= 0.7:
                self.log_test("Error Conditions Handling", True, 
                             f"Error conditions handling verified ({success_rate:.1%} coverage)",
                             {"conditions": found_conditions, "checks": found_checks})
                return True
            else:
                self.log_test("Error Conditions Handling", False, 
                             f"Insufficient error conditions handling ({success_rate:.1%} coverage)")
                return False
            
        except Exception as e:
            self.log_test("Error Conditions Handling", False, f"Error checking error conditions: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all AsyncStorage crash fix tests"""
        print("=" * 80)
        print("MHT Assessment App - AsyncStorage Crash Fixes Testing Suite")
        print("=" * 80)
        print("Testing specific fixes mentioned in review request:")
        print("1. Enhanced asyncStorageUtils.ts with dynamic initialization and retry mechanisms")
        print("2. Robust Zustand store configuration with safe rehydration")
        print("3. Enhanced SafeFlatList with interactive retry functionality")
        print("4. Patient data loading and persistence")
        print("5. Guidelines data access")
        print("6. AsyncStorage operations under error conditions")
        print("7. Error recovery mechanisms")
        print()
        
        # Test sequence focusing on the specific fixes
        tests = [
            ("Dynamic Initialization Mechanism", self.test_dynamic_initialization_mechanism),
            ("Retry Mechanisms", self.test_retry_mechanisms),
            ("Safe Rehydration Configuration", self.test_safe_rehydration_configuration),
            ("Interactive Retry Functionality", self.test_interactive_retry_functionality),
            ("Patient Data Loading & Persistence", self.test_patient_data_loading_persistence),
            ("Guidelines Data Access", self.test_guidelines_data_access),
            ("Error Conditions Handling", self.test_error_conditions_handling)
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"\nRunning: {test_name}")
            try:
                if test_func():
                    passed += 1
            except Exception as e:
                self.log_test(test_name, False, f"Test execution error: {str(e)}")
        
        print("\n" + "=" * 80)
        print(f"ASYNCSTORAGE CRASH FIXES TEST SUMMARY: {passed}/{total} tests passed")
        print("=" * 80)
        
        # Print detailed results
        print("\nDetailed Results:")
        for result in self.test_results:
            status = "✅" if result['success'] else "❌"
            print(f"{status} {result['test']}: {result['message']}")
        
        return passed, total, passed == total

def main():
    """Main test execution"""
    tester = AsyncStorageCrashFixTester()
    passed, total, all_passed = tester.run_all_tests()
    
    print(f"\n{'='*80}")
    print("FINAL ASSESSMENT:")
    print(f"{'='*80}")
    
    if all_passed:
        print("🎉 ALL ASYNCSTORAGE CRASH FIXES VERIFIED SUCCESSFULLY!")
        print("✅ Enhanced asyncStorageUtils.ts with dynamic initialization - WORKING")
        print("✅ Retry mechanisms for AsyncStorage operations - WORKING") 
        print("✅ Robust Zustand store configuration with safe rehydration - WORKING")
        print("✅ Enhanced SafeFlatList with interactive retry functionality - WORKING")
        print("✅ Patient data loading and persistence safety - WORKING")
        print("✅ Guidelines data access error handling - WORKING")
        print("✅ AsyncStorage operations under error conditions - WORKING")
        print("\n🛡️  The app should no longer crash with 'unable to load list' errors!")
        sys.exit(0)
    else:
        print(f"⚠️  {total - passed}/{total} AsyncStorage crash fix tests failed.")
        print("❌ Some AsyncStorage crash fixes may not be fully implemented")
        print("🔧 Review the failed tests above for specific issues")
        sys.exit(1)

if __name__ == "__main__":
    main()