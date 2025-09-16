/**
 * MHT Assessment Rules Engine
 * TypeScript port of the decision_engine.js for React Native integration
 */

// Import the JSON rules from assets
import riskThresholds from '../assets/mht_rules/risk_thresholds.json';
import drugInteractions from '../assets/mht_rules/drug_interactions.json';
import treatmentRules from '../assets/mht_rules/treatment_rules.json';

// Type definitions
export interface RiskThresholds {
  low: number;
  intermediate?: number;
  moderate?: number;
  high: number;
}

export interface AssessmentInput {
  age: number;
  ASCVD?: number;
  Framingham?: number;
  Framingham_score?: number;
  Gail?: number;
  TyrerCuzick?: number;
  Wells?: number;
  wells_recent_event?: boolean;
  FRAX?: number;
  meds?: string[];
  therapy_selected?: string;
  symptom_severity?: number;
  breast_cancer_active?: boolean;
  
  // Calculated categories (will be added by engine)
  ASCVD_category?: string;
  Framingham_category?: string;
  Gail_category?: string;
  TyrerCuzick_category?: string;
  Wells_category?: string;
  FRAX_category?: string;
}

export interface TreatmentResult {
  primary: string;
  suitability: 'Contraindicated' | 'Use with caution' | 'Suitable' | 'Suitable (for osteoporosis therapy)';
  rationale: string;
  warnings: string[];
}

export interface RuleCondition {
  [key: string]: any;
  symptom_severity?: {
    lte?: number;
    gte?: number;
  };
  meds_include?: string;
  therapy_selected?: string | string[];
}

export interface RuleAction {
  recommendation: string;
  suitability: TreatmentResult['suitability'];
  rationale: string;
}

export interface TreatmentRule {
  id: string;
  condition: RuleCondition;
  action: RuleAction;
}

/**
 * Categorize risk score based on thresholds
 */
function categorizeRisk(value: number | null | undefined, thresholds: RiskThresholds): string {
  if (value === null || value === undefined) return 'low';
  if (value >= thresholds.high) return 'high';
  if (thresholds.intermediate && value >= thresholds.intermediate) return 'intermediate';
  if (thresholds.moderate && value >= thresholds.moderate) return 'moderate';
  return 'low';
}

/**
 * Check if array contains any item
 */
function containsAny(list: string[] | undefined, item: string): boolean {
  if (!Array.isArray(list)) return false;
  return list.indexOf(item) !== -1;
}

/**
 * Match rule condition against input
 */
function matchCondition(cond: RuleCondition, input: AssessmentInput): boolean {
  for (const k of Object.keys(cond)) {
    const val = cond[k];
    
    if (k === 'symptom_severity' && typeof val === 'object') {
      if (val.lte !== undefined && !(input.symptom_severity && input.symptom_severity <= val.lte)) return false;
      if (val.gte !== undefined && !(input.symptom_severity && input.symptom_severity >= val.gte)) return false;
      continue;
    }
    
    if (k === 'meds_include') {
      if (!containsAny(input.meds, val)) return false;
      continue;
    }
    
    if (k === 'therapy_selected') {
      if (Array.isArray(val)) {
        if (!input.therapy_selected || !val.includes(input.therapy_selected)) return false;
      } else {
        if (input.therapy_selected !== val) return false;
      }
      continue;
    }
    
    if (typeof val === 'boolean') {
      if ((input[k as keyof AssessmentInput] === true) !== val) return false;
      continue;
    }
    
    if (k.endsWith('_category') || k.endsWith('category')) {
      if (input[k as keyof AssessmentInput] !== val) return false;
      continue;
    }
    
    if (input[k as keyof AssessmentInput] !== val) return false;
  }
  return true;
}

/**
 * Main evaluation function - matches the Node.js engine logic
 */
export function evaluate(input: AssessmentInput): TreatmentResult {
  // Calculate risk categories
  const enhancedInput = { ...input };
  enhancedInput.ASCVD_category = categorizeRisk(input.ASCVD, riskThresholds.ASCVD);
  enhancedInput.Framingham_category = categorizeRisk(input.Framingham || input.Framingham_score, riskThresholds.Framingham);
  enhancedInput.Gail_category = categorizeRisk(input.Gail, riskThresholds.Gail);
  enhancedInput.TyrerCuzick_category = categorizeRisk(input.TyrerCuzick, riskThresholds.TyrerCuzick);
  enhancedInput.Wells_category = categorizeRisk(input.Wells, riskThresholds.Wells);
  enhancedInput.FRAX_category = categorizeRisk(input.FRAX, riskThresholds.FRAX);

  let warnings: string[] = [];
  let accumulated: RuleAction[] = [];

  // Check contraindications first (highest priority)
  for (const r of treatmentRules.contraindication) {
    if (matchCondition(r.condition, enhancedInput)) {
      return {
        primary: r.action.recommendation,
        suitability: r.action.suitability,
        rationale: r.action.rationale,
        warnings
      };
    }
  }

  // Check high risk conditions
  for (const r of treatmentRules.high_risk) {
    if (matchCondition(r.condition, enhancedInput)) {
      accumulated.push(r.action);
      warnings.push(r.id);
    }
  }

  // Check drug interactions
  for (const med of input.meds || []) {
    const medInfo = drugInteractions.drugClasses[med as keyof typeof drugInteractions.drugClasses];
    if (!medInfo) continue;
    
    const interactions = medInfo.interactions || {};
    for (const k of Object.keys(interactions)) {
      if (input.therapy_selected && (input.therapy_selected === k || input.therapy_selected === k.replace('_', ''))) {
        accumulated.push({
          recommendation: 'Interaction: ' + interactions[k as keyof typeof interactions],
          suitability: 'Use with caution',
          rationale: 'Medication interaction detected: ' + med + ' -> ' + interactions[k as keyof typeof interactions]
        });
        warnings.push('interaction_' + med + '_' + k);
      }
    }
    
    // Specific drug interaction rules
    if (med === 'anticoagulants' && (input.therapy_selected && input.therapy_selected.startsWith('estrogen'))) {
      accumulated.push({
        recommendation: 'Avoid systemic estrogen; prefer non-hormonal or consult specialist',
        suitability: 'Contraindicated',
        rationale: 'Anticoagulant present increases bleeding risk with systemic estrogen.'
      });
      warnings.push('anticoagulant_interaction');
    }
    
    if (med === 'anticonvulsants' && input.therapy_selected === 'estrogen_oral') {
      accumulated.push({
        recommendation: 'Estrogen efficacy may be reduced; consider transdermal or adjust plan',
        suitability: 'Use with caution',
        rationale: 'Anticonvulsant may reduce oral estrogen levels.'
      });
      warnings.push('anticonvulsant_interaction');
    }
  }

  // Check moderate risk conditions
  for (const r of treatmentRules.moderate_risk) {
    if (matchCondition(r.condition, enhancedInput)) {
      accumulated.push(r.action);
    }
  }

  // Check default rules
  for (const r of treatmentRules.default || []) {
    if (matchCondition(r.condition, enhancedInput)) {
      accumulated.push(r.action);
    }
  }

  // Sort by priority (contraindicated > use with caution > suitable)
  const priority: Record<string, number> = {
    'Contraindicated': 3,
    'Use with caution': 2,
    'Suitable': 1,
    'Suitable (for osteoporosis therapy)': 1
  };
  
  accumulated.sort((a, b) => (priority[b.suitability] || 0) - (priority[a.suitability] || 0));
  
  const chosen = accumulated.length ? accumulated[0] : {
    recommendation: 'No specific recommendation',
    suitability: 'Suitable' as const,
    rationale: 'No rules matched specifically.'
  };

  return {
    primary: chosen.recommendation,
    suitability: chosen.suitability,
    rationale: chosen.rationale,
    warnings
  };
}

/**
 * Helper function to create input object from assessment data
 */
export function createAssessmentInput(assessmentData: any): AssessmentInput {
  return {
    age: assessmentData.age || 0,
    ASCVD: assessmentData.ascvdScore || assessmentData.ASCVD,
    Framingham: assessmentData.framinghamScore || assessmentData.Framingham,
    Framingham_score: assessmentData.framingham_score || assessmentData.Framingham_score,
    Gail: assessmentData.gailScore || assessmentData.Gail,
    TyrerCuzick: assessmentData.tyrerCuzickScore || assessmentData.TyrerCuzick,
    Wells: assessmentData.wellsScore || assessmentData.Wells,
    wells_recent_event: assessmentData.wells_recent_event || false,
    FRAX: assessmentData.fraxScore || assessmentData.FRAX,
    meds: assessmentData.currentMedications || assessmentData.meds || [],
    therapy_selected: assessmentData.selectedTherapy || assessmentData.therapy_selected || 'none',
    symptom_severity: assessmentData.symptomSeverity || assessmentData.symptom_severity || 1,
    breast_cancer_active: assessmentData.breastCancerActive || assessmentData.breast_cancer_active || false
  };
}

/**
 * Get risk category for display
 */
export function getRiskCategory(score: number | undefined, type: 'ASCVD' | 'Framingham' | 'Gail' | 'TyrerCuzick' | 'Wells' | 'FRAX'): string {
  if (!score) return 'Not assessed';
  const thresholds = riskThresholds[type];
  return categorizeRisk(score, thresholds);
}

/**
 * Get readable suitability status
 */
export function getSuitabilityColor(suitability: TreatmentResult['suitability']): string {
  switch (suitability) {
    case 'Contraindicated':
      return '#dc3545'; // Red
    case 'Use with caution':
      return '#fd7e14'; // Orange
    case 'Suitable':
    case 'Suitable (for osteoporosis therapy)':
      return '#28a745'; // Green
    default:
      return '#6c757d'; // Gray
  }
}

/**
 * Export the loaded rules for debugging/inspection
 */
export const loadedRules = {
  riskThresholds,
  drugInteractions,
  treatmentRules
};