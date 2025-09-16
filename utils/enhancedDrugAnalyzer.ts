/**
 * Enhanced Drug Analyzer for MHT Assessment App
 * Comprehensive medicine analysis with local rules and optional API integration
 */

import crashProofStorage from "./asyncStorageUtils";
import { Alert } from 'react-native';

// Import optional medicines configuration
import optionalMedicinesConfig from '../assets/rules/optional_medicines.json';

// Enhanced drug interaction interfaces
export interface MedicineItem {
  id: string;
  name: string;
  displayName: string;
  category: string;
  type: string;
  key: string;
  severity: 'low' | 'medium' | 'high';
  selected: boolean;
  timestamp: number;
}

export interface DrugInteractionAnalysis {
  id: string;
  severity: 'critical' | 'major' | 'moderate' | 'minor';
  title: string;
  shortExplanation: string;
  clinicalImpact: string;
  suggestedActions: string[];
  source: 'local' | 'api' | 'combined';
  medications: string[];
  expandedDetails?: string;
}

export interface AnalysisResult {
  timestamp: number;
  medications: MedicineItem[];
  interactions: DrugInteractionAnalysis[];
  contraindications: ContraindicationResult[];
  duplicateTherapies: DuplicateTherapyResult[];
  highRiskCombinations: HighRiskCombination[];
  analysisStatus: 'complete' | 'partial' | 'local_only' | 'failed';
  apiErrors?: string[];
}

export interface ContraindicationResult {
  id: string;
  severity: 'absolute' | 'relative';
  condition: string;
  medication: string;
  reason: string;
  recommendation: string;
}

export interface DuplicateTherapyResult {
  id: string;
  medications: string[];
  category: string;
  recommendation: string;
}

export interface HighRiskCombination {
  id: string;
  medications: string[];
  riskType: 'vte' | 'bleeding' | 'cardiovascular' | 'hepatic' | 'metabolic';
  severity: 'critical' | 'major';
  explanation: string;
  recommendation: string;
}

// Configuration interface
export interface AnalyzerConfig {
  enableOnlineAPI: boolean;
  apiProvider: 'none' | 'openfda' | 'rxnorm' | 'drugbank';
  apiTimeout: number;
  cacheResults: boolean;
}

// Local drug interaction rules (comprehensive)
const LOCAL_INTERACTION_RULES = {
  'warfarin + nsaid': {
    severity: 'critical' as const,
    title: 'Warfarin + NSAID — Critical interaction',
    shortExplanation: 'Severe bleeding risk increase',
    clinicalImpact: 'Up to 13-fold increase in gastrointestinal bleeding risk. Life-threatening bleeding possible.',
    suggestedActions: [
      'Avoid combination if possible',
      'Alternative: acetaminophen for pain',
      'If unavoidable: reduce warfarin dose, frequent INR monitoring',
      'Urgent consultation with anticoagulation clinic'
    ],
    medications: ['warfarin', 'nsaid'],
    expandedDetails: 'NSAIDs inhibit platelet aggregation and can cause gastric irritation, compounding anticoagulant effects. Risk highest with ketorolac, diclofenac, and piroxicam.'
  },
  
  'estrogen + anticoagulant': {
    severity: 'major' as const,
    title: 'Estrogen + Anticoagulants — Major interaction',
    shortExplanation: 'Increased thrombosis risk despite anticoagulation',
    clinicalImpact: 'Estrogen increases clotting factors and may reduce anticoagulant effectiveness.',
    suggestedActions: [
      'Consider non-hormonal alternatives',
      'If HRT needed: prefer transdermal route',
      'Enhanced monitoring for VTE signs',
      'Possible anticoagulant dose adjustment needed'
    ],
    medications: ['estrogen', 'anticoagulant']
  },

  'ssri + tamoxifen': {
    severity: 'major' as const,
    title: 'SSRI + Tamoxifen — Major interaction',
    shortExplanation: 'Reduced tamoxifen effectiveness',
    clinicalImpact: 'CYP2D6 inhibiting SSRIs can reduce tamoxifen conversion to active metabolite endoxifen.',
    suggestedActions: [
      'Avoid paroxetine and fluoxetine',
      'Consider sertraline or citalopram (weak CYP2D6 inhibition)',
      'Oncology consultation recommended',
      'Monitor for tamoxifen treatment failure signs'
    ],
    medications: ['ssri', 'tamoxifen']
  },

  'gabapentin + opioids': {
    severity: 'major' as const,
    title: 'Gabapentin + Opioids — Major interaction',
    shortExplanation: 'Respiratory depression risk',
    clinicalImpact: 'Additive CNS depression can lead to severe respiratory depression.',
    suggestedActions: [
      'Start with lowest doses of both medications',
      'Frequent monitoring for sedation/respiratory depression',
      'Patient education on warning signs',
      'Consider alternative for neuropathic pain'
    ],
    medications: ['gabapentin', 'opioid']
  },

  'hrt + rifampin': {
    severity: 'moderate' as const,
    title: 'HRT + Rifampin — Moderate interaction',
    shortExplanation: 'Reduced HRT effectiveness',
    clinicalImpact: 'Rifampin induces CYP3A4, increasing estrogen metabolism and reducing effectiveness.',
    suggestedActions: [
      'Monitor for return of menopausal symptoms',
      'Consider higher HRT dose during rifampin treatment',
      'Switch to transdermal route if oral HRT',
      'Review after rifampin discontinuation'
    ],
    medications: ['hrt', 'rifampin']
  },

  'black_cohosh + hepatotoxic': {
    severity: 'moderate' as const,
    title: 'Black Cohosh + Hepatotoxic drugs — Moderate interaction',
    shortExplanation: 'Increased liver toxicity risk',
    clinicalImpact: 'Additive hepatotoxicity potential, especially with acetaminophen, statins.',
    suggestedActions: [
      'Monitor liver function tests',
      'Patient education on hepatotoxicity signs',
      'Consider alternative herbal supplements',
      'Limit concurrent hepatotoxic medications'
    ],
    medications: ['black_cohosh', 'hepatotoxic']
  },

  'clonidine + beta_blocker': {
    severity: 'moderate' as const,
    title: 'Clonidine + Beta-blockers — Moderate interaction',
    shortExplanation: 'Rebound hypertension risk',
    clinicalImpact: 'Beta-blockers can exacerbate clonidine withdrawal hypertensive crisis.',
    suggestedActions: [
      'Avoid abrupt clonidine discontinuation',
      'Taper clonidine gradually before stopping beta-blocker',
      'Monitor blood pressure closely',
      'Have emergency protocol for hypertensive crisis'
    ],
    medications: ['clonidine', 'beta_blocker']
  }
};

// High-risk combination rules
const HIGH_RISK_COMBINATIONS = {
  'hrt + family_history_vte + obesity': {
    riskType: 'vte' as const,
    severity: 'critical' as const,
    explanation: 'Multiple VTE risk factors significantly increase thrombosis risk with HRT',
    recommendation: 'Strongly consider non-hormonal alternatives. If HRT needed, use transdermal route with thrombophilia screening.'
  },
  
  'anticoagulant + nsaid + ppi': {
    riskType: 'bleeding' as const,
    severity: 'major' as const,
    explanation: 'Triple combination increases GI bleeding risk despite PPI protection',
    recommendation: 'Use lowest effective doses, frequent monitoring, consider H2 blocker instead of PPI for some patients.'
  }
};

// Contraindication rules
const CONTRAINDICATION_RULES = {
  'estrogen + active_breast_cancer': {
    severity: 'absolute' as const,
    reason: 'Estrogen can stimulate hormone-sensitive breast cancer growth',
    recommendation: 'Absolute contraindication. Use non-hormonal alternatives only.'
  },
  
  'estrogen + recent_vte': {
    severity: 'absolute' as const,
    reason: 'Recent VTE within 3 months is absolute contraindication due to high recurrence risk',
    recommendation: 'Wait minimum 3 months, consider transdermal route only with anticoagulation.'
  },

  'ssri + mao_inhibitor': {
    severity: 'absolute' as const,
    reason: 'Risk of serotonin syndrome, potentially fatal',
    recommendation: 'Wait 14 days after MAO inhibitor discontinuation before starting SSRI.'
  }
};

// Duplicate therapy detection
const DUPLICATE_THERAPY_RULES = {
  categories: {
    'estrogen': ['estradiol', 'conjugated_estrogens', 'estrone', 'estriol'],
    'progestogen': ['progesterone', 'medroxyprogesterone', 'norethisterone', 'levonorgestrel'],
    'ssri': ['sertraline', 'fluoxetine', 'paroxetine', 'escitalopram', 'citalopram'],
    'snri': ['venlafaxine', 'desvenlafaxine', 'duloxetine'],
    'anticoagulant': ['warfarin', 'rivaroxaban', 'apixaban', 'dabigatran', 'edoxaban'],
    'nsaid': ['ibuprofen', 'naproxen', 'diclofenac', 'celecoxib', 'ketorolac']
  }
};

class EnhancedDrugAnalyzer {
  private config: AnalyzerConfig = {
    enableOnlineAPI: false, // Default OFF as requested
    apiProvider: 'none',
    apiTimeout: 6000,
    cacheResults: true
  };

  constructor(config?: Partial<AnalyzerConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Main analysis function - comprehensive medicine analysis
   */
  async analyzeMedicines(
    medicines: MedicineItem[],
    patientConditions?: any
  ): Promise<AnalysisResult> {
    const startTime = Date.now();
    const result: AnalysisResult = {
      timestamp: startTime,
      medications: medicines,
      interactions: [],
      contraindications: [],
      duplicateTherapies: [],
      highRiskCombinations: [],
      analysisStatus: 'complete',
      apiErrors: []
    };

    try {
      // 1. Local rules analysis (always runs)
      console.log('🔍 Running local drug interaction analysis...');
      result.interactions = await this.analyzeLocalInteractions(medicines);
      
      // 2. Check contraindications
      console.log('🚨 Checking contraindications...');
      result.contraindications = this.checkContraindications(medicines, patientConditions);
      
      // 3. Detect duplicate therapies
      console.log('🔍 Detecting duplicate therapies...');
      result.duplicateTherapies = this.detectDuplicateTherapies(medicines);
      
      // 4. Check high-risk combinations
      console.log('⚠️ Checking high-risk combinations...');
      result.highRiskCombinations = this.checkHighRiskCombinations(medicines, patientConditions);

      // 5. Optional API analysis
      if (this.config.enableOnlineAPI && this.config.apiProvider !== 'none') {
        console.log('🌐 Running online API analysis...');
        try {
          const apiResults = await this.queryExternalAPI(medicines);
          result.interactions = this.mergeAPIResults(result.interactions, apiResults);
          result.analysisStatus = 'complete';
        } catch (apiError) {
          console.warn('⚠️ API analysis failed:', apiError);
          result.apiErrors?.push(apiError instanceof Error ? apiError.message : 'API request failed');
          result.analysisStatus = 'local_only';
        }
      } else {
        result.analysisStatus = 'local_only';
      }

      // 6. Cache results if enabled
      if (this.config.cacheResults) {
        await this.cacheAnalysisResult(result);
      }

      console.log(`✅ Analysis completed in ${Date.now() - startTime}ms`);
      return result;

    } catch (error) {
      console.error('❌ Analysis failed:', error);
      result.analysisStatus = 'failed';
      result.apiErrors?.push(error instanceof Error ? error.message : 'Analysis failed');
      return result;
    }
  }

  /**
   * Analyze using local interaction rules
   */
  private async analyzeLocalInteractions(medicines: MedicineItem[]): Promise<DrugInteractionAnalysis[]> {
    const interactions: DrugInteractionAnalysis[] = [];
    
    // Check each pair of medicines
    for (let i = 0; i < medicines.length; i++) {
      for (let j = i + 1; j < medicines.length; j++) {
        const med1 = medicines[i];
        const med2 = medicines[j];
        
        const interaction = this.findInteractionRule(med1.key || med1.type, med2.key || med2.type);
        if (interaction) {
          interactions.push({
            id: `local_${med1.id}_${med2.id}`,
            source: 'local',
            medications: [med1.displayName, med2.displayName],
            ...interaction
          });
        }
      }
    }

    return interactions;
  }

  /**
   * Find interaction rule for two medications
   */
  private findInteractionRule(med1: string, med2: string): Omit<DrugInteractionAnalysis, 'id' | 'source' | 'medications'> | null {
    const med1Lower = med1.toLowerCase();
    const med2Lower = med2.toLowerCase();
    
    // Check direct rules
    for (const [ruleKey, rule] of Object.entries(LOCAL_INTERACTION_RULES)) {
      const ruleMeds = ruleKey.split(' + ');
      
      if (this.medicationMatchesRule(med1Lower, ruleMeds[0]) && 
          this.medicationMatchesRule(med2Lower, ruleMeds[1])) {
        return rule;
      }
      
      if (this.medicationMatchesRule(med1Lower, ruleMeds[1]) && 
          this.medicationMatchesRule(med2Lower, ruleMeds[0])) {
        return rule;
      }
    }
    
    return null;
  }

  /**
   * Check if medication matches rule pattern
   */
  private medicationMatchesRule(medication: string, rulePattern: string): boolean {
    const patterns = {
      'warfarin': ['warfarin', 'coumadin'],
      'nsaid': ['ibuprofen', 'naproxen', 'diclofenac', 'celecoxib', 'nsaid'],
      'estrogen': ['estradiol', 'estrogen', 'premarin', 'estrace'],
      'anticoagulant': ['warfarin', 'rivaroxaban', 'apixaban', 'dabigatran'],
      'ssri': ['sertraline', 'fluoxetine', 'paroxetine', 'escitalopram', 'citalopram', 'ssri'],
      'tamoxifen': ['tamoxifen'],
      'gabapentin': ['gabapentin', 'neurontin'],
      'opioid': ['oxycodone', 'morphine', 'fentanyl', 'codeine', 'tramadol'],
      'hrt': ['estradiol', 'estrogen', 'progesterone', 'hrt'],
      'rifampin': ['rifampin', 'rifadin'],
      'black_cohosh': ['black cohosh', 'cimicifuga'],
      'hepatotoxic': ['acetaminophen', 'tylenol', 'atorvastatin', 'simvastatin'],
      'clonidine': ['clonidine', 'catapres'],
      'beta_blocker': ['metoprolol', 'propranolol', 'atenolol', 'carvedilol']
    };

    const rulePatterns = patterns[rulePattern as keyof typeof patterns] || [rulePattern];
    return rulePatterns.some(pattern => medication.includes(pattern));
  }

  /**
   * Check contraindications
   */
  private checkContraindications(medicines: MedicineItem[], patientConditions?: any): ContraindicationResult[] {
    const contraindications: ContraindicationResult[] = [];
    
    medicines.forEach(med => {
      for (const [ruleKey, rule] of Object.entries(CONTRAINDICATION_RULES)) {
        const [medication, condition] = ruleKey.split(' + ');
        
        if (this.medicationMatchesRule(med.name.toLowerCase(), medication)) {
          // Check if patient has the condition
          const hasCondition = this.patientHasCondition(condition, patientConditions);
          
          if (hasCondition) {
            contraindications.push({
              id: `contra_${med.id}_${condition}`,
              severity: rule.severity,
              condition: condition.replace('_', ' '),
              medication: med.name,
              reason: rule.reason,
              recommendation: rule.recommendation
            });
          }
        }
      }
    });

    return contraindications;
  }

  /**
   * Check if patient has specific condition
   */
  private patientHasCondition(condition: string, patientConditions?: any): boolean {
    if (!patientConditions) return false;
    
    const conditionMap = {
      'active_breast_cancer': patientConditions.personalHistoryBreastCancer,
      'recent_vte': patientConditions.personalHistoryDVT,
      'mao_inhibitor': false // Would need to check current medications
    };
    
    return conditionMap[condition as keyof typeof conditionMap] || false;
  }

  /**
   * Detect duplicate therapies
   */
  private detectDuplicateTherapies(medicines: MedicineItem[]): DuplicateTherapyResult[] {
    const duplicates: DuplicateTherapyResult[] = [];
    
    for (const [category, medications] of Object.entries(DUPLICATE_THERAPY_RULES.categories)) {
      const matchingMeds = medicines.filter(med => 
        medications.some(ruleMed => med.name.toLowerCase().includes(ruleMed.toLowerCase()))
      );
      
      if (matchingMeds.length > 1) {
        duplicates.push({
          id: `dup_${category}_${Date.now()}`,
          medications: matchingMeds.map(m => m.name),
          category: category,
          recommendation: `Multiple ${category} medications selected. Review for therapeutic duplication and consider consolidating to single agent.`
        });
      }
    }
    
    return duplicates;
  }

  /**
   * Check high-risk combinations
   */
  private checkHighRiskCombinations(medicines: MedicineItem[], patientConditions?: any): HighRiskCombination[] {
    const combinations: HighRiskCombination[] = [];
    
    // This would be enhanced with more sophisticated logic
    // For now, implementing basic patterns
    
    const hasHRT = medicines.some(m => this.medicationMatchesRule(m.name.toLowerCase(), 'hrt'));
    const hasAnticoagulant = medicines.some(m => this.medicationMatchesRule(m.name.toLowerCase(), 'anticoagulant'));
    const hasNSAID = medicines.some(m => this.medicationMatchesRule(m.name.toLowerCase(), 'nsaid'));
    
    if (hasAnticoagulant && hasNSAID) {
      combinations.push({
        id: `highrisk_bleeding_${Date.now()}`,
        medications: medicines.filter(m => 
          this.medicationMatchesRule(m.name.toLowerCase(), 'anticoagulant') ||
          this.medicationMatchesRule(m.name.toLowerCase(), 'nsaid')
        ).map(m => m.name),
        riskType: 'bleeding',
        severity: 'critical',
        explanation: 'Anticoagulant + NSAID combination significantly increases bleeding risk',
        recommendation: 'Avoid combination. Use acetaminophen for pain relief instead of NSAID.'
      });
    }
    
    return combinations;
  }

  /**
   * Query external API (placeholder for real implementation)
   */
  private async queryExternalAPI(medicines: MedicineItem[]): Promise<DrugInteractionAnalysis[]> {
    // This would implement actual API calls to OpenFDA, RxNorm, etc.
    // For now, return empty array to simulate API unavailable
    return [];
  }

  /**
   * Merge API results with local results
   */
  private mergeAPIResults(localResults: DrugInteractionAnalysis[], apiResults: DrugInteractionAnalysis[]): DrugInteractionAnalysis[] {
    // Simple merge - in production would be more sophisticated
    return [...localResults, ...apiResults.map(api => ({ ...api, source: 'api' as const }))];
  }

  /**
   * Cache analysis result
   */
  private async cacheAnalysisResult(result: AnalysisResult): Promise<void> {
    try {
      const cacheKey = `analysis_${result.timestamp}`;
      await crashProofStorage.setItem(cacheKey, JSON.stringify(result));
      
      // Keep only last 10 cached results
      const keys = await crashProofStorage.getAllKeys();
      const analysisKeys = keys.filter(key => key.startsWith('analysis_')).sort();
      
      if (analysisKeys.length > 10) {
        const keysToRemove = analysisKeys.slice(0, analysisKeys.length - 10);
        await crashProofStorage.multiRemove(keysToRemove);
      }
    } catch (error) {
      console.warn('Failed to cache analysis result:', error);
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AnalyzerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): AnalyzerConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const drugAnalyzer = new EnhancedDrugAnalyzer();

// Medicine lookup utility
export const findMedicineInOptionalList = (searchName: string): any | null => {
  const normalizedSearch = searchName.toLowerCase().trim();
  
  return optionalMedicinesConfig.medicines.find(medicine => {
    // Check direct ID match
    if (medicine.id.toLowerCase() === normalizedSearch) return true;
    
    // Check display name match
    if (medicine.displayName.toLowerCase() === normalizedSearch) return true;
    
    // Check aliases
    return medicine.aliases.some(alias => alias.toLowerCase() === normalizedSearch);
  }) || null;
};

// Create medicine item utility with enhanced display name support
export const createMedicineItem = (name: string, category: string, type: string = 'user_selected', severity: 'low' | 'medium' | 'high' = 'medium'): MedicineItem => {
  // Try to find the medicine in optional medicines list for proper display name
  const optionalMedicine = findMedicineInOptionalList(name);
  
  return {
    id: `${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
    name: name.trim(),
    displayName: optionalMedicine?.displayName || name.trim(),
    category: optionalMedicine?.category || category,
    type: optionalMedicine?.key || type,
    key: optionalMedicine?.key || type,
    severity: optionalMedicine?.defaultSeverity || severity,
    selected: true,
    timestamp: Date.now()
  };
};

export const groupInteractionsBySeverity = (interactions: DrugInteractionAnalysis[]) => {
  return {
    critical: interactions.filter(i => i.severity === 'critical'),
    major: interactions.filter(i => i.severity === 'major'),
    moderate: interactions.filter(i => i.severity === 'moderate'),
    minor: interactions.filter(i => i.severity === 'minor')
  };
};