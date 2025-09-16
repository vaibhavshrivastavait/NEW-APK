/**
 * Deterministic Treatment Plan & Risk Decision Engine
 * 
 * This engine applies rules in exact precedence order:
 * 1. Absolute contraindications → immediate block
 * 2. High-severity drug interactions → block or advise avoid
 * 3. Risk-threshold high → treat as high-priority safety actions
 * 4. Moderate-risk rules → suggest review/monitor
 * 5. Patient preference / symptom guidance → last
 */

import thresholds from '../data/thresholds.json';
import contraindications from '../data/contraindications.json';
import interactions from '../data/interactions.json';

export interface TreatmentInputs {
  // Demographics
  age: number;
  sex: string;
  weight?: number;
  height?: number;
  
  // Risk Scores (external or computed)
  ASCVD?: number;
  ASCVD_source?: 'external' | 'computed';
  Framingham?: number;
  Framingham_source?: 'external' | 'computed';
  FRAX_major?: number;
  FRAX_major_source?: 'external' | 'computed';
  FRAX_hip?: number;
  FRAX_hip_source?: 'external' | 'computed';
  GAIL_5yr?: number;
  GAIL_5yr_source?: 'external' | 'computed';
  Wells?: number;
  Wells_source?: 'external' | 'computed';
  
  // Clinical data for risk calculation
  smoking_status?: boolean;
  systolic_bp?: number;
  total_cholesterol?: number;
  hdl_cholesterol?: number;
  diabetes?: boolean;
  family_history_mi?: boolean;
  
  // Treatment selection
  selected_medicine: string;
  current_medications: string[];
  
  // Conditions
  conditions: string[];
}

export interface FiredRule {
  id: string;
  description: string;
  sourceFile: string;
  type: 'contraindication' | 'interaction' | 'risk_threshold' | 'action';
  severity?: 'absolute' | 'relative' | 'high' | 'moderate' | 'low';
}

export interface TreatmentRecommendation {
  summaryInputs: TreatmentInputs;
  firedRules: FiredRule[];
  primaryRecommendation: {
    text: string;
    strength: 'Strong' | 'Conditional' | 'Not recommended';
  };
  alternatives: string[];
  monitoring: string[];
  clinicianReviewRequired: boolean;
  riskScoreConflicts?: Array<{
    score: string;
    external: number;
    computed: number;
    difference: number;
  }>;
}

export class TreatmentPlanEngine {
  private thresholds = thresholds;
  private contraindications = contraindications;
  private interactions = interactions;

  /**
   * Main entry point - evaluates treatment inputs and returns recommendation
   */
  public evaluateTreatment(inputs: TreatmentInputs): TreatmentRecommendation {
    const firedRules: FiredRule[] = [];
    const alternatives: string[] = [];
    const monitoring: string[] = [];
    let clinicianReviewRequired = false;
    let primaryRecommendation = '';
    let strength: 'Strong' | 'Conditional' | 'Not recommended' = 'Conditional';

    // Check for missing critical data
    if (!inputs.selected_medicine) {
      return this.createInsufficientDataResponse(inputs);
    }

    // Apply rules in precedence order from thresholds.json
    const precedence = this.thresholds.precedence;

    for (const ruleType of precedence) {
      switch (ruleType) {
        case 'absolute_contraindications':
          const contraResults = this.checkContraindications(inputs);
          firedRules.push(...contraResults.firedRules);
          if (contraResults.hasAbsolute) {
            return {
              summaryInputs: inputs,
              firedRules,
              primaryRecommendation: {
                text: contraResults.message,
                strength: 'Not recommended'
              },
              alternatives: contraResults.alternatives,
              monitoring: [],
              clinicianReviewRequired: true
            };
          }
          if (contraResults.hasRelative) {
            clinicianReviewRequired = true;
            primaryRecommendation = contraResults.message;
            strength = 'Conditional';
            alternatives.push(...contraResults.alternatives);
          }
          break;

        case 'interactions_high':
          const interactionResults = this.checkInteractions(inputs);
          firedRules.push(...interactionResults.firedRules);
          if (interactionResults.hasHigh) {
            return {
              summaryInputs: inputs,
              firedRules,
              primaryRecommendation: {
                text: interactionResults.message,
                strength: 'Not recommended'
              },
              alternatives: interactionResults.alternatives,
              monitoring: interactionResults.monitoring,
              clinicianReviewRequired: true
            };
          }
          if (interactionResults.hasModerate) {
            primaryRecommendation = interactionResults.message;
            strength = 'Conditional';
            monitoring.push(...interactionResults.monitoring);
          }
          break;

        case 'risk_high':
        case 'risk_moderate':
          const riskResults = this.checkRiskThresholds(inputs, ruleType === 'risk_high');
          firedRules.push(...riskResults.firedRules);
          if (riskResults.hasHighRisk) {
            if (!primaryRecommendation) {
              primaryRecommendation = riskResults.message;
              strength = riskResults.blocksTreatment ? 'Not recommended' : 'Conditional';
            }
            alternatives.push(...riskResults.alternatives);
            monitoring.push(...riskResults.monitoring);
            clinicianReviewRequired = true;
          }
          break;

        case 'symptom_guided':
          // This would be implemented for symptom-based recommendations
          // For now, provide default guidance if no other rules fired
          if (!primaryRecommendation && !firedRules.length) {
            primaryRecommendation = 'Consider individual patient factors and symptom severity for treatment selection.';
            strength = 'Conditional';
          }
          break;
      }

      // If we have a blocking recommendation, stop processing
      if (strength === 'Not recommended') {
        break;
      }
    }

    // Default response if no rules fired
    if (!primaryRecommendation) {
      primaryRecommendation = this.thresholds.defaults.insufficient_data;
      strength = 'Conditional';
      clinicianReviewRequired = true;
    }

    return {
      summaryInputs: inputs,
      firedRules,
      primaryRecommendation: {
        text: primaryRecommendation,
        strength
      },
      alternatives,
      monitoring,
      clinicianReviewRequired
    };
  }

  /**
   * Check contraindications from contraindications.json
   */
  private checkContraindications(inputs: TreatmentInputs): {
    firedRules: FiredRule[];
    hasAbsolute: boolean;
    hasRelative: boolean;
    message: string;
    alternatives: string[];
  } {
    const firedRules: FiredRule[] = [];
    const alternatives: string[] = [];
    let hasAbsolute = false;
    let hasRelative = false;
    let message = '';

    for (const contra of this.contraindications.contraindications) {
      const hasCondition = inputs.conditions.includes(contra.condition);
      
      if (hasCondition) {
        firedRules.push({
          id: contra.id,
          description: contra.message,
          sourceFile: 'contraindications.json',
          type: 'contraindication',
          severity: contra.type as 'absolute' | 'relative'
        });

        if (contra.type === 'absolute') {
          hasAbsolute = true;
          message = contra.message;
          alternatives.push('Seek alternative non-hormonal therapy');
        } else if (contra.type === 'relative') {
          hasRelative = true;
          if (!message) message = contra.message;
          alternatives.push('Consider careful monitoring or alternative approach');
        }
      }
    }

    return { firedRules, hasAbsolute, hasRelative, message, alternatives };
  }

  /**
   * Check drug interactions from interactions.json
   */
  private checkInteractions(inputs: TreatmentInputs): {
    firedRules: FiredRule[];
    hasHigh: boolean;
    hasModerate: boolean;
    message: string;
    alternatives: string[];
    monitoring: string[];
  } {
    const firedRules: FiredRule[] = [];
    const alternatives: string[] = [];
    const monitoring: string[] = [];
    let hasHigh = false;
    let hasModerate = false;
    let message = '';

    for (const interaction of this.interactions.interactions) {
      // Check if selected medicine interacts with any current medication
      const interacts = (
        (interaction.drug_a === inputs.selected_medicine && 
         inputs.current_medications.some(med => this.normalizeDrug(med) === this.normalizeDrug(interaction.drug_b))) ||
        (interaction.drug_b === inputs.selected_medicine && 
         inputs.current_medications.some(med => this.normalizeDrug(med) === this.normalizeDrug(interaction.drug_a)))
      );

      if (interacts) {
        firedRules.push({
          id: interaction.id,
          description: interaction.message,
          sourceFile: 'interactions.json',
          type: 'interaction',
          severity: interaction.severity as 'high' | 'moderate' | 'low'
        });

        if (interaction.severity === 'high') {
          hasHigh = true;
          message = interaction.message;
          alternatives.push('Select alternative medication without interaction');
        } else if (interaction.severity === 'moderate') {
          hasModerate = true;
          if (!message) message = interaction.message;
          monitoring.push(interaction.action === 'monitor' ? 'Enhanced monitoring required' : 'Counsel patient on risks');
        }
      }
    }

    return { firedRules, hasHigh, hasModerate, message, alternatives, monitoring };
  }

  /**
   * Check risk thresholds from thresholds.json
   */
  private checkRiskThresholds(inputs: TreatmentInputs, highRiskOnly: boolean): {
    firedRules: FiredRule[];
    hasHighRisk: boolean;
    message: string;
    alternatives: string[];
    monitoring: string[];
    blocksTreatment: boolean;
  } {
    const firedRules: FiredRule[] = [];
    const alternatives: string[] = [];
    const monitoring: string[] = [];
    let hasHighRisk = false;
    let message = '';
    let blocksTreatment = false;

    // Check ASCVD
    if (inputs.ASCVD !== undefined) {
      const ascvdThreshold = this.thresholds.risk_thresholds.ASCVD;
      if (inputs.ASCVD >= ascvdThreshold.cutoffs.high) {
        firedRules.push({
          id: 'ASCVD_high',
          description: `High ASCVD risk (${inputs.ASCVD}% ≥ ${ascvdThreshold.cutoffs.high}%)`,
          sourceFile: 'thresholds.json',
          type: 'risk_threshold',
          severity: 'high'
        });
        hasHighRisk = true;
        message = this.thresholds.actions.ASCVD_high.join('; ');
        blocksTreatment = true;
        alternatives.push(...this.thresholds.actions.ASCVD_high);
      } else if (!highRiskOnly && inputs.ASCVD >= ascvdThreshold.cutoffs.low) {
        firedRules.push({
          id: 'ASCVD_intermediate',
          description: `Intermediate ASCVD risk (${inputs.ASCVD}% ≥ ${ascvdThreshold.cutoffs.low}%)`,
          sourceFile: 'thresholds.json',
          type: 'risk_threshold',
          severity: 'moderate'
        });
        hasHighRisk = true;
        if (!message) message = this.thresholds.actions.ASCVD_intermediate.join('; ');
        alternatives.push(...this.thresholds.actions.ASCVD_intermediate);
      }
    }

    // Check FRAX
    if (inputs.FRAX_major !== undefined) {
      const fraxThreshold = this.thresholds.risk_thresholds.FRAX_major;
      if (inputs.FRAX_major >= fraxThreshold.cutoffs.high) {
        firedRules.push({
          id: 'FRAX_high',
          description: `High fracture risk (FRAX major ${inputs.FRAX_major}% ≥ ${fraxThreshold.cutoffs.high}%)`,
          sourceFile: 'thresholds.json',
          type: 'risk_threshold',
          severity: 'high'
        });
        hasHighRisk = true;
        if (!message) message = this.thresholds.actions.FRAX_high.join('; ');
        alternatives.push(...this.thresholds.actions.FRAX_high);
      }
    }

    // Check GAIL
    if (inputs.GAIL_5yr !== undefined) {
      const gailThreshold = this.thresholds.risk_thresholds.GAIL_5yr;
      if (inputs.GAIL_5yr >= gailThreshold.cutoffs.elevated_5yr) {
        firedRules.push({
          id: 'GAIL_elevated',
          description: `Elevated breast cancer risk (GAIL 5-year ${inputs.GAIL_5yr}% ≥ ${gailThreshold.cutoffs.elevated_5yr}%)`,
          sourceFile: 'thresholds.json',
          type: 'risk_threshold',
          severity: 'moderate'
        });
        hasHighRisk = true;
        if (!message) message = this.thresholds.actions.GAIL_elevated.join('; ');
        alternatives.push(...this.thresholds.actions.GAIL_elevated);
      }
    }

    // Check Wells VTE
    if (inputs.Wells !== undefined) {
      const wellsThreshold = this.thresholds.risk_thresholds.WELLS_VTE;
      if (inputs.Wells >= wellsThreshold.cutoffs.high) {
        firedRules.push({
          id: 'WELLS_high',
          description: `High VTE risk (Wells score ${inputs.Wells} ≥ ${wellsThreshold.cutoffs.high})`,
          sourceFile: 'thresholds.json',
          type: 'risk_threshold',
          severity: 'high'
        });
        hasHighRisk = true;
        if (!message) message = this.thresholds.actions.WELLS_high.join('; ');
        blocksTreatment = true;
        alternatives.push(...this.thresholds.actions.WELLS_high);
      }
    }

    return { firedRules, hasHighRisk, message, alternatives, monitoring, blocksTreatment };
  }

  /**
   * Normalize drug names for comparison
   */
  private normalizeDrug(drugName: string): string {
    return drugName.toLowerCase().trim().replace(/[()]/g, '');
  }

  /**
   * Create response for insufficient data
   */
  private createInsufficientDataResponse(inputs: TreatmentInputs): TreatmentRecommendation {
    return {
      summaryInputs: inputs,
      firedRules: [],
      primaryRecommendation: {
        text: this.thresholds.defaults.insufficient_data,
        strength: 'Conditional'
      },
      alternatives: ['Gather additional clinical data', 'Comprehensive patient assessment'],
      monitoring: [],
      clinicianReviewRequired: true
    };
  }

  /**
   * Utility method to get rule by ID for testing
   */
  public getRuleById(ruleId: string): any {
    // Check contraindications
    const contra = this.contraindications.contraindications.find(c => c.id === ruleId);
    if (contra) return { ...contra, sourceFile: 'contraindications.json' };

    // Check interactions
    const interaction = this.interactions.interactions.find(i => i.id === ruleId);
    if (interaction) return { ...interaction, sourceFile: 'interactions.json' };

    // Check threshold actions
    if (this.thresholds.actions[ruleId as keyof typeof this.thresholds.actions]) {
      return { 
        id: ruleId, 
        actions: this.thresholds.actions[ruleId as keyof typeof this.thresholds.actions],
        sourceFile: 'thresholds.json' 
      };
    }

    return null;
  }
}