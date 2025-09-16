/**
 * Offline Treatment Data Manager
 * 
 * Manages all offline data for the treatment plan system including:
 * - Clinical guidelines and rules
 * - Evidence base and research data
 * - Drug interaction databases
 * - Patient treatment histories
 * - Plan templates and protocols
 */

import { crashProofStorage } from './asyncStorageUtils';
import { EnhancedTreatmentPlan } from './enhancedTreatmentEngine';

export interface ClinicalGuideline {
  id: string;
  name: string;
  organization: string;
  version: string;
  lastUpdated: string;
  url?: string;
  recommendations: {
    id: string;
    condition: string;
    recommendation: string;
    evidenceLevel: 'A' | 'B' | 'C' | 'D';
    strength: 'strong' | 'moderate' | 'weak';
  }[];
}

export interface TreatmentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'routine' | 'complex' | 'emergency';
  conditions: string[];
  template: {
    assessments: string[];
    treatments: string[];
    monitoring: string[];
    duration: string;
  };
  lastUsed?: string;
  useCount: number;
}

export interface PatientTreatmentHistory {
  patientId: string;
  treatments: {
    planId: string;
    startDate: string;
    endDate?: string;
    outcome: 'successful' | 'failed' | 'discontinued' | 'ongoing';
    sideEffects: string[];
    notes: string;
  }[];
  allergies: string[];
  contraindications: string[];
  preferences: {
    route: string[];
    avoided: string[];
    notes: string;
  };
}

export interface EvidenceEntry {
  id: string;
  title: string;
  type: 'rct' | 'meta-analysis' | 'observational' | 'guideline' | 'expert-opinion';
  source: string;
  year: number;
  population: string;
  intervention: string;
  outcome: string;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  summary: string;
  relevantFor: string[];
}

export interface TreatmentOutcome {
  planId: string;
  patientId: string;
  followUpDate: string;
  outcome: {
    symptomsImproved: boolean;
    sideEffectsReported: string[];
    adherence: 'good' | 'moderate' | 'poor';
    patientSatisfaction: number; // 1-10
    clinicianAssessment: string;
    planModifications: string[];
  };
  nextSteps: string[];
}

export class OfflineTreatmentDataManager {
  private initialized = false;

  constructor() {
    this.initializeOfflineData();
  }

  /**
   * Initialize offline data storage with default content
   */
  private async initializeOfflineData(): Promise<void> {
    if (this.initialized) return;

    try {
      // Check if data already exists
      const dataExists = await crashProofStorage.getItem('offline_data_initialized');
      
      if (!dataExists) {
        await this.setupDefaultGuidelines();
        await this.setupDefaultTemplates();
        await this.setupDefaultEvidenceBase();
        await crashProofStorage.setItem('offline_data_initialized', 'true');
      }

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing offline data:', error);
    }
  }

  /**
   * Save treatment plan outcome for future analysis
   */
  async saveTreatmentOutcome(outcome: TreatmentOutcome): Promise<void> {
    try {
      const key = `treatment_outcome_${outcome.planId}`;
      await crashProofStorage.setItem(key, JSON.stringify(outcome));

      // Add to outcomes index
      const indexKey = 'treatment_outcomes_index';
      const indexData = await crashProofStorage.getItem(indexKey);
      const index = indexData ? JSON.parse(indexData) : [];
      
      if (!index.includes(outcome.planId)) {
        index.push(outcome.planId);
        await crashProofStorage.setItem(indexKey, JSON.stringify(index));
      }

      // Update patient treatment history
      await this.updatePatientTreatmentHistory(outcome.patientId, outcome);

    } catch (error) {
      console.error('Error saving treatment outcome:', error);
    }
  }

  /**
   * Get treatment outcomes for analysis
   */
  async getTreatmentOutcomes(patientId?: string): Promise<TreatmentOutcome[]> {
    try {
      const indexData = await crashProofStorage.getItem('treatment_outcomes_index');
      const index = indexData ? JSON.parse(indexData) : [];

      const outcomes: TreatmentOutcome[] = [];
      for (const planId of index) {
        const outcomeData = await crashProofStorage.getItem(`treatment_outcome_${planId}`);
        if (outcomeData) {
          const outcome = JSON.parse(outcomeData);
          if (!patientId || outcome.patientId === patientId) {
            outcomes.push(outcome);
          }
        }
      }

      return outcomes.sort((a, b) => 
        new Date(b.followUpDate).getTime() - new Date(a.followUpDate).getTime()
      );
    } catch (error) {
      console.error('Error getting treatment outcomes:', error);
      return [];
    }
  }

  /**
   * Get treatment templates by category
   */
  async getTreatmentTemplates(category?: string): Promise<TreatmentTemplate[]> {
    try {
      const templatesData = await crashProofStorage.getItem('treatment_templates');
      const templates = templatesData ? JSON.parse(templatesData) : [];

      if (category) {
        return templates.filter((template: TreatmentTemplate) => template.category === category);
      }

      return templates.sort((a: TreatmentTemplate, b: TreatmentTemplate) => b.useCount - a.useCount);
    } catch (error) {
      console.error('Error getting treatment templates:', error);
      return [];
    }
  }

  /**
   * Save custom treatment template
   */
  async saveCustomTemplate(template: Omit<TreatmentTemplate, 'id' | 'useCount'>): Promise<string> {
    try {
      const templateWithId: TreatmentTemplate = {
        ...template,
        id: `custom_${Date.now()}`,
        useCount: 0
      };

      const templatesData = await crashProofStorage.getItem('treatment_templates');
      const templates = templatesData ? JSON.parse(templatesData) : [];
      templates.push(templateWithId);

      await crashProofStorage.setItem('treatment_templates', JSON.stringify(templates));
      return templateWithId.id;
    } catch (error) {
      console.error('Error saving custom template:', error);
      throw error;
    }
  }

  /**
   * Update template usage count
   */
  async updateTemplateUsage(templateId: string): Promise<void> {
    try {
      const templatesData = await crashProofStorage.getItem('treatment_templates');
      const templates = templatesData ? JSON.parse(templatesData) : [];

      const templateIndex = templates.findIndex((t: TreatmentTemplate) => t.id === templateId);
      if (templateIndex !== -1) {
        templates[templateIndex].useCount += 1;
        templates[templateIndex].lastUsed = new Date().toISOString();
        await crashProofStorage.setItem('treatment_templates', JSON.stringify(templates));
      }
    } catch (error) {
      console.error('Error updating template usage:', error);
    }
  }

  /**
   * Get clinical guidelines
   */
  async getClinicalGuidelines(organization?: string): Promise<ClinicalGuideline[]> {
    try {
      const guidelinesData = await crashProofStorage.getItem('clinical_guidelines');
      const guidelines = guidelinesData ? JSON.parse(guidelinesData) : [];

      if (organization) {
        return guidelines.filter((g: ClinicalGuideline) => g.organization === organization);
      }

      return guidelines;
    } catch (error) {
      console.error('Error getting clinical guidelines:', error);
      return [];
    }
  }

  /**
   * Search evidence base
   */
  async searchEvidence(query: string, type?: string): Promise<EvidenceEntry[]> {
    try {
      const evidenceData = await crashProofStorage.getItem('evidence_base');
      const evidence = evidenceData ? JSON.parse(evidenceData) : [];

      let filtered = evidence;

      if (type) {
        filtered = filtered.filter((e: EvidenceEntry) => e.type === type);
      }

      if (query) {
        const searchTerms = query.toLowerCase().split(' ');
        filtered = filtered.filter((e: EvidenceEntry) => 
          searchTerms.some(term => 
            e.title.toLowerCase().includes(term) ||
            e.summary.toLowerCase().includes(term) ||
            e.intervention.toLowerCase().includes(term) ||
            e.outcome.toLowerCase().includes(term)
          )
        );
      }

      return filtered.sort((a: EvidenceEntry, b: EvidenceEntry) => b.year - a.year);
    } catch (error) {
      console.error('Error searching evidence:', error);
      return [];
    }
  }

  /**
   * Get patient treatment history
   */
  async getPatientTreatmentHistory(patientId: string): Promise<PatientTreatmentHistory | null> {
    try {
      const historyData = await crashProofStorage.getItem(`patient_history_${patientId}`);
      return historyData ? JSON.parse(historyData) : null;
    } catch (error) {
      console.error('Error getting patient treatment history:', error);
      return null;
    }
  }

  /**
   * Export all offline data for backup
   */
  async exportOfflineData(): Promise<string> {
    try {
      const data = {
        guidelines: await crashProofStorage.getItem('clinical_guidelines'),
        templates: await crashProofStorage.getItem('treatment_templates'),
        evidence: await crashProofStorage.getItem('evidence_base'),
        outcomes: await this.getTreatmentOutcomes(),
        timestamp: new Date().toISOString()
      };

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting offline data:', error);
      throw error;
    }
  }

  /**
   * Import offline data from backup
   */
  async importOfflineData(dataString: string): Promise<void> {
    try {
      const data = JSON.parse(dataString);

      if (data.guidelines) {
        await crashProofStorage.setItem('clinical_guidelines', data.guidelines);
      }

      if (data.templates) {
        await crashProofStorage.setItem('treatment_templates', data.templates);
      }

      if (data.evidence) {
        await crashProofStorage.setItem('evidence_base', data.evidence);
      }

      // Import outcomes
      if (data.outcomes && Array.isArray(data.outcomes)) {
        for (const outcome of data.outcomes) {
          await this.saveTreatmentOutcome(outcome);
        }
      }

    } catch (error) {
      console.error('Error importing offline data:', error);
      throw error;
    }
  }

  /**
   * Clear all offline data (for reset/cleanup)
   */
  async clearOfflineData(): Promise<void> {
    try {
      const keys = [
        'clinical_guidelines',
        'treatment_templates',
        'evidence_base',
        'treatment_outcomes_index',
        'offline_data_initialized'
      ];

      for (const key of keys) {
        await crashProofStorage.removeItem(key);
      }

      // Clear individual outcome records
      const outcomes = await this.getTreatmentOutcomes();
      for (const outcome of outcomes) {
        await crashProofStorage.removeItem(`treatment_outcome_${outcome.planId}`);
      }

      this.initialized = false;
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  }

  /**
   * Get data usage statistics
   */
  async getDataUsageStats(): Promise<{
    totalPlans: number;
    totalOutcomes: number;
    totalTemplates: number;
    totalGuidelines: number;
    totalEvidence: number;
    lastUpdate: string;
  }> {
    try {
      const [outcomes, templates, guidelines, evidence] = await Promise.all([
        this.getTreatmentOutcomes(),
        this.getTreatmentTemplates(),
        this.getClinicalGuidelines(),
        this.searchEvidence('')
      ]);

      return {
        totalPlans: outcomes.length,
        totalOutcomes: outcomes.length,
        totalTemplates: templates.length,
        totalGuidelines: guidelines.length,
        totalEvidence: evidence.length,
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting data usage stats:', error);
      return {
        totalPlans: 0,
        totalOutcomes: 0,
        totalTemplates: 0,
        totalGuidelines: 0,
        totalEvidence: 0,
        lastUpdate: new Date().toISOString()
      };
    }
  }

  // Private helper methods
  private async setupDefaultGuidelines(): Promise<void> {
    const defaultGuidelines: ClinicalGuideline[] = [
      {
        id: 'nice_ng23',
        name: 'Menopause: diagnosis and management',
        organization: 'NICE',
        version: '1.0',
        lastUpdated: '2023-12-01',
        url: 'https://www.nice.org.uk/guidance/ng23',
        recommendations: [
          {
            id: 'nice_01',
            condition: 'Severe vasomotor symptoms',
            recommendation: 'Offer HRT unless contraindicated',
            evidenceLevel: 'A',
            strength: 'strong'
          },
          {
            id: 'nice_02',
            condition: 'History of VTE',
            recommendation: 'Avoid oral HRT, consider transdermal',
            evidenceLevel: 'B',
            strength: 'strong'
          },
          {
            id: 'nice_03',
            condition: 'History of breast cancer',
            recommendation: 'Do not offer systemic HRT',
            evidenceLevel: 'A',
            strength: 'strong'
          }
        ]
      },
      {
        id: 'acog_565',
        name: 'Hormone Therapy and Heart Disease',
        organization: 'ACOG',
        version: '2.0',
        lastUpdated: '2024-01-15',
        recommendations: [
          {
            id: 'acog_01',
            condition: 'Cardiovascular disease prevention',
            recommendation: 'Do not use HRT solely for cardiovascular protection',
            evidenceLevel: 'A',
            strength: 'strong'
          },
          {
            id: 'acog_02',
            condition: 'Early menopause (<45 years)',
            recommendation: 'Consider HRT until average age of menopause',
            evidenceLevel: 'B',
            strength: 'moderate'
          }
        ]
      }
    ];

    await crashProofStorage.setItem('clinical_guidelines', JSON.stringify(defaultGuidelines));
  }

  private async setupDefaultTemplates(): Promise<void> {
    const defaultTemplates: TreatmentTemplate[] = [
      {
        id: 'template_low_risk',
        name: 'Low Risk Standard HRT',
        description: 'Standard template for low-risk patients with moderate-severe symptoms',
        category: 'routine',
        conditions: ['Low cardiovascular risk', 'No contraindications', 'Moderate-severe symptoms'],
        template: {
          assessments: ['BP', 'BMI', 'Breast exam', 'Risk scores'],
          treatments: ['Oral estradiol 1mg + progesterone', 'OR transdermal estradiol'],
          monitoring: ['3 months', '6 months', 'then annually'],
          duration: 'Shortest effective duration'
        },
        useCount: 0
      },
      {
        id: 'template_high_risk',
        name: 'High Risk Conservative',
        description: 'Conservative approach for patients with elevated risk factors',
        category: 'complex',
        conditions: ['Elevated CV risk', 'Multiple risk factors', 'Contraindications present'],
        template: {
          assessments: ['Comprehensive risk assessment', 'Specialist consultation'],
          treatments: ['Non-hormonal options', 'Lifestyle modifications', 'Vaginal estrogen if appropriate'],
          monitoring: ['Monthly initially', 'then every 3 months'],
          duration: 'Ongoing assessment'
        },
        useCount: 0
      },
      {
        id: 'template_contraindicated',
        name: 'HRT Contraindicated',
        description: 'Template for patients with absolute contraindications to HRT',
        category: 'routine',
        conditions: ['Breast cancer history', 'VTE history', 'Unexplained bleeding'],
        template: {
          assessments: ['Symptom severity', 'Quality of life impact'],
          treatments: ['SSRI/SNRI', 'Clonidine', 'CBT', 'Lifestyle measures'],
          monitoring: ['4-6 weeks', 'then every 3 months'],
          duration: 'As tolerated'
        },
        useCount: 0
      }
    ];

    await crashProofStorage.setItem('treatment_templates', JSON.stringify(defaultTemplates));
  }

  private async setupDefaultEvidenceBase(): Promise<void> {
    const defaultEvidence: EvidenceEntry[] = [
      {
        id: 'whi_study',
        title: 'Women\'s Health Initiative Study',
        type: 'rct',
        source: 'JAMA',
        year: 2002,
        population: 'Postmenopausal women aged 50-79',
        intervention: 'Conjugated equine estrogens plus progestin',
        outcome: 'Increased breast cancer and cardiovascular risk',
        evidenceLevel: 'A',
        summary: 'Large RCT showing increased risks with combined HRT, particularly breast cancer and stroke',
        relevantFor: ['breast_cancer_risk', 'cardiovascular_risk', 'hrt_risks']
      },
      {
        id: 'nice_guidance_2023',
        title: 'NICE Menopause Guidance Update',
        type: 'guideline',
        source: 'NICE',
        year: 2023,
        population: 'Perimenopausal and postmenopausal women',
        intervention: 'Various HRT regimens',
        outcome: 'Evidence-based recommendations',
        evidenceLevel: 'A',
        summary: 'Comprehensive evidence-based guidelines for menopause management',
        relevantFor: ['clinical_guidelines', 'treatment_options', 'monitoring']
      },
      {
        id: 'transdermal_vte_risk',
        title: 'Transdermal HRT and VTE Risk',
        type: 'meta-analysis',
        source: 'BMJ',
        year: 2019,
        population: 'Postmenopausal women using HRT',
        intervention: 'Transdermal vs oral HRT',
        outcome: 'Lower VTE risk with transdermal',
        evidenceLevel: 'A',
        summary: 'Meta-analysis showing lower VTE risk with transdermal compared to oral HRT',
        relevantFor: ['vte_risk', 'route_selection', 'safety']
      }
    ];

    await crashProofStorage.setItem('evidence_base', JSON.stringify(defaultEvidence));
  }

  private async updatePatientTreatmentHistory(patientId: string, outcome: TreatmentOutcome): Promise<void> {
    try {
      let history = await this.getPatientTreatmentHistory(patientId);

      if (!history) {
        history = {
          patientId,
          treatments: [],
          allergies: [],
          contraindications: [],
          preferences: {
            route: [],
            avoided: [],
            notes: ''
          }
        };
      }

      // Update treatment record
      const treatmentIndex = history.treatments.findIndex(t => t.planId === outcome.planId);
      const treatmentData = {
        planId: outcome.planId,
        startDate: outcome.followUpDate, // This should be start date in real implementation
        outcome: outcome.outcome.symptomsImproved ? 'successful' : 'failed',
        sideEffects: outcome.outcome.sideEffectsReported,
        notes: outcome.outcome.clinicianAssessment
      };

      if (treatmentIndex !== -1) {
        history.treatments[treatmentIndex] = { ...history.treatments[treatmentIndex], ...treatmentData };
      } else {
        history.treatments.push(treatmentData as any);
      }

      await crashProofStorage.setItem(`patient_history_${patientId}`, JSON.stringify(history));
    } catch (error) {
      console.error('Error updating patient treatment history:', error);
    }
  }
}

export default OfflineTreatmentDataManager;