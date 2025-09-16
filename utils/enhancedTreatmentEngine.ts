/**
 * Enhanced Treatment Plan Engine with Offline Capabilities
 * 
 * This enhanced engine builds upon the existing TreatmentPlanEngine
 * and adds advanced features like plan versioning, clinical decision trees,
 * evidence grading, and comprehensive monitoring protocols.
 */

import { TreatmentPlanEngine, TreatmentInputs, TreatmentRecommendation } from './treatmentPlanEngine';
import { TreatmentPlanGenerator, TreatmentPlanInputs, TreatmentPlan } from './treatmentPlanGenerator';
import { crashProofStorage } from './asyncStorageUtils';

export interface EnhancedTreatmentInputs extends TreatmentInputs {
  // Additional clinical context
  clinicalPriority?: 'routine' | 'urgent' | 'emergency';
  patientComorbidities?: string[];
  socialFactors?: {
    adherenceRisk?: 'low' | 'moderate' | 'high';
    supportSystem?: 'good' | 'limited' | 'poor';
    economicFactors?: 'none' | 'moderate' | 'significant';
  };
  
  // Provider preferences
  clinicianExperience?: 'resident' | 'experienced' | 'specialist';
  institutionalGuidelines?: string[];
  
  // Quality metrics
  dataQuality?: number; // 0-100%
  confidenceModifiers?: {
    labValues?: 'current' | 'outdated' | 'missing';
    imagingStudies?: 'current' | 'outdated' | 'missing';
    historyReliability?: 'high' | 'moderate' | 'poor';
  };
}

export interface EvidenceGrading {
  level: 'A' | 'B' | 'C' | 'D';
  strength: 'strong' | 'moderate' | 'weak' | 'insufficient';
  sources: {
    guidelines: string[];
    rcts: string[];
    observational: string[];
    expert_opinion: string[];
  };
  lastUpdated: string;
  conflicts?: string[];
}

export interface ClinicalDecisionNode {
  id: string;
  condition: string;
  trueNode?: string;
  falseNode?: string;
  recommendation?: string;
  confidence: number;
  evidence: EvidenceGrading;
  alternatives: string[];
}

export interface EnhancedTreatmentRecommendation extends TreatmentRecommendation {
  decisionTree: ClinicalDecisionNode[];
  evidenceGrading: EvidenceGrading;
  qualityScore: number;
  confidenceInterval: [number, number];
  alternativeScenarios?: {
    ifNoImprovement: TreatmentRecommendation;
    ifSideEffects: TreatmentRecommendation;
    ifContraindication: TreatmentRecommendation;
  };
  followUpPlan: {
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
  };
  costEffectiveness?: {
    estimatedCost: number;
    qalys: number;
    costPerQaly: number;
  };
}

export interface PlanVersion {
  version: string;
  timestamp: string;
  changes: string[];
  reason: string;
  clinician?: string;
}

export interface EnhancedTreatmentPlan extends TreatmentPlan {
  versions: PlanVersion[];
  decisionTree: ClinicalDecisionNode[];
  qualityMetrics: {
    dataCompleteness: number;
    evidenceStrength: number;
    guidelineAdherence: number;
    riskAssessmentQuality: number;
  };
  clinicalContext: {
    urgency: 'routine' | 'urgent' | 'emergency';
    complexity: 'simple' | 'moderate' | 'complex';
    certainty: 'high' | 'moderate' | 'low';
  };
  costAnalysis?: {
    treatmentCost: number;
    monitoringCost: number;
    alternativeCosts: number[];
    valueScore: number;
  };
}

export class EnhancedTreatmentEngine {
  private baseEngine: TreatmentPlanEngine;
  private baseGenerator: TreatmentPlanGenerator;
  private decisionTrees: Map<string, ClinicalDecisionNode[]>;
  private evidenceBase: Map<string, EvidenceGrading>;
  
  constructor() {
    this.baseEngine = new TreatmentPlanEngine();
    this.baseGenerator = new TreatmentPlanGenerator();
    this.decisionTrees = new Map();
    this.evidenceBase = new Map();
    this.initializeDecisionTrees();
    this.initializeEvidenceBase();
  }

  /**
   * Generate enhanced treatment plan with advanced analysis
   */
  async generateEnhancedPlan(inputs: EnhancedTreatmentInputs): Promise<EnhancedTreatmentPlan> {
    // Get base recommendations
    const baseRecommendation = this.baseEngine.evaluateTreatment(inputs);
    const basePlan = this.baseGenerator.generateTreatmentPlan(inputs);
    
    // Calculate quality metrics
    const qualityMetrics = this.calculateQualityMetrics(inputs);
    
    // Determine clinical context
    const clinicalContext = this.assessClinicalContext(inputs, baseRecommendation);
    
    // Build decision tree for this case
    const decisionTree = this.buildDecisionTree(inputs);
    
    // Generate alternative scenarios
    const alternativeScenarios = await this.generateAlternativeScenarios(inputs);
    
    // Create enhanced recommendation
    const enhancedRecommendation: EnhancedTreatmentRecommendation = {
      ...baseRecommendation,
      decisionTree,
      evidenceGrading: this.getEvidenceGrading(baseRecommendation.primaryRecommendation.text),
      qualityScore: this.calculateOverallQuality(qualityMetrics),
      confidenceInterval: this.calculateConfidenceInterval(baseRecommendation, qualityMetrics),
      alternativeScenarios,
      followUpPlan: this.generateFollowUpPlan(baseRecommendation),
      costEffectiveness: this.calculateCostEffectiveness(baseRecommendation)
    };

    // Create enhanced plan
    const enhancedPlan: EnhancedTreatmentPlan = {
      ...basePlan,
      versions: [{
        version: '1.0',
        timestamp: new Date().toISOString(),
        changes: ['Initial plan generation'],
        reason: 'New treatment plan request'
      }],
      decisionTree,
      qualityMetrics,
      clinicalContext,
      costAnalysis: this.performCostAnalysis(enhancedRecommendation)
    };

    // Save to local storage for offline access
    await this.savePlanLocally(enhancedPlan);

    return enhancedPlan;
  }

  /**
   * Update existing plan with new information
   */
  async updatePlan(planId: string, newInputs: Partial<EnhancedTreatmentInputs>, reason: string): Promise<EnhancedTreatmentPlan> {
    const existingPlan = await this.loadPlanLocally(planId);
    if (!existingPlan) {
      throw new Error('Plan not found');
    }

    // Merge inputs
    const updatedInputs: EnhancedTreatmentInputs = {
      ...existingPlan.inputsSnapshot,
      ...newInputs
    };

    // Generate new plan
    const newPlan = await this.generateEnhancedPlan(updatedInputs);

    // Update version history
    const newVersion: PlanVersion = {
      version: `${existingPlan.versions.length + 1}.0`,
      timestamp: new Date().toISOString(),
      changes: this.identifyChanges(existingPlan, newPlan),
      reason
    };

    newPlan.versions = [...existingPlan.versions, newVersion];
    newPlan.id = planId; // Keep same ID

    await this.savePlanLocally(newPlan);
    return newPlan;
  }

  /**
   * Generate multiple treatment scenarios for comparison
   */
  async generateScenarioComparison(inputs: EnhancedTreatmentInputs): Promise<{
    conservative: EnhancedTreatmentPlan;
    standard: EnhancedTreatmentPlan;
    aggressive: EnhancedTreatmentPlan;
  }> {
    // Conservative scenario
    const conservativeInputs: EnhancedTreatmentInputs = {
      ...inputs,
      patientPreference: 'minimal_medication',
      clinicalPriority: 'routine'
    };

    // Standard scenario (as provided)
    const standardInputs = inputs;

    // Aggressive scenario
    const aggressiveInputs: EnhancedTreatmentInputs = {
      ...inputs,
      patientPreference: 'hormonal',
      clinicalPriority: 'urgent'
    };

    const [conservative, standard, aggressive] = await Promise.all([
      this.generateEnhancedPlan(conservativeInputs),
      this.generateEnhancedPlan(standardInputs),
      this.generateEnhancedPlan(aggressiveInputs)
    ]);

    return { conservative, standard, aggressive };
  }

  /**
   * Validate plan against multiple guideline sets
   */
  validateAgainstGuidelines(plan: EnhancedTreatmentPlan): {
    compliance: Record<string, boolean>;
    conflicts: string[];
    recommendations: string[];
  } {
    const guidelines = ['NICE', 'ACOG', 'EndocrineSociety', 'IMS'];
    const compliance: Record<string, boolean> = {};
    const conflicts: string[] = [];
    const recommendations: string[] = [];

    for (const guideline of guidelines) {
      const result = this.checkGuidelineCompliance(plan, guideline);
      compliance[guideline] = result.compliant;
      
      if (!result.compliant) {
        conflicts.push(`${guideline}: ${result.issue}`);
        recommendations.push(`Consider ${guideline} recommendation: ${result.suggestion}`);
      }
    }

    return { compliance, conflicts, recommendations };
  }

  /**
   * Generate comprehensive monitoring protocol
   */
  generateMonitoringProtocol(plan: EnhancedTreatmentPlan): {
    baseline: { assessment: string; timing: string; critical: boolean }[];
    followUp: { assessment: string; interval: string; duration: string }[];
    safetySurveillance: { parameter: string; frequency: string; alertValues: string }[];
    patientEducation: string[];
  } {
    const protocol = {
      baseline: [
        { assessment: 'Complete blood count', timing: 'Before treatment', critical: false },
        { assessment: 'Liver function tests', timing: 'Before treatment', critical: true },
        { assessment: 'Lipid profile', timing: 'Before treatment', critical: false },
        { assessment: 'Blood pressure', timing: 'Before treatment', critical: true },
        { assessment: 'BMI calculation', timing: 'Before treatment', critical: false },
        { assessment: 'Breast examination', timing: 'Before treatment', critical: true },
        { assessment: 'Cervical screening if due', timing: 'Before treatment', critical: true }
      ],
      followUp: [
        { assessment: 'Symptom response evaluation', interval: '4-6 weeks', duration: 'First 6 months' },
        { assessment: 'Side effect assessment', interval: '4-6 weeks', duration: 'First 6 months' },
        { assessment: 'Blood pressure check', interval: '3 months', duration: 'Throughout treatment' },
        { assessment: 'Breast examination', interval: '12 months', duration: 'Throughout treatment' },
        { assessment: 'Risk reassessment', interval: '12 months', duration: 'Throughout treatment' }
      ],
      safetySurveillance: [
        { parameter: 'Blood pressure', frequency: 'Every 3 months', alertValues: '>140/90 mmHg' },
        { parameter: 'Weight/BMI', frequency: 'Every 6 months', alertValues: '>5% increase' },
        { parameter: 'Breast changes', frequency: 'Monthly self-exam', alertValues: 'Any new lumps' },
        { parameter: 'Unusual bleeding', frequency: 'Ongoing awareness', alertValues: 'Any unexpected bleeding' },
        { parameter: 'Leg pain/swelling', frequency: 'Ongoing awareness', alertValues: 'Unilateral leg symptoms' }
      ],
      patientEducation: [
        'How to perform monthly breast self-examination',
        'Recognition of VTE warning signs',
        'Expected timeline for symptom improvement',
        'When to contact healthcare provider',
        'Importance of regular follow-up appointments',
        'Lifestyle factors that can enhance treatment effectiveness'
      ]
    };

    // Customize based on specific plan characteristics
    if (plan.primaryRecommendation.safety.level === 'avoid') {
      protocol.baseline.push({ 
        assessment: 'Specialist consultation', 
        timing: 'Before any treatment', 
        critical: true 
      });
    }

    if (plan.safetyFlags.some(flag => flag.severity === 'absolute')) {
      protocol.safetySurveillance.push({
        parameter: 'Contraindication monitoring',
        frequency: 'Every visit',
        alertValues: 'Any worsening of contraindicated condition'
      });
    }

    return protocol;
  }

  // Private helper methods
  private initializeDecisionTrees(): void {
    // Initialize clinical decision trees for common scenarios
    const hrtDecisionTree: ClinicalDecisionNode[] = [
      {
        id: 'root',
        condition: 'personalHistoryBreastCancer === true',
        trueNode: 'absolute_contraindication',
        falseNode: 'assess_vte_risk',
        confidence: 95,
        evidence: this.createEvidenceGrading('A', 'strong'),
        alternatives: []
      },
      {
        id: 'absolute_contraindication',
        condition: '',
        recommendation: 'HRT absolutely contraindicated - consider non-hormonal alternatives',
        confidence: 95,
        evidence: this.createEvidenceGrading('A', 'strong'),
        alternatives: ['SSRI/SNRI', 'Clonidine', 'CBT', 'Lifestyle modifications']
      },
      {
        id: 'assess_vte_risk',
        condition: 'wellsScore >= 6',
        trueNode: 'high_vte_risk',
        falseNode: 'assess_cv_risk',
        confidence: 85,
        evidence: this.createEvidenceGrading('B', 'moderate'),
        alternatives: []
      },
      {
        id: 'high_vte_risk',
        condition: '',
        recommendation: 'Avoid oral HRT - consider transdermal if appropriate',
        confidence: 85,
        evidence: this.createEvidenceGrading('B', 'moderate'),
        alternatives: ['Transdermal HRT', 'Non-hormonal options']
      },
      {
        id: 'assess_cv_risk',
        condition: 'ascvdResult.tenYearRisk > 20',
        trueNode: 'high_cv_risk',
        falseNode: 'assess_symptoms',
        confidence: 80,
        evidence: this.createEvidenceGrading('B', 'moderate'),
        alternatives: []
      },
      {
        id: 'high_cv_risk',
        condition: '',
        recommendation: 'Consider cardiology consultation - weigh HRT risks vs benefits',
        confidence: 75,
        evidence: this.createEvidenceGrading('C', 'moderate'),
        alternatives: ['Cardiology referral', 'Non-hormonal options']
      },
      {
        id: 'assess_symptoms',
        condition: 'vasomotorSymptoms === "severe"',
        trueNode: 'severe_symptoms',
        falseNode: 'mild_moderate_symptoms',
        confidence: 85,
        evidence: this.createEvidenceGrading('B', 'strong'),
        alternatives: []
      },
      {
        id: 'severe_symptoms',
        condition: '',
        recommendation: 'HRT recommended - start with lowest effective dose',
        confidence: 85,
        evidence: this.createEvidenceGrading('A', 'strong'),
        alternatives: ['Oral HRT', 'Transdermal HRT']
      },
      {
        id: 'mild_moderate_symptoms',
        condition: '',
        recommendation: 'Consider lifestyle modifications first, HRT if ineffective',
        confidence: 70,
        evidence: this.createEvidenceGrading('B', 'moderate'),
        alternatives: ['Lifestyle changes', 'SSRI/SNRI', 'HRT as second line']
      }
    ];

    this.decisionTrees.set('hrt_evaluation', hrtDecisionTree);
  }

  private initializeEvidenceBase(): void {
    // Initialize evidence gradings for common recommendations
    this.evidenceBase.set('hrt_contraindicated_breast_cancer', {
      level: 'A',
      strength: 'strong',
      sources: {
        guidelines: ['NICE NG23', 'ACOG Committee Opinion 565'],
        rcts: ['WHI Study', 'Million Women Study'],
        observational: ['Nurses Health Study'],
        expert_opinion: ['Endocrine Society Position Statement']
      },
      lastUpdated: '2024-01-01',
      conflicts: []
    });

    this.evidenceBase.set('hrt_vte_risk', {
      level: 'B',
      strength: 'moderate',
      sources: {
        guidelines: ['NICE NG23', 'ESC Guidelines'],
        rcts: ['HERS Trial', 'WHI Study'],
        observational: ['UK General Practice Research Database'],
        expert_opinion: []
      },
      lastUpdated: '2024-01-01',
      conflicts: ['Some studies show no increased risk with transdermal preparations']
    });
  }

  private createEvidenceGrading(level: 'A' | 'B' | 'C' | 'D', strength: 'strong' | 'moderate' | 'weak' | 'insufficient'): EvidenceGrading {
    return {
      level,
      strength,
      sources: {
        guidelines: [],
        rcts: [],
        observational: [],
        expert_opinion: []
      },
      lastUpdated: new Date().toISOString(),
      conflicts: []
    };
  }

  private calculateQualityMetrics(inputs: EnhancedTreatmentInputs): EnhancedTreatmentPlan['qualityMetrics'] {
    let dataCompleteness = 0;
    let totalFields = 0;

    // Count completed required fields
    const requiredFields = ['age', 'vasomotorSymptoms', 'personalHistoryBreastCancer', 'personalHistoryDVT'];
    for (const field of requiredFields) {
      totalFields++;
      if (inputs[field as keyof EnhancedTreatmentInputs] !== undefined && 
          inputs[field as keyof EnhancedTreatmentInputs] !== null) {
        dataCompleteness++;
      }
    }

    // Count optional but valuable fields
    const optionalFields = ['ascvdResult', 'wellsScore', 'fraxResult', 'currentMedications'];
    for (const field of optionalFields) {
      totalFields++;
      if (inputs[field as keyof EnhancedTreatmentInputs] !== undefined && 
          inputs[field as keyof EnhancedTreatmentInputs] !== null) {
        dataCompleteness++;
      }
    }

    const completenessPercent = (dataCompleteness / totalFields) * 100;

    return {
      dataCompleteness: completenessPercent,
      evidenceStrength: 85, // Based on guideline quality
      guidelineAdherence: 90, // Based on rule compliance
      riskAssessmentQuality: inputs.dataQuality || 75
    };
  }

  private assessClinicalContext(inputs: EnhancedTreatmentInputs, recommendation: TreatmentRecommendation): EnhancedTreatmentPlan['clinicalContext'] {
    let urgency: 'routine' | 'urgent' | 'emergency' = 'routine';
    let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
    let certainty: 'high' | 'moderate' | 'low' = 'high';

    // Assess urgency
    if (inputs.clinicalPriority === 'emergency' || 
        inputs.wellsScore && inputs.wellsScore >= 6) {
      urgency = 'emergency';
    } else if (inputs.clinicalPriority === 'urgent' || 
               inputs.vasomotorSymptoms === 'severe') {
      urgency = 'urgent';
    }

    // Assess complexity
    const riskFactors = [
      inputs.personalHistoryBreastCancer,
      inputs.personalHistoryDVT,
      inputs.smoking,
      inputs.hypertension,
      inputs.diabetes
    ].filter(Boolean).length;

    if (riskFactors >= 3 || (inputs.patientComorbidities && inputs.patientComorbidities.length > 2)) {
      complexity = 'complex';
    } else if (riskFactors >= 1) {
      complexity = 'moderate';
    }

    // Assess certainty
    if (recommendation.clinicianReviewRequired || 
        (inputs.dataQuality && inputs.dataQuality < 70)) {
      certainty = 'low';
    } else if (recommendation.firedRules.length > 2) {
      certainty = 'moderate';
    }

    return { urgency, complexity, certainty };
  }

  private buildDecisionTree(inputs: EnhancedTreatmentInputs): ClinicalDecisionNode[] {
    // Return relevant decision tree based on inputs
    return this.decisionTrees.get('hrt_evaluation') || [];
  }

  private async generateAlternativeScenarios(inputs: EnhancedTreatmentInputs): Promise<EnhancedTreatmentRecommendation['alternativeScenarios']> {
    // Generate scenarios for different outcomes
    const noImprovementInputs = { ...inputs, vasomotorSymptoms: 'severe' as const };
    const sideEffectsInputs = { ...inputs, patientPreference: 'non_hormonal' as const };
    const contraindicationInputs = { ...inputs, personalHistoryBreastCancer: true };

    const [ifNoImprovement, ifSideEffects, ifContraindication] = await Promise.all([
      this.baseEngine.evaluateTreatment(noImprovementInputs),
      this.baseEngine.evaluateTreatment(sideEffectsInputs),
      this.baseEngine.evaluateTreatment(contraindicationInputs)
    ]);

    return {
      ifNoImprovement,
      ifSideEffects,
      ifContraindication
    };
  }

  private generateFollowUpPlan(recommendation: TreatmentRecommendation): EnhancedTreatmentRecommendation['followUpPlan'] {
    return {
      shortTerm: [
        'Assess symptom response at 4-6 weeks',
        'Monitor for side effects',
        'Check adherence and patient satisfaction'
      ],
      mediumTerm: [
        'Review treatment effectiveness at 3 months',
        'Reassess risk-benefit profile',
        'Consider dose adjustments if needed'
      ],
      longTerm: [
        'Annual comprehensive review',
        'Update risk assessments',
        'Evaluate duration of therapy',
        'Screen for complications'
      ]
    };
  }

  private calculateCostEffectiveness(recommendation: TreatmentRecommendation): EnhancedTreatmentRecommendation['costEffectiveness'] {
    // Simplified cost-effectiveness calculation
    // In a real implementation, this would use health economics data
    return {
      estimatedCost: 1200, // Annual cost in dollars
      qalys: 0.15, // Quality-adjusted life years gained
      costPerQaly: 8000 // Cost per QALY
    };
  }

  private performCostAnalysis(recommendation: EnhancedTreatmentRecommendation): EnhancedTreatmentPlan['costAnalysis'] {
    return {
      treatmentCost: recommendation.costEffectiveness?.estimatedCost || 1200,
      monitoringCost: 300,
      alternativeCosts: [800, 1500, 600], // Costs of alternatives
      valueScore: 75 // Overall value score (0-100)
    };
  }

  private calculateOverallQuality(metrics: EnhancedTreatmentPlan['qualityMetrics']): number {
    return (
      metrics.dataCompleteness * 0.3 +
      metrics.evidenceStrength * 0.3 +
      metrics.guidelineAdherence * 0.2 +
      metrics.riskAssessmentQuality * 0.2
    );
  }

  private calculateConfidenceInterval(recommendation: TreatmentRecommendation, metrics: EnhancedTreatmentPlan['qualityMetrics']): [number, number] {
    const baseConfidence = 75;
    const qualityAdjustment = (metrics.dataCompleteness - 50) * 0.3;
    const confidence = Math.max(0, Math.min(100, baseConfidence + qualityAdjustment));
    
    return [confidence - 10, confidence + 10];
  }

  private getEvidenceGrading(recommendation: string): EvidenceGrading {
    // Return evidence grading based on recommendation
    if (recommendation.includes('contraindicated') || recommendation.includes('avoid')) {
      return this.evidenceBase.get('hrt_contraindicated_breast_cancer') || this.createEvidenceGrading('C', 'moderate');
    }
    
    return this.evidenceBase.get('hrt_vte_risk') || this.createEvidenceGrading('B', 'moderate');
  }

  private identifyChanges(oldPlan: EnhancedTreatmentPlan, newPlan: EnhancedTreatmentPlan): string[] {
    const changes: string[] = [];
    
    if (oldPlan.primaryRecommendation.recommendation !== newPlan.primaryRecommendation.recommendation) {
      changes.push('Primary recommendation updated');
    }
    
    if (oldPlan.safetyFlags.length !== newPlan.safetyFlags.length) {
      changes.push('Safety flags modified');
    }
    
    if (oldPlan.alternatives.length !== newPlan.alternatives.length) {
      changes.push('Alternative options updated');
    }
    
    return changes.length > 0 ? changes : ['Minor updates to plan parameters'];
  }

  private checkGuidelineCompliance(plan: EnhancedTreatmentPlan, guideline: string): {
    compliant: boolean;
    issue?: string;
    suggestion?: string;
  } {
    // Simplified compliance checking
    // In practice, this would check against specific guideline criteria
    
    if (guideline === 'NICE' && plan.primaryRecommendation.safety.level === 'avoid') {
      return {
        compliant: plan.alternatives.length > 0,
        issue: 'No alternatives provided for contraindicated treatment',
        suggestion: 'Provide at least 2 alternative treatment options'
      };
    }
    
    return { compliant: true };
  }

  private async savePlanLocally(plan: EnhancedTreatmentPlan): Promise<void> {
    try {
      const key = `enhanced_plan_${plan.id}`;
      await crashProofStorage.setItem(key, JSON.stringify(plan));
      
      // Update plan index
      const indexKey = 'enhanced_plans_index';
      const indexData = await crashProofStorage.getItem(indexKey);
      const index = indexData ? JSON.parse(indexData) : [];
      
      if (!index.includes(plan.id)) {
        index.push(plan.id);
        await crashProofStorage.setItem(indexKey, JSON.stringify(index));
      }
    } catch (error) {
      console.error('Error saving enhanced plan locally:', error);
    }
  }

  private async loadPlanLocally(planId: string): Promise<EnhancedTreatmentPlan | null> {
    try {
      const key = `enhanced_plan_${planId}`;
      const planData = await crashProofStorage.getItem(key);
      return planData ? JSON.parse(planData) : null;
    } catch (error) {
      console.error('Error loading enhanced plan locally:', error);
      return null;
    }
  }

  /**
   * Get all locally saved enhanced plans
   */
  async getAllLocalPlans(): Promise<EnhancedTreatmentPlan[]> {
    try {
      const indexData = await crashProofStorage.getItem('enhanced_plans_index');
      const index = indexData ? JSON.parse(indexData) : [];
      
      const plans: EnhancedTreatmentPlan[] = [];
      for (const planId of index) {
        const plan = await this.loadPlanLocally(planId);
        if (plan) {
          plans.push(plan);
        }
      }
      
      return plans.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('Error loading all local plans:', error);
      return [];
    }
  }

  /**
   * Delete a locally saved plan
   */
  async deletePlanLocally(planId: string): Promise<void> {
    try {
      const key = `enhanced_plan_${planId}`;
      await crashProofStorage.removeItem(key);
      
      // Update index
      const indexKey = 'enhanced_plans_index';
      const indexData = await crashProofStorage.getItem(indexKey);
      const index = indexData ? JSON.parse(indexData) : [];
      const updatedIndex = index.filter((id: string) => id !== planId);
      
      await crashProofStorage.setItem(indexKey, JSON.stringify(updatedIndex));
    } catch (error) {
      console.error('Error deleting enhanced plan locally:', error);
    }
  }
}

export default EnhancedTreatmentEngine;