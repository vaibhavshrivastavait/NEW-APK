/**
 * Medicine Persistence Unit Tests
 * Test local storage functionality for medicine data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  medicinePersistence,
  createPatientMedicineKey,
  validateMedicineData,
  type PatientMedicineData,
  type AppSettings 
} from '../medicinePersistence';
import { createMedicineItem, type MedicineItem, type AnalysisResult } from '../enhancedDrugAnalyzer';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
  getAllKeys: jest.fn()
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('Medicine Persistence Service', () => {
  const testPatientId = 'test-patient-123';
  const testMedicines: MedicineItem[] = [
    createMedicineItem('Warfarin', 'Anticoagulant', 'anticoagulant'),
    createMedicineItem('Ibuprofen', 'NSAID', 'nsaid')
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveMedicinesForPatient', () => {
    it('should save medicines correctly', async () => {
      mockAsyncStorage.setItem.mockResolvedValue();
      mockAsyncStorage.getItem.mockResolvedValue(null); // No existing history

      await medicinePersistence.saveMedicinesForPatient(testPatientId, testMedicines);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        `patient_medicines_${testPatientId}`,
        expect.stringContaining('"patientId":"test-patient-123"')
      );

      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1]);
      expect(savedData).toMatchObject({
        patientId: testPatientId,
        medicines: testMedicines
      });
      expect(savedData.lastUpdated).toBeGreaterThan(0);
    });

    it('should handle save errors gracefully', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage full'));

      await expect(
        medicinePersistence.saveMedicinesForPatient(testPatientId, testMedicines)
      ).rejects.toThrow('Failed to save medicine selection');
    });
  });

  describe('loadMedicinesForPatient', () => {
    it('should load medicines correctly', async () => {
      const mockData: PatientMedicineData = {
        patientId: testPatientId,
        medicines: testMedicines,
        lastUpdated: Date.now()
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockData));

      const result = await medicinePersistence.loadMedicinesForPatient(testPatientId);

      expect(result).toEqual(testMedicines);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(`patient_medicines_${testPatientId}`);
    });

    it('should return empty array if no data exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await medicinePersistence.loadMedicinesForPatient(testPatientId);

      expect(result).toEqual([]);
    });

    it('should handle invalid data gracefully', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid json');

      const result = await medicinePersistence.loadMedicinesForPatient(testPatientId);

      expect(result).toEqual([]);
    });

    it('should handle malformed data structure', async () => {
      const invalidData = { patientId: testPatientId, medicines: null };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(invalidData));

      const result = await medicinePersistence.loadMedicinesForPatient(testPatientId);

      expect(result).toEqual([]);
    });
  });

  describe('addMedicineToPatient', () => {
    it('should add medicine to existing list', async () => {
      const existingMedicines = [testMedicines[0]];
      const newMedicine = testMedicines[1];
      
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({
        patientId: testPatientId,
        medicines: existingMedicines,
        lastUpdated: Date.now()
      }));
      mockAsyncStorage.setItem.mockResolvedValue();
      mockAsyncStorage.getItem.mockResolvedValueOnce(null); // For history update

      await medicinePersistence.addMedicineToPatient(testPatientId, newMedicine);

      const savedCall = mockAsyncStorage.setItem.mock.calls.find(call => 
        call[0] === `patient_medicines_${testPatientId}`
      );
      expect(savedCall).toBeDefined();
      
      const savedData = JSON.parse(savedCall![1]);
      expect(savedData.medicines).toHaveLength(2);
      expect(savedData.medicines).toContainEqual(newMedicine);
    });

    it('should prevent duplicate medicines', async () => {
      const existingMedicines = [testMedicines[0]];
      const duplicateMedicine = { ...testMedicines[0], id: 'different-id' };
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify({
        patientId: testPatientId,
        medicines: existingMedicines,
        lastUpdated: Date.now()
      }));

      await expect(
        medicinePersistence.addMedicineToPatient(testPatientId, duplicateMedicine)
      ).rejects.toThrow('Medicine "Warfarin" is already selected');
    });
  });

  describe('removeMedicineFromPatient', () => {
    it('should remove medicine correctly', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({
        patientId: testPatientId,
        medicines: testMedicines,
        lastUpdated: Date.now()
      }));
      mockAsyncStorage.setItem.mockResolvedValue();
      mockAsyncStorage.getItem.mockResolvedValue(null); // For history
      mockAsyncStorage.removeItem.mockResolvedValue(); // For cache invalidation

      await medicinePersistence.removeMedicineFromPatient(testPatientId, testMedicines[0].id);

      const savedCall = mockAsyncStorage.setItem.mock.calls.find(call => 
        call[0] === `patient_medicines_${testPatientId}`
      );
      const savedData = JSON.parse(savedCall![1]);
      expect(savedData.medicines).toHaveLength(1);
      expect(savedData.medicines[0].id).toBe(testMedicines[1].id);
    });

    it('should handle non-existent medicine', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify({
        patientId: testPatientId,
        medicines: testMedicines,
        lastUpdated: Date.now()
      }));

      await expect(
        medicinePersistence.removeMedicineFromPatient(testPatientId, 'non-existent-id')
      ).rejects.toThrow('Medicine not found');
    });
  });

  describe('removeMultipleMedicines', () => {
    it('should remove multiple medicines correctly', async () => {
      const medicineIds = [testMedicines[0].id, testMedicines[1].id];
      
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({
        patientId: testPatientId,
        medicines: testMedicines,
        lastUpdated: Date.now()
      }));
      mockAsyncStorage.setItem.mockResolvedValue();
      mockAsyncStorage.getItem.mockResolvedValue(null); // For history
      mockAsyncStorage.removeItem.mockResolvedValue(); // For cache invalidation

      await medicinePersistence.removeMedicinesFromPatient(testPatientId, medicineIds);

      const savedCall = mockAsyncStorage.setItem.mock.calls.find(call => 
        call[0] === `patient_medicines_${testPatientId}`
      );
      const savedData = JSON.parse(savedCall![1]);
      expect(savedData.medicines).toHaveLength(0);
    });

    it('should handle empty removal list', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify({
        patientId: testPatientId,
        medicines: testMedicines,
        lastUpdated: Date.now()
      }));

      await expect(
        medicinePersistence.removeMedicinesFromPatient(testPatientId, [])
      ).rejects.toThrow('No medicines found to remove');
    });
  });

  describe('cacheAnalysisResult', () => {
    it('should cache analysis result correctly', async () => {
      const mockAnalysis: AnalysisResult = {
        timestamp: Date.now(),
        medications: testMedicines,
        interactions: [],
        contraindications: [],
        duplicateTherapies: [],
        highRiskCombinations: [],
        analysisStatus: 'complete'
      };

      mockAsyncStorage.setItem.mockResolvedValue();

      await medicinePersistence.cacheAnalysisResult(testPatientId, mockAnalysis);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        `analysis_cache_${testPatientId}`,
        JSON.stringify(mockAnalysis)
      );
    });
  });

  describe('loadCachedAnalysis', () => {
    it('should load valid cached analysis', async () => {
      const mockAnalysis: AnalysisResult = {
        timestamp: Date.now() - 1000, // 1 second ago
        medications: testMedicines,
        interactions: [],
        contraindications: [],
        duplicateTherapies: [],
        highRiskCombinations: [],
        analysisStatus: 'complete'
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockAnalysis));

      const result = await medicinePersistence.loadCachedAnalysis(testPatientId);

      expect(result).toEqual(mockAnalysis);
    });

    it('should return null for expired cache', async () => {
      const mockAnalysis: AnalysisResult = {
        timestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago (expired)
        medications: testMedicines,
        interactions: [],
        contraindications: [],
        duplicateTherapies: [],
        highRiskCombinations: [],
        analysisStatus: 'complete'
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockAnalysis));
      mockAsyncStorage.removeItem.mockResolvedValue();

      const result = await medicinePersistence.loadCachedAnalysis(testPatientId);

      expect(result).toBeNull();
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(`analysis_cache_${testPatientId}`);
    });

    it('should return null if no cache exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await medicinePersistence.loadCachedAnalysis(testPatientId);

      expect(result).toBeNull();
    });
  });

  describe('App Settings', () => {
    const defaultSettings: AppSettings = {
      enableOnlineChecks: false,
      apiProvider: 'none',
      showDetailedInteractions: true,
      confirmDestructiveActions: true,
      cacheAnalysisResults: true
    };

    it('should save app settings correctly', async () => {
      mockAsyncStorage.setItem.mockResolvedValue();

      await medicinePersistence.saveAppSettings(defaultSettings);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'mht_app_settings',
        JSON.stringify(defaultSettings)
      );
    });

    it('should load app settings correctly', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(defaultSettings));

      const result = await medicinePersistence.loadAppSettings();

      expect(result).toEqual(defaultSettings);
    });

    it('should return default settings if none exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockAsyncStorage.setItem.mockResolvedValue();

      const result = await medicinePersistence.loadAppSettings();

      expect(result).toEqual(defaultSettings);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'mht_app_settings',
        JSON.stringify(defaultSettings)
      );
    });

    it('should handle settings load errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await medicinePersistence.loadAppSettings();

      expect(result).toEqual(defaultSettings);
    });
  });

  describe('clearPatientData', () => {
    it('should clear all patient data', async () => {
      mockAsyncStorage.multiRemove.mockResolvedValue();

      await medicinePersistence.clearPatientData(testPatientId);

      expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
        `patient_medicines_${testPatientId}`,
        `analysis_cache_${testPatientId}`
      ]);
    });
  });

  describe('exportPatientData', () => {
    it('should export patient data correctly', async () => {
      const mockAnalysis: AnalysisResult = {
        timestamp: Date.now(),
        medications: testMedicines,
        interactions: [],
        contraindications: [],
        duplicateTherapies: [],
        highRiskCombinations: [],
        analysisStatus: 'complete'
      };

      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify({
          patientId: testPatientId,
          medicines: testMedicines,
          lastUpdated: Date.now()
        }))
        .mockResolvedValueOnce(JSON.stringify(mockAnalysis));

      const exportData = await medicinePersistence.exportPatientData(testPatientId);
      const parsed = JSON.parse(exportData);

      expect(parsed).toMatchObject({
        patientId: testPatientId,
        medicines: expect.arrayContaining(testMedicines),
        analysis: mockAnalysis,
        version: '1.0'
      });
      expect(parsed.exportTimestamp).toBeGreaterThan(0);
    });
  });

  describe('importPatientData', () => {
    it('should import patient data correctly', async () => {
      const exportedData = {
        patientId: testPatientId,
        medicines: testMedicines,
        analysis: null,
        exportTimestamp: Date.now(),
        version: '1.0'
      };

      mockAsyncStorage.setItem.mockResolvedValue();
      mockAsyncStorage.getItem.mockResolvedValue(null); // For history

      await medicinePersistence.importPatientData(testPatientId, JSON.stringify(exportedData));

      const medicinesSaveCall = mockAsyncStorage.setItem.mock.calls.find(call => 
        call[0] === `patient_medicines_${testPatientId}`
      );
      expect(medicinesSaveCall).toBeDefined();
    });

    it('should handle invalid import data', async () => {
      await expect(
        medicinePersistence.importPatientData(testPatientId, 'invalid json')
      ).rejects.toThrow('Failed to import data');
    });

    it('should validate import data structure', async () => {
      const invalidData = { patientId: testPatientId, medicines: null };

      await expect(
        medicinePersistence.importPatientData(testPatientId, JSON.stringify(invalidData))
      ).rejects.toThrow('Failed to import data');
    });
  });

  describe('getStorageStats', () => {
    it('should return storage statistics', async () => {
      mockAsyncStorage.getAllKeys.mockResolvedValue([
        'patient_medicines_patient1',
        'patient_medicines_patient2',
        'analysis_cache_patient1',
        'other_key'
      ]);

      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify({
          medicines: [testMedicines[0]]
        }))
        .mockResolvedValueOnce(JSON.stringify({
          medicines: testMedicines
        }));

      const stats = await medicinePersistence.getStorageStats();

      expect(stats).toMatchObject({
        totalPatients: 2,
        totalMedicines: 3,
        cacheSize: 1
      });
      expect(stats.lastCleanup).toBeGreaterThan(0);
    });
  });
});

describe('Utility Functions', () => {
  describe('createPatientMedicineKey', () => {
    it('should create correct key format', () => {
      const key = createPatientMedicineKey('test-123');
      expect(key).toBe('patient_medicines_test-123');
    });
  });

  describe('validateMedicineData', () => {
    it('should validate correct data structure', () => {
      const validData: PatientMedicineData = {
        patientId: 'test',
        medicines: [],
        lastUpdated: Date.now()
      };

      expect(validateMedicineData(validData)).toBe(true);
    });

    it('should reject invalid data structures', () => {
      expect(validateMedicineData(null)).toBe(false);
      expect(validateMedicineData({})).toBe(false);
      expect(validateMedicineData({ patientId: 'test' })).toBe(false);
      expect(validateMedicineData({ 
        patientId: 'test', 
        medicines: 'invalid',
        lastUpdated: Date.now()
      })).toBe(false);
    });
  });
});