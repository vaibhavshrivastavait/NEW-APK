import crashProofStorage from "./asyncStorageUtils";
import * as FileSystem from 'expo-file-system';

export interface GuidelineSource {
  title: string;
  url: string;
  version: string;
  date: string;
  type: 'guideline' | 'interaction' | 'contraindication';
}

export interface ClinicalRule {
  id: string;
  condition: {
    all?: Array<{field: string; equals?: any; greaterThan?: number; lessThan?: number; contains?: any}>;
    any?: Array<{field: string; equals?: any; greaterThan?: number; lessThan?: number; contains?: any}>;
  };
  action: {
    type: 'Lifestyle' | 'NonPharm' | 'Pharm' | 'Urgent' | 'Refer';
    text: string;
    rationale: string;
    evidence: GuidelineSource[];
    priority: number;
    confidence: number;
    contraindications?: string[];
    interactions?: string[];
  };
}

export interface KnowledgePack {
  version: string;
  lastUpdated: string;
  sources: GuidelineSource[];
  rules: ClinicalRule[];
  interactions: Array<{
    drug1: string;
    drug2: string;
    severity: 'major' | 'moderate' | 'minor';
    description: string;
  }>;
  contraindications: Array<{
    medication: string;
    condition: string;
    severity: 'absolute' | 'relative';
    description: string;
  }>;
}

class KnowledgeManager {
  private static instance: KnowledgeManager;
  private knowledgePack: KnowledgePack | null = null;
  private knowledgeDir: string;

  constructor() {
    this.knowledgeDir = `${FileSystem.documentDirectory}knowledge/`;
  }

  public static getInstance(): KnowledgeManager {
    if (!KnowledgeManager.instance) {
      KnowledgeManager.instance = new KnowledgeManager();
    }
    return KnowledgeManager.instance;
  }

  /**
   * Initialize knowledge directory and load cached knowledge
   */
  public async initialize(): Promise<void> {
    try {
      console.log('🧠 Initializing Knowledge Manager...');
      
      // Create knowledge directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(this.knowledgeDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.knowledgeDir, { intermediates: true });
        console.log('📁 Created knowledge directory');
      }

      // Load cached knowledge
      await this.loadCachedKnowledge();
      
      console.log('✅ Knowledge Manager initialized');
    } catch (error) {
      console.error('❌ Error initializing Knowledge Manager:', error);
      throw error;
    }
  }

  /**
   * Load cached knowledge from local storage
   */
  private async loadCachedKnowledge(): Promise<void> {
    try {
      const knowledgeFile = `${this.knowledgeDir}knowledge_pack.json`;
      const fileInfo = await FileSystem.getInfoAsync(knowledgeFile);

      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(knowledgeFile);
        this.knowledgePack = JSON.parse(content);
        console.log(`📚 Loaded knowledge pack v${this.knowledgePack?.version}`);
      } else {
        console.log('📚 No cached knowledge found, will use default');
        await this.createDefaultKnowledgePack();
      }
    } catch (error) {
      console.error('❌ Error loading cached knowledge:', error);
      await this.createDefaultKnowledgePack();
    }
  }

  /**
   * Create default knowledge pack with essential rules
   */
  private async createDefaultKnowledgePack(): Promise<void> {
    console.log('🔧 Creating default knowledge pack...');

    const defaultPack: KnowledgePack = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      sources: [
        {
          title: 'NAMS 2022 Hormone Therapy Position Statement',
          url: 'https://www.menopause.org/docs/default-source/professional/namspositionstatement2022.pdf',
          version: '2022',
          date: '2022-01-01',
          type: 'guideline'
        },
        {
          title: 'ACOG Practice Bulletin on Hormone Therapy',
          url: 'https://www.acog.org/clinical/clinical-guidance/practice-bulletin/articles/2014/01/hormone-therapy',
          version: '2014',
          date: '2014-01-01', 
          type: 'guideline'
        },
        {
          title: 'AHA/ACC Cardiovascular Risk Guidelines',
          url: 'https://www.acc.org/guidelines/about-guidelines-and-clinical-documents/clinical-practice-guidelines',
          version: '2019',
          date: '2019-01-01',
          type: 'guideline'
        }
      ],
      rules: [
        {
          id: 'rule-hrt-vte-contraindication',
          condition: {
            all: [
              { field: 'medicineType', equals: 'HRT' },
              { field: 'history.VTE', equals: true }
            ]
          },
          action: {
            type: 'Urgent',
            text: 'HRT is contraindicated due to prior VTE — refer to hematology/clinician for risk stratification.',
            rationale: 'VTE history increases thrombosis risk on estrogen-containing therapy.',
            evidence: [
              {
                title: 'NAMS 2022 Hormone Therapy Position Statement',
                url: 'https://www.menopause.org/docs/default-source/professional/namspositionstatement2022.pdf',
                version: '2022',
                date: '2022-01-01',
                type: 'guideline'
              }
            ],
            priority: 1,
            confidence: 0.95,
            contraindications: ['VTE history']
          }
        },
        {
          id: 'rule-hrt-breast-cancer-contraindication',
          condition: {
            all: [
              { field: 'medicineType', equals: 'HRT' },
              { field: 'history.breastCancer_active', equals: true }
            ]
          },
          action: {
            type: 'Urgent',
            text: 'HRT is contraindicated due to active breast cancer — refer to oncology immediately.',
            rationale: 'Active breast cancer is an absolute contraindication for hormone therapy.',
            evidence: [
              {
                title: 'ACOG Practice Bulletin on Hormone Therapy',
                url: 'https://www.acog.org/clinical/clinical-guidance/practice-bulletin/articles/2014/01/hormone-therapy',
                version: '2014',
                date: '2014-01-01',
                type: 'guideline'
              }
            ],
            priority: 1,
            confidence: 0.98,
            contraindications: ['Active breast cancer']
          }
        },
        {
          id: 'rule-lifestyle-first-low-risk',
          condition: {
            all: [
              { field: 'riskScores.ASCVD', lessThan: 7.5 },
              { field: 'symptoms.severity', lessThan: 6 }
            ]
          },
          action: {
            type: 'Lifestyle',
            text: 'Consider lifestyle modifications as first-line approach for mild-moderate symptoms in low cardiovascular risk patients.',
            rationale: 'Low-risk patients with mild symptoms may benefit from conservative management before pharmacological intervention.',
            evidence: [
              {
                title: 'NAMS 2022 Hormone Therapy Position Statement',
                url: 'https://www.menopause.org/docs/default-source/professional/namspositionstatement2022.pdf',
                version: '2022',
                date: '2022-01-01',
                type: 'guideline'
              }
            ],
            priority: 5,
            confidence: 0.75
          }
        },
        {
          id: 'rule-cardiology-consult-high-ascvd',
          condition: {
            all: [
              { field: 'medicineType', equals: 'HRT' },
              { field: 'riskScores.ASCVD', greaterThan: 10 }
            ]
          },
          action: {
            type: 'Refer',
            text: 'Consider cardiology consultation before HRT initiation due to elevated cardiovascular risk.',
            rationale: 'High ASCVD score indicates increased cardiovascular risk requiring specialist evaluation.',
            evidence: [
              {
                title: 'AHA/ACC Cardiovascular Risk Guidelines',
                url: 'https://www.acc.org/guidelines/about-guidelines-and-clinical-documents/clinical-practice-guidelines',
                version: '2019',
                date: '2019-01-01',
                type: 'guideline'
              }
            ],
            priority: 3,
            confidence: 0.85
          }
        },
        {
          id: 'rule-herb-drug-interaction',
          condition: {
            all: [
              { field: 'medicineType', equals: 'HerbalSupplement' },
              { field: 'currentMedications', contains: 'warfarin' }
            ]
          },
          action: {
            type: 'Urgent',
            text: 'Potential herb-drug interaction with warfarin detected — discuss with clinician before starting herbal supplements.',
            rationale: 'Many herbal supplements can affect anticoagulant medications and increase bleeding risk.',
            evidence: [
              {
                title: 'Natural Medicines Database',
                url: 'https://naturalmedicines.therapeuticresearch.com/',
                version: '2024',
                date: '2024-01-01',
                type: 'interaction'
              }
            ],
            priority: 2,
            confidence: 0.90,
            interactions: ['warfarin-herbs']
          }
        }
      ],
      interactions: [
        {
          drug1: 'warfarin',
          drug2: 'herbal_supplements',
          severity: 'major',
          description: 'Herbal supplements may affect warfarin metabolism and increase bleeding risk'
        },
        {
          drug1: 'HRT',
          drug2: 'warfarin',
          severity: 'moderate', 
          description: 'Estrogen may increase clotting factors and affect warfarin effectiveness'
        }
      ],
      contraindications: [
        {
          medication: 'HRT',
          condition: 'active_breast_cancer',
          severity: 'absolute',
          description: 'Active breast cancer is an absolute contraindication for hormone therapy'
        },
        {
          medication: 'HRT',
          condition: 'VTE_history',
          severity: 'absolute',
          description: 'History of venous thromboembolism is an absolute contraindication for oral HRT'
        }
      ]
    };

    this.knowledgePack = defaultPack;
    await this.saveKnowledgePack();
    console.log('✅ Default knowledge pack created');
  }

  /**
   * Save knowledge pack to local storage
   */
  private async saveKnowledgePack(): Promise<void> {
    if (!this.knowledgePack) return;

    try {
      const knowledgeFile = `${this.knowledgeDir}knowledge_pack.json`;
      await FileSystem.writeAsStringAsync(
        knowledgeFile,
        JSON.stringify(this.knowledgePack, null, 2)
      );
      console.log('💾 Knowledge pack saved to file system');
    } catch (error) {
      console.error('❌ Error saving knowledge pack:', error);
    }
  }

  /**
   * Get current knowledge pack
   */
  public getKnowledgePack(): KnowledgePack | null {
    return this.knowledgePack;
  }

  /**
   * Get all clinical rules
   */
  public getRules(): ClinicalRule[] {
    return this.knowledgePack?.rules || [];
  }

  /**
   * Get drug interactions
   */
  public getInteractions(): Array<{drug1: string; drug2: string; severity: string; description: string}> {
    return this.knowledgePack?.interactions || [];
  }

  /**
   * Get contraindications
   */
  public getContraindications(): Array<{medication: string; condition: string; severity: string; description: string}> {
    return this.knowledgePack?.contraindications || [];
  }

  /**
   * Check if knowledge pack needs update
   */
  public needsUpdate(): boolean {
    if (!this.knowledgePack) return true;
    
    const lastUpdate = new Date(this.knowledgePack.lastUpdated);
    const now = new Date();
    const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysSinceUpdate > 30; // Update every 30 days
  }

  /**
   * Get knowledge pack version info
   */
  public getVersionInfo(): { version: string; lastUpdated: string; rulesCount: number } | null {
    if (!this.knowledgePack) return null;
    
    return {
      version: this.knowledgePack.version,
      lastUpdated: this.knowledgePack.lastUpdated,
      rulesCount: this.knowledgePack.rules.length
    };
  }

  /**
   * Force refresh knowledge pack (for admin/dev use)
   */
  public async forceRefresh(): Promise<void> {
    console.log('🔄 Force refreshing knowledge pack...');
    await this.createDefaultKnowledgePack();
  }

  /**
   * Validate rule condition against patient data
   */
  public validateCondition(condition: any, patientData: any): boolean {
    if (condition.all) {
      return condition.all.every((cond: any) => this.evaluateCondition(cond, patientData));
    }
    
    if (condition.any) {
      return condition.any.some((cond: any) => this.evaluateCondition(cond, patientData));
    }
    
    return false;
  }

  /**
   * Evaluate individual condition
   */
  private evaluateCondition(condition: any, patientData: any): boolean {
    const value = this.getNestedValue(patientData, condition.field);
    
    if (condition.equals !== undefined) {
      return value === condition.equals;
    }
    
    if (condition.greaterThan !== undefined) {
      return typeof value === 'number' && value > condition.greaterThan;
    }
    
    if (condition.lessThan !== undefined) {
      return typeof value === 'number' && value < condition.lessThan;
    }
    
    if (condition.contains !== undefined) {
      if (Array.isArray(value)) {
        return value.includes(condition.contains);
      }
      if (typeof value === 'string') {
        return value.includes(condition.contains);
      }
    }
    
    return false;
  }

  /**
   * Get nested property value
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => (current && current[key]) ? current[key] : undefined, obj);
  }
}

export default KnowledgeManager;