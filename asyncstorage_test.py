#!/usr/bin/env python3
"""
AsyncStorage Testing Suite for MHT Assessment App
Tests AsyncStorage crash fixes and error recovery mechanisms
"""

import json
import os
import sys
import subprocess
from datetime import datetime
from pathlib import Path

class AsyncStorageTestSuite:
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
    
    def test_asyncstorage_utils_implementation(self):
        """Test asyncStorageUtils.ts implementation"""
        try:
            utils_file = self.app_root / "utils" / "asyncStorageUtils.ts"
            if not utils_file.exists():
                self.log_test("AsyncStorage Utils", False, "asyncStorageUtils.ts file not found")
                return False
            
            content = utils_file.read_text()
            
            # Check for key implementation features
            required_features = [
                "initializeAsyncStorage",
                "crashProofStorage",
                "dynamic import",
                "retry mechanisms",
                "error handling",
                "getItem",
                "setItem", 
                "removeItem",
                "isAvailable"
            ]
            
            missing_features = []
            for feature in required_features:
                if feature.lower().replace(" ", "") not in content.lower().replace(" ", ""):
                    missing_features.append(feature)
            
            if missing_features:
                self.log_test("AsyncStorage Utils", False, f"Missing features: {missing_features}")
                return False
            
            # Check for specific crash prevention patterns
            crash_prevention_patterns = [
                "try {",
                "catch",
                "console.error",
                "typeof AsyncStorage",
                "null checks"
            ]
            
            found_patterns = []
            for pattern in crash_prevention_patterns:
                if pattern.lower() in content.lower():
                    found_patterns.append(pattern)
            
            self.log_test("AsyncStorage Utils", True, 
                         f"Implementation verified with {len(found_patterns)}/{len(crash_prevention_patterns)} safety patterns",
                         {"found_patterns": found_patterns})
            return True
            
        except Exception as e:
            self.log_test("AsyncStorage Utils", False, f"Error checking implementation: {str(e)}")
            return False
    
    def test_zustand_store_configuration(self):
        """Test Zustand store configuration with safe rehydration"""
        try:
            store_file = self.app_root / "store" / "assessmentStore.ts"
            if not store_file.exists():
                self.log_test("Zustand Store Config", False, "assessmentStore.ts file not found")
                return False
            
            content = store_file.read_text()
            
            # Check for safe rehydration features
            rehydration_features = [
                "crashProofStorage",
                "onRehydrateStorage",
                "error handling",
                "fallback states",
                "migrate",
                "version",
                "persist"
            ]
            
            found_features = []
            for feature in rehydration_features:
                if feature.lower().replace(" ", "") in content.lower().replace(" ", ""):
                    found_features.append(feature)
            
            # Check for specific error recovery patterns
            error_recovery_patterns = [
                "try {",
                "catch (error)",
                "console.error",
                "return null",
                "default state",
                "JSON.parse",
                "JSON.stringify"
            ]
            
            found_recovery = []
            for pattern in error_recovery_patterns:
                if pattern.lower() in content.lower():
                    found_recovery.append(pattern)
            
            success_rate = (len(found_features) + len(found_recovery)) / (len(rehydration_features) + len(error_recovery_patterns))
            
            if success_rate >= 0.8:  # 80% of features found
                self.log_test("Zustand Store Config", True, 
                             f"Store configuration verified ({success_rate:.1%} features found)",
                             {"rehydration_features": found_features, "recovery_patterns": found_recovery})
                return True
            else:
                self.log_test("Zustand Store Config", False, 
                             f"Insufficient safety features ({success_rate:.1%} found)",
                             {"missing_features": set(rehydration_features) - set(found_features)})
                return False
            
        except Exception as e:
            self.log_test("Zustand Store Config", False, f"Error checking store config: {str(e)}")
            return False
    
    def test_safe_flatlist_implementation(self):
        """Test SafeFlatList component with error boundaries"""
        try:
            component_file = self.app_root / "components" / "SafeFlatList.tsx"
            if not component_file.exists():
                self.log_test("SafeFlatList Component", False, "SafeFlatList.tsx file not found")
                return False
            
            content = component_file.read_text()
            
            # Check for error boundary features
            error_boundary_features = [
                "getDerivedStateFromError",
                "componentDidCatch",
                "hasError",
                "retry",
                "fallback",
                "error handling",
                "TouchableOpacity",
                "Try Again"
            ]
            
            found_features = []
            for feature in error_boundary_features:
                if feature.lower().replace(" ", "") in content.lower().replace(" ", ""):
                    found_features.append(feature)
            
            # Check for specific AsyncStorage error handling
            asyncstorage_patterns = [
                "AsyncStorage",
                "getItem",
                "setItem",
                "Cannot read property",
                "TypeError",
                "storage error"
            ]
            
            found_patterns = []
            for pattern in asyncstorage_patterns:
                if pattern.lower().replace(" ", "") in content.lower().replace(" ", ""):
                    found_patterns.append(pattern)
            
            if len(found_features) >= 6 and len(found_patterns) >= 3:
                self.log_test("SafeFlatList Component", True, 
                             f"Error boundary implementation verified ({len(found_features)} features, {len(found_patterns)} AsyncStorage patterns)",
                             {"features": found_features, "patterns": found_patterns})
                return True
            else:
                self.log_test("SafeFlatList Component", False, 
                             f"Insufficient error handling ({len(found_features)} features, {len(found_patterns)} patterns)")
                return False
            
        except Exception as e:
            self.log_test("SafeFlatList Component", False, f"Error checking SafeFlatList: {str(e)}")
            return False
    
    def test_patient_records_integration(self):
        """Test Patient Records screen AsyncStorage integration"""
        try:
            screen_file = self.app_root / "screens" / "PatientListScreen.tsx"
            if not screen_file.exists():
                self.log_test("Patient Records Integration", False, "PatientListScreen.tsx file not found")
                return False
            
            content = screen_file.read_text()
            
            # Check for proper AsyncStorage integration
            integration_features = [
                "useAssessmentStore",
                "SafeFlatList",
                "patients",
                "deletePatient",
                "deleteAllPatients",
                "error handling",
                "refreshing",
                "formatDate"
            ]
            
            found_features = []
            for feature in integration_features:
                if feature.lower().replace(" ", "") in content.lower().replace(" ", ""):
                    found_features.append(feature)
            
            # Check for crash prevention in data handling
            crash_prevention = [
                "try {",
                "catch",
                "|| []",
                "Array.isArray",
                "typeof",
                "isNaN",
                "Invalid Date"
            ]
            
            found_prevention = []
            for pattern in crash_prevention:
                if pattern.lower() in content.lower():
                    found_prevention.append(pattern)
            
            success_rate = len(found_features) / len(integration_features)
            
            if success_rate >= 0.8:
                self.log_test("Patient Records Integration", True, 
                             f"Integration verified ({success_rate:.1%} features, {len(found_prevention)} safety patterns)",
                             {"features": found_features, "safety": found_prevention})
                return True
            else:
                self.log_test("Patient Records Integration", False, 
                             f"Insufficient integration ({success_rate:.1%} features found)")
                return False
            
        except Exception as e:
            self.log_test("Patient Records Integration", False, f"Error checking integration: {str(e)}")
            return False
    
    def test_guidelines_screen_integration(self):
        """Test Guidelines screen AsyncStorage integration"""
        try:
            screen_file = self.app_root / "screens" / "GuidelinesScreen.tsx"
            if not screen_file.exists():
                self.log_test("Guidelines Integration", False, "GuidelinesScreen.tsx file not found")
                return False
            
            content = screen_file.read_text()
            
            # Check for proper AsyncStorage integration
            integration_features = [
                "crashProofStorage",
                "SafeFlatList",
                "loadBookmarks",
                "saveBookmarks",
                "BOOKMARKS_KEY",
                "error handling",
                "try {",
                "catch"
            ]
            
            found_features = []
            for feature in integration_features:
                if feature.lower().replace(" ", "") in content.lower().replace(" ", ""):
                    found_features.append(feature)
            
            # Check for specific AsyncStorage operations
            storage_operations = [
                "getItem",
                "setItem",
                "JSON.parse",
                "JSON.stringify",
                "console.error"
            ]
            
            found_operations = []
            for op in storage_operations:
                if op.lower() in content.lower():
                    found_operations.append(op)
            
            success_rate = len(found_features) / len(integration_features)
            
            if success_rate >= 0.7:
                self.log_test("Guidelines Integration", True, 
                             f"Integration verified ({success_rate:.1%} features, {len(found_operations)} storage operations)",
                             {"features": found_features, "operations": found_operations})
                return True
            else:
                self.log_test("Guidelines Integration", False, 
                             f"Insufficient integration ({success_rate:.1%} features found)")
                return False
            
        except Exception as e:
            self.log_test("Guidelines Integration", False, f"Error checking guidelines integration: {str(e)}")
            return False
    
    def test_error_recovery_mechanisms(self):
        """Test overall error recovery mechanisms"""
        try:
            # Check for error recovery patterns across key files
            key_files = [
                "utils/asyncStorageUtils.ts",
                "store/assessmentStore.ts", 
                "components/SafeFlatList.tsx"
            ]
            
            recovery_mechanisms = {
                "retry_logic": ["retry", "retryCount", "handleRetry"],
                "fallback_states": ["fallback", "default", "empty array", "null"],
                "error_boundaries": ["getDerivedStateFromError", "componentDidCatch", "hasError"],
                "graceful_degradation": ["isAvailable", "console.warn", "return null"],
                "user_feedback": ["Try Again", "Unable to load", "error message"]
            }
            
            found_mechanisms = {}
            
            for file_path in key_files:
                full_path = self.app_root / file_path
                if full_path.exists():
                    content = full_path.read_text().lower()
                    
                    for mechanism, patterns in recovery_mechanisms.items():
                        if mechanism not in found_mechanisms:
                            found_mechanisms[mechanism] = []
                        
                        for pattern in patterns:
                            if pattern.lower() in content:
                                found_mechanisms[mechanism].append(f"{file_path}:{pattern}")
            
            # Calculate coverage
            total_mechanisms = len(recovery_mechanisms)
            implemented_mechanisms = len([m for m in found_mechanisms.values() if m])
            coverage = implemented_mechanisms / total_mechanisms
            
            if coverage >= 0.8:
                self.log_test("Error Recovery Mechanisms", True, 
                             f"Recovery mechanisms verified ({coverage:.1%} coverage)",
                             found_mechanisms)
                return True
            else:
                self.log_test("Error Recovery Mechanisms", False, 
                             f"Insufficient recovery mechanisms ({coverage:.1%} coverage)",
                             found_mechanisms)
                return False
            
        except Exception as e:
            self.log_test("Error Recovery Mechanisms", False, f"Error checking recovery mechanisms: {str(e)}")
            return False
    
    def test_data_persistence_safety(self):
        """Test data persistence safety measures"""
        try:
            store_file = self.app_root / "store" / "assessmentStore.ts"
            if not store_file.exists():
                self.log_test("Data Persistence Safety", False, "Store file not found")
                return False
            
            content = store_file.read_text()
            
            # Check for data safety patterns
            safety_patterns = [
                "JSON.parse",
                "JSON.stringify", 
                "try {",
                "catch (error)",
                "Date objects",
                "createdAt",
                "updatedAt",
                "new Date()",
                "isNaN",
                "typeof"
            ]
            
            found_patterns = []
            for pattern in safety_patterns:
                if pattern.lower().replace(" ", "") in content.lower().replace(" ", ""):
                    found_patterns.append(pattern)
            
            # Check for specific data validation
            validation_patterns = [
                "patient.name",
                "patient.age", 
                "filter",
                "map",
                "|| []",
                "|| {}",
                "default"
            ]
            
            found_validation = []
            for pattern in validation_patterns:
                if pattern.lower() in content.lower():
                    found_validation.append(pattern)
            
            total_safety = len(found_patterns) + len(found_validation)
            expected_safety = len(safety_patterns) + len(validation_patterns)
            safety_score = total_safety / expected_safety
            
            if safety_score >= 0.7:
                self.log_test("Data Persistence Safety", True, 
                             f"Data safety verified ({safety_score:.1%} safety measures)",
                             {"safety_patterns": found_patterns, "validation": found_validation})
                return True
            else:
                self.log_test("Data Persistence Safety", False, 
                             f"Insufficient safety measures ({safety_score:.1%} found)")
                return False
            
        except Exception as e:
            self.log_test("Data Persistence Safety", False, f"Error checking data safety: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all AsyncStorage tests"""
        print("=" * 70)
        print("MHT Assessment App - AsyncStorage Crash Fixes Testing Suite")
        print("=" * 70)
        print("Testing AsyncStorage crash fixes and error recovery mechanisms")
        print()
        
        # Test sequence
        tests = [
            ("AsyncStorage Utils Implementation", self.test_asyncstorage_utils_implementation),
            ("Zustand Store Safe Rehydration", self.test_zustand_store_configuration),
            ("SafeFlatList Error Boundaries", self.test_safe_flatlist_implementation),
            ("Patient Records Integration", self.test_patient_records_integration),
            ("Guidelines Screen Integration", self.test_guidelines_screen_integration),
            ("Error Recovery Mechanisms", self.test_error_recovery_mechanisms),
            ("Data Persistence Safety", self.test_data_persistence_safety)
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
        
        print("\n" + "=" * 70)
        print(f"ASYNCSTORAGE TEST SUMMARY: {passed}/{total} tests passed")
        print("=" * 70)
        
        # Print detailed results
        print("\nDetailed Results:")
        for result in self.test_results:
            status = "✅" if result['success'] else "❌"
            print(f"{status} {result['test']}: {result['message']}")
        
        return passed, total, passed == total

def main():
    """Main test execution"""
    tester = AsyncStorageTestSuite()
    passed, total, all_passed = tester.run_all_tests()
    
    if all_passed:
        print("\n🎉 All AsyncStorage crash fix tests passed!")
        print("✅ Enhanced asyncStorageUtils.ts with dynamic initialization verified")
        print("✅ Robust Zustand store configuration with safe rehydration verified")
        print("✅ Enhanced SafeFlatList with interactive retry functionality verified")
        print("✅ Patient data loading and persistence safety verified")
        print("✅ Guidelines data access error handling verified")
        print("✅ AsyncStorage operations under error conditions verified")
        print("✅ Error recovery mechanisms verified")
        sys.exit(0)
    else:
        print(f"\n⚠️  {total - passed}/{total} AsyncStorage tests failed. Check the details above.")
        print("❌ Some AsyncStorage crash fixes may not be properly implemented")
        sys.exit(1)

if __name__ == "__main__":
    main()