/**
 * Advanced Clinical Decision Rule Engine
 * Evaluates complex boolean logic rules for clinical decision support
 */

export interface RuleCondition {
  field: string;
  op?: string;
  value?: any;
  contains?: string;
  contains_any?: string[];
  contains_multiple?: string[];
}

export interface RuleConditions {
  all?: RuleCondition[];
  any?: RuleCondition[];
  none?: RuleCondition[];
}

export interface ClinicalRule {
  id: string;
  conditions: RuleConditions;
  severity: 'Critical' | 'Major' | 'Moderate' | 'Minor';
  severity_priority: number;
  title: string;
  message: string;
  action: string;
  source: string;
}

export interface RuleEvaluationResult {
  rule: ClinicalRule;
  triggered: boolean;
  triggeredFields: string[];
  evaluationTime: number;
}

export interface PatientContext {
  // Demographics
  age?: number;
  sex?: string;
  bmi?: number;
  
  // Risk Scores
  ASCVD_percent?: number;
  gail_score?: number;
  frax_major_fracture?: number;
  frax_hip_fracture?: number;
  wells_score?: number;
  
  // Lab Values
  egfr?: number;
  alt_level?: number;
  potassium_level?: number;
  systolic_bp?: number;
  
  // Clinical History
  smoking?: boolean;
  pregnancy_status?: boolean;
  breastfeeding?: boolean;
  breast_cancer_history?: boolean;
  family_history_breast_cancer?: boolean;
  seizure_history?: boolean;
  fall_history?: boolean;
  severe_depression?: boolean;
  peptic_ulcer_disease?: boolean;
  acute_vte_risk?: boolean;
  
  // Symptoms & Indications
  vasomotor_symptoms_severe?: boolean;
  hot_flashes_insomnia?: boolean;
  indication_bone_protection?: boolean;
  hrt_contraindicated?: boolean;
  
  // Medications
  selected_medications: string[];
  medication_count?: number;
  
  // Monitoring
  inr_available?: boolean;
}

export class ClinicalRuleEngine {
  private rules: ClinicalRule[] = [];

  constructor(rules: ClinicalRule[]) {
    this.rules = rules.sort((a, b) => b.severity_priority - a.severity_priority);
    console.log(`🔧 Rule engine initialized with ${rules.length} rules`);
  }

  /**
   * Evaluate all rules against patient context
   */
  public evaluateAllRules(patient: PatientContext): RuleEvaluationResult[] {
    const startTime = Date.now();
    const results: RuleEvaluationResult[] = [];

    console.log(`🔍 Evaluating ${this.rules.length} rules for patient`);
    console.log(`📋 Patient medications: ${patient.selected_medications?.join(', ') || 'None'}`);
    
    for (const rule of this.rules) {
      const ruleStartTime = Date.now();
      const triggered = this.evaluateRule(rule, patient);
      const triggeredFields = triggered ? this.getTriggeredFields(rule, patient) : [];
      const evaluationTime = Date.now() - ruleStartTime;
      
      results.push({
        rule,
        triggered,
        triggeredFields,
        evaluationTime
      });
      
      if (triggered) {
        console.log(`🚨 Rule ${rule.id} (${rule.severity}) triggered: ${rule.title}`);
        console.log(`   Fields: ${triggeredFields.join(', ')}`);
      }
    }

    const totalTime = Date.now() - startTime;
    const triggeredRules = results.filter(r => r.triggered);
    
    console.log(`✅ Rule evaluation completed in ${totalTime}ms`);
    console.log(`📊 Results: ${triggeredRules.length}/${this.rules.length} rules triggered`);
    
    return results;
  }

  /**
   * Evaluate a single rule against patient context
   */
  private evaluateRule(rule: ClinicalRule, patient: PatientContext): boolean {
    try {
      return this.evaluateConditions(rule.conditions, patient);
    } catch (error) {
      console.error(`❌ Error evaluating rule ${rule.id}:`, error);
      return false;
    }
  }

  /**
   * Evaluate rule conditions with boolean logic
   */
  private evaluateConditions(conditions: RuleConditions, patient: PatientContext): boolean {
    let result = true;

    // Evaluate 'all' conditions (AND logic)
    if (conditions.all && conditions.all.length > 0) {
      const allResult = conditions.all.every(condition => 
        this.evaluateSingleCondition(condition, patient)
      );
      result = result && allResult;
    }

    // Evaluate 'any' conditions (OR logic)
    if (conditions.any && conditions.any.length > 0) {
      const anyResult = conditions.any.some(condition => 
        this.evaluateSingleCondition(condition, patient)
      );
      result = result && anyResult;
    }

    // Evaluate 'none' conditions (NOT logic)
    if (conditions.none && conditions.none.length > 0) {
      const noneResult = !conditions.none.some(condition => 
        this.evaluateSingleCondition(condition, patient)
      );
      result = result && noneResult;
    }

    return result;
  }

  /**
   * Evaluate a single condition
   */
  private evaluateSingleCondition(condition: RuleCondition, patient: PatientContext): boolean {
    const fieldValue = this.getFieldValue(condition.field, patient);
    
    // Handle 'contains' for arrays (medication lists)
    if (condition.contains !== undefined) {
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(condition.contains);
      }
      return false;
    }

    // Handle 'contains_any' for arrays
    if (condition.contains_any !== undefined) {
      if (Array.isArray(fieldValue)) {
        return condition.contains_any.some(item => fieldValue.includes(item));
      }
      return false;
    }

    // Handle 'contains_multiple' for arrays (checking for duplicates)
    if (condition.contains_multiple !== undefined) {
      if (Array.isArray(fieldValue)) {
        const matches = condition.contains_multiple.filter(item => fieldValue.includes(item));
        return matches.length >= 2; // At least 2 items from the list are present
      }
      return false;
    }

    // Handle standard operators
    if (condition.op && condition.value !== undefined) {
      console.log(`   Checking operator: ${fieldValue} ${condition.op} ${condition.value}`);
      const result = this.evaluateOperator(fieldValue, condition.op, condition.value);
      console.log(`   Operator result: ${result}`);
      return result;
    }

    console.log(`   No matching condition type, returning false`);
    return false;
  }

  /**
   * Evaluate operator conditions
   */
  private evaluateOperator(fieldValue: any, operator: string, compareValue: any): boolean {
    if (fieldValue === null || fieldValue === undefined) {
      return false;
    }

    switch (operator) {
      case '=':
      case '==':
        return fieldValue === compareValue;
      case '!=':
        return fieldValue !== compareValue;
      case '>':
        return Number(fieldValue) > Number(compareValue);
      case '>=':
        return Number(fieldValue) >= Number(compareValue);
      case '<':
        return Number(fieldValue) < Number(compareValue);
      case '<=':
        return Number(fieldValue) <= Number(compareValue);
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(compareValue).toLowerCase());
      case 'not_contains':
        return !String(fieldValue).toLowerCase().includes(String(compareValue).toLowerCase());
      default:
        console.warn(`⚠️ Unknown operator: ${operator}`);
        return false;
    }
  }

  /**
   * Get field value from patient context
   */
  private getFieldValue(fieldName: string, patient: PatientContext): any {
    // Handle nested field access
    const fields = fieldName.split('.');
    let value: any = patient;
    
    for (const field of fields) {
      value = value?.[field];
    }
    
    return value;
  }

  /**
   * Get fields that triggered a rule (for debugging/traceability)
   */
  private getTriggeredFields(rule: ClinicalRule, patient: PatientContext): string[] {
    const triggeredFields: string[] = [];
    
    // Check all conditions
    if (rule.conditions.all) {
      for (const condition of rule.conditions.all) {
        if (this.evaluateSingleCondition(condition, patient)) {
          triggeredFields.push(condition.field);
        }
      }
    }
    
    if (rule.conditions.any) {
      for (const condition of rule.conditions.any) {
        if (this.evaluateSingleCondition(condition, patient)) {
          triggeredFields.push(condition.field);
        }
      }
    }
    
    return [...new Set(triggeredFields)]; // Remove duplicates
  }

  /**
   * Group and merge similar rule results
   */
  public static groupAndMergeResults(results: RuleEvaluationResult[]): {
    actions: Map<string, RuleEvaluationResult[]>;
    byPriority: Map<number, RuleEvaluationResult[]>;
  } {
    const triggeredResults = results.filter(r => r.triggered);
    
    // Group by action
    const actionGroups = new Map<string, RuleEvaluationResult[]>();
    for (const result of triggeredResults) {
      const action = result.rule.action;
      if (!actionGroups.has(action)) {
        actionGroups.set(action, []);
      }
      actionGroups.get(action)!.push(result);
    }
    
    // Group by severity priority
    const priorityGroups = new Map<number, RuleEvaluationResult[]>();
    for (const result of triggeredResults) {
      const priority = result.rule.severity_priority;
      if (!priorityGroups.has(priority)) {
        priorityGroups.set(priority, []);
      }
      priorityGroups.get(priority)!.push(result);
    }
    
    return {
      actions: actionGroups,
      byPriority: priorityGroups
    };
  }

  /**
   * Format results for clinical display
   */
  public static formatResultsForDisplay(results: RuleEvaluationResult[]): {
    critical: RuleEvaluationResult[];
    major: RuleEvaluationResult[];
    moderate: RuleEvaluationResult[];
    minor: RuleEvaluationResult[];
  } {
    const triggered = results.filter(r => r.triggered);
    
    return {
      critical: triggered.filter(r => r.rule.severity === 'Critical'),
      major: triggered.filter(r => r.rule.severity === 'Major'),
      moderate: triggered.filter(r => r.rule.severity === 'Moderate'),
      minor: triggered.filter(r => r.rule.severity === 'Minor')
    };
  }
}

// Import the rules directly at the top level
import decisionRulesData from '../assets/rules/decision_rules.json';

/**
 * Load rules from imported JSON data
 */
export const loadRulesFromAssets = async (): Promise<ClinicalRule[]> => {
  try {
    // Use the directly imported data
    const rules = decisionRulesData;
    
    if (!Array.isArray(rules)) {
      throw new Error('Rules file does not contain valid array');
    }
    
    console.log(`✅ Loaded ${rules.length} clinical decision rules from static import`);
    return rules as ClinicalRule[];
  } catch (error) {
    console.error('❌ Failed to load rules from assets:', error);
    return [];
  }
};

/**
 * Create patient context from assessment data
 */
export const createPatientContext = (
  patientAssessment: any,
  selectedMedicines: any[],
  settings: any
): PatientContext => {
  console.log('🔄 Creating patient context for rule evaluation');
  console.log(`📊 Patient assessment:`, patientAssessment);
  console.log(`💊 Selected medicines (${selectedMedicines.length}):`, selectedMedicines);
  
  // Extract medication names/keys for rule evaluation
  const medicationNames = selectedMedicines.map(med => {
    // For rule evaluation, use the 'key' field which maps to rule conditions
    if (typeof med === 'string') return med;
    if (med.key) return med.key;  // This is what rules expect (e.g., "HRT_Estrogen")
    if (med.name) return med.name;
    if (med.displayName) return med.displayName;
    return 'Unknown';
  });
  
  const context: PatientContext = {
    // Demographics
    age: patientAssessment.age,
    sex: patientAssessment.sex,
    bmi: patientAssessment.bmi,
    
    // Risk Scores
    ASCVD_percent: patientAssessment.ascvdScore,
    gail_score: patientAssessment.gailScore,
    frax_major_fracture: patientAssessment.fraxScore,
    frax_hip_fracture: patientAssessment.fraxScore ? patientAssessment.fraxScore * 0.2 : undefined, // Rough estimate
    wells_score: patientAssessment.wellsScore,
    
    // Lab Values (with defaults for demo)
    egfr: patientAssessment.egfr || (patientAssessment.age > 65 ? 50 : 80),
    alt_level: patientAssessment.altLevel || 25,
    potassium_level: patientAssessment.potassiumLevel || 4.2,
    systolic_bp: patientAssessment.systolicBP || 130,
    
    // Clinical History
    smoking: patientAssessment.smoking || false,
    pregnancy_status: patientAssessment.pregnancyStatus || false,
    breastfeeding: patientAssessment.breastfeeding || false,
    breast_cancer_history: patientAssessment.breastCancerActive || patientAssessment.personalHistoryBreastCancer || false,
    family_history_breast_cancer: patientAssessment.familyHistoryBreastCancer || false,
    seizure_history: patientAssessment.seizureHistory || false,
    fall_history: patientAssessment.fallHistory || false,
    severe_depression: patientAssessment.severeDepression || false,
    peptic_ulcer_disease: patientAssessment.pepticUlcerDisease || false,
    acute_vte_risk: patientAssessment.wells_recent_event || false,
    
    // Symptoms & Indications  
    vasomotor_symptoms_severe: (patientAssessment.symptomSeverity || 0) >= 7,
    hot_flashes_insomnia: (patientAssessment.hotFlashes || 0) >= 6,
    indication_bone_protection: patientAssessment.indicationBoneProtection || false,
    hrt_contraindicated: false, // Will be determined by rules
    
    // Medications
    selected_medications: medicationNames,
    medication_count: medicationNames.length,
    
    // Monitoring
    inr_available: patientAssessment.inrAvailable || false
  };
  
  console.log(`✅ Patient context created with ${medicationNames.length} medications:`, medicationNames);
  console.log(`🩺 Risk scores - ASCVD: ${context.ASCVD_percent}%, Gail: ${context.gail_score}, Wells: ${context.wells_score}`);
  console.log(`🔍 Full patient context for rule evaluation:`, JSON.stringify(context, null, 2));
  
  return context;
};