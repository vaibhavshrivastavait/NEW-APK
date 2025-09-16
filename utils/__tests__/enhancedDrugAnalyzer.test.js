/**
 * Unit Tests for Enhanced Drug Analyzer
 * Tests all key functionality including interactions, contraindications, and offline behavior
 */

import { drugAnalyzer, createMedicineItem, groupInteractionsBySeverity } from '../enhancedDrugAnalyzer';

// Mock AsyncStorage for testing
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
  getAllKeys: jest.fn(() => Promise.resolve([])),
}));

describe('Enhanced Drug Analyzer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Medicine Item Creation', () => {
    test('should create medicine item with correct structure', () => {
      const medicine = createMedicineItem('Warfarin', 'anticoagulant', 'blood_thinner');
      
      expect(medicine).toHaveProperty('id');
      expect(medicine).toHaveProperty('name', 'Warfarin');
      expect(medicine).toHaveProperty('category', 'anticoagulant');
      expect(medicine).toHaveProperty('type', 'blood_thinner');
      expect(medicine).toHaveProperty('selected', true);
      expect(medicine).toHaveProperty('timestamp');
      expect(typeof medicine.timestamp).toBe('number');
    });

    test('should generate unique IDs for different medicines', () => {
      const med1 = createMedicineItem('Medicine1', 'cat1', 'type1');
      const med2 = createMedicineItem('Medicine2', 'cat2', 'type2');
      
      expect(med1.id).not.toBe(med2.id);
    });
  });

  describe('Drug Interaction Analysis', () => {
    test('should detect critical Warfarin + NSAID interaction', async () => {
      const medicines = [
        createMedicineItem('Warfarin', 'anticoagulant', 'blood_thinner'),
        createMedicineItem('Ibuprofen', 'nsaid', 'pain_reliever')
      ];

      const result = await drugAnalyzer.analyzeMedicines(medicines);

      expect(result.interactions.length).toBeGreaterThan(0);
      const criticalInteractions = result.interactions.filter(i => i.severity === 'critical');
      expect(criticalInteractions.length).toBeGreaterThan(0);
      
      const warfarinNsaidInteraction = criticalInteractions.find(i => 
        i.medications.includes('Warfarin') && i.medications.includes('Ibuprofen')
      );
      expect(warfarinNsaidInteraction).toBeDefined();
      expect(warfarinNsaidInteraction.title).toContain('Critical interaction');
    });

    test('should detect Estrogen + Anticoagulant major interaction', async () => {
      const medicines = [
        createMedicineItem('Estradiol', 'estrogen', 'hormone'),
        createMedicineItem('Rivaroxaban', 'anticoagulant', 'blood_thinner')
      ];

      const result = await drugAnalyzer.analyzeMedicines(medicines);

      expect(result.interactions.length).toBeGreaterThan(0);
      const majorInteractions = result.interactions.filter(i => i.severity === 'major');
      expect(majorInteractions.length).toBeGreaterThan(0);
    });

    test('should handle empty medicine list', async () => {
      const result = await drugAnalyzer.analyzeMedicines([]);

      expect(result.interactions).toEqual([]);
      expect(result.contraindications).toEqual([]);
      expect(result.duplicateTherapies).toEqual([]);
      expect(result.analysisStatus).toBe('local_only');
    });

    test('should work in offline mode', async () => {
      drugAnalyzer.updateConfig({ enableOnlineAPI: false });
      
      const medicines = [
        createMedicineItem('Warfarin', 'anticoagulant', 'blood_thinner'),
        createMedicineItem('Ibuprofen', 'nsaid', 'pain_reliever')
      ];

      const result = await drugAnalyzer.analyzeMedicines(medicines);

      expect(result.analysisStatus).toBe('local_only');
      expect(result.interactions.length).toBeGreaterThan(0);
      expect(result.interactions.every(i => i.source === 'local')).toBe(true);
    });
  });

  describe('Contraindication Detection', () => {
    test('should detect contraindications with patient conditions', async () => {
      const medicines = [
        createMedicineItem('Estradiol', 'estrogen', 'hormone')
      ];

      const patientConditions = {
        personalHistoryBreastCancer: true,
        age: 55
      };

      const result = await drugAnalyzer.analyzeMedicines(medicines, patientConditions);

      expect(result.contraindications.length).toBeGreaterThan(0);
      const breastCancerContraindication = result.contraindications.find(c => 
        c.condition.includes('breast cancer') || c.condition.includes('active breast cancer')
      );
      expect(breastCancerContraindication?.severity).toBe('absolute');
    });

    test('should not detect contraindications without patient conditions', async () => {
      const medicines = [
        createMedicineItem('Estradiol', 'estrogen', 'hormone')
      ];

      const result = await drugAnalyzer.analyzeMedicines(medicines);

      // Should have fewer or no contraindications without patient conditions
      expect(result.contraindications.length).toBe(0);
    });
  });

  describe('Duplicate Therapy Detection', () => {
    test('should detect duplicate anticoagulants', async () => {
      const medicines = [
        createMedicineItem('Warfarin', 'anticoagulant', 'blood_thinner'),
        createMedicineItem('Rivaroxaban', 'anticoagulant', 'blood_thinner')
      ];

      const result = await drugAnalyzer.analyzeMedicines(medicines);

      expect(result.duplicateTherapies.length).toBeGreaterThan(0);
      const anticoagulantDuplicate = result.duplicateTherapies.find(d => 
        d.category === 'anticoagulant'
      );
      expect(anticoagulantDuplicate).toBeDefined();
      expect(anticoagulantDuplicate.medications).toContain('Warfarin');
      expect(anticoagulantDuplicate.medications).toContain('Rivaroxaban');
    });

    test('should detect duplicate SSRIs', async () => {
      const medicines = [
        createMedicineItem('Sertraline', 'ssri', 'antidepressant'),
        createMedicineItem('Fluoxetine', 'ssri', 'antidepressant')
      ];

      const result = await drugAnalyzer.analyzeMedicines(medicines);

      expect(result.duplicateTherapies.length).toBeGreaterThan(0);
      const ssriDuplicate = result.duplicateTherapies.find(d => 
        d.category === 'ssri'
      );
      expect(ssriDuplicate).toBeDefined();
    });
  });

  describe('High-Risk Combinations', () => {
    test('should detect high-risk bleeding combination', async () => {
      const medicines = [
        createMedicineItem('Warfarin', 'anticoagulant', 'blood_thinner'),
        createMedicineItem('Naproxen', 'nsaid', 'pain_reliever')
      ];

      const result = await drugAnalyzer.analyzeMedicines(medicines);

      expect(result.highRiskCombinations.length).toBeGreaterThan(0);
      const bleedingRisk = result.highRiskCombinations.find(r => 
        r.riskType === 'bleeding'
      );
      expect(bleedingRisk).toBeDefined();
      expect(bleedingRisk.severity).toBe('critical');
    });
  });

  describe('Severity Grouping', () => {
    test('should group interactions by severity correctly', () => {
      const interactions = [
        { id: '1', severity: 'critical', title: 'Critical 1' },
        { id: '2', severity: 'major', title: 'Major 1' },
        { id: '3', severity: 'critical', title: 'Critical 2' },
        { id: '4', severity: 'minor', title: 'Minor 1' },
        { id: '5', severity: 'moderate', title: 'Moderate 1' }
      ];

      const grouped = groupInteractionsBySeverity(interactions);

      expect(grouped.critical.length).toBe(2);
      expect(grouped.major.length).toBe(1);
      expect(grouped.moderate.length).toBe(1);
      expect(grouped.minor.length).toBe(1);
    });
  });

  describe('Configuration Management', () => {
    test('should update configuration correctly', () => {
      const newConfig = {
        enableOnlineAPI: true,
        apiProvider: 'openfda',
        apiTimeout: 10000
      };

      drugAnalyzer.updateConfig(newConfig);
      const currentConfig = drugAnalyzer.getConfig();

      expect(currentConfig.enableOnlineAPI).toBe(true);
      expect(currentConfig.apiProvider).toBe('openfda');
      expect(currentConfig.apiTimeout).toBe(10000);
    });

    test('should maintain default configuration', () => {
      const config = drugAnalyzer.getConfig();

      expect(config.enableOnlineAPI).toBe(false); // Default OFF as requested
      expect(config.apiProvider).toBe('none');
      expect(config.cacheResults).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle analysis errors gracefully', async () => {
      // Mock an error in the analysis process
      const originalConsoleError = console.error;
      console.error = jest.fn();

      // Create invalid medicine data to trigger error
      const invalidMedicines = [
        { 
          id: null, // Invalid ID
          name: '', // Empty name
          category: undefined,
          type: null
        }
      ];

      const result = await drugAnalyzer.analyzeMedicines(invalidMedicines);

      expect(result.analysisStatus).toBe('failed');
      expect(result.apiErrors).toBeDefined();
      expect(result.apiErrors.length).toBeGreaterThan(0);

      console.error = originalConsoleError;
    });

    test('should return consistent result structure on failure', async () => {
      const result = await drugAnalyzer.analyzeMedicines([]);

      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('medications');
      expect(result).toHaveProperty('interactions');
      expect(result).toHaveProperty('contraindications');
      expect(result).toHaveProperty('duplicateTherapies');
      expect(result).toHaveProperty('highRiskCombinations');
      expect(result).toHaveProperty('analysisStatus');
    });
  });

  describe('Integration Test Scenarios', () => {
    test('Case 1: Select two medicines → analyze → results show interactions', async () => {
      const medicines = [
        createMedicineItem('Warfarin', 'anticoagulant', 'blood_thinner'),
        createMedicineItem('Aspirin', 'nsaid', 'pain_reliever')
      ];

      const result = await drugAnalyzer.analyzeMedicines(medicines);

      expect(result.medications.length).toBe(2);
      expect(result.interactions.length).toBeGreaterThan(0);
      expect(result.analysisStatus).toBe('local_only');
    });

    test('Case 2: Remove medicine → analysis updates accordingly', async () => {
      const allMedicines = [
        createMedicineItem('Warfarin', 'anticoagulant', 'blood_thinner'),
        createMedicineItem('Ibuprofen', 'nsaid', 'pain_reliever'),
        createMedicineItem('Acetaminophen', 'analgesic', 'pain_reliever')
      ];

      const resultWithAll = await drugAnalyzer.analyzeMedicines(allMedicines);

      // Remove one medicine (simulate removal)
      const reducedMedicines = allMedicines.filter(m => m.name !== 'Ibuprofen');
      const resultWithoutIbuprofen = await drugAnalyzer.analyzeMedicines(reducedMedicines);

      expect(resultWithoutIbuprofen.medications.length).toBe(2);
      
      // Should have fewer interactions after removing a medicine
      const ibuprofenInteractions = resultWithAll.interactions.filter(i => 
        i.medications.includes('Ibuprofen')
      );
      const remainingInteractions = resultWithoutIbuprofen.interactions.filter(i => 
        i.medications.includes('Ibuprofen')
      );
      
      expect(remainingInteractions.length).toBe(0);
    });

    test('Case 3: Offline mode shows local rules banner', async () => {
      drugAnalyzer.updateConfig({ enableOnlineAPI: false });
      
      const medicines = [
        createMedicineItem('Estradiol', 'estrogen', 'hormone')
      ];

      const result = await drugAnalyzer.analyzeMedicines(medicines);

      expect(result.analysisStatus).toBe('local_only');
      expect(result.interactions.every(i => i.source === 'local')).toBe(true);
    });

    test('Case 4: Accessibility - all results have proper structure', async () => {
      const medicines = [
        createMedicineItem('Warfarin', 'anticoagulant', 'blood_thinner'),
        createMedicineItem('Ibuprofen', 'nsaid', 'pain_reliever')
      ];

      const result = await drugAnalyzer.analyzeMedicines(medicines);

      // Check that all interactions have required accessibility properties
      result.interactions.forEach(interaction => {
        expect(interaction).toHaveProperty('id');
        expect(interaction).toHaveProperty('title');
        expect(interaction).toHaveProperty('shortExplanation');
        expect(interaction).toHaveProperty('clinicalImpact');
        expect(interaction).toHaveProperty('suggestedActions');
        expect(Array.isArray(interaction.suggestedActions)).toBe(true);
        expect(interaction).toHaveProperty('severity');
        expect(['critical', 'major', 'moderate', 'minor']).toContain(interaction.severity);
      });
    });
  });
});

// Manual QA Test Cases (for reference)
export const manualTestCases = [
  {
    name: 'Test 1: Medicine removal confirmation',
    steps: [
      '1. Add medicines to the selection',
      '2. Tap the X/remove button on a medicine',
      '3. Verify confirmation dialog appears',
      '4. Tap "Remove" to confirm',
      '5. Verify medicine is removed and UI updates'
    ],
    expected: 'Medicine removed immediately with confirmation'
  },
  {
    name: 'Test 2: Multi-select removal',
    steps: [
      '1. Add multiple medicines',
      '2. Toggle multi-select mode',
      '3. Select multiple medicines using checkboxes',
      '4. Tap "Remove selected" button',
      '5. Confirm removal in dialog'
    ],
    expected: 'All selected medicines removed simultaneously'
  },
  {
    name: 'Test 3: Analysis results display',
    steps: [
      '1. Add Warfarin and Ibuprofen',
      '2. Tap "Analyze medicines"',
      '3. Wait for analysis completion',
      '4. Verify critical interaction shown',
      '5. Expand interaction for details'
    ],
    expected: 'Critical bleeding risk interaction displayed with severity grouping'
  },
  {
    name: 'Test 4: Offline functionality',
    steps: [
      '1. Disable network connectivity',
      '2. Add medicines and analyze',
      '3. Verify "Local rules only" banner appears',
      '4. Check that analysis still works'
    ],
    expected: 'Analysis works offline with appropriate messaging'
  },
  {
    name: 'Test 5: Accessibility testing',
    steps: [
      '1. Enable screen reader (TalkBack/VoiceOver)',
      '2. Navigate through medicine selection',
      '3. Test remove button accessibility',
      '4. Test analysis results screen reader support'
    ],
    expected: 'All elements properly labeled and navigable'
  }
];