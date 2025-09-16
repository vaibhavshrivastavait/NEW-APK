import { InteractionManager } from 'react-native';
import treatmentRules from './treatmentPlanRules.json';

// Types for medicine-based treatment plan generation
export interface SelectedMedicine {
  id: string;
  name: string;
  type: string; // HRT_ESTROGEN, HRT_PROGESTOGEN, ANTIDEPRESSANT_SSRI, HERBAL_SUPPLEMENT, etc.
  category: string;
  dosage?: string;
  frequency?: string;
}

export interface PatientData {
  age?: number;
  gender?: string;
  personalHistoryBreastCancer?: boolean;
  personalHistoryDVT?: boolean;
  hypertension?: boolean;
  diabetes?: boolean;
  smoking?: boolean;
  liverDisease?: boolean;
  unexplainedVaginalBleeding?: boolean;
  currentMedications?: string[];
  allergies?: string[];
}

export interface TreatmentPlanOutput {
  id: string;
  generatedAt: string;
  patientId?: string;
  selectedMedicines: SelectedMedicine[];
  primaryRecommendations: RecommendationItem[];
  drugInteractionWarnings: InteractionWarning[];
  contraindicationAlerts: ContraindicationAlert[];
  alternativeTherapies: AlternativeTherapy[];
  rationale: RationaleItem[];
  monitoring: MonitoringItem[];
  references: string[];
  specialNotes: string[];
  isOfflineGenerated: boolean;
}

export interface RecommendationItem {
  id: string;
  type: 'START' | 'STOP' | 'MODIFY' | 'CONTINUE' | 'CONSIDER';
  medicine?: string;
  action: string;
  dosing?: string;
  rationale: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface InteractionWarning {
  id: string;
  severity: 'HIGH' | 'MODERATE' | 'LOW';
  medicine1: string;
  medicine2: string;
  description: string;
  clinicalAction: string;
  color: string;
}

export interface ContraindicationAlert {
  id: string;
  severity: 'ABSOLUTE' | 'RELATIVE';
  medicine: string;
  condition: string;
  description: string;
  recommendation: string;
  color: string;
}

export interface AlternativeTherapy {
  id: string;
  category: 'NON_HORMONAL' | 'LIFESTYLE' | 'HERBAL' | 'OTHER';
  name: string;
  description: string;
  evidenceLevel: 'HIGH' | 'MODERATE' | 'LOW' | 'LIMITED';
  suitability: string;
}

export interface RationaleItem {
  id: string;
  point: string;
  evidence: string;
  reference?: string;
}

export interface MonitoringItem {
  id: string;
  parameter: string;
  frequency: string;
  rationale: string;
  alertCriteria?: string;
}

class MedicineBasedTreatmentGenerator {
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getInteractionColor(severity: string): string {
    return treatmentRules.severityColors[severity as keyof typeof treatmentRules.severityColors] || '#666';
  }

  private checkInteractions(selectedMedicines: SelectedMedicine[]): InteractionWarning[] {
    const interactions: InteractionWarning[] = [];
    
    for (let i = 0; i < selectedMedicines.length; i++) {
      for (let j = i + 1; j < selectedMedicines.length; j++) {
        const med1 = selectedMedicines[i];
        const med2 = selectedMedicines[j];
        
        const interaction = this.findInteraction(med1.type, med2.type);
        if (interaction) {
          interactions.push({
            id: this.generateId(),
            severity: interaction.severity,
            medicine1: med1.name,
            medicine2: med2.name,
            description: interaction.warning,
            clinicalAction: this.getInteractionAction(interaction.severity),
            color: this.getInteractionColor(interaction.severity)
          });
        }
      }
    }
    
    return interactions;
  }

  private findInteraction(type1: string, type2: string): { severity: string; warning: string } | null {
    // Check interactions from rules
    const rules = treatmentRules.medicationInteractions;
    
    if (rules[type1 as keyof typeof rules]) {
      const med1Rules = rules[type1 as keyof typeof rules];
      if (med1Rules.interactsWith.includes(type2)) {
        return {
          severity: med1Rules.severity[type2 as keyof typeof med1Rules.severity],
          warning: med1Rules.warnings[type2 as keyof typeof med1Rules.warnings]
        };
      }
    }
    
    if (rules[type2 as keyof typeof rules]) {
      const med2Rules = rules[type2 as keyof typeof rules];
      if (med2Rules.interactsWith.includes(type1)) {
        return {
          severity: med2Rules.severity[type1 as keyof typeof med2Rules.severity],
          warning: med2Rules.warnings[type1 as keyof typeof med2Rules.warnings]
        };
      }
    }
    
    return null;
  }

  private getInteractionAction(severity: string): string {
    switch (severity) {
      case 'HIGH':
        return 'Avoid combination or monitor very closely';
      case 'MODERATE':
        return 'Monitor for interactions and adjust if needed';
      case 'LOW':
        return 'Monitor routinely';
      default:
        return 'Monitor as clinically appropriate';
    }
  }

  private checkContraindications(selectedMedicines: SelectedMedicine[], patientData: PatientData): ContraindicationAlert[] {
    const contraindications: ContraindicationAlert[] = [];
    
    selectedMedicines.forEach(medicine => {
      const medContraindications = this.findContraindications(medicine.type, patientData);
      contraindications.push(...medContraindications);
    });
    
    return contraindications;
  }

  private findContraindications(medicineType: string, patientData: PatientData): ContraindicationAlert[] {
    const alerts: ContraindicationAlert[] = [];
    const rules = treatmentRules.contraindications;
    
    if (rules[medicineType as keyof typeof rules]) {
      const medRules = rules[medicineType as keyof typeof rules];
      
      // Check absolute contraindications
      if (this.hasAbsoluteContraindication(patientData, medicineType)) {
        alerts.push({
          id: this.generateId(),
          severity: 'ABSOLUTE',
          medicine: medicineType,
          condition: 'Multiple risk factors present',
          description: 'Absolute contraindication detected based on patient history',
          recommendation: 'Do not initiate. Consider alternative therapy.',
          color: '#F44336'
        });
      }
      
      // Check relative contraindications
      const relativeContraindications = this.getRelativeContraindications(patientData, medicineType);
      relativeContraindications.forEach(condition => {
        alerts.push({
          id: this.generateId(),
          severity: 'RELATIVE',
          medicine: medicineType,
          condition: condition,
          description: 'Relative contraindication - increased risk',
          recommendation: 'Use with caution and enhanced monitoring',
          color: '#FF9800'
        });
      });
    }
    
    return alerts;
  }

  private hasAbsoluteContraindication(patientData: PatientData, medicineType: string): boolean {
    if (medicineType === 'HRT_ESTROGEN') {
      return !!(
        patientData.personalHistoryBreastCancer ||
        patientData.personalHistoryDVT ||
        patientData.liverDisease ||
        patientData.unexplainedVaginalBleeding
      );
    }
    return false;
  }

  private getRelativeContraindications(patientData: PatientData, medicineType: string): string[] {
    const conditions: string[] = [];
    
    if (medicineType === 'HRT_ESTROGEN') {
      if (patientData.hypertension) conditions.push('Hypertension');
      if (patientData.diabetes) conditions.push('Diabetes');
      if (patientData.smoking) conditions.push('Smoking');
    }
    
    return conditions;
  }

  private generateRecommendations(selectedMedicines: SelectedMedicine[], interactions: InteractionWarning[], contraindications: ContraindicationAlert[]): RecommendationItem[] {
    const recommendations: RecommendationItem[] = [];
    
    if (selectedMedicines.length === 0) {
      // No medications selected case
      recommendations.push({
        id: this.generateId(),
        type: 'CONSIDER',
        action: 'No medications currently selected for analysis',
        rationale: 'Evaluate symptoms and consider appropriate therapy options',
        priority: 'MEDIUM'
      });
      
      recommendations.push({
        id: this.generateId(),
        type: 'CONSIDER',
        action: 'Lifestyle modifications for menopause symptoms',
        rationale: 'First-line approach for mild to moderate symptoms',
        priority: 'HIGH'
      });
      
      return recommendations;
    }

    // Process each selected medicine
    selectedMedicines.forEach(medicine => {
      const hasAbsoluteContraindication = contraindications.some(
        contra => contra.medicine === medicine.type && contra.severity === 'ABSOLUTE'
      );
      
      const hasHighRiskInteraction = interactions.some(
        interaction => 
          (interaction.medicine1 === medicine.name || interaction.medicine2 === medicine.name) &&
          interaction.severity === 'HIGH'
      );

      if (hasAbsoluteContraindication) {
        recommendations.push({
          id: this.generateId(),
          type: 'STOP',
          medicine: medicine.name,
          action: `Do not initiate ${medicine.name} - absolute contraindication`,
          rationale: 'Absolute contraindication present based on patient risk factors',
          priority: 'HIGH'
        });
      } else if (hasHighRiskInteraction) {
        recommendations.push({
          id: this.generateId(),
          type: 'MODIFY',
          medicine: medicine.name,
          action: `Modify ${medicine.name} regimen or consider alternative`,
          rationale: 'High-risk drug interaction identified',
          priority: 'HIGH'
        });
      } else {
        recommendations.push({
          id: this.generateId(),
          type: 'CONTINUE',
          medicine: medicine.name,
          action: `Continue ${medicine.name} with appropriate monitoring`,
          dosing: medicine.dosage || 'As clinically appropriate',
          rationale: 'No major contraindications identified',
          priority: 'MEDIUM'
        });
      }
    });

    return recommendations;
  }

  private generateAlternatives(selectedMedicines: SelectedMedicine[], contraindications: ContraindicationAlert[]): AlternativeTherapy[] {
    const alternatives: AlternativeTherapy[] = [];
    
    // Standard non-hormonal alternatives
    alternatives.push({
      id: this.generateId(),
      category: 'NON_HORMONAL',   
      name: 'SSRIs/SNRIs',
      description: 'Low-dose antidepressants for vasomotor symptoms',
      evidenceLevel: 'HIGH',
      suitability: 'Suitable for patients with HRT contraindications'
    });

    alternatives.push({
      id: this.generateId(),
      category: 'LIFESTYLE',
      name: 'Cognitive Behavioral Therapy',
      description: 'Evidence-based psychological intervention for menopause symptoms',
      evidenceLevel: 'HIGH',  
      suitability: 'First-line for all patients'
    });

    alternatives.push({
      id: this.generateId(),
      category: 'LIFESTYLE',
      name: 'Regular Exercise Program',
      description: 'Structured physical activity program',
      evidenceLevel: 'MODERATE',
      suitability: 'Beneficial for overall health and symptom management'
    });

    // Add herbal alternatives if no contraindications
    const hasHerbalContraindications = contraindications.some(contra => 
      contra.medicine.includes('HERBAL')
    );

    if (!hasHerbalContraindications) {
      alternatives.push({
        id: this.generateId(),
        category: 'HERBAL',
        name: 'Black Cohosh',
        description: 'Herbal supplement for hot flashes',
        evidenceLevel: 'LIMITED',
        suitability: 'Limited evidence - discuss with healthcare provider'
      });
    }

    return alternatives;
  }

  private generateRationale(selectedMedicines: SelectedMedicine[], recommendations: RecommendationItem[]): RationaleItem[] {
    const rationale: RationaleItem[] = [];
    
    rationale.push({
      id: this.generateId(),
      point: 'Treatment recommendations based on current medication analysis',
      evidence: 'Guideline-driven assessment of selected medications',
      reference: 'IMS_2016'
    });

    if (selectedMedicines.some(med => med.type.includes('HRT'))) {
      rationale.push({
        id: this.generateId(),
        point: 'HRT recommendations follow international guidelines',
        evidence: 'Risk-benefit assessment based on individual patient factors',
        reference: 'NAMS_2017'
      });
    }

    if (selectedMedicines.some(med => med.type === 'HERBAL_SUPPLEMENT')) {
      rationale.push({
        id: this.generateId(),
        point: 'Herbal supplements have limited evidence base',
        evidence: 'Quality and consistency of herbal products variable',
        reference: 'WHO_2015'
      });
    }

    return rationale;
  }

  private generateMonitoring(selectedMedicines: SelectedMedicine[], interactions: InteractionWarning[]): MonitoringItem[] {
    const monitoring: MonitoringItem[] = [];
    
    // Standard monitoring
    monitoring.push({
      id: this.generateId(),
      parameter: 'Clinical symptoms',
      frequency: '3 months initially, then 6-monthly',
      rationale: 'Assess treatment effectiveness and side effects'
    });

    // Medicine-specific monitoring
    selectedMedicines.forEach(medicine => {
      if (medicine.type.includes('HRT')) {
        monitoring.push({
          id: this.generateId(),
          parameter: 'Mammography',
          frequency: 'Annually or as per national guidelines',
          rationale: 'Breast cancer screening for HRT users',
          alertCriteria: 'Any breast changes or concerning findings'
        });
      }

      if (medicine.type === 'ANTICOAGULANT') {
        monitoring.push({
          id: this.generateId(),
          parameter: 'INR/Bleeding parameters',
          frequency: 'As per anticoagulant protocol',
          rationale: 'Monitor for bleeding risk with hormonal therapy',
          alertCriteria: 'INR >4.0 or bleeding episodes'
        });
      }
    });

    // Interaction-based monitoring
    const highRiskInteractions = interactions.filter(i => i.severity === 'HIGH');
    if (highRiskInteractions.length > 0) {
      monitoring.push({
        id: this.generateId(),
        parameter: 'Drug interaction monitoring',
        frequency: 'More frequent initially (monthly)',
        rationale: 'High-risk interactions identified',
        alertCriteria: 'Any new symptoms or loss of medication effectiveness'
      });
    }

    return monitoring;
  }

  private generateSpecialNotes(selectedMedicines: SelectedMedicine[]): string[] {
    const notes: string[] = [];
    
    const herbalMeds = selectedMedicines.filter(med => med.type === 'HERBAL_SUPPLEMENT');
    if (herbalMeds.length > 0) {
      notes.push(treatmentRules.herbalSupplementNotes.general);
      notes.push("Inform all healthcare providers about herbal supplement use");
    }

    if (selectedMedicines.length > 3) {
      notes.push("Complex medication regimen - consider specialist referral");
    }

    notes.push("This is a decision-support tool - final prescribing decisions rest with the clinician");

    return notes;
  }

  public async generateTreatmentPlan(
    selectedMedicines: SelectedMedicine[],
    patientData: PatientData = {},
    patientId?: string
  ): Promise<TreatmentPlanOutput> {
    return new Promise((resolve, reject) => {
      InteractionManager.runAfterInteractions(() => {
        try {
          console.log('🔄 Generating treatment plan for medicines:', selectedMedicines.map(m => m.name));

          // Validate inputs
          const validatedMedicines = this.validateMedicines(selectedMedicines);
          
          // Generate plan components
          const interactions = this.checkInteractions(validatedMedicines);
          const contraindications = this.checkContraindications(validatedMedicines, patientData);
          const recommendations = this.generateRecommendations(validatedMedicines, interactions, contraindications);
          const alternatives = this.generateAlternatives(validatedMedicines, contraindications);
          const rationale = this.generateRationale(validatedMedicines, recommendations);
          const monitoring = this.generateMonitoring(validatedMedicines, interactions);
          const specialNotes = this.generateSpecialNotes(validatedMedicines);

          const treatmentPlan: TreatmentPlanOutput = {
            id: this.generateId(),
            generatedAt: new Date().toISOString(),
            patientId,
            selectedMedicines: validatedMedicines,
            primaryRecommendations: recommendations,
            drugInteractionWarnings: interactions,
            contraindicationAlerts: contraindications,
            alternativeTherapies: alternatives,
            rationale: rationale,
            monitoring: monitoring,
            references: Object.values(treatmentRules.guidelineReferences),
            specialNotes: specialNotes,
            isOfflineGenerated: true
          };

          console.log('✅ Treatment plan generated successfully');
          resolve(treatmentPlan);

        } catch (error) {
          console.error('❌ Error generating treatment plan:', error);
          reject(error);
        }
      });
    });
  }

  private validateMedicines(medicines: SelectedMedicine[]): SelectedMedicine[] {
    return medicines.map(medicine => ({
      ...medicine,
      id: medicine.id || this.generateId(),
      name: medicine.name || 'Unknown medication',
      type: medicine.type || 'UNKNOWN',
      category: medicine.category || 'UNKNOWN'
    }));
  }

  // Test cases for validation
  public async generateTestCase(testCase: string): Promise<TreatmentPlanOutput> {
    const testData = this.getTestCaseData(testCase);
    return this.generateTreatmentPlan(testData.medicines, testData.patientData);
  }

  private getTestCaseData(testCase: string): { medicines: SelectedMedicine[]; patientData: PatientData } {
    switch (testCase) {
      case 'A': // No meds selected
        return {
          medicines: [],
          patientData: { age: 52, gender: 'female' }
        };

      case 'B': // Single HRT med
        return {
          medicines: [{
            id: 'test-hrt-1',
            name: 'Estradiol patch',
            type: 'HRT_ESTROGEN',
            category: 'HORMONE',
            dosage: '0.025mg twice weekly'
          }],
          patientData: { age: 52, gender: 'female' }
        };

      case 'C': // HRT + anticoagulant
        return {
          medicines: [
            {
              id: 'test-hrt-2',
              name: 'Estradiol gel',
              type: 'HRT_ESTROGEN',
              category: 'HORMONE'
            },
            {
              id: 'test-anticoag-1',
              name: 'Warfarin',
              type: 'ANTICOAGULANT',
              category: 'CARDIOVASCULAR'
            }
          ],
          patientData: { age: 55, gender: 'female' }
        };

      case 'D': // Herbal supplement
        return {
          medicines: [{
            id: 'test-herbal-1',
            name: 'Black Cohosh',
            type: 'HERBAL_SUPPLEMENT',
            category: 'HERBAL'
          }],
          patientData: { age: 50, gender: 'female' }
        };

      case 'E': // Unknown med
        return {
          medicines: [{
            id: 'test-unknown-1',
            name: 'Unknown medication xyz',
            type: 'UNKNOWN',
            category: 'UNKNOWN'
          }],
          patientData: { age: 53, gender: 'female' }
        };

      default:
        return {
          medicines: [],
          patientData: {}
        };
    }
  }
}

export default new MedicineBasedTreatmentGenerator();