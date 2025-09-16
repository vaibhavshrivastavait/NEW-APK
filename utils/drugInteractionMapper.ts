/**
 * Drug Interaction Mapping Utility
 * Provides comprehensive mapping between Primary medication groups and Current medication categories
 * Based on /assets/rules/drug_interactions.json
 */

import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

// Type definitions
export interface DrugInteractionRule {
  primary: string;
  interaction_with: string;
  examples: string[];
  severity: 'HIGH' | 'MAJOR' | 'MODERATE' | 'MINOR' | 'LOW';
  score: number;
  rationale: string;
  recommended_action: string;
  source: string;
}

export interface DrugInteractionData {
  generatedAt: string;
  version: string;
  notes: string;
  rules: DrugInteractionRule[];
}

export interface InteractionResult {
  medication: string;
  primary: string;
  severity: string;
  severityLabel: string;
  score: number;
  rationale: string;
  recommended_action: string;
  source: string;
  match_type: 'exact' | 'category' | 'fallback' | 'none';
}

// Cache for loaded rules
let RULES_CACHE: DrugInteractionRule[] | null = null;

// Severity label mapping
const SEVERITY_LABELS: Record<string, string> = {
  'HIGH': 'Critical',
  'MAJOR': 'Major',
  'MODERATE': 'Moderate', 
  'MINOR': 'Minor',
  'LOW': 'Low'
};

/**
 * Load drug interaction rules from JSON file
 */
export async function loadDrugInteractionRules(): Promise<DrugInteractionRule[]> {
  if (RULES_CACHE) {
    return RULES_CACHE;
  }

  try {
    // Load the JSON file
    const asset = Asset.fromModule(require('../assets/rules/drug_interactions.json'));
    await asset.downloadAsync();
    
    const fileUri = asset.localUri || asset.uri;
    const fileContent = await FileSystem.readAsStringAsync(fileUri);
    const data: DrugInteractionData = JSON.parse(fileContent);
    
    RULES_CACHE = data.rules;
    console.log(`✅ Loaded ${RULES_CACHE.length} drug interaction rules`);
    
    return RULES_CACHE;
  } catch (error) {
    console.error('❌ Error loading drug interaction rules:', error);
    throw new Error('Failed to load drug interaction rules');
  }
}

/**
 * Normalize string for matching
 */
function normalize(str: string): string {
  return (str || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Find the best matching rule for a given primary group and selected medication
 */
export function findBestRule(
  primary: string,
  selectedMedName: string,
  selectedMedCategory?: string
): InteractionResult | null {
  if (!RULES_CACHE) {
    console.warn('⚠️ Rules not loaded. Call loadDrugInteractionRules() first.');
    return null;
  }

  const normalizedPrimary = normalize(primary);
  const normalizedMedName = normalize(selectedMedName);
  const normalizedMedCategory = normalize(selectedMedCategory || '');

  // 1. Exact example match
  const exactMatch = RULES_CACHE.find(rule => 
    normalize(rule.primary) === normalizedPrimary && 
    rule.examples.some(example => normalize(example) === normalizedMedName)
  );

  if (exactMatch) {
    return createInteractionResult(exactMatch, selectedMedName, 'exact');
  }

  // 2. Category match in examples (partial name matching)
  const categoryMatch = RULES_CACHE.find(rule => 
    normalize(rule.primary) === normalizedPrimary && 
    rule.examples.some(example => 
      normalizedMedName.includes(normalize(example)) || 
      normalize(example).includes(normalizedMedName)
    )
  );

  if (categoryMatch) {
    return createInteractionResult(categoryMatch, selectedMedName, 'category');
  }

  // 3. Interaction category match
  const interactionMatch = RULES_CACHE.find(rule => 
    normalize(rule.primary) === normalizedPrimary && 
    (normalize(rule.interaction_with).includes(normalizedMedCategory) ||
     normalizedMedCategory.includes(normalize(rule.interaction_with)))
  );

  if (interactionMatch) {
    return createInteractionResult(interactionMatch, selectedMedName, 'category');
  }

  // 4. Generic fallback rule
  const fallbackMatch = RULES_CACHE.find(rule => 
    (normalize(rule.primary).includes('all primary groups') || 
     normalize(rule.primary).includes('general')) &&
    rule.examples.some(example => normalize(example) === normalizedMedName)
  );

  if (fallbackMatch) {
    return createInteractionResult(fallbackMatch, selectedMedName, 'fallback');
  }

  return null;
}

/**
 * Create interaction result object
 */
function createInteractionResult(
  rule: DrugInteractionRule,
  medicationName: string,
  matchType: 'exact' | 'category' | 'fallback'
): InteractionResult {
  return {
    medication: medicationName,
    primary: rule.primary,
    severity: rule.severity,
    severityLabel: SEVERITY_LABELS[rule.severity] || rule.severity,
    score: rule.score,
    rationale: rule.rationale,
    recommended_action: rule.recommended_action,
    source: rule.source,
    match_type: matchType
  };
}

/**
 * Analyze multiple medications against a primary group
 */
export function analyzeMedicationsForPrimary(
  primary: string,
  medications: Array<{name: string; category?: string}>
): InteractionResult[] {
  const results: InteractionResult[] = [];

  for (const med of medications) {
    const result = findBestRule(primary, med.name, med.category);
    if (result) {
      results.push(result);
    }
  }

  // Sort by severity score (highest first)
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Get all available primary medication groups from rules
 */
export function getAvailablePrimaryGroups(): string[] {
  if (!RULES_CACHE) {
    return [];
  }

  const primaryGroups = new Set<string>();
  RULES_CACHE.forEach(rule => {
    if (!rule.primary.includes('fallback') && !rule.primary.includes('General')) {
      primaryGroups.add(rule.primary);
    }
  });

  return Array.from(primaryGroups).sort();
}

/**
 * Format interaction result for display
 */
export function formatInteractionDisplay(result: InteractionResult): string {
  return `${result.medication} + ${result.primary} — ${result.severity} (${result.severityLabel})`;
}

/**
 * Check if medication is unknown (no local rule found)
 */
export function isUnknownMedication(
  primary: string,
  medicationName: string,
  medicationCategory?: string
): boolean {
  const result = findBestRule(primary, medicationName, medicationCategory);
  return result === null;
}

/**
 * Get severity color for UI display
 */
export function getSeverityColor(severity: string): string {
  switch (severity.toUpperCase()) {
    case 'HIGH':
      return '#DC2626'; // Red-600
    case 'MAJOR':
      return '#EA580C'; // Orange-600
    case 'MODERATE':
      return '#D97706'; // Amber-600
    case 'MINOR':
      return '#16A34A'; // Green-600
    case 'LOW':
      return '#059669'; // Emerald-600
    default:
      return '#6B7280'; // Gray-500
  }
}

/**
 * Get severity icon for UI display
 */
export function getSeverityIcon(severity: string): string {
  switch (severity.toUpperCase()) {
    case 'HIGH':
      return 'error';
    case 'MAJOR':
      return 'warning';
    case 'MODERATE':
      return 'info';
    case 'MINOR':
      return 'check-circle';
    case 'LOW':
      return 'check';
    default:
      return 'help';
  }
}

/**
 * Initialize the drug interaction mapper
 * Call this once at app startup
 */
export async function initializeDrugInteractionMapper(): Promise<void> {
  try {
    await loadDrugInteractionRules();
    console.log('✅ Drug interaction mapper initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize drug interaction mapper:', error);
    throw error;
  }
}