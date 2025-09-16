import crashProofStorage from './asyncStorageUtils';
import KnowledgeManager, { ClinicalRule, GuidelineSource } from './knowledgeManager';

// Use crypto.getRandomValues for UUID generation to avoid external dependencies
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    array[6] = (array[6] & 0x0f) | 0x40; // version 4
    array[8] = (array[8] & 0x3f) | 0x80; // variant 10
    
    const hex = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    return [
      hex.substring(0, 8),
      hex.substring(8, 12),
      hex.substring(12, 16),
      hex.substring(16, 20),
      hex.substring(20, 32)
    ].join('-');
  }
  
  // Fallback for environments without crypto.getRandomValues
  return 'xxxx-xxxx-4xxx-yxxx-xxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export interface PatientAssessment {
  // Demographics
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  BMI?: number;
  
  // Symptoms with numeric severity (0-10, preserve Number type)
  symptoms?: {
    severity?: number;
    vasomotorSymptoms?: number;
    sleepDisturbances?: number;
    moodChanges?: number;
    vaginalDryness?: number;
  };
  
  // Medical history
  history?: {
    VTE?: boolean;
    breastCancer_active?: boolean;
    breastCancer_history?: boolean;
    cardiovascular?: boolean;
    diabetes?: boolean;
    hypertension?: boolean;
    osteoporosis?: boolean;
    surgeries?: string[];
  };
  
  // Current medications and allergies
  currentMedications?: string[];
  allergies?: string[];
  medicineType?: string;
  
  // Lab values
  labs?: {
    cholesterol?: number;
    hdl?: number;
    ldl?: number;
    triglycerides?: number;
    glucose?: number;
    hba1c?: number;
    creatinine?: number;
    eGFR?: number;
  };
  
  // Risk scores
  riskScores?: {
    ASCVD?: number;
    Framingham?: number;
    FRAX?: number;
    GailTyrer?: number;
    Wells?: number;
  };
  
  // Settings and preferences
  preferences?: {
    contraindication_sensitivity?: 'conservative' | 'moderate' | 'aggressive';
    locale?: string;
  };
}

export interface TreatmentRecommendation {
  type: 'Lifestyle' | 'NonPharm' | 'Pharm' | 'Urgent' | 'Refer';
  priority: number;
  text: string;
  rationale: string;
  evidence: GuidelineSource[];
  contraindications?: string[];
  confidenceScore: number;
  interactions?: string[];
  requiresMoreData?: boolean;
}

export interface TreatmentPlan {
  planId: string;
  timestamp: string;
  inputSnapshot: PatientAssessment;
  recommendations: TreatmentRecommendation[];
  summary: string;
  flags: {
    urgent: boolean;
    contraindicated: string[];
    missingData: string[];
  };
  generalPlan: string[];
  specificOptions: TreatmentRecommendation[];
  auditTrail: {
    rulesMatched: string[];
    evidenceUsed: GuidelineSource[];
    evaluationTime: number;
    knowledgeVersion: string;
  };
}

export interface ValidationResult {
  isValid: boolean;
  missingRequired: string[];
  canProceedWithCaveats: boolean;
  warnings: string[];
}

class OfflineRuleEngine {
  private knowledgeManager: KnowledgeManager;

  constructor() {
    this.knowledgeManager = KnowledgeManager.getInstance();
  }

  /**
   * Initialize the rule engine
   */
  public async initialize(): Promise<void> {
    await this.knowledgeManager.initialize();
    console.log('🔧 Offline Rule Engine initialized');
  }

  /**
   * Validate patient assessment data
   */
  public validateAssessment(assessment: PatientAssessment): ValidationResult {
    const required = ['age', 'gender'];
    const recommended = ['symptoms.severity', 'history.VTE', 'history.breastCancer_active', 'currentMedications'];
    
    const missing: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    for (const field of required) {
      const value = this.getNestedValue(assessment, field);
      if (value === undefined || value === null || value === '') {
        missing.push(field);
      }
    }

    // Check recommended fields
    for (const field of recommended) {
      const value = this.getNestedValue(assessment, field);
      if (value === undefined || value === null) {
        warnings.push(`Missing recommended field: ${field}`);
      }
    }

    // Validate numeric inputs are preserved as numbers
    const numericFields = [
      'age', 'symptoms.severity', 'symptoms.vasomotorSymptoms', 
      'symptoms.sleepDisturbances', 'riskScores.ASCVD', 'riskScores.FRAX'
    ];

    for (const field of numericFields) {
      const value = this.getNestedValue(assessment, field);
      if (value !== undefined && value !== null && typeof value !== 'number') {
        warnings.push(`Field ${field} should be numeric, got ${typeof value}`);
      }
    }

    return {
      isValid: missing.length === 0,
      missingRequired: missing,
      canProceedWithCaveats: missing.length <= 1, // Allow some flexibility
      warnings
    };
  }

  /**
   * Generate comprehensive treatment plan
   */
  public async generateTreatmentPlan(assessment: PatientAssessment): Promise<TreatmentPlan> {
    const startTime = Date.now();
    console.log('🎯 Generating treatment plan...');

    // Validate input
    const validation = this.validateAssessment(assessment);
    
    // Get knowledge pack
    const knowledgePack = this.knowledgeManager.getKnowledgePack();
    if (!knowledgePack) {
      throw new Error('Knowledge pack not available - please check internet connection and try again');
    }

    // Evaluate all applicable rules
    const candidateRecommendations: TreatmentRecommendation[] = [];
    const rulesMatched: string[] = [];
    const evidenceUsed: GuidelineSource[] = [];

    for (const rule of knowledgePack.rules) {
      if (this.evaluateRule(rule, assessment)) {
        const recommendation = this.createRecommendation(rule, assessment, validation);
        candidateRecommendations.push(recommendation);
        rulesMatched.push(rule.id);
        evidenceUsed.push(...rule.action.evidence);
      }
    }

    // Check for drug interactions
    const interactionRecommendations = this.checkDrugInteractions(assessment, knowledgePack);
    candidateRecommendations.push(...interactionRecommendations);

    // Sort recommendations by priority and confidence
    const sortedRecommendations = candidateRecommendations.sort((a, b) => {
      // First by type priority (Urgent > Refer > Pharm > NonPharm > Lifestyle)
      const typePriority = { Urgent: 1, Refer: 2, Pharm: 3, NonPharm: 4, Lifestyle: 5 };
      const typeDiff = typePriority[a.type] - typePriority[b.type];
      if (typeDiff !== 0) return typeDiff;
      
      // Then by priority number (lower = higher priority)
      const priorityDiff = a.priority - b.priority;
      if (priorityDiff !== 0) return priorityDiff;
      
      // Finally by confidence (higher = better)
      return b.confidenceScore - a.confidenceScore;
    });

    // Generate general plan (always 3 bullets)
    const generalPlan = this.generateGeneralPlan(assessment, sortedRecommendations);

    // Identify specific options (ranked)
    const specificOptions = sortedRecommendations.filter(r => 
      r.type === 'NonPharm' || r.type === 'Pharm'
    ).slice(0, 5); // Limit to top 5 specific options

    // Generate summary
    const summary = this.generateSummary(assessment, sortedRecommendations);

    // Extract flags
    const flags = {
      urgent: sortedRecommendations.some(r => r.type === 'Urgent'),
      contraindicated: sortedRecommendations
        .filter(r => r.contraindications)
        .flatMap(r => r.contraindications || []),
      missingData: validation.missingRequired
    };

    const evaluationTime = Date.now() - startTime;

    const plan: TreatmentPlan = {
      planId: generateUUID(),
      timestamp: new Date().toISOString(),
      inputSnapshot: JSON.parse(JSON.stringify(assessment)), // Deep copy
      recommendations: sortedRecommendations,
      summary,
      flags,
      generalPlan,
      specificOptions,
      auditTrail: {
        rulesMatched,
        evidenceUsed: this.deduplicateEvidence(evidenceUsed),
        evaluationTime,
        knowledgeVersion: knowledgePack.version
      }
    };

    console.log(`✅ Treatment plan generated in ${evaluationTime}ms`);
    return plan;
  }

  /**
   * Evaluate if a rule matches the assessment
   */
  private evaluateRule(rule: ClinicalRule, assessment: PatientAssessment): boolean {
    try {
      return this.knowledgeManager.validateCondition(rule.condition, assessment);
    } catch (error) {
      console.warn(`⚠️ Error evaluating rule ${rule.id}:`, error);
      return false;
    }
  }

  /**
   * Create recommendation from matched rule
   */
  private createRecommendation(
    rule: ClinicalRule, 
    assessment: PatientAssessment,
    validation: ValidationResult
  ): TreatmentRecommendation {
    const recommendation: TreatmentRecommendation = {
      type: rule.action.type,
      priority: rule.action.priority,
      text: rule.action.text,
      rationale: rule.action.rationale,
      evidence: rule.action.evidence,
      confidenceScore: rule.action.confidence,
      contraindications: rule.action.contraindications,
      interactions: rule.action.interactions
    };

    // Mark as requiring more data if validation failed
    if (!validation.isValid) {
      recommendation.requiresMoreData = true;
      recommendation.confidenceScore *= 0.7; // Reduce confidence for incomplete data
      recommendation.text = `${recommendation.text} (Requires complete assessment data for full evaluation)`;
    }

    return recommendation;
  }

  /**
   * Check for drug interactions
   */
  private checkDrugInteractions(
    assessment: PatientAssessment, 
    knowledgePack: any
  ): TreatmentRecommendation[] {
    const recommendations: TreatmentRecommendation[] = [];
    const currentMeds = assessment.currentMedications || [];
    const proposedMedicine = assessment.medicineType;

    if (currentMeds.length === 0 || !proposedMedicine) {
      return recommendations;
    }

    // Check interactions from knowledge pack
    for (const interaction of knowledgePack.interactions) {
      const hasCurrentMed = currentMeds.some(med => 
        med.toLowerCase().includes(interaction.drug1.toLowerCase()) ||
        interaction.drug1.toLowerCase().includes(med.toLowerCase())
      );
      
      const hasProposedMed = proposedMedicine.toLowerCase().includes(interaction.drug2.toLowerCase()) ||
        interaction.drug2.toLowerCase().includes(proposedMedicine.toLowerCase());

      if (hasCurrentMed && hasProposedMed) {
        recommendations.push({
          type: interaction.severity === 'major' ? 'Urgent' : 'Refer',
          priority: interaction.severity === 'major' ? 1 : 3,
          text: `${interaction.severity.toUpperCase()} drug interaction detected between ${interaction.drug1} and ${interaction.drug2} — discuss with clinician.`,
          rationale: interaction.description,
          evidence: [{
            title: 'Drug Interaction Database',
            url: 'https://reference.medscape.com/drug-interactionchecker',
            version: '2024',
            date: '2024-01-01',
            type: 'interaction'
          }],
          confidenceScore: interaction.severity === 'major' ? 0.95 : 0.80,
          interactions: [`${interaction.drug1}-${interaction.drug2}`]
        });
      }
    }

    return recommendations;
  }

  /**
   * Generate general plan (always 3 bullets)
   */
  private generateGeneralPlan(
    assessment: PatientAssessment, 
    recommendations: TreatmentRecommendation[]
  ): string[] {
    const generalPlan: string[] = [];

    // Always include lifestyle as first bullet
    generalPlan.push('Consider lifestyle modifications including regular exercise, balanced diet, and stress management techniques.');

    // Second bullet based on highest priority recommendation
    const topRecommendation = recommendations[0];
    if (topRecommendation) {
      if (topRecommendation.type === 'Urgent') {
        generalPlan.push('Urgent clinical evaluation required - contact healthcare provider immediately.');
      } else if (topRecommendation.type === 'Refer') {
        generalPlan.push('Specialist consultation recommended for comprehensive evaluation and treatment planning.');
      } else {
        generalPlan.push('Consider evidence-based treatment options appropriate for individual risk profile.');
      }
    } else {
      generalPlan.push('Regular monitoring and follow-up with healthcare provider for symptom assessment.');
    }

    // Third bullet - always monitoring/follow-up
    generalPlan.push('Schedule regular follow-up appointments to monitor treatment response and adjust plan as needed.');

    return generalPlan;
  }

  /**
   * Generate patient-friendly summary
   */
  private generateSummary(
    assessment: PatientAssessment, 
    recommendations: TreatmentRecommendation[]
  ): string {
    const age = assessment.age || 'unknown age';
    const urgentCount = recommendations.filter(r => r.type === 'Urgent').length;
    const totalRecommendations = recommendations.length;

    let summary = `Treatment plan generated for ${age}-year-old patient. `;

    if (urgentCount > 0) {
      summary += `⚠️ ${urgentCount} urgent recommendation(s) requiring immediate attention. `;
    }

    summary += `${totalRecommendations} evidence-based recommendations provided. `;
    summary += 'All recommendations are advisory and require healthcare provider discussion before implementation.';

    return summary;
  }

  /**
   * Deduplicate evidence sources
   */
  private deduplicateEvidence(evidence: GuidelineSource[]): GuidelineSource[] {
    const seen = new Set<string>();
    return evidence.filter(item => {
      const key = `${item.title}-${item.version}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Get nested property value
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Save treatment plan to local storage
   */
  public async saveTreatmentPlan(plan: TreatmentPlan): Promise<void> {
    try {
      const savedPlans = await this.getSavedPlans();
      savedPlans.push(plan);
      
      // Keep only last 50 plans
      const recentPlans = savedPlans.slice(-50);
      
      await this.knowledgeManager.initialize(); // Ensure storage is ready
      const plans = JSON.stringify(recentPlans);
      await crashProofStorage.setItem('offline_treatment_plans', plans);
      
      console.log(`💾 Treatment plan ${plan.planId} saved locally`);
    } catch (error) {
      console.error('❌ Error saving treatment plan:', error);
    }
  }

  /**
   * Get saved treatment plans from local storage
   */
  public async getSavedPlans(): Promise<TreatmentPlan[]> {
    try {
      const plans = await crashProofStorage.getItem('offline_treatment_plans');
      return plans ? JSON.parse(plans) : [];
    } catch (error) {
      console.error('❌ Error loading saved plans:', error);
      return [];
    }
  }

  /**
   * Get treatment plan by ID
   */
  public async getPlanById(planId: string): Promise<TreatmentPlan | null> {
    const plans = await this.getSavedPlans();
    return plans.find(plan => plan.planId === planId) || null;
  }

  /**
   * Get knowledge pack version info
   */
  public getKnowledgeVersion(): { version: string; lastUpdated: string; rulesCount: number } | null {
    return this.knowledgeManager.getVersionInfo();
  }
}

export default OfflineRuleEngine;