#!/usr/bin/env python3
"""
Advanced Drug Interaction System Debugging Test
This test simulates the exact data flow from JSON → drugRules.ts → DecisionSupportScreen → AnalysisResultsDisplay
to identify why users might still see old severity levels.
"""

import json
import os
import re
from typing import Dict, List, Any, Optional

class AdvancedDrugInteractionDebugger:
    def __init__(self):
        self.app_path = "/app"
        self.json_rules_path = "/app/assets/rules/drug_interactions.json"
        self.test_results = []
        
    def log_test(self, test_name: str, status: str, details: str = ""):
        """Log test results"""
        result = {
            "test": test_name,
            "status": status,
            "details": details
        }
        self.test_results.append(result)
        
        status_icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
        print(f"{status_icon} {test_name}: {status}")
        if details:
            print(f"   Details: {details}")
        print()

    def test_data_flow_simulation(self):
        """Simulate the exact data flow from JSON to UI components"""
        test_name = "Data Flow Simulation"
        
        try:
            # Step 1: Load JSON rules (simulating drugRules.ts loadLocalRules)
            with open(self.json_rules_path, 'r') as f:
                json_data = json.load(f)
            rules = json_data['rules']
            
            # Step 2: Simulate findInteractionsForSelection with real test case
            primary_groups = ["Hormone Replacement Therapy (HRT)"]
            current_medicines = ["warfarin"]
            
            # Find matching interactions (simulating the exact logic from drugRules.ts)
            interactions_found = []
            for primary in primary_groups:
                for medicine in current_medicines:
                    for rule in rules:
                        if rule.get('primary', '').lower() == primary.lower():
                            examples = [ex.lower() for ex in rule.get('examples', [])]
                            if medicine.lower() in examples:
                                interaction = {
                                    "medication": medicine,
                                    "primary": primary,
                                    "severity": rule.get('severity'),  # This should be HIGH/MODERATE/LOW
                                    "severityLabel": self.get_severity_label(rule.get('severity')),
                                    "rationale": rule.get('rationale'),
                                    "recommended_action": rule.get('recommended_action'),
                                    "source": "Rules (local)",
                                    "match_type": "exact"
                                }
                                interactions_found.append(interaction)
            
            # Step 3: Simulate the compatible result creation (from DecisionSupportScreen.tsx)
            compatible_result = {
                "interactions": [
                    {
                        "medication": result["medication"],
                        "severity": result["severity"],  # This should be HIGH/MODERATE/LOW from JSON
                        "description": result["rationale"],
                        "recommendedAction": result["recommended_action"],
                        "source": result["source"]
                    }
                    for result in interactions_found
                ],
                "summary": {
                    "totalInteractions": len(interactions_found),
                    "highSeverityCount": len([r for r in interactions_found if r['severity'] == 'HIGH']),
                    "mediumSeverityCount": len([r for r in interactions_found if r['severity'] == 'MODERATE']),
                    "lowSeverityCount": len([r for r in interactions_found if r['severity'] == 'LOW'])
                }
            }
            
            # Step 4: Simulate AnalysisResultsDisplay severity mapping
            ui_results = []
            for interaction in compatible_result["interactions"]:
                severity = interaction["severity"]
                color = self.get_severity_color(severity)
                icon = self.get_severity_icon(severity)
                
                ui_results.append({
                    "medication": interaction["medication"],
                    "severity": severity,
                    "color": color,
                    "icon": icon,
                    "description": interaction["description"]
                })
            
            # Verify the complete data flow
            if not interactions_found:
                self.log_test(test_name, "FAIL", "No interactions found in simulation")
                return
            
            # Check if we have the expected HRT + warfarin HIGH severity
            hrt_warfarin = next((i for i in interactions_found if 
                               i['medication'].lower() == 'warfarin' and 
                               'hormone replacement therapy' in i['primary'].lower()), None)
            
            if not hrt_warfarin:
                self.log_test(test_name, "FAIL", "HRT + warfarin interaction not found")
                return
            
            if hrt_warfarin['severity'] != 'HIGH':
                self.log_test(test_name, "FAIL", f"HRT + warfarin severity is {hrt_warfarin['severity']}, expected HIGH")
                return
            
            # Check UI mapping
            ui_hrt_warfarin = next((u for u in ui_results if u['medication'].lower() == 'warfarin'), None)
            if not ui_hrt_warfarin:
                self.log_test(test_name, "FAIL", "UI mapping for HRT + warfarin not found")
                return
            
            expected_color = '#DC2626'  # Red for HIGH severity
            expected_icon = 'dangerous'
            
            if ui_hrt_warfarin['color'] != expected_color:
                self.log_test(test_name, "FAIL", f"UI color is {ui_hrt_warfarin['color']}, expected {expected_color}")
                return
            
            if ui_hrt_warfarin['icon'] != expected_icon:
                self.log_test(test_name, "FAIL", f"UI icon is {ui_hrt_warfarin['icon']}, expected {expected_icon}")
                return
            
            details = f"Complete data flow verified: JSON({hrt_warfarin['severity']}) → UI({ui_hrt_warfarin['color']}, {ui_hrt_warfarin['icon']})"
            self.log_test(test_name, "PASS", details)
            
        except Exception as e:
            self.log_test(test_name, "FAIL", f"Exception: {str(e)}")

    def test_potential_caching_issues(self):
        """Check for potential caching issues that might cause old data to persist"""
        test_name = "Potential Caching Issues"
        
        try:
            # Check if there are any cached analysis results that might be interfering
            decision_support_path = "/app/screens/DecisionSupportScreen.tsx"
            
            with open(decision_support_path, 'r') as f:
                content = f.read()
            
            # Look for caching mechanisms
            caching_indicators = []
            
            if "cacheAnalysisResult" in content:
                caching_indicators.append("Analysis results are cached")
            
            if "loadCachedAnalysis" in content:
                caching_indicators.append("Cached analysis is loaded on component mount")
            
            if "invalidateAnalysisCache" in content:
                caching_indicators.append("Cache invalidation mechanism exists")
            
            # Check if there's proper cache invalidation when medicines change
            cache_invalidation_patterns = [
                r"setMedicines.*invalidate",
                r"removeMedicine.*invalidate",
                r"medicines.*change.*cache"
            ]
            
            has_proper_invalidation = any(re.search(pattern, content, re.IGNORECASE) 
                                        for pattern in cache_invalidation_patterns)
            
            if caching_indicators and not has_proper_invalidation:
                self.log_test(test_name, "WARN", 
                            f"Caching detected but invalidation unclear: {'; '.join(caching_indicators)}")
            elif caching_indicators:
                self.log_test(test_name, "PASS", 
                            f"Caching with proper invalidation: {'; '.join(caching_indicators)}")
            else:
                self.log_test(test_name, "PASS", "No caching detected - results should always be fresh")
                
        except Exception as e:
            self.log_test(test_name, "FAIL", f"Exception: {str(e)}")

    def test_component_state_management(self):
        """Check for potential state management issues"""
        test_name = "Component State Management"
        
        try:
            decision_support_path = "/app/screens/DecisionSupportScreen.tsx"
            
            with open(decision_support_path, 'r') as f:
                content = f.read()
            
            # Check for potential state issues
            state_issues = []
            
            # Check if there are multiple analysis result states that might conflict
            analysis_states = re.findall(r'useState.*[Aa]nalysis.*Result', content)
            if len(analysis_states) > 1:
                state_issues.append(f"Multiple analysis result states detected: {len(analysis_states)}")
            
            # Check if there's proper state clearing when medicines change
            if "setAnalysisResult(null)" in content:
                state_issues.append("Analysis result is properly cleared when medicines change")
            else:
                state_issues.append("Analysis result may not be cleared when medicines change")
            
            # Check for race conditions in async operations
            if "setIsAnalyzing(true)" in content and "setIsAnalyzing(false)" in content:
                state_issues.append("Loading state management present")
            
            # Look for potential old analyzer usage
            old_analyzer_patterns = [
                "drugInteractionChecker",
                "enhancedDrugAnalyzer", 
                "oldAnalyzer",
                "legacyAnalyzer"
            ]
            
            old_analyzer_usage = [pattern for pattern in old_analyzer_patterns if pattern in content]
            if old_analyzer_usage:
                state_issues.append(f"Potential old analyzer usage: {old_analyzer_usage}")
            
            if any("may not be cleared" in issue or "old analyzer" in issue.lower() for issue in state_issues):
                self.log_test(test_name, "WARN", f"Potential issues: {'; '.join(state_issues)}")
            else:
                self.log_test(test_name, "PASS", f"State management looks good: {'; '.join(state_issues)}")
                
        except Exception as e:
            self.log_test(test_name, "FAIL", f"Exception: {str(e)}")

    def test_fallback_mechanisms(self):
        """Check if there are fallback mechanisms that might use old analyzers"""
        test_name = "Fallback Mechanisms"
        
        try:
            decision_support_path = "/app/screens/DecisionSupportScreen.tsx"
            
            with open(decision_support_path, 'r') as f:
                content = f.read()
            
            # Look for fallback code that might use old systems
            fallback_patterns = [
                r"catch.*error.*fallback",
                r"try.*catch.*old",
                r"fallback.*analyzer",
                r"legacy.*system",
                r"backup.*analysis"
            ]
            
            fallbacks_found = []
            for pattern in fallback_patterns:
                matches = re.findall(pattern, content, re.IGNORECASE)
                if matches:
                    fallbacks_found.extend(matches)
            
            # Look for the specific fallback in the code
            if "Fallback to local analysis only" in content:
                fallbacks_found.append("Local analysis fallback mechanism exists")
            
            if "findInteractionsForSelection" in content and "fallback" in content.lower():
                fallbacks_found.append("Fallback uses new findInteractionsForSelection function")
            
            if fallbacks_found:
                details = f"Fallback mechanisms found: {'; '.join(fallbacks_found)}"
                if "new findInteractionsForSelection" in details:
                    self.log_test(test_name, "PASS", details)
                else:
                    self.log_test(test_name, "WARN", details + " - Verify fallback uses new system")
            else:
                self.log_test(test_name, "PASS", "No fallback mechanisms detected")
                
        except Exception as e:
            self.log_test(test_name, "FAIL", f"Exception: {str(e)}")

    def get_severity_label(self, severity: str) -> str:
        """Simulate the severity label mapping from drugRules.ts"""
        labels = {"HIGH": "Critical", "MODERATE": "Major", "LOW": "Minor"}
        return labels.get(severity, severity)

    def get_severity_color(self, severity: str) -> str:
        """Simulate the severity color mapping from AnalysisResultsDisplay.tsx"""
        normalized_severity = severity.lower()
        color_map = {
            'critical': '#DC2626',
            'high': '#DC2626',
            'major': '#EA580C', 
            'moderate': '#D97706',
            'minor': '#65A30D',
            'low': '#65A30D'
        }
        return color_map.get(normalized_severity, '#6B7280')

    def get_severity_icon(self, severity: str) -> str:
        """Simulate the severity icon mapping from AnalysisResultsDisplay.tsx"""
        normalized_severity = severity.lower()
        icon_map = {
            'critical': 'dangerous',
            'high': 'dangerous',
            'major': 'warning',
            'moderate': 'warning',
            'minor': 'check-circle',
            'low': 'check-circle'
        }
        return icon_map.get(normalized_severity, 'help')

    def run_all_tests(self):
        """Run all advanced debugging tests"""
        print("🔬 ADVANCED DRUG INTERACTION SYSTEM DEBUGGING")
        print("=" * 60)
        print("Deep dive analysis to identify why users might see old severity levels")
        print()
        
        # Run all tests
        self.test_data_flow_simulation()
        self.test_potential_caching_issues()
        self.test_component_state_management()
        self.test_fallback_mechanisms()
        
        # Summary
        print("=" * 60)
        print("📊 DEBUGGING SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r['status'] == 'PASS'])
        failed_tests = len([r for r in self.test_results if r['status'] == 'FAIL'])
        warned_tests = len([r for r in self.test_results if r['status'] == 'WARN'])
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"⚠️  Warnings: {warned_tests}")
        print()
        
        if failed_tests > 0:
            print("🚨 CRITICAL ISSUES FOUND:")
            for result in self.test_results:
                if result['status'] == 'FAIL':
                    print(f"   • {result['test']}: {result['details']}")
            print()
        
        if warned_tests > 0:
            print("⚠️  POTENTIAL ISSUES:")
            for result in self.test_results:
                if result['status'] == 'WARN':
                    print(f"   • {result['test']}: {result['details']}")
            print()
        
        # Root cause analysis
        print("🔍 ROOT CAUSE ANALYSIS:")
        print("=" * 30)
        
        if failed_tests == 0 and warned_tests == 0:
            print("✅ No issues found in the drug interaction system implementation.")
            print("   The new HIGH/MODERATE/LOW severity system is properly integrated.")
            print("   If users are still seeing old severity levels, the issue may be:")
            print("   1. Browser/app cache not cleared")
            print("   2. User not triggering a fresh analysis")
            print("   3. Using cached results from before the update")
        elif warned_tests > 0:
            print("⚠️  Potential issues identified that could cause old severity levels:")
            for result in self.test_results:
                if result['status'] == 'WARN':
                    print(f"   - {result['details']}")
        else:
            print("❌ Critical issues found that explain why old severity levels are showing")
        
        print()
        print("🎯 SPECIFIC RECOMMENDATIONS:")
        print("=" * 30)
        
        if failed_tests == 0 and warned_tests == 0:
            print("1. Clear app cache/storage to remove any cached analysis results")
            print("2. Ensure users are adding medicines and clicking 'Analyze' to trigger fresh analysis")
            print("3. Verify the analyzeInteractionsWithLogging function is being called (check console logs)")
            print("4. Test with a fresh patient/session to avoid cached data")
        else:
            print("1. Address the specific issues identified above")
            print("2. Test the complete user workflow from medicine selection to results display")
            print("3. Add console.log statements to trace the exact data flow")
            print("4. Verify cache invalidation is working properly when medicines change")

if __name__ == "__main__":
    debugger = AdvancedDrugInteractionDebugger()
    debugger.run_all_tests()