/**
 * Settings for Drug Interaction Analysis
 * Handles online API configuration and preferences
 */

import crashProofStorage from './asyncStorageUtils';

export interface DrugCheckSettings {
  onlineChecksEnabled: boolean;
  apiProvider: 'None' | 'OpenFDA' | 'RxNorm' | 'DrugBank';
  apiTimeout: number;
  debugLogging: boolean;
}

const DEFAULT_SETTINGS: DrugCheckSettings = {
  onlineChecksEnabled: false,
  apiProvider: 'None',
  apiTimeout: 6000, // 6 seconds
  debugLogging: false
};

const SETTINGS_KEY = 'drug_interaction_settings';

/**
 * Load drug interaction settings
 */
export async function loadDrugCheckSettings(): Promise<DrugCheckSettings> {
  try {
    const storedSettings = await crashProofStorage.getItem(SETTINGS_KEY);
    if (storedSettings) {
      const parsed = JSON.parse(storedSettings);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.warn('Failed to load drug check settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save drug interaction settings
 */
export async function saveDrugCheckSettings(settings: DrugCheckSettings): Promise<void> {
  try {
    await crashProofStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save drug check settings:', error);
  }
}

/**
 * Toggle online checks
 */
export async function toggleOnlineChecks(enabled: boolean): Promise<void> {
  const settings = await loadDrugCheckSettings();
  settings.onlineChecksEnabled = enabled;
  await saveDrugCheckSettings(settings);
}

/**
 * Set API provider
 */
export async function setApiProvider(provider: DrugCheckSettings['apiProvider']): Promise<void> {
  const settings = await loadDrugCheckSettings();
  settings.apiProvider = provider;
  await saveDrugCheckSettings(settings);
}

/**
 * Debug logging functionality
 */
export interface DrugAnalysisLog {
  timestamp: string;
  patientId: string;
  medsSelected: string[];
  medsRemoved: string[];
  onlineEnabled: boolean;
  apiResponseStatus: 'success' | 'failure' | 'timeout' | 'skipped';
  localResultsCount: number;
  mergedResultsCount: number;
  apiProvider?: string;
  errorMessage?: string;
}

const DEBUG_LOG_KEY = 'drug_interaction_debug_logs';
const MAX_DEBUG_LOGS = 100;

/**
 * Add debug log entry
 */
export async function addDebugLog(logEntry: DrugAnalysisLog): Promise<void> {
  try {
    const existingLogs = await getDebugLogs();
    const newLogs = [logEntry, ...existingLogs].slice(0, MAX_DEBUG_LOGS);
    await crashProofStorage.setItem(DEBUG_LOG_KEY, JSON.stringify(newLogs));
    
    // Also log to console if debug logging is enabled
    const settings = await loadDrugCheckSettings();
    if (settings.debugLogging) {
      console.log('🔍 Drug Analysis Log:', logEntry);
    }
  } catch (error) {
    console.warn('Failed to add debug log:', error);
  }
}

/**
 * Get debug logs
 */
export async function getDebugLogs(): Promise<DrugAnalysisLog[]> {
  try {
    const logs = await crashProofStorage.getItem(DEBUG_LOG_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.warn('Failed to get debug logs:', error);
    return [];
  }
}

/**
 * Clear debug logs
 */
export async function clearDebugLogs(): Promise<void> {
  try {
    await crashProofStorage.removeItem(DEBUG_LOG_KEY);
  } catch (error) {
    console.warn('Failed to clear debug logs:', error);
  }
}