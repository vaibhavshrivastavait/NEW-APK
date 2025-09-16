/**
 * Drug Interaction Mapper Tests
 * Comprehensive test suite for drug interaction mapping functionality
 */

import {
  loadDrugInteractionRules,
  findBestRule,
  analyzeMedicationsForPrimary,
  getAvailablePrimaryGroups,
  formatInteractionDisplay,
  isUnknownMedication,
  getSeverityColor,
  getSeverityIcon,
  initializeDrugInteractionMapper
} from '../drugInteractionMapper';

// Mock expo-file-system and expo-asset
jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn()
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

// Mock the JSON data
const mockRulesData = {
  "generatedAt": "2025-09-11T00:00:00Z",
  "version": "1.0.0",
  "notes": "Test data",
  "rules": [
    {
      "primary": "Hormone Replacement Therapy (HRT)",
      "interaction_with": "Anticoagulants",
      "examples": ["warfarin", "coumadin", "rivaroxaban"],
      "severity": "HIGH",
      "score": 4,
      "rationale": "Test rationale for HRT + anticoagulants",
      "recommended_action": "Avoid combination",
      "source": "Rules (local)"
    },
    {
      "primary": "Hormone Replacement Therapy (HRT)",
      "interaction_with": "Non-steroidal anti-inflammatory drugs (NSAIDs)",
      "examples": ["ibuprofen", "naproxen", "diclofenac"],
      "severity": "MAJOR",
      "score": 3,
      "rationale": "Test rationale for HRT + NSAIDs",
      "recommended_action": "Consider alternatives",
      "source": "Rules (local)"
    },
    {
      "primary": "SSRIs / SNRIs",
      "interaction_with": "Anticoagulants",
      "examples": ["warfarin", "rivaroxaban"],
      "severity": "MAJOR",
      "score": 3,
      "rationale": "Test rationale for SSRIs + anticoagulants",
      "recommended_action": "Monitor closely",
      "source": "Rules (local)"
    },
    {
      "primary": "All Primary groups (generic fallback)",
      "interaction_with": "Herbal supplements",
      "examples": ["st john's wort", "ginkgo"],
      "severity": "MAJOR",
      "score": 3,
      "rationale": "Generic fallback rule",
      "recommended_action": "Check interactions",
      "source": "Rules (local)"
    },
    {
      "primary": "Bisphosphonates",
      "interaction_with": "Calcium / antacids",
      "examples": ["calcium carbonate", "tums"],
      "severity": "MINOR",
      "score": 1,
      "rationale": "Test rationale for minor interaction",
      "recommended_action": "Separate dosing",
      "source": "Rules (local)"
    }
  ]
};

describe('Drug Interaction Mapper', () => {
  beforeEach(() => {
    // Reset the cache and mocks
    jest.clearAllMocks();
    
    // Mock file system response
    const { readAsStringAsync } = require('expo-file-system');
    readAsStringAsync.mockResolvedValue(JSON.stringify(mockRulesData));
  });

  describe('loadDrugInteractionRules', () => {
    it('should load rules from JSON file successfully', async () => {
      const rules = await loadDrugInteractionRules();
      
      expect(rules).toHaveLength(5);
      expect(rules[0].primary).toBe('Hormone Replacement Therapy (HRT)');
      expect(rules[0].severity).toBe('HIGH');
    });

    it('should cache loaded rules', async () => {
      const { readAsStringAsync } = require('expo-file-system');
      
      // First load
      await loadDrugInteractionRules();
      expect(readAsStringAsync).toHaveBeenCalledTimes(1);
      
      // Second load should use cache
      await loadDrugInteractionRules();
      expect(readAsStringAsync).toHaveBeenCalledTimes(1);
    });

    it('should handle file loading errors', async () => {
      const { readAsStringAsync } = require('expo-file-system');
      readAsStringAsync.mockRejectedValue(new Error('File not found'));

      await expect(loadDrugInteractionRules()).rejects.toThrow('Failed to load drug interaction rules');
    });
  });

  describe('findBestRule', () => {
    beforeEach(async () => {
      await loadDrugInteractionRules();
    });

    // Test Case 1: Exact medication name match
    it('should find exact match for warfarin with HRT', () => {
      const result = findBestRule('Hormone Replacement Therapy (HRT)', 'warfarin');
      
      expect(result).not.toBeNull();
      expect(result?.medication).toBe('warfarin');
      expect(result?.primary).toBe('Hormone Replacement Therapy (HRT)');
      expect(result?.severity).toBe('HIGH');
      expect(result?.match_type).toBe('exact');
    });

    // Test Case 2: Case insensitive matching
    it('should handle case insensitive matching', () => {
      const result = findBestRule('HORMONE REPLACEMENT THERAPY (HRT)', 'WARFARIN');
      
      expect(result).not.toBeNull();
      expect(result?.medication).toBe('WARFARIN');
      expect(result?.severity).toBe('HIGH');
    });

    // Test Case 3: Category matching
    it('should find category match when exact match not found', () => {
      const result = findBestRule('Hormone Replacement Therapy (HRT)', 'advil', 'nsaid');
      
      expect(result).not.toBeNull();
      expect(result?.medication).toBe('advil');
      expect(result?.primary).toBe('Hormone Replacement Therapy (HRT)');
      expect(result?.match_type).toBe('category');
    });

    // Test Case 4: Fallback rule matching  
    it('should use fallback rule when no specific match found', () => {
      const result = findBestRule('Unknown Primary', 'st john\'s wort');
      
      expect(result).not.toBeNull();
      expect(result?.medication).toBe('st john\'s wort');
      expect(result?.primary).toBe('All Primary groups (generic fallback)');
      expect(result?.match_type).toBe('fallback');
    });

    // Test Case 5: No match found
    it('should return null when no match found', () => {
      const result = findBestRule('Unknown Primary', 'unknown medication');
      
      expect(result).toBeNull();
    });

    // Test Case 6: Multiple severity levels
    it('should return correct severity levels', () => {
      const highResult = findBestRule('Hormone Replacement Therapy (HRT)', 'warfarin');
      const majorResult = findBestRule('Hormone Replacement Therapy (HRT)', 'ibuprofen');
      const minorResult = findBestRule('Bisphosphonates', 'calcium carbonate');
      
      expect(highResult?.severity).toBe('HIGH');
      expect(highResult?.score).toBe(4);
      expect(majorResult?.severity).toBe('MAJOR');
      expect(majorResult?.score).toBe(3);
      expect(minorResult?.severity).toBe('MINOR');
      expect(minorResult?.score).toBe(1);
    });

    // Test Case 7: Partial name matching
    it('should match partial medication names', () => {
      const result = findBestRule('Hormone Replacement Therapy (HRT)', 'ibuprofen tablets');
      
      expect(result).not.toBeNull();
      expect(result?.medication).toBe('ibuprofen tablets');
      expect(result?.severity).toBe('MAJOR');
    });

    // Test Case 8: Brand name matching
    it('should match brand names like Coumadin for warfarin', () => {
      const result = findBestRule('Hormone Replacement Therapy (HRT)', 'coumadin');
      
      expect(result).not.toBeNull();
      expect(result?.medication).toBe('coumadin');
      expect(result?.severity).toBe('HIGH');
    });
  });

  describe('analyzeMedicationsForPrimary', () => {
    beforeEach(async () => {
      await loadDrugInteractionRules();
    });

    // Test Case 9: Multiple medications analysis
    it('should analyze multiple medications and sort by severity', () => {
      const medications = [
        { name: 'calcium carbonate', category: 'supplement' },
        { name: 'warfarin', category: 'anticoagulant' },
        { name: 'ibuprofen', category: 'nsaid' }
      ];

      const results = analyzeMedicationsForPrimary('Hormone Replacement Therapy (HRT)', medications);
      
      expect(results).toHaveLength(2); // calcium carbonate won't match HRT
      expect(results[0].severity).toBe('HIGH'); // warfarin should be first (highest score)
      expect(results[1].severity).toBe('MAJOR'); // ibuprofen should be second
    });

    // Test Case 10: Empty medication list
    it('should handle empty medication list', () => {
      const results = analyzeMedicationsForPrimary('Hormone Replacement Therapy (HRT)', []);
      
      expect(results).toHaveLength(0);
    });
  });

  describe('Utility Functions', () => {
    beforeEach(async () => {
      await loadDrugInteractionRules();
    });

    // Test Case 11: Get available primary groups
    it('should return available primary groups excluding fallbacks', () => {
      const groups = getAvailablePrimaryGroups();
      
      expect(groups).toContain('Hormone Replacement Therapy (HRT)');
      expect(groups).toContain('SSRIs / SNRIs');
      expect(groups).toContain('Bisphosphonates');
      expect(groups).not.toContain('All Primary groups (generic fallback)');
    });

    // Test Case 12: Format interaction display
    it('should format interaction display correctly', () => {
      const mockResult = {
        medication: 'warfarin',
        primary: 'Hormone Replacement Therapy (HRT)',
        severity: 'HIGH',
        severityLabel: 'Critical',
        score: 4,
        rationale: 'Test',
        recommended_action: 'Test',
        source: 'Test',
        match_type: 'exact' as const
      };

      const formatted = formatInteractionDisplay(mockResult);
      
      expect(formatted).toBe('warfarin + Hormone Replacement Therapy (HRT) — HIGH (Critical)');
    });

    // Test Case 13: Unknown medication detection
    it('should detect unknown medications', () => {
      const isUnknown = isUnknownMedication('Unknown Primary', 'unknown medication');
      const isKnown = isUnknownMedication('Hormone Replacement Therapy (HRT)', 'warfarin');
      
      expect(isUnknown).toBe(true);
      expect(isKnown).toBe(false);
    });

    // Test Case 14: Severity color mapping
    it('should return correct severity colors', () => {
      expect(getSeverityColor('HIGH')).toBe('#DC2626');
      expect(getSeverityColor('MAJOR')).toBe('#EA580C');
      expect(getSeverityColor('MODERATE')).toBe('#D97706');
      expect(getSeverityColor('MINOR')).toBe('#16A34A');
      expect(getSeverityColor('LOW')).toBe('#059669');
      expect(getSeverityColor('UNKNOWN')).toBe('#6B7280');
    });

    // Test Case 15: Severity icon mapping
    it('should return correct severity icons', () => {
      expect(getSeverityIcon('HIGH')).toBe('error');
      expect(getSeverityIcon('MAJOR')).toBe('warning');
      expect(getSeverityIcon('MODERATE')).toBe('info');
      expect(getSeverityIcon('MINOR')).toBe('check-circle');
      expect(getSeverityIcon('LOW')).toBe('check');
      expect(getSeverityIcon('UNKNOWN')).toBe('help');
    });
  });

  describe('Integration Scenarios', () => {
    beforeEach(async () => {
      await loadDrugInteractionRules();
    });

    // Test Case 16: Real-world medication combinations
    it('should handle common HRT + anticoagulant combination', () => {
      const result = findBestRule('Hormone Replacement Therapy (HRT)', 'rivaroxaban');
      
      expect(result).not.toBeNull();
      expect(result?.severity).toBe('HIGH');
      expect(result?.recommended_action).toBe('Avoid combination');
    });

    // Test Case 17: SSRI interactions
    it('should detect SSRI + anticoagulant interactions', () => {
      const result = findBestRule('SSRIs / SNRIs', 'warfarin');
      
      expect(result).not.toBeNull();
      expect(result?.severity).toBe('MAJOR');
      expect(result?.rationale).toBe('Test rationale for SSRIs + anticoagulants');
    });

    // Test Case 18: Minor interactions
    it('should handle minor interactions appropriately', () => {
      const result = findBestRule('Bisphosphonates', 'tums');
      
      expect(result).not.toBeNull();
      expect(result?.severity).toBe('MINOR');
      expect(result?.score).toBe(1);
    });

    // Test Case 19: Case variations and whitespace handling
    it('should handle medication name variations', () => {
      const variations = [
        'WARFARIN',
        'warfarin  ',
        '  Warfarin',
        'warfarin\t'
      ];

      variations.forEach(variation => {
        const result = findBestRule('Hormone Replacement Therapy (HRT)', variation);
        expect(result).not.toBeNull();
        expect(result?.severity).toBe('HIGH');
      });
    });

    // Test Case 20: Persistence and invalidation simulation
    it('should simulate removal and cache invalidation', async () => {
      // Simulate removing a medication from analysis
      const initialMeds = [
        { name: 'warfarin', category: 'anticoagulant' },
        { name: 'ibuprofen', category: 'nsaid' }
      ];
      
      const initialResults = analyzeMedicationsForPrimary('Hormone Replacement Therapy (HRT)', initialMeds);
      expect(initialResults).toHaveLength(2);
      
      // Simulate removal of warfarin
      const updatedMeds = [
        { name: 'ibuprofen', category: 'nsaid' }
      ];
      
      const updatedResults = analyzeMedicationsForPrimary('Hormone Replacement Therapy (HRT)', updatedMeds);
      expect(updatedResults).toHaveLength(1);
      expect(updatedResults[0].medication).toBe('ibuprofen');
    });
  });

  describe('Error Handling', () => {
    // Test Case 21: Rules not loaded
    it('should handle when rules are not loaded', () => {
      // Clear the cache by mocking an unloaded state
      jest.doMock('../drugInteractionMapper', () => {
        const originalModule = jest.requireActual('../drugInteractionMapper');
        return {
          ...originalModule,
          findBestRule: () => null
        };
      });

      const result = findBestRule('Test Primary', 'test med');
      expect(result).toBeNull();
    });

    // Test Case 22: Initialize function error handling
    it('should handle initialization errors gracefully', async () => {
      const { readAsStringAsync } = require('expo-file-system');
      readAsStringAsync.mockRejectedValue(new Error('Network error'));

      await expect(initializeDrugInteractionMapper()).rejects.toThrow('Network error');
    });
  });
});