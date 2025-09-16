/**
 * Enhanced Drug Analyzer Unit Tests
 * Comprehensive testing for medicine analysis functionality
 */

import { 
  drugAnalyzer, 
  createMedicineItem, 
  groupInteractionsBySeverity,
  type MedicineItem,
  type AnalysisResult 
} from '../enhancedDrugAnalyzer';

describe('Enhanced Drug Analyzer', () => {
  
  beforeEach(() => {
    // Reset analyzer configuration before each test
    drugAnalyzer.updateConfig({
      enableOnlineAPI: false,
      apiProvider: 'none',
      apiTimeout: 6000,
      cacheResults: false
    });
  });

  describe('createMedicineItem', () => {
    it('should create a valid medicine item', () => {
      const medicine = createMedicineItem('Warfarin', 'Anticoagulant', 'anticoagulant');
      
      expect(medicine).toMatchObject({
        name: 'Warfarin',
        category: 'Anticoagulant',
        type: 'anticoagulant',
        selected: true
      });
      expect(medicine.id).toMatch(/^med_\d+_[a-z0-9]{9}$/);
      expect(medicine.timestamp).toBeGreaterThan(0);
    });
  });

  describe('analyzeMedicines', () => {
    it('should handle empty medicine list', async () => {
      const result = await drugAnalyzer.analyzeMedicines([]);
      
      expect(result).toMatchObject({
        medications: [],
        interactions: [],
        contraindications: [],
        duplicateTherapies: [],
        highRiskCombinations: [],
        analysisStatus: 'complete'
      });
    });

    it('should detect critical warfarin + NSAID interaction', async () => {
      const medicines: MedicineItem[] = [
        createMedicineItem('Warfarin', 'Anticoagulant', 'anticoagulant'),
        createMedicineItem('Ibuprofen', 'NSAID', 'nsaid')
      ];

      const result = await drugAnalyzer.analyzeMedicines(medicines);
      
      expect(result.interactions).toHaveLength(1);
      expect(result.interactions[0]).toMatchObject({
        severity: 'critical',
        title: 'Warfarin + NSAID — Critical interaction',
        medications: ['Warfarin', 'Ibuprofen'],
        source: 'local'
      });
      expect(result.interactions[0].suggestedActions).toContain('Avoid combination if possible');
    });

    it('should detect major estrogen + anticoagulant interaction', async () => {
      const medicines: MedicineItem[] = [
        createMedicineItem('Estradiol', 'Hormone', 'estrogen'),
        createMedicineItem('Warfarin', 'Anticoagulant', 'anticoagulant')
      ];

      const result = await drugAnalyzer.analyzeMedicines(medicines);
      
      expect(result.interactions).toHaveLength(1);
      expect(result.interactions[0]).toMatchObject({
        severity: 'major',
        title: 'Estrogen + Anticoagulants — Major interaction',
        medications: ['Estradiol', 'Warfarin'],
        source: 'local'
      });
    });

    it('should detect contraindications', async () => {
      const medicines: MedicineItem[] = [
        createMedicineItem('Estradiol', 'Hormone', 'estrogen')
      ];

      const patientConditions = {
        personalHistoryBreastCancer: true
      };

      const result = await drugAnalyzer.analyzeMedicines(medicines, patientConditions);
      
      expect(result.contraindications).toHaveLength(1);
      expect(result.contraindications[0]).toMatchObject({
        severity: 'absolute',
        condition: 'active breast cancer',
        medication: 'Estradiol',
        reason: 'Estrogen can stimulate hormone-sensitive breast cancer growth'
      });
    });

    it('should detect duplicate therapies', async () => {
      const medicines: MedicineItem[] = [
        createMedicineItem('Estradiol', 'Hormone', 'estrogen'),
        createMedicineItem('Premarin', 'Hormone', 'estrogen')
      ];

      const result = await drugAnalyzer.analyzeMedicines(medicines);
      
      expect(result.duplicateTherapies).toHaveLength(1);
      expect(result.duplicateTherapies[0]).toMatchObject({
        medications: ['Estradiol', 'Premarin'],
        category: 'estrogen'
      });
    });

    it('should detect high-risk combinations', async () => {
      const medicines: MedicineItem[] = [
        createMedicineItem('Warfarin', 'Anticoagulant', 'anticoagulant'),
        createMedicineItem('Ibuprofen', 'NSAID', 'nsaid')
      ];

      const result = await drugAnalyzer.analyzeMedicines(medicines);
      
      expect(result.highRiskCombinations).toHaveLength(1);
      expect(result.highRiskCombinations[0]).toMatchObject({
        riskType: 'bleeding',
        severity: 'critical',
        medications: ['Warfarin', 'Ibuprofen']
      });
    });

    it('should handle multiple interactions correctly', async () => {
      const medicines: MedicineItem[] = [
        createMedicineItem('Warfarin', 'Anticoagulant', 'anticoagulant'),
        createMedicineItem('Ibuprofen', 'NSAID', 'nsaid'),
        createMedicineItem('Estradiol', 'Hormone', 'estrogen'),
        createMedicineItem('Sertraline', 'Antidepressant', 'ssri')
      ];

      const result = await drugAnalyzer.analyzeMedicines(medicines);
      
      // Should detect warfarin+nsaid (critical) and estrogen+anticoagulant (major)
      expect(result.interactions.length).toBeGreaterThanOrEqual(2);
      
      const severities = result.interactions.map(i => i.severity);
      expect(severities).toContain('critical');
      expect(severities).toContain('major');
    });

    it('should handle analysis errors gracefully', async () => {
      // Test with malformed medicine data
      const medicines: any[] = [
        { id: 'invalid', name: null, type: undefined }
      ];

      const result = await drugAnalyzer.analyzeMedicines(medicines);
      
      expect(result.analysisStatus).toBe('failed');
      expect(result.apiErrors).toBeDefined();
      expect(result.apiErrors!.length).toBeGreaterThan(0);
    });
  });

  describe('groupInteractionsBySeverity', () => {
    it('should group interactions by severity correctly', () => {
      const interactions = [
        { severity: 'critical', id: '1' } as any,
        { severity: 'major', id: '2' } as any,
        { severity: 'moderate', id: '3' } as any,
        { severity: 'minor', id: '4' } as any,
        { severity: 'critical', id: '5' } as any
      ];

      const grouped = groupInteractionsBySeverity(interactions);

      expect(grouped.critical).toHaveLength(2);
      expect(grouped.major).toHaveLength(1);
      expect(grouped.moderate).toHaveLength(1);
      expect(grouped.minor).toHaveLength(1);
    });

    it('should handle empty array', () => {
      const grouped = groupInteractionsBySeverity([]);

      expect(grouped.critical).toHaveLength(0);
      expect(grouped.major).toHaveLength(0);
      expect(grouped.moderate).toHaveLength(0);
      expect(grouped.minor).toHaveLength(0);
    });
  });

  describe('Configuration', () => {
    it('should update configuration correctly', () => {
      const newConfig = {
        enableOnlineAPI: true,
        apiProvider: 'openfda' as const,
        apiTimeout: 8000,
        cacheResults: true
      };

      drugAnalyzer.updateConfig(newConfig);
      const currentConfig = drugAnalyzer.getConfig();

      expect(currentConfig).toMatchObject(newConfig);
    });

    it('should return current configuration', () => {
      const config = drugAnalyzer.getConfig();
      
      expect(config).toHaveProperty('enableOnlineAPI');
      expect(config).toHaveProperty('apiProvider');
      expect(config).toHaveProperty('apiTimeout');
      expect(config).toHaveProperty('cacheResults');
    });
  });

  describe('Edge Cases', () => {
    it('should handle medicines with similar names correctly', async () => {
      const medicines: MedicineItem[] = [
        createMedicineItem('Estradiol Patch', 'Hormone', 'estrogen'),
        createMedicineItem('Estradiol Gel', 'Hormone', 'estrogen')
      ];

      const result = await drugAnalyzer.analyzeMedicines(medicines);
      
      // Should detect duplicate therapy
      expect(result.duplicateTherapies).toHaveLength(1);
    });

    it('should handle case-insensitive medicine matching', async () => {
      const medicines: MedicineItem[] = [
        createMedicineItem('WARFARIN', 'Anticoagulant', 'anticoagulant'),
        createMedicineItem('ibuprofen', 'NSAID', 'nsaid')
      ];

      const result = await drugAnalyzer.analyzeMedicines(medicines);
      
      // Should still detect the interaction despite case differences
      expect(result.interactions).toHaveLength(1);
      expect(result.interactions[0].severity).toBe('critical');
    });

    it('should handle medicines with brand names', async () => {
      const medicines: MedicineItem[] = [
        createMedicineItem('Coumadin', 'Anticoagulant', 'anticoagulant'), // Brand name for warfarin
        createMedicineItem('Advil', 'NSAID', 'nsaid') // Brand name for ibuprofen
      ];

      const result = await drugAnalyzer.analyzeMedicines(medicines);
      
      // Should detect interaction using brand names
      expect(result.interactions).toHaveLength(1);
    });

    it('should handle unknown medicines gracefully', async () => {
      const medicines: MedicineItem[] = [
        createMedicineItem('Unknown Medicine X', 'Unknown', 'unknown'),
        createMedicineItem('Unknown Medicine Y', 'Unknown', 'unknown')
      ];

      const result = await drugAnalyzer.analyzeMedicines(medicines);
      
      // Should complete without errors, but no interactions found
      expect(result.analysisStatus).toBe('complete');
      expect(result.interactions).toHaveLength(0);
    });
  });

  describe('Performance', () => {
    it('should complete analysis within reasonable time', async () => {
      const medicines: MedicineItem[] = [
        createMedicineItem('Warfarin', 'Anticoagulant', 'anticoagulant'),
        createMedicineItem('Ibuprofen', 'NSAID', 'nsaid'),
        createMedicineItem('Estradiol', 'Hormone', 'estrogen'),
        createMedicineItem('Sertraline', 'Antidepressant', 'ssri'),
        createMedicineItem('Gabapentin', 'Anticonvulsant', 'gabapentin')
      ];

      const startTime = Date.now();
      const result = await drugAnalyzer.analyzeMedicines(medicines);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000); // Should complete in under 2 seconds
      expect(result.analysisStatus).toBe('complete');
    });
  });
});

// Integration tests with medicine persistence
describe('Medicine Analysis Integration', () => {
  it('should work with real-world medicine combinations', async () => {
    // Test a realistic scenario: postmenopausal woman on HRT with anticoagulation
    const medicines: MedicineItem[] = [
      createMedicineItem('Estradiol 2mg', 'Hormone', 'estrogen'),
      createMedicineItem('Progesterone 100mg', 'Hormone', 'progestogen'),
      createMedicineItem('Warfarin 5mg', 'Anticoagulant', 'anticoagulant'),
      createMedicineItem('Sertraline 50mg', 'Antidepressant', 'ssri')
    ];

    const patientConditions = {
      age: 58,
      personalHistoryBreastCancer: false,
      personalHistoryDVT: true, // History of DVT
      smoking: false,
      hypertension: true
    };

    const result = await drugAnalyzer.analyzeMedicines(medicines, patientConditions);

    // Should detect estrogen + anticoagulant interaction
    expect(result.interactions.length).toBeGreaterThan(0);
    
    // Should have major severity interaction
    const majorInteractions = result.interactions.filter(i => i.severity === 'major');
    expect(majorInteractions.length).toBeGreaterThan(0);

    // Should detect potential contraindication due to VTE history
    expect(result.contraindications.length).toBeGreaterThan(0);

    expect(result.analysisStatus).toBe('complete');
  });
});