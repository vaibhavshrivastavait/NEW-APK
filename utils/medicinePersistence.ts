/**
 * Medicine Persistence Service
 * Handles local storage of medicine selections and analysis results
 */

import crashProofStorage from "./asyncStorageUtils";
import { MedicineItem, AnalysisResult } from './enhancedDrugAnalyzer';

const STORAGE_KEYS = {
  PATIENT_MEDICINES: 'patient_medicines_',
  ANALYSIS_CACHE: 'analysis_cache_',
  APP_SETTINGS: 'mht_app_settings',
  MEDICINE_HISTORY: 'medicine_selection_history'
};

export interface PatientMedicineData {
  patientId: string;
  medicines: MedicineItem[];
  lastUpdated: number;
  lastAnalysis?: AnalysisResult;
}

export interface MedicineSelectionHistory {
  selections: {
    medicine: MedicineItem;
    timestamp: number;
    removed?: boolean;
  }[];
}

export interface AppSettings {
  enableOnlineChecks: boolean;
  apiProvider: 'none' | 'openfda' | 'rxnorm' | 'drugbank';
  showDetailedInteractions: boolean;
  confirmDestructiveActions: boolean;
  cacheAnalysisResults: boolean;
}

class MedicinePersistenceService {
  /**
   * Save medicines for a specific patient
   */
  async saveMedicinesForPatient(patientId: string, medicines: MedicineItem[]): Promise<void> {
    try {
      const data: PatientMedicineData = {
        patientId,
        medicines,
        lastUpdated: Date.now()
      };
      
      await crashProofStorage.setItem(
        `${STORAGE_KEYS.PATIENT_MEDICINES}${patientId}`,
        JSON.stringify(data)
      );
      
      // Also update medicine history
      await this.updateMedicineHistory(medicines);
      
      console.log(`✅ Saved ${medicines.length} medicines for patient ${patientId}`);
    } catch (error) {
      console.error('❌ Failed to save medicines:', error);
      throw new Error('Failed to save medicine selection');
    }
  }

  /**
   * Load medicines for a specific patient
   */
  async loadMedicinesForPatient(patientId: string): Promise<MedicineItem[]> {
    try {
      const dataString = await crashProofStorage.getItem(`${STORAGE_KEYS.PATIENT_MEDICINES}${patientId}`);
      
      if (!dataString) {
        return [];
      }
      
      const data: PatientMedicineData = JSON.parse(dataString);
      
      // Validate data structure
      if (!data.medicines || !Array.isArray(data.medicines)) {
        console.warn('⚠️ Invalid medicine data structure, returning empty array');
        return [];
      }
      
      console.log(`✅ Loaded ${data.medicines.length} medicines for patient ${patientId}`);
      return data.medicines;
    } catch (error) {
      console.error('❌ Failed to load medicines:', error);
      return [];
    }
  }

  /**
   * Add medicine to patient's list
   */
  async addMedicineToPatient(patientId: string, medicine: MedicineItem): Promise<void> {
    try {
      const currentMedicines = await this.loadMedicinesForPatient(patientId);
      
      // Check for duplicates
      const isDuplicate = currentMedicines.some(m => 
        m.name.toLowerCase() === medicine.name.toLowerCase()
      );
      
      if (isDuplicate) {
        throw new Error(`Medicine "${medicine.name}" is already selected`);
      }
      
      const updatedMedicines = [...currentMedicines, medicine];
      await this.saveMedicinesForPatient(patientId, updatedMedicines);
      
      console.log(`✅ Added medicine "${medicine.name}" for patient ${patientId}`);
    } catch (error) {
      console.error('❌ Failed to add medicine:', error);
      throw error;
    }
  }

  /**
   * Remove medicine from patient's list
   */
  async removeMedicineFromPatient(patientId: string, medicineId: string): Promise<void> {
    try {
      const currentMedicines = await this.loadMedicinesForPatient(patientId);
      const medicineToRemove = currentMedicines.find(m => m.id === medicineId);
      
      if (!medicineToRemove) {
        throw new Error('Medicine not found');
      }
      
      const updatedMedicines = currentMedicines.filter(m => m.id !== medicineId);
      await this.saveMedicinesForPatient(patientId, updatedMedicines);
      
      // Log removal in history
      await this.logMedicineRemoval(medicineToRemove);
      
      // Invalidate cached analysis
      await this.invalidateAnalysisCache(patientId);
      
      console.log(`✅ Removed medicine "${medicineToRemove.name}" for patient ${patientId}`);
    } catch (error) {
      console.error('❌ Failed to remove medicine:', error);
      throw error;
    }
  }

  /**
   * Remove multiple medicines from patient's list
   */
  async removeMedicinesFromPatient(patientId: string, medicineIds: string[]): Promise<void> {
    try {
      const currentMedicines = await this.loadMedicinesForPatient(patientId);
      const medicinesToRemove = currentMedicines.filter(m => medicineIds.includes(m.id));
      
      if (medicinesToRemove.length === 0) {
        throw new Error('No medicines found to remove');
      }
      
      const updatedMedicines = currentMedicines.filter(m => !medicineIds.includes(m.id));
      await this.saveMedicinesForPatient(patientId, updatedMedicines);
      
      // Log removals in history
      for (const medicine of medicinesToRemove) {
        await this.logMedicineRemoval(medicine);
      }
      
      // Invalidate cached analysis
      await this.invalidateAnalysisCache(patientId);
      
      console.log(`✅ Removed ${medicinesToRemove.length} medicines for patient ${patientId}`);
    } catch (error) {
      console.error('❌ Failed to remove medicines:', error);
      throw error;
    }
  }

  /**
   * Update medicine history
   */
  private async updateMedicineHistory(medicines: MedicineItem[]): Promise<void> {
    try {
      const historyString = await crashProofStorage.getItem(STORAGE_KEYS.MEDICINE_HISTORY);
      let history: MedicineSelectionHistory = { selections: [] };
      
      if (historyString) {
        history = JSON.parse(historyString);
      }
      
      // Add new selections to history
      for (const medicine of medicines) {
        const existingEntry = history.selections.find(s => 
          s.medicine.name.toLowerCase() === medicine.name.toLowerCase() && !s.removed
        );
        
        if (!existingEntry) {
          history.selections.push({
            medicine,
            timestamp: Date.now()
          });
        }
      }
      
      // Keep only last 100 entries
      history.selections = history.selections.slice(-100);
      
      await crashProofStorage.setItem(STORAGE_KEYS.MEDICINE_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.warn('⚠️ Failed to update medicine history:', error);
    }
  }

  /**
   * Log medicine removal
   */
  private async logMedicineRemoval(medicine: MedicineItem): Promise<void> {
    try {
      const historyString = await crashProofStorage.getItem(STORAGE_KEYS.MEDICINE_HISTORY);
      let history: MedicineSelectionHistory = { selections: [] };
      
      if (historyString) {
        history = JSON.parse(historyString);
      }
      
      history.selections.push({
        medicine,
        timestamp: Date.now(),
        removed: true
      });
      
      await crashProofStorage.setItem(STORAGE_KEYS.MEDICINE_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.warn('⚠️ Failed to log medicine removal:', error);
    }
  }

  /**
   * Cache analysis result
   */
  async cacheAnalysisResult(patientId: string, analysis: AnalysisResult): Promise<void> {
    try {
      await crashProofStorage.setItem(
        `${STORAGE_KEYS.ANALYSIS_CACHE}${patientId}`,
        JSON.stringify(analysis)
      );
      
      console.log(`✅ Cached analysis result for patient ${patientId}`);
    } catch (error) {
      console.error('❌ Failed to cache analysis result:', error);
    }
  }

  /**
   * Load cached analysis result
   */
  async loadCachedAnalysis(patientId: string): Promise<AnalysisResult | null> {
    try {
      const analysisString = await crashProofStorage.getItem(`${STORAGE_KEYS.ANALYSIS_CACHE}${patientId}`);
      
      if (!analysisString) {
        return null;
      }
      
      const analysis: AnalysisResult = JSON.parse(analysisString);
      
      // Check if cache is still valid (not older than 1 hour)
      const cacheAge = Date.now() - analysis.timestamp;
      const maxCacheAge = 60 * 60 * 1000; // 1 hour
      
      if (cacheAge > maxCacheAge) {
        await this.invalidateAnalysisCache(patientId);
        return null;
      }
      
      console.log(`✅ Loaded cached analysis for patient ${patientId}`);
      return analysis;
    } catch (error) {
      console.error('❌ Failed to load cached analysis:', error);
      return null;
    }
  }

  /**
   * Invalidate analysis cache
   */
  async invalidateAnalysisCache(patientId: string): Promise<void> {
    try {
      await crashProofStorage.removeItem(`${STORAGE_KEYS.ANALYSIS_CACHE}${patientId}`);
      console.log(`✅ Invalidated analysis cache for patient ${patientId}`);
    } catch (error) {
      console.error('❌ Failed to invalidate analysis cache:', error);
    }
  }

  /**
   * Save app settings
   */
  async saveAppSettings(settings: AppSettings): Promise<void> {
    try {
      await crashProofStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
      console.log('✅ Saved app settings');
    } catch (error) {
      console.error('❌ Failed to save app settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  /**
   * Load app settings
   */
  async loadAppSettings(): Promise<AppSettings> {
    try {
      const settingsString = await crashProofStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      
      if (!settingsString) {
        // Return default settings
        const defaultSettings: AppSettings = {
          enableOnlineChecks: false, // Default OFF as requested
          apiProvider: 'none',
          showDetailedInteractions: true,
          confirmDestructiveActions: true,
          cacheAnalysisResults: true
        };
        
        // Save default settings
        await this.saveAppSettings(defaultSettings);
        return defaultSettings;
      }
      
      const settings: AppSettings = JSON.parse(settingsString);
      console.log('✅ Loaded app settings');
      return settings;
    } catch (error) {
      console.error('❌ Failed to load app settings:', error);
      
      // Return default settings on error
      return {
        enableOnlineChecks: false,
        apiProvider: 'none',
        showDetailedInteractions: true,
        confirmDestructiveActions: true,
        cacheAnalysisResults: true
      };
    }
  }

  /**
   * Get medicine selection history
   */
  async getMedicineHistory(): Promise<MedicineSelectionHistory> {
    try {
      const historyString = await crashProofStorage.getItem(STORAGE_KEYS.MEDICINE_HISTORY);
      
      if (!historyString) {
        return { selections: [] };
      }
      
      return JSON.parse(historyString);
    } catch (error) {
      console.error('❌ Failed to load medicine history:', error);
      return { selections: [] };
    }
  }

  /**
   * Clear all data for a patient
   */
  async clearPatientData(patientId: string): Promise<void> {
    try {
      await crashProofStorage.multiRemove([
        `${STORAGE_KEYS.PATIENT_MEDICINES}${patientId}`,
        `${STORAGE_KEYS.ANALYSIS_CACHE}${patientId}`
      ]);
      
      console.log(`✅ Cleared all data for patient ${patientId}`);
    } catch (error) {
      console.error('❌ Failed to clear patient data:', error);
      throw new Error('Failed to clear patient data');
    }
  }

  /**
   * Export patient data (for backup/transfer)
   */
  async exportPatientData(patientId: string): Promise<string> {
    try {
      const medicines = await this.loadMedicinesForPatient(patientId);
      const analysis = await this.loadCachedAnalysis(patientId);
      
      const exportData = {
        patientId,
        medicines,
        analysis,
        exportTimestamp: Date.now(),
        version: '1.0'
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('❌ Failed to export patient data:', error);
      throw new Error('Failed to export data');
    }
  }

  /**
   * Import patient data (from backup/transfer)
   */
  async importPatientData(patientId: string, exportedData: string): Promise<void> {
    try {
      const data = JSON.parse(exportedData);
      
      // Validate data structure
      if (!data.medicines || !Array.isArray(data.medicines)) {
        throw new Error('Invalid data format');
      }
      
      await this.saveMedicinesForPatient(patientId, data.medicines);
      
      if (data.analysis) {
        await this.cacheAnalysisResult(patientId, data.analysis);
      }
      
      console.log(`✅ Imported data for patient ${patientId}`);
    } catch (error) {
      console.error('❌ Failed to import patient data:', error);
      throw new Error('Failed to import data');
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalPatients: number;
    totalMedicines: number;
    cacheSize: number;
    lastCleanup: number;
  }> {
    try {
      const keys = await crashProofStorage.getAllKeys();
      
      const patientKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.PATIENT_MEDICINES));
      const cacheKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.ANALYSIS_CACHE));
      
      let totalMedicines = 0;
      for (const key of patientKeys) {
        try {
          const dataString = await crashProofStorage.getItem(key);
          if (dataString) {
            const data = JSON.parse(dataString);
            totalMedicines += data.medicines?.length || 0;
          }
        } catch {
          // Skip invalid entries
        }
      }
      
      return {
        totalPatients: patientKeys.length,
        totalMedicines,
        cacheSize: cacheKeys.length,
        lastCleanup: Date.now()
      };
    } catch (error) {
      console.error('❌ Failed to get storage stats:', error);
      return {
        totalPatients: 0,
        totalMedicines: 0,
        cacheSize: 0,
        lastCleanup: 0
      };
    }
  }
}

// Export singleton instance
export const medicinePersistence = new MedicinePersistenceService();

// Export utility functions
export const createPatientMedicineKey = (patientId: string): string => 
  `${STORAGE_KEYS.PATIENT_MEDICINES}${patientId}`;

export const validateMedicineData = (data: any): data is PatientMedicineData => {
  return data && 
         typeof data.patientId === 'string' && 
         Array.isArray(data.medicines) &&
         typeof data.lastUpdated === 'number';
};