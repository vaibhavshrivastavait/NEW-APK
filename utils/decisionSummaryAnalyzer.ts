/**
 * Advanced Clinical Decision Summary Analyzer
 * Uses comprehensive rule-based engine for clinical decision support
 */

import { PatientAssessment } from '../store/assessmentStore';
import { 
  ClinicalRuleEngine, 
  loadRulesFromAssets, 
  createPatientContext,
  RuleEvaluationResult,
  ClinicalRule
} from './ruleEngine';
import { MedicineItem } from './enhancedDrugAnalyzer';

export interface DecisionSummary {
  patientId: string;
  timestamp: number;
  topRecommendation: {
    text: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    confidence: number;
    ruleId?: string;
  };
  recommendations: {
    category: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    text: string;
    rationale: string;
    evidence: string;
    actionRequired: boolean;
    expandable?: boolean;
    details?: string[];
    ruleId?: string;
    triggeredFields?: string[];
    source: string;
  }[];
  riskFactors: {
    factor: string;
    level: 'High' | 'Moderate' | 'Low';
    value: string;
    recommendation: string;
  }[];
  conflicts: {
    type: string;
    description: string;
    severity: 'Critical' | 'Major' | 'Minor';
    resolution: string;
    ruleIds?: string[];
  }[];
  summary: {
    patientProfile: string;
    keyFindings: string[];
    overallRisk: string;
    primaryActions: string[];
    rulesEvaluated: number;
    rulesTriggered: number;
  };
  sources: {
    local: boolean;
    online: boolean;
    guidelines: string[];
    ruleEngine: boolean;
  };
}

export interface DecisionSettings {
  onlineChecksEnabled: boolean;
  apiProvider: 'RxNorm' | 'OpenFDA' | 'DrugBank' | null;
}

class DecisionSummaryAnalyzer {
  private ruleEngine: ClinicalRuleEngine | null = null;
  private rules: ClinicalRule[] = [];

  constructor() {
    this.initializeRuleEngine();
  }

  /**
   * Initialize the rule engine with clinical rules
   */
  private async initializeRuleEngine(): Promise<void> {
    try {
      console.log('🔧 Initializing clinical decision rule engine...');
      this.rules = await loadRulesFromAssets();
      
      if (this.rules.length === 0) {
        console.warn('⚠️ No clinical rules loaded - using fallback rules');
        this.rules = this.getFallbackRules();
      }
      
      this.ruleEngine = new ClinicalRuleEngine(this.rules);
      console.log(`✅ Rule engine initialized with ${this.rules.length} rules`);
    } catch (error) {
      console.error('❌ Failed to initialize rule engine:', error);
      this.rules = this.getFallbackRules();
      this.ruleEngine = new ClinicalRuleEngine(this.rules);
    }
  }

  /**
   * Generate comprehensive decision summary using rule engine
   */
  async generateDecisionSummary(
    patient: PatientAssessment,
    selectedMedicines: MedicineItem[],
    settings: DecisionSettings = { onlineChecksEnabled: false, apiProvider: null }
  ): Promise<DecisionSummary> {
    const startTime = Date.now();
    
    console.log('🔍 Generating decision summary for patient:', patient.id);
    console.log('📋 Selected medicines:', selectedMedicines);
    
    // Ensure rule engine is initialized
    if (!this.ruleEngine) {
      await this.initializeRuleEngine();
    }

    try {
      // Create patient context for rule evaluation
      const patientContext = createPatientContext(patient, selectedMedicines, settings);
      
      // Evaluate all clinical rules
      const ruleResults = this.ruleEngine!.evaluateAllRules(patientContext);
      
      // Format results for clinical display
      const formattedResults = ClinicalRuleEngine.formatResultsForDisplay(ruleResults);
      
      // Generate recommendations from rule results
      const recommendations = this.convertRuleResultsToRecommendations(ruleResults);
      
      // Generate risk factors summary
      const riskFactors = this.generateRiskFactorsSummary(patient, selectedMedicines);
      
      // Detect conflicts between rules
      const conflicts = this.detectRuleConflicts(ruleResults);
      
      // Generate top recommendation
      const topRecommendation = this.generateTopRecommendation(recommendations, formattedResults);
      
      // Generate overall summary
      const summary = this.generateSummary(patient, selectedMedicines, ruleResults);
      
      const analysisTime = Date.now() - startTime;
      console.log(`✅ Decision summary generated in ${analysisTime}ms`);
      console.log(`📊 Results: ${ruleResults.filter(r => r.triggered).length}/${ruleResults.length} rules triggered`);

      return {
        patientId: patient.id,
        timestamp: Date.now(),
        topRecommendation,
        recommendations,
        riskFactors,
        conflicts,
        summary,
        sources: {
          local: true,
          online: settings.onlineChecksEnabled,
          guidelines: ['AHA/ACC Guidelines', 'ACOG Guidelines', 'NAMS Guidelines'],
          ruleEngine: true
        }
      };

    } catch (error) {
      console.error('❌ Error generating decision summary:', error);
      throw new Error(`Decision analysis failed: ${error.message}`);
    }
  }

  /**
   * Convert rule evaluation results to clinical recommendations
   */
  private convertRuleResultsToRecommendations(
    ruleResults: RuleEvaluationResult[]
  ): DecisionSummary['recommendations'] {
    const triggeredResults = ruleResults.filter(r => r.triggered);
    
    return triggeredResults.map(result => {
      const rule = result.rule;
      const priority = this.mapSeverityToPriority(rule.severity);
      
      return {
        category: this.getRuleCategory(rule.id),
        priority,
        text: rule.title,
        rationale: rule.message,
        evidence: this.generateEvidence(rule, result.triggeredFields),
        actionRequired: rule.severity === 'Critical' || rule.severity === 'Major',
        expandable: true,
        details: rule.action.split(';').map(action => action.trim()),
        ruleId: rule.id,
        triggeredFields: result.triggeredFields,
        source: rule.source
      };
    });
  }

  /**
   * Map rule severity to display priority
   */
  private mapSeverityToPriority(severity: string): 'Critical' | 'High' | 'Medium' | 'Low' {
    switch (severity) {
      case 'Critical': return 'Critical';
      case 'Major': return 'High';
      case 'Moderate': return 'Medium';
      case 'Minor': return 'Low';
      default: return 'Medium';
    }
  }

  /**
   * Get rule category based on rule ID
   */
  private getRuleCategory(ruleId: string): string {
    if (ruleId.startsWith('R00')) return 'Cardiovascular Risk';
    if (ruleId.startsWith('R01')) return 'VTE/Anticoagulation';
    if (ruleId.startsWith('R02')) return 'Breast Cancer Risk';
    if (ruleId.startsWith('R03')) return 'Bone Health';
    if (ruleId.startsWith('R04')) return 'Organ Function';
    if (ruleId.startsWith('R05')) return 'Drug Interactions';
    if (ruleId.startsWith('R06')) return 'Duplicate Therapy';
    if (ruleId.startsWith('R07')) return 'Pregnancy/Lactation';
    if (ruleId.startsWith('R08')) return 'Neurological';
    if (ruleId.startsWith('R09')) return 'Herbal Interactions';
    if (ruleId.startsWith('R10')) return 'Analgesics';
    if (ruleId.startsWith('R11')) return 'Geriatric Care';
    if (ruleId.startsWith('R12')) return 'Monitoring';
    if (ruleId.startsWith('R13')) return 'Alternative Therapy';
    return 'General';
  }

  /**
   * Generate evidence text for triggered rule
   */
  private generateEvidence(rule: ClinicalRule, triggeredFields: string[]): string {
    const evidenceParts: string[] = [];
    
    // Add numeric evidence where available
    triggeredFields.forEach(field => {
      switch (field) {
        case 'ASCVD_percent':
          evidenceParts.push('High cardiovascular risk score');
          break;
        case 'wells_score':
          evidenceParts.push('Elevated VTE risk score');
          break;
        case 'gail_score':
          evidenceParts.push('Elevated breast cancer risk');
          break;
        case 'age':
          evidenceParts.push('Age-related risk factors');
          break;
        case 'selected_medications':
          evidenceParts.push('Medication interaction detected');
          break;
      }
    });
    
    return evidenceParts.length > 0 
      ? evidenceParts.join(', ') 
      : `Based on clinical guideline (${rule.source})`;
  }

  /**
   * Generate risk factors summary
   */
  private generateRiskFactorsSummary(
    patient: PatientAssessment, 
    medicines: MedicineItem[]
  ): DecisionSummary['riskFactors'] {
    const riskFactors: DecisionSummary['riskFactors'] = [];

    // ASCVD Risk
    if (patient.ascvdScore > 0) {
      const level = patient.ascvdScore >= 20 ? 'High' : 
                   patient.ascvdScore >= 7.5 ? 'Moderate' : 'Low';
      riskFactors.push({
        factor: 'Cardiovascular Disease (ASCVD)',
        level,
        value: `${patient.ascvdScore}% 10-year risk`,
        recommendation: level === 'High' ? 'Intensive risk factor modification' :
                       level === 'Moderate' ? 'Consider statin therapy' : 
                       'Lifestyle modifications'
      });
    }

    // VTE Risk
    if (patient.wellsScore > 0) {
      const level = patient.wellsScore >= 4 ? 'High' : 
                   patient.wellsScore >= 2 ? 'Moderate' : 'Low';
      riskFactors.push({
        factor: 'Venous Thromboembolism (Wells)',
        level,
        value: `Score: ${patient.wellsScore}`,
        recommendation: level === 'High' ? 'Urgent VTE evaluation' :
                       'Clinical monitoring'
      });
    }

    // Breast Cancer Risk
    if (patient.gailScore > 0) {
      const level = patient.gailScore >= 1.67 ? 'High' : 
                   patient.gailScore >= 1.0 ? 'Moderate' : 'Low';
      riskFactors.push({
        factor: 'Breast Cancer (Gail Model)',
        level,
        value: `${patient.gailScore}% 5-year risk`,
        recommendation: level === 'High' ? 'Enhanced screening, consider chemoprevention' :
                       'Standard screening'
      });
    }

    // Fracture Risk
    if (patient.fraxScore > 0) {
      const level = patient.fraxScore >= 20 ? 'High' : 
                   patient.fraxScore >= 10 ? 'Moderate' : 'Low';
      riskFactors.push({
        factor: 'Fracture Risk (FRAX)',
        level,
        value: `${patient.fraxScore}% 10-year risk`,
        recommendation: level === 'High' ? 'Bone density evaluation, consider bisphosphonates' :
                       'Calcium and vitamin D supplementation'
      });
    }

    return riskFactors;
  }

  /**
   * Detect conflicts between triggered rules
   */
  private detectRuleConflicts(ruleResults: RuleEvaluationResult[]): DecisionSummary['conflicts'] {
    const conflicts: DecisionSummary['conflicts'] = [];
    const triggeredRules = ruleResults.filter(r => r.triggered);
    
    // Look for conflicting recommendations
    // Example: One rule recommends HRT, another contraindicates it
    const hrtRecommenders = triggeredRules.filter(r => 
      r.rule.action.toLowerCase().includes('consider hrt') ||
      r.rule.message.toLowerCase().includes('hrt benefit')
    );
    
    const hrtContraindicated = triggeredRules.filter(r => 
      r.rule.action.toLowerCase().includes('avoid hrt') ||
      r.rule.message.toLowerCase().includes('hrt contraindicated')
    );

    if (hrtRecommenders.length > 0 && hrtContraindicated.length > 0) {
      conflicts.push({
        type: 'Treatment Conflict',
        description: 'Conflicting recommendations regarding HRT use',
        severity: 'Major',
        resolution: 'Specialist consultation required to weigh risks and benefits',
        ruleIds: [...hrtRecommenders.map(r => r.rule.id), ...hrtContraindicated.map(r => r.rule.id)]
      });
    }

    return conflicts;
  }

  /**
   * Generate top recommendation from all results
   */
  private generateTopRecommendation(
    recommendations: DecisionSummary['recommendations'],
    formattedResults: ReturnType<typeof ClinicalRuleEngine.formatResultsForDisplay>
  ): DecisionSummary['topRecommendation'] {
    
    // Prioritize critical recommendations
    if (formattedResults.critical.length > 0) {
      const topCritical = formattedResults.critical[0];
      return {
        text: `URGENT: ${topCritical.rule.title}. ${topCritical.rule.action.split(';')[0]}`,
        priority: 'Critical',
        confidence: 95,
        ruleId: topCritical.rule.id
      };
    }

    // Next, major recommendations
    if (formattedResults.major.length > 0) {
      const topMajor = formattedResults.major[0];
      return {
        text: `Important: ${topMajor.rule.title}. ${topMajor.rule.action.split(';')[0]}`,
        priority: 'High',
        confidence: 85,
        ruleId: topMajor.rule.id
      };
    }

    // Moderate recommendations
    if (formattedResults.moderate.length > 0) {
      const topModerate = formattedResults.moderate[0];
      return {
        text: `Consider: ${topModerate.rule.title}. ${topModerate.rule.action.split(';')[0]}`,
        priority: 'Medium',
        confidence: 75,
        ruleId: topModerate.rule.id
      };
    }

    // Minor or no issues
    if (formattedResults.minor.length > 0) {
      const topMinor = formattedResults.minor[0];
      return {
        text: `Note: ${topMinor.rule.title}`,
        priority: 'Low',
        confidence: 65,
        ruleId: topMinor.rule.id
      };
    }

    // No issues identified
    return {
      text: 'No significant clinical concerns identified. Continue monitoring as appropriate.',
      priority: 'Low',
      confidence: 80
    };
  }

  /**
   * Generate overall clinical summary
   */
  private generateSummary(
    patient: PatientAssessment,
    medicines: MedicineItem[],
    ruleResults: RuleEvaluationResult[]
  ): DecisionSummary['summary'] {
    const triggeredRules = ruleResults.filter(r => r.triggered);
    const criticalCount = triggeredRules.filter(r => r.rule.severity === 'Critical').length;
    const majorCount = triggeredRules.filter(r => r.rule.severity === 'Major').length;
    
    const keyFindings: string[] = [];
    const primaryActions: string[] = [];
    
    // Summarize key findings
    if (criticalCount > 0) {
      keyFindings.push(`${criticalCount} critical issue${criticalCount > 1 ? 's' : ''} identified`);
    }
    if (majorCount > 0) {
      keyFindings.push(`${majorCount} major concern${majorCount > 1 ? 's' : ''} identified`);
    }
    
    // Generate primary actions from top priority rules
    const topRules = triggeredRules
      .sort((a, b) => b.rule.severity_priority - a.rule.severity_priority)
      .slice(0, 3);
    
    topRules.forEach(result => {
      const actions = result.rule.action.split(';');
      if (actions.length > 0) {
        primaryActions.push(actions[0].trim());
      }
    });

    let overallRisk = 'Low';
    if (criticalCount > 0) overallRisk = 'Critical';
    else if (majorCount > 0) overallRisk = 'High';
    else if (triggeredRules.length > 2) overallRisk = 'Moderate';

    return {
      patientProfile: `${patient.age}-year-old ${patient.sex || 'patient'} with ${medicines.length} selected medication${medicines.length !== 1 ? 's' : ''}`,
      keyFindings: keyFindings.length > 0 ? keyFindings : ['No significant concerns identified'],
      overallRisk,
      primaryActions: primaryActions.length > 0 ? primaryActions : ['Continue current monitoring'],
      rulesEvaluated: ruleResults.length,
      rulesTriggered: triggeredRules.length
    };
  }

  /**
   * Fallback rules if JSON loading fails
   */
  private getFallbackRules(): ClinicalRule[] {
    return [
      {
        id: 'F001',
        conditions: {
          all: [
            { field: 'ASCVD_percent', op: '>=', value: 20 },
            { field: 'selected_medications', contains: 'HRT_Estrogen' }
          ]
        },
        severity: 'Critical',
        severity_priority: 3,
        title: 'High ASCVD risk + HRT',
        message: 'ASCVD ≥20% — HRT not recommended. Prioritize CVD risk reduction.',
        action: 'Avoid HRT; cardiology referral',
        source: 'Fallback rules'
      }
    ];
  }
}

// Export singleton instance
export const decisionSummaryAnalyzer = new DecisionSummaryAnalyzer();