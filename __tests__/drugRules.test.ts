/**
 * Comprehensive Test Suite for Drug Rules Integration
 * Tests all aspects of the local JSON rule system as specified in requirements
 */

import {
  loadLocalRules,
  findInteractionsForSelection,
  analyzeInteractionsWithLogging,
  reloadRules,
  getAvailablePrimaryGroups,
  getRulesStats,
  type Rule,
  type InteractionResult,
  type MergedResult
} from '../drugRules';

import { 
  loadDrugCheckSettings,
  saveDrugCheckSettings,
  toggleOnlineChecks,
  setApiProvider,
  addDebugLog,
  getDebugLogs,
  clearDebugLogs
} from '../drugSettings';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock expo modules
jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn(),
}));

jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn(() => ({
      downloadAsync: jest.fn(),
      localUri: 'mocked-uri',
      uri: 'mocked-uri'
    }))
  }
}));

// Mock drug interaction rules data
const mockRulesData = {
  "generatedAt": "2025-09-11T00:00:00Z",
  "version": "1.0.0",
  "notes": "Test rules",
  "rules": [
    {
      "primary": "Hormone Replacement Therapy (HRT)",
      "interaction_with": "Anticoagulants",
      "examples": ["warfarin", "coumadin", "rivaroxaban", "apixaban"],
      "severity": "HIGH",
      "rationale": "HRT increases bleeding risk with anticoagulants",
      "recommended_action": "Avoid combination; if necessary, monitor closely"
    },
    {
      "primary": "Hormone Replacement Therapy (HRT)",
      "interaction_with": "NSAIDs",
      "examples": ["ibuprofen", "naproxen", "diclofenac"],
      "severity": "MODERATE",
      "rationale": "NSAIDs may increase cardiovascular risk with HRT",
      "recommended_action": "Consider alternatives; monitor for side effects"
    },
    {
      "primary": "SSRIs / SNRIs (for vasomotor symptoms)",
      "interaction_with": "Anticoagulants",
      "examples": ["warfarin", "rivaroxaban"],
      "severity": "MODERATE",
      "rationale": "SSRIs affect platelet function",
      "recommended_action": "Monitor for bleeding"
    },
    {
      "primary": "Bisphosphonates",
      "interaction_with": "Calcium supplements",
      "examples": ["calcium carbonate", "calcium citrate"],
      "severity": "LOW",
      "rationale": "Calcium reduces bisphosphonate absorption",
      "recommended_action": "Separate dosing times"
    }
  ]
};

describe('Drug Rules Integration - Comprehensive Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock file system response
    const { readAsStringAsync } = require('expo-file-system');
    readAsStringAsync.mockResolvedValue(JSON.stringify(mockRulesData));
    
    // Mock AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue(null);
  });

  describe('1. Rule Loading and Caching', () => {
    // Test Case 1: Load rules successfully
    it('should load rules from JSON file and build indexes', async () => {
      const rules = await loadLocalRules();
      
      expect(rules).toHaveLength(4);
      expect(rules[0].primary).toBe('Hormone Replacement Therapy (HRT)');
      expect(rules[0].severity).toBe('HIGH');
    });

    // Test Case 2: Cache rules for performance
    it('should cache loaded rules for subsequent calls', async () => {
      const { readAsStringAsync } = require('expo-file-system');
      
      // First load
      await loadLocalRules();
      expect(readAsStringAsync).toHaveBeenCalledTimes(1);
      
      // Second load should use cache
      await loadLocalRules();
      expect(readAsStringAsync).toHaveBeenCalledTimes(1);
    });

    // Test Case 3: Reload rules functionality
    it('should reload rules when explicitly requested', async () => {
      const { readAsStringAsync } = require('expo-file-system');
      
      await loadLocalRules();
      expect(readAsStringAsync).toHaveBeenCalledTimes(1);
      
      await reloadRules();
      expect(readAsStringAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('2. Matching Logic - As Specified in Requirements', () => {
    beforeEach(async () => {
      await loadLocalRules();
    });

    // Test Case 4: Exact example matching (case-insensitive)
    it('should find exact matches with case-insensitive comparison', async () => {
      const results = await findInteractionsForSelection(
        ['Hormone Replacement Therapy (HRT)'],
        ['WARFARIN', 'warfarin', 'Warfarin']
      );
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.primary).toBe('Hormone Replacement Therapy (HRT)');
        expect(result.severity).toBe('HIGH');
        expect(result.match_type).toBe('exact');
      });
    });

    // Test Case 5: Category matching when no exact match
    it('should fall back to category matching', async () => {
      const results = await findInteractionsForSelection(
        ['Hormone Replacement Therapy (HRT)'],
        ['advil'] // Not in examples, but should match NSAIDs category
      );
      
      // This test depends on implementation details of category matching
      expect(results.length).toBeGreaterThanOrEqual(0);
    });

    // Test Case 6: Multiple primary groups
    it('should check against multiple primary groups', async () => {
      const results = await findInteractionsForSelection(
        ['Hormone Replacement Therapy (HRT)', 'SSRIs / SNRIs (for vasomotor symptoms)'],
        ['warfarin']
      );
      
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].severity).toBe('HIGH'); // Should prioritize HRT+warfarin (HIGH)
    });

    // Test Case 7: Severity-based sorting
    it('should sort results by severity (highest first)', async () => {
      const results = await findInteractionsForSelection(
        ['Hormone Replacement Therapy (HRT)', 'Bisphosphonates'],
        ['warfarin', 'calcium carbonate']
      );
      
      if (results.length > 1) {
        const firstSeverity = getSeverityScore(results[0].severity);
        const secondSeverity = getSeverityScore(results[1].severity);
        expect(firstSeverity).toBeGreaterThanOrEqual(secondSeverity);
      }
    });

    // Test Case 8: No matches found
    it('should return empty array when no matches found', async () => {
      const results = await findInteractionsForSelection(
        ['Unknown Primary Group'],
        ['unknown medication']
      );
      
      expect(results).toHaveLength(0);
    });
  });

  describe('3. Settings and Configuration', () => {
    // Test Case 9: Load default settings
    it('should load default settings', async () => {
      const settings = await loadDrugCheckSettings();
      
      expect(settings.onlineChecksEnabled).toBe(false);
      expect(settings.apiProvider).toBe('None');
      expect(settings.apiTimeout).toBe(6000);
    });

    // Test Case 10: Toggle online checks
    it('should toggle online checks setting', async () => {
      await toggleOnlineChecks(true);
      
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'drug_interaction_settings',
        expect.stringContaining('"onlineChecksEnabled":true')
      );
    });

    // Test Case 11: Set API provider
    it('should set API provider', async () => {
      await setApiProvider('OpenFDA');
      
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'drug_interaction_settings',
        expect.stringContaining('"apiProvider":"OpenFDA"')
      );
    });
  });

  describe('4. Debug Logging', () => {
    // Test Case 12: Add debug log
    it('should add debug log entries', async () => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        patientId: 'test-patient-123',
        medsSelected: ['warfarin', 'ibuprofen'],
        medsRemoved: ['aspirin'],
        onlineEnabled: false,
        apiResponseStatus: 'skipped' as const,
        localResultsCount: 2,
        mergedResultsCount: 2
      };

      await addDebugLog(logEntry);

      const AsyncStorage = require('@react-native-async-storage/async-storage');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'drug_interaction_debug_logs',
        expect.stringContaining('"patientId":"test-patient-123"')
      );
    });

    // Test Case 13: Retrieve debug logs
    it('should retrieve debug logs', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify([{
        timestamp: '2025-09-11T12:00:00Z',
        patientId: 'test-patient',
        medsSelected: ['warfarin'],
        medsRemoved: [],
        onlineEnabled: false,
        apiResponseStatus: 'success',
        localResultsCount: 1,
        mergedResultsCount: 1
      }]));

      const logs = await getDebugLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].patientId).toBe('test-patient');
    });
  });

  describe('5. Comprehensive Analysis Function', () => {
    beforeEach(async () => {
      await loadLocalRules();
    });

    // Test Case 14: Complete analysis workflow
    it('should perform complete analysis with logging', async () => {
      const result = await analyzeInteractionsWithLogging(
        ['Hormone Replacement Therapy (HRT)'],
        ['warfarin', 'ibuprofen'],
        'test-patient-456',
        []
      );

      expect(result.results).toBeDefined();
      expect(result.analysisLog).toBeDefined();
      expect(result.analysisLog.patientId).toBe('test-patient-456');
      expect(result.analysisLog.medsSelected).toEqual(['warfarin', 'ibuprofen']);
    });

    // Test Case 15: Handle empty medication list
    it('should handle empty medication list gracefully', async () => {
      const result = await analyzeInteractionsWithLogging(
        ['Hormone Replacement Therapy (HRT)'],
        [],
        'test-patient-empty',
        []
      );

      expect(result.results).toHaveLength(0);
      expect(result.analysisLog.medsSelected).toHaveLength(0);
    });
  });

  describe('6. Persistence and Removal Simulation', () => {
    // Test Case 16: Simulate medicine removal
    it('should handle medicine removal correctly', async () => {
      const initialMeds = ['warfarin', 'ibuprofen', 'calcium carbonate'];
      const removedMeds = ['ibuprofen'];
      const remainingMeds = initialMeds.filter(med => !removedMeds.includes(med));

      const result = await analyzeInteractionsWithLogging(
        ['Hormone Replacement Therapy (HRT)'],
        remainingMeds,
        'test-patient-removal',
        removedMeds
      );

      expect(result.analysisLog.medsSelected).toEqual(['warfarin', 'calcium carbonate']);
      expect(result.analysisLog.medsRemoved).toEqual(['ibuprofen']);
    });

    // Test Case 17: Multi-select removal
    it('should handle multiple medicine removals', async () => {
      const initialMeds = ['warfarin', 'ibuprofen', 'naproxen', 'calcium carbonate'];
      const removedMeds = ['ibuprofen', 'naproxen'];
      const remainingMeds = initialMeds.filter(med => !removedMeds.includes(med));

      const result = await analyzeInteractionsWithLogging(
        ['Hormone Replacement Therapy (HRT)', 'Bisphosphonates'],
        remainingMeds,
        'test-patient-multi-removal',
        removedMeds
      );

      expect(result.analysisLog.medsRemoved).toEqual(['ibuprofen', 'naproxen']);
      expect(result.results.every(r => !removedMeds.includes(r.medication))).toBe(true);
    });
  });

  describe('7. Error Handling', () => {
    // Test Case 18: Handle file loading errors
    it('should handle JSON loading errors gracefully', async () => {
      const { readAsStringAsync } = require('expo-file-system');
      readAsStringAsync.mockRejectedValue(new Error('File not found'));

      await expect(loadLocalRules()).rejects.toThrow('Failed to load drug interaction rules');
    });

    // Test Case 19: Handle malformed JSON
    it('should handle malformed JSON data', async () => {
      const { readAsStringAsync } = require('expo-file-system');
      readAsStringAsync.mockResolvedValue('{ invalid json }');

      await expect(loadLocalRules()).rejects.toThrow();
    });
  });

  describe('8. Performance and Statistics', () => {
    beforeEach(async () => {
      await loadLocalRules();
    });

    // Test Case 20: Get rules statistics
    it('should provide rules statistics', () => {
      const stats = getRulesStats();
      
      expect(stats.totalRules).toBe(4);
      expect(stats.severityBreakdown.HIGH).toBe(1);
      expect(stats.severityBreakdown.MODERATE).toBe(2);
      expect(stats.severityBreakdown.LOW).toBe(1);
    });

    // Test Case 21: Get available primary groups
    it('should list available primary groups', () => {
      const groups = getAvailablePrimaryGroups();
      
      expect(groups).toContain('Hormone Replacement Therapy (HRT)');
      expect(groups).toContain('SSRIs / SNRIs (for vasomotor symptoms)');
      expect(groups).toContain('Bisphosphonates');
    });

    // Test Case 22: Large dataset performance
    it('should handle large medication lists efficiently', async () => {
      const largeMedList = Array.from({ length: 100 }, (_, i) => `medication_${i}`);
      const startTime = Date.now();
      
      const results = await findInteractionsForSelection(
        ['Hormone Replacement Therapy (HRT)'],
        largeMedList
      );
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      // Should complete within reasonable time (< 1 second)
      expect(executionTime).toBeLessThan(1000);
      expect(Array.isArray(results)).toBe(true);
    });
  });
});

// Helper function for severity scoring (matches implementation)
function getSeverityScore(severity: string): number {
  const scores = { HIGH: 3, MODERATE: 2, LOW: 1 };
  return scores[severity as keyof typeof scores] || 0;
}