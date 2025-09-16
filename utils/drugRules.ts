/**
 * Drug Rules Utility - Main implementation as specified in requirements
 * Handles local rule loading, matching logic, and API merging
 */

import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { 
  DrugCheckSettings, 
  loadDrugCheckSettings, 
  addDebugLog,
  DrugAnalysisLog 
} from './drugSettings';
import { 
  checkDrugInteractionsOnline, 
  mergeInteractionResults,
  ApiResponse 
} from './drugApiIntegration';

// Type definitions as specified in requirements
export interface Rule {
  primary: string;
  interaction_with: string;
  examples: string[];
  severity: 'HIGH' | 'MODERATE' | 'LOW';
  rationale: string;
  recommended_action: string;
}

export interface InteractionResult {
  medication: string;
  primary: string;
  severity: 'HIGH' | 'MODERATE' | 'LOW';
  severityLabel: string;
  rationale: string;
  recommended_action: string;
  source: string;
  match_type: 'exact' | 'category' | 'fallback';
}

export interface MergedResult extends InteractionResult {
  confidence?: number;
  apiProvider?: string;
  sources: string[];
}

// Cache for loaded rules and indexed lookups
let RULES_CACHE: Rule[] | null = null;
let PRIMARY_INDEX: Map<string, Rule[]> | null = null;
let EXAMPLE_INDEX: Map<string, Rule[]> | null = null;

/**
 * Load local rules from JSON file - as specified in requirements
 */
export async function loadLocalRules(): Promise<Rule[]> {
  if (RULES_CACHE) {
    return RULES_CACHE;
  }

  try {
    console.log('📋 Loading local drug interaction rules...');
    
    // Load JSON file
    const asset = Asset.fromModule(require('../assets/rules/drug_interactions.json'));
    await asset.downloadAsync();
    
    const fileContent = await FileSystem.readAsStringAsync(asset.localUri || asset.uri);
    const data = JSON.parse(fileContent);
    
    RULES_CACHE = data.rules;
    
    // Build performance indexes
    buildIndexes(RULES_CACHE);
    
    console.log(`✅ Loaded ${RULES_CACHE.length} local rules and built indexes`);
    return RULES_CACHE;
  } catch (error) {
    console.error('❌ Failed to load local rules:', error);
    throw new Error('Failed to load drug interaction rules');
  }
}

/**
 * Build performance indexes for O(1) lookups
 */
function buildIndexes(rules: Rule[]) {
  PRIMARY_INDEX = new Map();
  EXAMPLE_INDEX = new Map();
  
  rules.forEach(rule => {
    const primaryKey = normalize(rule.primary);
    
    // Index by primary
    if (!PRIMARY_INDEX.has(primaryKey)) {
      PRIMARY_INDEX.set(primaryKey, []);
    }
    PRIMARY_INDEX.get(primaryKey)!.push(rule);
    
    // Index by examples (case-insensitive)
    rule.examples.forEach(example => {
      const exampleKey = normalize(example);
      if (!EXAMPLE_INDEX.has(exampleKey)) {
        EXAMPLE_INDEX.set(exampleKey, []);
      }
      EXAMPLE_INDEX.get(exampleKey)!.push(rule);
    });
  });
  
  console.log(`📊 Built indexes: ${PRIMARY_INDEX.size} primary groups, ${EXAMPLE_INDEX.size} examples`);
}

/**
 * Normalize strings for consistent matching
 */
function normalize(str: string): string {
  return str.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Find interactions for selection - main matching logic as specified
 */
export async function findInteractionsForSelection(
  primaryList: string[],
  currentMedList: string[]
): Promise<InteractionResult[]> {
  
  // Ensure rules are loaded
  if (!RULES_CACHE || !PRIMARY_INDEX || !EXAMPLE_INDEX) {
    await loadLocalRules();
  }
  
  const results: InteractionResult[] = [];
  
  console.log(`🔍 Finding interactions for ${primaryList.length} primary groups and ${currentMedList.length} medications`);
  
  // Normalize inputs
  const normalizedPrimaries = primaryList.map(normalize);
  const normalizedMeds = currentMedList.map(med => ({
    original: med,
    normalized: normalize(med)
  }));
  
  // Matching logic as specified in requirements
  for (const primaryNorm of normalizedPrimaries) {
    for (const med of normalizedMeds) {
      // Step a: Try exact match
      const exactMatches = EXAMPLE_INDEX?.get(med.normalized);
      if (exactMatches) {
        const primaryMatch = exactMatches.find(rule => 
          normalize(rule.primary) === primaryNorm
        );
        if (primaryMatch) {
          results.push(createInteractionResult(primaryMatch, med.original, 'exact'));
          continue; // Found exact match, skip category matching
        }
      }
      
      // Step b: Match on interaction_with category
      const primaryRules = PRIMARY_INDEX?.get(primaryNorm);
      if (primaryRules) {
        const categoryMatch = primaryRules.find(rule => 
          med.normalized.includes(normalize(rule.interaction_with)) ||
          normalize(rule.interaction_with).includes(med.normalized)
        );
        if (categoryMatch) {
          results.push(createInteractionResult(categoryMatch, med.original, 'category'));
          continue;
        }
      }
      
      // Step c: Check for fallback rules (generic interactions)
      const fallbackRules = RULES_CACHE?.filter(rule => 
        rule.primary.toLowerCase().includes('generic') || 
        rule.primary.toLowerCase().includes('fallback')
      );
      
      if (fallbackRules) {
        const fallbackMatch = fallbackRules.find(rule => 
          rule.examples.some(example => normalize(example) === med.normalized)
        );
        if (fallbackMatch) {
          results.push(createInteractionResult(fallbackMatch, med.original, 'fallback'));
        }
      }
    }
  }
  
  // Sort by severity (highest first)
  return results.sort((a, b) => getSeverityScore(b.severity) - getSeverityScore(a.severity));
}

/**
 * Create interaction result object
 */
function createInteractionResult(
  rule: Rule,
  medication: string,
  matchType: 'exact' | 'category' | 'fallback'
): InteractionResult {
  return {
    medication,
    primary: rule.primary,
    severity: rule.severity,
    severityLabel: getSeverityLabel(rule.severity),
    rationale: rule.rationale,
    recommended_action: rule.recommended_action,
    source: 'Rules (local)',
    match_type: matchType
  };
}

/**
 * Get severity score for sorting
 */
function getSeverityScore(severity: string): number {
  const scores = { HIGH: 3, MODERATE: 2, LOW: 1 };
  return scores[severity as keyof typeof scores] || 0;
}

/**
 * Get severity label for display
 */
function getSeverityLabel(severity: string): string {
  const labels = { HIGH: 'Critical', MODERATE: 'Major', LOW: 'Minor' };
  return labels[severity as keyof typeof labels] || severity;
}

/**
 * Merge API results with local results - as specified in requirements
 */
export async function mergeApiResults(
  localResults: InteractionResult[],
  apiResults: any[]
): Promise<MergedResult[]> {
  
  const merged: MergedResult[] = [];
  const processedPairs = new Set<string>();
  
  // Process local results first
  localResults.forEach(local => {
    const pairKey = `${normalize(local.medication)}+${normalize(local.primary)}`;
    processedPairs.add(pairKey);
    
    merged.push({
      ...local,
      sources: [local.source],
      confidence: 0.9 // High confidence for local rules
    });
  });
  
  // Add unique API results
  apiResults.forEach(api => {
    const pairKey = `${normalize(api.medication)}+${normalize(api.primary)}`;
    
    if (!processedPairs.has(pairKey)) {
      merged.push({
        medication: api.medication,
        primary: api.primary,
        severity: api.severity,
        severityLabel: getSeverityLabel(api.severity),
        rationale: api.rationale,
        recommended_action: api.recommended_action,
        source: api.source,
        match_type: 'exact',
        sources: [api.source],
        confidence: api.confidence || 0.7,
        apiProvider: api.apiProvider
      });
    } else {
      // Merge with existing local result if API severity is higher
      const existingIndex = merged.findIndex(m => 
        normalize(m.medication) === normalize(api.medication) &&
        normalize(m.primary) === normalize(api.primary)
      );
      
      if (existingIndex !== -1 && 
          getSeverityScore(api.severity) > getSeverityScore(merged[existingIndex].severity)) {
        merged[existingIndex].severity = api.severity;
        merged[existingIndex].severityLabel = getSeverityLabel(api.severity);
        merged[existingIndex].sources.push(api.source);
      }
    }
  });
  
  return merged.sort((a, b) => getSeverityScore(b.severity) - getSeverityScore(a.severity));
}

/**
 * Comprehensive analysis function with logging as specified
 */
export async function analyzeInteractionsWithLogging(
  primaryList: string[],
  currentMedList: string[],
  patientId: string,
  removedMeds: string[] = []
): Promise<{
  results: MergedResult[];
  apiResponse?: ApiResponse;
  analysisLog: DrugAnalysisLog;
}> {
  
  const startTime = new Date().toISOString();
  const settings = await loadDrugCheckSettings();
  
  console.log(`🧬 Starting comprehensive drug analysis for patient ${patientId}`);
  
  let apiResponse: ApiResponse | undefined;
  let mergedResults: MergedResult[] = [];
  let apiResponseStatus: DrugAnalysisLog['apiResponseStatus'] = 'skipped';
  
  try {
    // Step 1: Get local results
    const localResults = await findInteractionsForSelection(primaryList, currentMedList);
    console.log(`📋 Found ${localResults.length} local interactions`);
    
    // Step 2: Get API results if enabled
    if (settings.onlineChecksEnabled && settings.apiProvider !== 'None') {
      console.log(`🌐 Calling ${settings.apiProvider} API...`);
      apiResponse = await checkDrugInteractionsOnline(currentMedList, settings);
      
      if (apiResponse.status === 'success') {
        apiResponseStatus = 'success';
        console.log(`✅ API returned ${apiResponse.results.length} interactions`);
      } else if (apiResponse.status === 'timeout') {
        apiResponseStatus = 'timeout';
        console.log(`⏰ API call timed out after ${settings.apiTimeout}ms`);
      } else {
        apiResponseStatus = 'failure';
        console.log(`❌ API call failed: ${apiResponse.errorMessage}`);
      }
    }
    
    // Step 3: Merge results
    const apiResults = apiResponse?.results || [];
    mergedResults = await mergeApiResults(localResults, apiResults);
    
    console.log(`🔄 Merged results: ${mergedResults.length} total interactions`);
    
  } catch (error) {
    apiResponseStatus = 'failure';
    console.error('❌ Analysis error:', error);
    
    // Fallback to local results only
    const localResults = await findInteractionsForSelection(primaryList, currentMedList);
    mergedResults = await mergeApiResults(localResults, []);
  }
  
  // Create analysis log
  const analysisLog: DrugAnalysisLog = {
    timestamp: startTime,
    patientId,
    medsSelected: currentMedList,
    medsRemoved: removedMeds,
    onlineEnabled: settings.onlineChecksEnabled,
    apiResponseStatus,
    localResultsCount: mergedResults.filter(r => r.sources.includes('Rules (local)')).length,
    mergedResultsCount: mergedResults.length,
    apiProvider: settings.apiProvider !== 'None' ? settings.apiProvider : undefined,
    errorMessage: apiResponse?.errorMessage
  };
  
  // Log the analysis
  await addDebugLog(analysisLog);
  
  return {
    results: mergedResults,
    apiResponse,
    analysisLog
  };
}

/**
 * Reload rules - for development and updates
 */
export async function reloadRules(): Promise<Rule[]> {
  console.log('🔄 Reloading drug interaction rules...');
  RULES_CACHE = null;
  PRIMARY_INDEX = null;
  EXAMPLE_INDEX = null;
  return await loadLocalRules();
}

/**
 * Get available primary groups for UI
 */
export function getAvailablePrimaryGroups(): string[] {
  if (!PRIMARY_INDEX) {
    return [];
  }
  
  return Array.from(PRIMARY_INDEX.keys())
    .filter(key => !key.includes('generic') && !key.includes('fallback'))
    .sort();
}

/**
 * Get rules statistics for debugging
 */
export function getRulesStats(): {
  totalRules: number;
  primaryGroups: number;
  totalExamples: number;
  severityBreakdown: Record<string, number>;
} {
  if (!RULES_CACHE) {
    return { totalRules: 0, primaryGroups: 0, totalExamples: 0, severityBreakdown: {} };
  }
  
  const severityBreakdown: Record<string, number> = {};
  let totalExamples = 0;
  
  RULES_CACHE.forEach(rule => {
    severityBreakdown[rule.severity] = (severityBreakdown[rule.severity] || 0) + 1;
    totalExamples += rule.examples.length;
  });
  
  return {
    totalRules: RULES_CACHE.length,
    primaryGroups: PRIMARY_INDEX?.size || 0,
    totalExamples,
    severityBreakdown
  };
}