import treatmentRules from './treatmentRules.json';

/**
 * Treatment Plan Generator for MHT Assessment
 * Evidence-based clinical decision support system
 * Version: 1.0.0
 */

export interface TreatmentPlanInputs {
  // Patient Demographics
  age: number;
  gender: string;
  
  // Risk Scores
  ascvdResult?: {
    tenYearRisk: number;
    riskCategory: string;
  };
  framinghamResult?: {
    tenYearRisk: number;
    riskCategory: string;
  };
  gailResult?: {
    fiveYearRisk: number;
    lifetimeRisk: number;
  };
  fraxResult?: {
    majorFractureRisk: number;
    hipFractureRisk: number;
  };
  wellsScore?: number;
  
  // Clinical Factors
  personalHistoryBreastCancer: boolean;
  personalHistoryDVT: boolean;
  unexplainedVaginalBleeding: boolean;
  liverDisease: boolean;
  smoking: boolean;
  hypertension: boolean;
  diabetes: boolean;
  
  // Symptoms & Preferences
  vasomotorSymptoms: 'mild' | 'moderate' | 'severe' | 'none';
  genitourinarySymptoms: boolean;
  sleepDisturbance: boolean;
  moodSymptoms: boolean;
  patientPreference: 'hormonal' | 'non_hormonal' | 'minimal_medication' | 'no_preference';
  
  // Additional Factors
  bmi?: number;
  breastfeeding?: boolean;
  timeSinceMenopause?: number;
  currentMedications?: string[];
  allergies?: string[];
}

export interface TreatmentRecommendation {
  id: string;
  type: 'primary' | 'alternative';
  title: string;
  recommendation: string;
  details?: {
    firstLine?: string;
    dosing?: string;
    duration?: string;
    route?: string;
    approach?: string;
    secondLine?: string;
  };
  rationale: string;
  evidence: {
    guidelines: string[];
    references: string[];
    strength: 'strong' | 'moderate' | 'weak';
  };
  safety: {
    level: 'preferred' | 'consider' | 'caution' | 'avoid';
    color: 'green' | 'yellow' | 'orange' | 'red';
    contraindications: string[];
  };
  monitoring: string;
  score: number;
  triggeredRules: string[];
}

export interface SafetyFlag {
  id: string;
  severity: 'absolute' | 'high' | 'moderate' | 'low';
  title: string;
  description: string;
  action: string;
  ruleId: string;
}

export interface MonitoringPlan {
  baseline: string[];
  earlyFollowup: string[];
  ongoing: string[];
  timeline: string;
}

export interface PatientCounseling {
  benefits: string[];
  risks: string[];
  sharedDecisionPoints: string[];
}

export interface TreatmentPlan {
  id: string;
  timestamp: string;
  rulesetVersion: string;
  
  // Patient Info
  patientInfo: {
    age: number;
    keyFlags: string[];
  };
  
  // Recommendations
  primaryRecommendation: TreatmentRecommendation;
  alternatives: TreatmentRecommendation[];
  
  // Safety & Monitoring
  safetyFlags: SafetyFlag[];
  contraindications: string[];
  monitoringPlan: MonitoringPlan;
  
  // Patient Counseling
  counseling: PatientCounseling;
  
  // Documentation
  clinicalSummary: string;
  chartDocumentation: string;
  
  // Audit Trail
  inputsSnapshot: TreatmentPlanInputs;
  triggeredRules: string[];
  
  // Disclaimer
  disclaimer: string;
}

class TreatmentPlanGenerator {
  private rules = treatmentRules;
  
  /**
   * Generate comprehensive treatment plan based on assessment data
   */
  generateTreatmentPlan(inputs: TreatmentPlanInputs): TreatmentPlan {
    const planId = this.generatePlanId();
    const timestamp = new Date().toISOString();
    
    // Evaluate all rules
    const safetyFlags = this.evaluateSafetyFlags(inputs);
    const contraindications = this.evaluateContraindications(inputs);
    const recommendations = this.evaluateRecommendations(inputs, contraindications);
    
    // Generate monitoring plan
    const monitoringPlan = this.generateMonitoringPlan(recommendations.primary);
    
    // Generate patient counseling
    const counseling = this.generateCounseling(recommendations.primary);
    
    // Generate documentation
    const clinicalSummary = this.generateClinicalSummary(inputs, recommendations.primary);
    const chartDocumentation = this.generateChartDocumentation(inputs, recommendations.primary);
    
    // Collect all triggered rules
    const triggeredRules = [
      ...safetyFlags.map(flag => flag.ruleId),
      ...recommendations.primary.triggeredRules,
      ...recommendations.alternatives.flatMap(alt => alt.triggeredRules)
    ];
    
    return {
      id: planId,
      timestamp,
      rulesetVersion: this.rules.version,
      
      patientInfo: {
        age: inputs.age,
        keyFlags: this.generateKeyFlags(inputs, safetyFlags)
      },
      
      primaryRecommendation: recommendations.primary,
      alternatives: recommendations.alternatives,
      
      safetyFlags,
      contraindications,
      monitoringPlan,
      
      counseling,
      
      clinicalSummary,
      chartDocumentation,
      
      inputsSnapshot: { ...inputs },
      triggeredRules,
      
      disclaimer: "This is a decision support suggestion. Final clinical judgement rests with treating clinician."
    };
  }
  
  /**
   * Evaluate safety flags and contraindications
   */
  private evaluateSafetyFlags(inputs: TreatmentPlanInputs): SafetyFlag[] {
    const flags: SafetyFlag[] = [];
    
    // Check absolute contraindications
    for (const contraindication of this.rules.absoluteContraindications) {
      if (this.evaluateCondition(inputs, contraindication.condition, contraindication.value)) {
        flags.push({
          id: contraindication.id,
          severity: contraindication.severity as 'absolute',
          title: contraindication.recommendation,
          description: contraindication.rationale,
          action: contraindication.alternatives.join(', '),
          ruleId: contraindication.rule
        });
      }
    }
    
    // Check relative contraindications
    for (const contraindication of this.rules.relativeContraindications) {
      if (this.evaluateConditions(inputs, contraindication.conditions)) {
        flags.push({
          id: contraindication.id,
          severity: contraindication.severity as any,
          title: contraindication.recommendation,
          description: contraindication.rationale,
          action: contraindication.alternatives.join(', '),
          ruleId: contraindication.rule
        });
      }
    }
    
    return flags;
  }
  
  /**
   * Evaluate contraindications list
   */
  private evaluateContraindications(inputs: TreatmentPlanInputs): string[] {
    const contraindications: string[] = [];
    
    if (inputs.personalHistoryBreastCancer) {
      contraindications.push('Personal history of breast cancer');
    }
    
    if (inputs.personalHistoryDVT) {
      contraindications.push('Personal history of venous thromboembolism');
    }
    
    if (inputs.unexplainedVaginalBleeding) {
      contraindications.push('Unexplained vaginal bleeding');
    }
    
    if (inputs.liverDisease) {
      contraindications.push('Active liver disease');
    }
    
    if (inputs.smoking && inputs.age > 35) {
      contraindications.push('Smoking over age 35 (relative contraindication)');
    }
    
    return contraindications;
  }
  
  /**
   * Evaluate and rank treatment recommendations
   */
  private evaluateRecommendations(inputs: TreatmentPlanInputs, contraindications: string[]): {
    primary: TreatmentRecommendation;
    alternatives: TreatmentRecommendation[];
  } {
    const recommendations: TreatmentRecommendation[] = [];
    
    // If absolute contraindications exist, recommend against HRT
    if (contraindications.some(c => c.includes('breast cancer') || c.includes('thromboembolism') || c.includes('bleeding') || c.includes('liver'))) {
      const noHRTRecommendation = this.createNoHRTRecommendation(inputs, contraindications);
      return {
        primary: noHRTRecommendation,
        alternatives: this.getNonHormonalAlternatives(inputs)
      };
    }
    
    // Evaluate primary recommendations
    for (const rule of this.rules.primaryRecommendations) {
      if (this.evaluateConditions(inputs, rule.conditions)) {
        const recommendation = this.createRecommendation(rule, inputs, 'primary');
        recommendations.push(recommendation);
      }
    }
    
    // Sort by score and select top recommendation
    recommendations.sort((a, b) => b.score - a.score);
    
    const primary = recommendations[0] || this.createDefaultRecommendation(inputs);
    const alternatives = this.getAlternativeRecommendations(inputs, primary);
    
    return { primary, alternatives };
  }
  
  /**
   * Create recommendation object from rule
   */
  private createRecommendation(rule: any, inputs: TreatmentPlanInputs, type: 'primary' | 'alternative'): TreatmentRecommendation {
    const score = this.calculateRecommendationScore(rule, inputs);
    
    return {
      id: rule.id,
      type,
      title: this.getRecommendationTitle(rule),
      recommendation: rule.recommendation,
      details: rule.details,
      rationale: rule.rationale,
      evidence: {
        guidelines: rule.guidelines,
        references: rule.references,
        strength: this.getEvidenceStrength(rule.severity)
      },
      safety: {
        level: rule.severity,
        color: this.getSafetyColor(rule.severity),
        contraindications: []
      },
      monitoring: rule.monitoring || 'Standard monitoring recommended',
      score,
      triggeredRules: [rule.rule]
    };
  }
  
  /**
   * Create no-HRT recommendation for contraindicated patients
   */
  private createNoHRTRecommendation(inputs: TreatmentPlanInputs, contraindications: string[]): TreatmentRecommendation {
    return {
      id: 'no_hrt_contraindicated',
      type: 'primary',
      title: 'HRT Not Recommended',
      recommendation: 'Do not start systemic hormone replacement therapy',
      rationale: `Contraindications present: ${contraindications.join(', ')}`,
      evidence: {
        guidelines: ['NICE', 'ACOG', 'EndocrineSociety'],
        references: ['NICE NG23 1.4', 'ACOG Committee Opinion 565'],
        strength: 'strong'
      },
      safety: {
        level: 'avoid',
        color: 'red',
        contraindications
      },
      monitoring: 'Focus on alternative treatments and symptom management',
      score: 100, // Highest priority when contraindicated
      triggeredRules: ['CONTRAINDICATION_DETECTED']
    };
  }
  
  /**
   * Get non-hormonal alternatives
   */
  private getNonHormonalAlternatives(inputs: TreatmentPlanInputs): TreatmentRecommendation[] {
    const alternatives: TreatmentRecommendation[] = [];
    
    // SSRI/SNRI for vasomotor symptoms
    if (inputs.vasomotorSymptoms !== 'none') {
      alternatives.push({
        id: 'ssri_snri_alternative',
        type: 'alternative',
        title: 'SSRIs/SNRIs',
        recommendation: 'Consider SSRI/SNRI for vasomotor symptoms',
        rationale: 'Effective for hot flashes when HRT contraindicated',
        evidence: {
          guidelines: ['NICE', 'ACOG'],
          references: ['NICE NG23 1.3.1'],
          strength: 'moderate'
        },
        safety: {
          level: 'consider',
          color: 'yellow',
          contraindications: []
        },
        monitoring: 'Monitor for side effects and efficacy at 4-6 weeks',
        score: 80,
        triggeredRules: ['ALT_SSRI']
      });
    }
    
    // Vaginal estrogen for genitourinary symptoms
    if (inputs.genitourinarySymptoms) {
      alternatives.push({
        id: 'vaginal_estrogen_alternative',
        type: 'alternative',
        title: 'Vaginal Estrogen',
        recommendation: 'Vaginal estrogen for genitourinary symptoms',
        rationale: 'Safe for local symptoms with minimal systemic absorption',
        evidence: {
          guidelines: ['NICE', 'ACOG'],
          references: ['NICE NG23 1.3.2'],
          strength: 'strong'
        },
        safety: {
          level: 'preferred',
          color: 'green',
          contraindications: []
        },
        monitoring: 'Annual review, no routine endometrial monitoring needed',
        score: 85,
        triggeredRules: ['ALT_VAGINAL']
      });
    }
    
    return alternatives;
  }
  
  /**
   * Get alternative recommendations for eligible patients
   */
  private getAlternativeRecommendations(inputs: TreatmentPlanInputs, primary: TreatmentRecommendation): TreatmentRecommendation[] {
    const alternatives: TreatmentRecommendation[] = [];
    
    // Add transdermal HRT as alternative if oral is primary
    if (primary.id === 'low_risk_severe_symptoms') {
      alternatives.push({
        id: 'transdermal_alternative',
        type: 'alternative',
        title: 'Transdermal HRT',
        recommendation: 'Transdermal estradiol with progestogen',
        rationale: 'Lower VTE risk compared to oral preparations',
        evidence: {
          guidelines: ['NICE', 'ACOG'],
          references: ['NICE NG23 1.2.3'],
          strength: 'moderate'
        },
        safety: {
          level: 'consider',
          color: 'yellow',
          contraindications: []
        },
        monitoring: 'Standard HRT monitoring',
        score: 75,
        triggeredRules: ['ALT_TRANSDERMAL']
      });
    }
    
    // Add non-hormonal alternatives
    alternatives.push(...this.getNonHormonalAlternatives(inputs));
    
    return alternatives.slice(0, 3); // Limit to top 3 alternatives
  }
  
  /**
   * Create default recommendation when no specific rules match
   */
  private createDefaultRecommendation(inputs: TreatmentPlanInputs): TreatmentRecommendation {
    return {
      id: 'individualized_assessment',
      type: 'primary',
      title: 'Individualized Assessment Required',
      recommendation: 'Individualized risk-benefit assessment recommended',
      rationale: 'Complex clinical picture requires individualized evaluation',
      evidence: {
        guidelines: ['NICE', 'ACOG'],
        references: ['Clinical judgment required'],
        strength: 'moderate'
      },
      safety: {
        level: 'consider',
        color: 'yellow',
        contraindications: []
      },
      monitoring: 'Specialist consultation may be beneficial',
      score: 50,
      triggeredRules: ['DEFAULT_RULE']
    };
  }
  
  /**
   * Generate monitoring plan based on recommendation
   */
  private generateMonitoringPlan(recommendation: TreatmentRecommendation): MonitoringPlan {
    const baselineAssessments = this.rules.monitoringProtocols.baseline_hrt.assessments;
    const earlyFollowup = this.rules.monitoringProtocols.early_followup.assessments;
    const ongoing = this.rules.monitoringProtocols.annual_review.assessments;
    
    return {
      baseline: baselineAssessments,
      earlyFollowup: earlyFollowup,
      ongoing: ongoing,
      timeline: recommendation.type === 'primary' && recommendation.safety.level === 'preferred' 
        ? '3 months, then annually'
        : '3 months, 6 months, then 6-monthly'
    };
  }
  
  /**
   * Generate patient counseling points
   */
  private generateCounseling(recommendation: TreatmentRecommendation): PatientCounseling {
    return {
      benefits: this.rules.patientCounseling.hrt_benefits,
      risks: this.rules.patientCounseling.hrt_risks,
      sharedDecisionPoints: this.rules.patientCounseling.shared_decision_points
    };
  }
  
  /**
   * Generate clinical summary
   */
  private generateClinicalSummary(inputs: TreatmentPlanInputs, recommendation: TreatmentRecommendation): string {
    const riskFactors = this.summarizeRiskFactors(inputs);
    const symptoms = this.summarizeSymptoms(inputs);
    
    return `${inputs.age}-year-old patient with ${symptoms}. Risk factors: ${riskFactors}. 
    Recommendation: ${recommendation.recommendation}. Rationale: ${recommendation.rationale}`;
  }
  
  /**
   * Generate chart documentation text
   */
  private generateChartDocumentation(inputs: TreatmentPlanInputs, recommendation: TreatmentRecommendation): string {
    return `Menopause assessment completed. Patient counseled regarding treatment options including benefits and risks of HRT. 
    ${recommendation.recommendation}. Risk-benefit ratio discussed. Patient understanding confirmed. Plan: ${recommendation.monitoring}`;
  }
  
  // Helper methods
  private generatePlanId(): string {
    return `TP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private generateKeyFlags(inputs: TreatmentPlanInputs, safetyFlags: SafetyFlag[]): string[] {
    const flags: string[] = [];
    
    if (inputs.ascvdResult && inputs.ascvdResult.tenYearRisk > 20) {
      flags.push('High ASCVD Risk');
    }
    
    if (inputs.personalHistoryBreastCancer) {
      flags.push('BC History');
    }
    
    if (inputs.personalHistoryDVT) {
      flags.push('VTE History');
    }
    
    if (inputs.smoking) {
      flags.push('Smoker');
    }
    
    if (safetyFlags.some(flag => flag.severity === 'absolute')) {
      flags.push('Absolute Contraindication');
    }
    
    return flags;
  }
  
  private evaluateCondition(inputs: any, field: string, value: any): boolean {
    const fieldValue = this.getNestedValue(inputs, field);
    return fieldValue === value;
  }
  
  private evaluateConditions(inputs: any, conditions: any[]): boolean {
    return conditions.every(condition => {
      const fieldValue = this.getNestedValue(inputs, condition.field);
      
      switch (condition.operator) {
        case '==':
          return fieldValue === condition.value;
        case '!=':
          return fieldValue !== condition.value;
        case '>':
          return fieldValue > condition.value;
        case '>=':
          return fieldValue >= condition.value;
        case '<':
          return fieldValue < condition.value;
        case '<=':
          return fieldValue <= condition.value;
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(fieldValue);
        default:
          return false;
      }
    });
  }
  
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
  
  private calculateRecommendationScore(rule: any, inputs: TreatmentPlanInputs): number {
    let score = 50; // Base score
    
    // Adjust based on severity
    switch (rule.severity) {
      case 'preferred':
        score += 30;
        break;
      case 'consider':
        score += 10;
        break;
      case 'alternative':
        score -= 10;
        break;
    }
    
    // Adjust based on symptom severity
    if (inputs.vasomotorSymptoms === 'severe') {
      score += 20;
    } else if (inputs.vasomotorSymptoms === 'moderate') {
      score += 10;
    }
    
    // Adjust based on patient preference
    if (inputs.patientPreference === 'hormonal' && rule.recommendation.includes('HRT')) {
      score += 15;
    } else if (inputs.patientPreference === 'non_hormonal' && !rule.recommendation.includes('HRT')) {
      score += 15;
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  private getRecommendationTitle(rule: any): string {
    return rule.title || rule.recommendation.split(' ')[0] + ' Treatment';
  }
  
  private getEvidenceStrength(severity: string): 'strong' | 'moderate' | 'weak' {
    switch (severity) {
      case 'preferred':
        return 'strong';
      case 'consider':
        return 'moderate';
      default:
        return 'weak';
    }
  }
  
  private getSafetyColor(level: string): 'green' | 'yellow' | 'orange' | 'red' {
    switch (level) {
      case 'preferred':
        return 'green';
      case 'consider':
        return 'yellow';
      case 'caution':
        return 'orange';
      case 'avoid':
        return 'red';
      default:
        return 'yellow';
    }
  }
  
  private summarizeRiskFactors(inputs: TreatmentPlanInputs): string {
    const factors: string[] = [];
    
    if (inputs.ascvdResult && inputs.ascvdResult.tenYearRisk > 10) {
      factors.push(`ASCVD ${inputs.ascvdResult.tenYearRisk}%`);
    }
    
    if (inputs.personalHistoryBreastCancer) {
      factors.push('personal BC history');
    }
    
    if (inputs.personalHistoryDVT) {
      factors.push('VTE history');
    }
    
    if (inputs.smoking) {
      factors.push('smoking');
    }
    
    return factors.length > 0 ? factors.join(', ') : 'low risk profile';
  }
  
  private summarizeSymptoms(inputs: TreatmentPlanInputs): string {
    const symptoms: string[] = [];
    
    if (inputs.vasomotorSymptoms !== 'none') {
      symptoms.push(`${inputs.vasomotorSymptoms} vasomotor symptoms`);
    }
    
    if (inputs.genitourinarySymptoms) {
      symptoms.push('genitourinary symptoms');
    }
    
    if (inputs.sleepDisturbance) {
      symptoms.push('sleep disturbance');
    }
    
    if (inputs.moodSymptoms) {
      symptoms.push('mood symptoms');
    }
    
    return symptoms.length > 0 ? symptoms.join(', ') : 'menopausal symptoms';
  }
}

// Export singleton instance
export const treatmentPlanGenerator = new TreatmentPlanGenerator();
export default treatmentPlanGenerator;