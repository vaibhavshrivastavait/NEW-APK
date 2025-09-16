/**
 * Enhanced Drug Interaction Handler
 * Uses drug_interactions.json as source of truth for all interactions
 */

import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

export interface DrugInteractionRule {
  primary: string;
  interaction_with: string;
  examples: string[];
  severity: 'HIGH' | 'MODERATE' | 'LOW';
  rationale: string;
  recommended_action: string;
}

export interface DrugInteractionResult {
  mainMedicine: string;
  optionalMedicine: string;
  severity: 'HIGH' | 'MODERATE' | 'LOW';
  severityDisplay: 'High Risk' | 'Moderate Risk' | 'Low Risk';
  rationale: string;
  recommendedAction: string;
  ruleMatched: DrugInteractionRule;
}

export interface GroupedInteractionResults {
  highRisk: DrugInteractionResult[];
  moderateRisk: DrugInteractionResult[];
  lowRisk: DrugInteractionResult[];
  overallRiskLevel: 'HIGH' | 'MODERATE' | 'LOW' | 'NONE';
}

let CACHED_RULES: DrugInteractionRule[] | null = null;

/**
 * Load drug interaction rules from JSON file
 */
export async function loadDrugInteractionRules(): Promise<DrugInteractionRule[]> {
  if (CACHED_RULES) {
    return CACHED_RULES;
  }

  try {
    console.log('📋 Loading drug interaction rules from JSON...');
    
    const asset = Asset.fromModule(require('../assets/rules/drug_interactions.json'));
    await asset.downloadAsync();
    
    const fileContent = await FileSystem.readAsStringAsync(asset.localUri || asset.uri);
    const data = JSON.parse(fileContent);
    
    CACHED_RULES = data.rules || [];
    console.log(`✅ Loaded ${CACHED_RULES.length} drug interaction rules`);
    
    return CACHED_RULES;
  } catch (error) {
    console.error('❌ Failed to load drug interaction rules:', error);
    CACHED_RULES = [];
    return CACHED_RULES;
  }
}

/**
 * Normalize medicine name for matching (lowercase, remove spaces/symbols)
 */
function normalizeName(name: string): string {
  return name.toLowerCase()
    .replace(/[^\w\s]/g, ' ')  // Replace symbols with spaces
    .replace(/\s+/g, ' ')      // Multiple spaces to single
    .trim();
}

/**
 * Check if a medicine matches a rule
 */
function matchesMedicine(medicineName: string, rule: DrugInteractionRule): { matches: boolean; type: 'primary' | 'interaction' | null; matchedText?: string } {
  const normalizedMedicine = normalizeName(medicineName);
  
  // Check primary match
  const normalizedPrimary = normalizeName(rule.primary);
  if (normalizedMedicine.includes(normalizedPrimary) || normalizedPrimary.includes(normalizedMedicine)) {
    return { matches: true, type: 'primary', matchedText: rule.primary };
  }
  
  // Check interaction_with match
  const normalizedInteraction = normalizeName(rule.interaction_with);
  if (normalizedMedicine.includes(normalizedInteraction) || normalizedInteraction.includes(normalizedMedicine)) {
    return { matches: true, type: 'interaction', matchedText: rule.interaction_with };
  }
  
  // Check examples match
  for (const example of rule.examples) {
    const normalizedExample = normalizeName(example);
    if (normalizedMedicine.includes(normalizedExample) || normalizedExample.includes(normalizedMedicine)) {
      return { matches: true, type: 'interaction', matchedText: example };
    }
  }
  
  return { matches: false, type: null };
}

/**
 * Find interactions between main medicine and optional medicines
 */
export async function findDrugInteractions(
  mainMedicine: string,
  optionalMedicines: string[]
): Promise<DrugInteractionResult[]> {
  if (!mainMedicine || optionalMedicines.length === 0) {
    return [];
  }

  const rules = await loadDrugInteractionRules();
  const interactions: DrugInteractionResult[] = [];
  
  console.log(`🔍 Checking interactions for main: ${mainMedicine} with ${optionalMedicines.length} optional medicines`);

  for (const optionalMedicine of optionalMedicines) {
    // Find rules where main medicine matches primary and optional medicine matches interaction_with or examples
    for (const rule of rules) {
      const mainMatch = matchesMedicine(mainMedicine, rule);
      const optionalMatch = matchesMedicine(optionalMedicine, rule);
      
      // Check for interaction: main as primary, optional as interaction target
      if (mainMatch.matches && mainMatch.type === 'primary' && 
          optionalMatch.matches && optionalMatch.type === 'interaction') {
        
        interactions.push({
          mainMedicine,
          optionalMedicine,
          severity: rule.severity,
          severityDisplay: getSeverityDisplay(rule.severity),
          rationale: rule.rationale,
          recommendedAction: rule.recommended_action,
          ruleMatched: rule
        });
        
        console.log(`✅ Found interaction: ${mainMedicine} + ${optionalMedicine} = ${rule.severity}`);
      }
      
      // Also check reverse: optional as primary, main as interaction target
      else if (optionalMatch.matches && optionalMatch.type === 'primary' && 
               mainMatch.matches && mainMatch.type === 'interaction') {
        
        interactions.push({
          mainMedicine,
          optionalMedicine,
          severity: rule.severity,
          severityDisplay: getSeverityDisplay(rule.severity),
          rationale: rule.rationale,
          recommendedAction: rule.recommended_action,
          ruleMatched: rule
        });
        
        console.log(`✅ Found reverse interaction: ${optionalMedicine} + ${mainMedicine} = ${rule.severity}`);
      }
    }
  }

  return interactions;
}

/**
 * Convert severity to display format
 */
function getSeverityDisplay(severity: 'HIGH' | 'MODERATE' | 'LOW'): 'High Risk' | 'Moderate Risk' | 'Low Risk' {
  switch (severity) {
    case 'HIGH': return 'High Risk';
    case 'MODERATE': return 'Moderate Risk';
    case 'LOW': return 'Low Risk';
    default: return 'Low Risk';
  }
}

/**
 * Group interactions by severity level
 */
export function groupInteractionsBySeverity(interactions: DrugInteractionResult[]): GroupedInteractionResults {
  const highRisk = interactions.filter(i => i.severity === 'HIGH');
  const moderateRisk = interactions.filter(i => i.severity === 'MODERATE');
  const lowRisk = interactions.filter(i => i.severity === 'LOW');
  
  // Determine overall risk level (highest wins)
  let overallRiskLevel: 'HIGH' | 'MODERATE' | 'LOW' | 'NONE' = 'NONE';
  
  if (highRisk.length > 0) {
    overallRiskLevel = 'HIGH';
  } else if (moderateRisk.length > 0) {
    overallRiskLevel = 'MODERATE';
  } else if (lowRisk.length > 0) {
    overallRiskLevel = 'LOW';
  }
  
  console.log(`📊 Grouped interactions: ${highRisk.length} high, ${moderateRisk.length} moderate, ${lowRisk.length} low`);
  
  return {
    highRisk,
    moderateRisk,
    lowRisk,
    overallRiskLevel
  };
}

/**
 * Get risk level color for UI
 */
export function getRiskColor(severity: 'HIGH' | 'MODERATE' | 'LOW'): string {
  switch (severity) {
    case 'HIGH': return '#DC2626';    // Red
    case 'MODERATE': return '#D97706'; // Amber
    case 'LOW': return '#65A30D';     // Green
    default: return '#6B7280';        // Gray
  }
}

/**
 * Get risk level icon for UI
 */
export function getRiskIcon(severity: 'HIGH' | 'MODERATE' | 'LOW'): string {
  switch (severity) {
    case 'HIGH': return 'dangerous';
    case 'MODERATE': return 'warning';
    case 'LOW': return 'check-circle';
    default: return 'help';
  }
}