/**
 * Drug Interaction Mapping Utility
 * Handles loading, parsing, and lookup of drug interactions from the local JSON file
 */

import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import crashProofStorage from "./asyncStorageUtils";

export interface DrugInteractionPair {
  main: string;
  optionals: {
    drug: string;
    severity: 'high' | 'moderate' | 'low' | 'unknown';
  }[];
}

export interface DrugInteractionData {
  version: string;
  notes: string;
  pairs: DrugInteractionPair[];
  defaults: {
    missingSeverity: 'high' | 'moderate' | 'low' | 'unknown';
  };
}

export interface CheckingResult {
  drugName: string;
  displayName: string;
  severity: 'high' | 'moderate' | 'low' | 'unknown';
  severityDisplay: 'High' | 'Moderate' | 'Low' | 'Unknown';
  color: string;
}

// Cache for loaded interaction data
let cachedInteractionData: DrugInteractionData | null = null;
let loadError: string | null = null;

/**
 * Convert medicine display name to canonical key
 */
export function getCanonicalKey(medicineName: string): string {
  return medicineName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')  // Replace non-alphanumeric with underscore
    .replace(/_+/g, '_')         // Multiple underscores to single
    .replace(/^_|_$/g, '');      // Remove leading/trailing underscores
}

/**
 * Enhanced canonical key mapping with common medicine variations
 */
export function getEnhancedCanonicalKey(medicineName: string): string[] {
  const baseName = medicineName.toLowerCase().trim();
  const keys: string[] = [];
  
  // Add the standard canonical key
  keys.push(getCanonicalKey(medicineName));
  
  // Add specific mappings for common medicine variations
  const mappings: { [key: string]: string[] } = {
    'estrogen': ['hormone_estradiol', 'estrogen', 'estradiol'],
    'estradiol': ['hormone_estradiol', 'estrogen', 'estradiol'],
    'hrt': ['hormone_estradiol', 'hormone_progesterone'],
    'progesterone': ['hormone_progesterone', 'progesterone'],
    'testosterone': ['hormone_testosterone', 'testosterone'],
    'warfarin': ['warfarin'],
    'aspirin': ['aspirin'],
    'ibuprofen': ['ibuprofen'],
    'simvastatin': ['simvastatin'],
    'atorvastatin': ['atorvastatin'],
    'levothyroxine': ['levothyroxine'],
    'metformin': ['metformin'],
    'gabapentin': ['gabapentin'],
    'pregabalin': ['pregabalin'],
    'paroxetine': ['paroxetine'],
    'venlafaxine': ['venlafaxine'],
    'alendronate': ['alendronate'],
    'risedronate': ['risedronate']
  };
  
  // Check for direct mappings
  for (const [pattern, canonicals] of Object.entries(mappings)) {
    if (baseName.includes(pattern)) {
      keys.push(...canonicals);
    }
  }
  
  // Remove duplicates and return
  return [...new Set(keys)];
}

/**
 * Get color for severity level
 */
export function getSeverityColor(severity: 'high' | 'moderate' | 'low'): string {
  switch (severity) {
    case 'high': return '#E57373';     // Red
    case 'moderate': return '#FFB74D';  // Orange
    case 'low': return '#FFD54F';      // Yellow
    default: return '#FFB74D';         // Default to moderate
  }
}

/**
 * Get display text for severity
 */
export function getSeverityDisplay(severity: 'high' | 'moderate' | 'low'): 'High' | 'Moderate' | 'Low' {
  switch (severity) {
    case 'high': return 'High';
    case 'moderate': return 'Moderate';
    case 'low': return 'Low';
    default: return 'Moderate';
  }
}

/**
 * Load drug interaction data from the local JSON file
 */
export async function loadDrugInteractionData(): Promise<DrugInteractionData> {
  if (cachedInteractionData && !loadError) {
    return cachedInteractionData;
  }

  try {
    console.log('📋 Loading drug interaction data from local JSON...');
    
    const asset = Asset.fromModule(require('../assets/rules/drug_interactions.json'));
    await asset.downloadAsync();
    
    const fileContent = await FileSystem.readAsStringAsync(asset.localUri || asset.uri);
    const data: DrugInteractionData = JSON.parse(fileContent);
    
    // Validate the data structure
    if (!data.pairs || !Array.isArray(data.pairs)) {
      throw new Error('Invalid data format: missing pairs array');
    }
    
    if (!data.defaults || !data.defaults.missingSeverity) {
      throw new Error('Invalid data format: missing defaults');
    }
    
    cachedInteractionData = data;
    loadError = null;
    
    console.log(`✅ Loaded ${data.pairs.length} drug interaction pairs`);
    
    // Cache success status
    await crashProofStorage.setItem('drugInteractionLoadStatus', 'success');
    await crashProofStorage.setItem('drugInteractionVersion', data.version);
    
    return data;
    
  } catch (error) {
    console.error('❌ Failed to load drug interaction data:', error);
    loadError = error instanceof Error ? error.message : 'Unknown error loading drug interactions';
    
    // Cache error status
    await crashProofStorage.setItem('drugInteractionLoadStatus', 'error');
    await crashProofStorage.setItem('drugInteractionLoadError', loadError);
    
    // Return minimal fallback data
    const fallbackData: DrugInteractionData = {
      version: '0.0.0',
      notes: 'Fallback data due to load error',
      pairs: [],
      defaults: {
        missingSeverity: 'moderate'
      }
    };
    
    return fallbackData;
  }
}

/**
 * Find interaction severity for a main medicine and optional medicine
 */
export async function findInteractionSeverity(
  mainMedicine: string,
  optionalMedicine: string
): Promise<'high' | 'moderate' | 'low'> {
  
  try {
    const data = await loadDrugInteractionData();
    
    // Get canonical keys for both medicines
    const mainKeys = getEnhancedCanonicalKey(mainMedicine);
    const optionalKeys = getEnhancedCanonicalKey(optionalMedicine);
    
    console.log(`🔍 Looking for interaction: main=${mainKeys.join('|')} + optional=${optionalKeys.join('|')}`);
    
    // Search through all pairs
    for (const pair of data.pairs) {
      // Check if main medicine matches
      if (mainKeys.includes(pair.main)) {
        // Check if optional medicine matches any in this pair
        for (const optional of pair.optionals) {
          if (optionalKeys.includes(optional.drug)) {
            console.log(`✅ Found match: ${pair.main} + ${optional.drug} = ${optional.severity}`);
            return optional.severity;
          }
        }
      }
    }
    
    console.log(`⚠️ No specific interaction found, using default: ${data.defaults.missingSeverity}`);
    return data.defaults.missingSeverity;
    
  } catch (error) {
    console.error('❌ Error finding interaction severity:', error);
    return 'moderate'; // Safe fallback
  }
}

/**
 * Perform checking for multiple optional medicines with a main medicine
 */
export async function performDrugChecking(
  mainMedicine: string,
  optionalMedicines: { name: string; displayName?: string }[]
): Promise<CheckingResult[]> {
  
  if (!mainMedicine || optionalMedicines.length === 0) {
    return [];
  }
  
  console.log(`🔍 Checking interactions for main: ${mainMedicine} with ${optionalMedicines.length} optional medicines`);
  
  const results: CheckingResult[] = [];
  
  for (const optional of optionalMedicines) {
    try {
      const severity = await findInteractionSeverity(mainMedicine, optional.name);
      
      results.push({
        drugName: optional.name,
        displayName: optional.displayName || optional.name,
        severity,
        severityDisplay: getSeverityDisplay(severity),
        color: getSeverityColor(severity)
      });
      
    } catch (error) {
      console.error(`❌ Error checking ${optional.name}:`, error);
      
      // Add fallback result
      results.push({
        drugName: optional.name,
        displayName: optional.displayName || optional.name,
        severity: 'moderate',
        severityDisplay: 'Moderate',
        color: getSeverityColor('moderate')
      });
    }
  }
  
  console.log(`✅ Checking complete: ${results.length} results`);
  return results;
}

/**
 * Get the highest severity from a list of results (for multi-main scenarios)
 */
export function getHighestSeverity(severities: ('high' | 'moderate' | 'low')[]): 'high' | 'moderate' | 'low' {
  if (severities.includes('high')) return 'high';
  if (severities.includes('moderate')) return 'moderate';
  return 'low';
}

/**
 * Check if interaction data loaded successfully
 */
export async function getInteractionLoadStatus(): Promise<{
  status: 'success' | 'error' | 'loading';
  error?: string;
  version?: string;
}> {
  try {
    const status = await crashProofStorage.getItem('drugInteractionLoadStatus');
    const error = await crashProofStorage.getItem('drugInteractionLoadError');
    const version = await crashProofStorage.getItem('drugInteractionVersion');
    
    return {
      status: status as 'success' | 'error' | 'loading' || 'loading',
      error: error || undefined,
      version: version || undefined
    };
  } catch {
    return { status: 'loading' };
  }
}

/**
 * Clear cached interaction data (for refresh functionality)
 */
export function clearInteractionCache(): void {
  cachedInteractionData = null;
  loadError = null;
  crashProofStorage.removeItem('drugInteractionLoadStatus');
  crashProofStorage.removeItem('drugInteractionLoadError');
  crashProofStorage.removeItem('drugInteractionVersion');
  console.log('🔄 Drug interaction cache cleared');
}