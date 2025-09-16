/**
 * Drug Interaction Checker for MHT Assessment App
 * Focuses on HRT-specific interactions and contraindications
 * Designed for offline local computation without external API dependencies
 */

import { PatientData } from '../store/assessmentStore';

// Medication categories and common drugs
export interface Medication {
  name: string;
  category: string;
  genericName?: string;
  brandNames?: string[];
}

export interface InteractionAlert {
  severity: 'contraindication' | 'major' | 'moderate' | 'minor';
  message: string;
  recommendation: string;
  medications: string[];
}

export interface ContraindicationAlert {
  type: 'absolute' | 'relative';
  condition: string;
  message: string;
  recommendation: string;
}

// Common HRT medications
export const HRT_MEDICATIONS: Medication[] = [
  // Estrogens
  { name: 'Estradiol', category: 'estrogen', brandNames: ['Estrace', 'Climara', 'Vivelle'] },
  { name: 'Conjugated Estrogens', category: 'estrogen', brandNames: ['Premarin'] },
  { name: 'Estradiol Valerate', category: 'estrogen', brandNames: ['Progynova'] },
  { name: 'Estrone', category: 'estrogen' },
  
  // Progestogens
  { name: 'Micronized Progesterone', category: 'progestogen', brandNames: ['Prometrium', 'Utrogestan'] },
  { name: 'Medroxyprogesterone', category: 'progestogen', brandNames: ['Provera'] },
  { name: 'Norethisterone', category: 'progestogen', brandNames: ['Norethindrone'] },
  { name: 'Levonorgestrel IUS', category: 'progestogen', brandNames: ['Mirena'] },
  
  // Combined preparations
  { name: 'Estradiol/Norethisterone', category: 'combined-hrt', brandNames: ['Kliogest', 'Activelle'] },
  { name: 'Estradiol/Levonorgestrel', category: 'combined-hrt' },
  
  // Tibolone
  { name: 'Tibolone', category: 'synthetic-steroid', brandNames: ['Livial'] }
];

// Medications that interact with HRT
export const INTERACTING_MEDICATIONS: Medication[] = [
  // Anticoagulants
  { name: 'Warfarin', category: 'anticoagulant', brandNames: ['Coumadin'] },
  { name: 'Rivaroxaban', category: 'anticoagulant', brandNames: ['Xarelto'] },
  { name: 'Apixaban', category: 'anticoagulant', brandNames: ['Eliquis'] },
  { name: 'Dabigatran', category: 'anticoagulant', brandNames: ['Pradaxa'] },
  
  // Enzyme inducers
  { name: 'Carbamazepine', category: 'anticonvulsant', brandNames: ['Tegretol'] },
  { name: 'Phenytoin', category: 'anticonvulsant', brandNames: ['Dilantin'] },
  { name: 'Phenobarbital', category: 'anticonvulsant' },
  { name: 'Rifampin', category: 'antibiotic', brandNames: ['Rifadin'] },
  { name: 'St John\'s Wort', category: 'herbal' },
  
  // Corticosteroids
  { name: 'Prednisolone', category: 'corticosteroid' },
  { name: 'Dexamethasone', category: 'corticosteroid' },
  
  // Thyroid medications
  { name: 'Levothyroxine', category: 'thyroid', brandNames: ['Synthroid', 'Levoxyl'] },
  
  // Diabetes medications
  { name: 'Insulin', category: 'diabetes' },
  { name: 'Metformin', category: 'diabetes', brandNames: ['Glucophage'] },
  
  // Antihypertensives
  { name: 'ACE Inhibitors', category: 'antihypertensive' },
  { name: 'Calcium Channel Blockers', category: 'antihypertensive' },
  
  // Statins
  { name: 'Atorvastatin', category: 'statin', brandNames: ['Lipitor'] },
  { name: 'Simvastatin', category: 'statin', brandNames: ['Zocor'] }
];

/**
 * Medicine type interface for conditional display
 */
export interface MedicineType {
  id: string;
  name: string;
  description: string;
  category: 'hormonal' | 'herbal' | 'non_hormonal';
  hasContraindications: boolean;
  riskLevel: 'low' | 'moderate' | 'high';
}

/**
 * Available medicine types for selection - EXPANDED LIST
 */
export const MEDICINE_TYPES: MedicineType[] = [
  {
    id: 'hormone_replacement_therapy',
    name: 'Hormone Replacement Therapy (HRT)',
    description: 'Estrogen and/or progesterone therapy for menopausal symptoms',
    category: 'hormonal',
    hasContraindications: true,
    riskLevel: 'moderate'
  },
  {
    id: 'selective_estrogen_modulators',
    name: 'Selective Estrogen Receptor Modulators (SERMs)',
    description: 'Raloxifene, Tamoxifen - selective estrogen-like effects',
    category: 'hormonal',
    hasContraindications: true,
    riskLevel: 'moderate'
  },
  {
    id: 'tibolone',
    name: 'Tibolone',
    description: 'Synthetic steroid with estrogenic, progestogenic, and androgenic properties',
    category: 'hormonal',
    hasContraindications: true,
    riskLevel: 'moderate'
  },
  {
    id: 'antidepressants',
    name: 'Antidepressants (SSRIs/SNRIs)',
    description: 'Paroxetine, Venlafaxine, Escitalopram for menopausal symptoms',
    category: 'non_hormonal',
    hasContraindications: true,
    riskLevel: 'moderate'
  },
  {
    id: 'anticonvulsants_menopause',
    name: 'Anticonvulsants for Menopause',
    description: 'Gabapentin, Pregabalin for hot flashes and mood',
    category: 'non_hormonal',
    hasContraindications: true,
    riskLevel: 'low'
  },
  {
    id: 'blood_pressure_menopause',
    name: 'Clonidine & Other Antihypertensives',
    description: 'Clonidine for hot flashes, other blood pressure medications',
    category: 'non_hormonal',
    hasContraindications: true,
    riskLevel: 'low'
  },
  {
    id: 'herbal_estrogens',
    name: 'Herbal Estrogen Supplements',
    description: 'Phytoestrogens, Black Cohosh, Red Clover, Soy Isoflavones',
    category: 'herbal',
    hasContraindications: false,
    riskLevel: 'low'
  },
  {
    id: 'herbal_general',
    name: 'General Herbal Supplements',
    description: 'St. John\'s Wort, Ginkgo, Ginseng, Evening Primrose Oil',
    category: 'herbal',
    hasContraindications: false,
    riskLevel: 'low'
  },
  {
    id: 'complementary_therapies',
    name: 'Complementary & Alternative Therapies',
    description: 'Acupuncture, Yoga, Mindfulness, Dietary supplements',
    category: 'non_hormonal',
    hasContraindications: false,
    riskLevel: 'low'
  },
  {
    id: 'bisphosphonates',
    name: 'Bisphosphonates',
    description: 'Alendronate, Risedronate for osteoporosis prevention',
    category: 'non_hormonal',
    hasContraindications: true,
    riskLevel: 'low'
  }
];

/**
 * Medication category interface
 */
export interface MedicationCategory {
  id: string;
  name: string;
  description: string;
  examples: string[];
  interactions: DrugInteractionInfo[];
}

/**
 * Drug interaction information interface
 */
export interface DrugInteractionInfo {
  severity: 'low' | 'moderate' | 'high';
  message: string;
  recommendation: string;
  source: string;
  affectsContraindications?: boolean;
  modifiesRisk?: 'increases' | 'decreases';
}

/**
 * Predefined medication categories for interaction checking
 */
export const MEDICATION_CATEGORIES: MedicationCategory[] = [
  {
    id: 'anticoagulants',
    name: 'Anticoagulants (Blood Thinners)',
    description: 'Medications that prevent blood clotting',
    examples: ['Warfarin', 'Rivaroxaban', 'Apixaban', 'Dabigatran'],
    interactions: [{
      severity: 'high',
      message: 'HRT may alter anticoagulant metabolism and increase bleeding risk',
      recommendation: 'Monitor INR/bleeding parameters closely and adjust dose as needed',
      source: 'https://www.fda.gov/drugs/drug-interactions-labeling/drug-development-and-drug-interactions-table-substrates-inhibitors-and-inducers',
      affectsContraindications: true,
      modifiesRisk: 'increases'
    }]
  },
  {
    id: 'anticonvulsants',
    name: 'Anticonvulsants (Seizure Medications)',
    description: 'Medications used to treat epilepsy and seizures',
    examples: ['Phenytoin', 'Carbamazepine', 'Phenobarbital', 'Valproate'],
    interactions: [{
      severity: 'moderate',
      message: 'Anticonvulsants may reduce effectiveness of estrogen through enzyme induction',
      recommendation: 'Consider alternative anticonvulsant or higher HRT dose with close monitoring',
      source: 'https://reference.medscape.com/drug-interactionchecker',
      modifiesRisk: 'decreases'
    }]
  },
  {
    id: 'antibiotics',
    name: 'Antibiotics (Broad-spectrum)',
    description: 'Antibiotics that may affect hormone levels',
    examples: ['Rifampin', 'Rifabutin', 'Griseofulvin'],
    interactions: [{
      severity: 'moderate',
      message: 'Some antibiotics may reduce HRT effectiveness through enzyme induction',
      recommendation: 'Monitor HRT effectiveness and consider temporary dose adjustment',
      source: 'https://reference.medscape.com/drug-interactionchecker'
    }]
  },
  {
    id: 'proton_pump_inhibitors',
    name: 'Proton Pump Inhibitors (PPIs)',
    description: 'Medications for acid reflux and stomach ulcers',
    examples: ['Omeprazole', 'Lansoprazole', 'Esomeprazole', 'Pantoprazole'],
    interactions: [{
      severity: 'low',
      message: 'May affect estrogen absorption due to altered gastric pH',
      recommendation: 'Take HRT 2 hours before or after PPI administration',
      source: 'https://reference.medscape.com/drug-interactionchecker'
    }]
  },
  {
    id: 'antifungals',
    name: 'Antifungal Medications',
    description: 'Medications used to treat fungal infections',
    examples: ['Fluconazole', 'Ketoconazole', 'Itraconazole'],
    interactions: [{
      severity: 'moderate',
      message: 'May increase estrogen levels by inhibiting metabolism',
      recommendation: 'Monitor for increased estrogen effects and consider dose reduction',
      source: 'https://reference.medscape.com/drug-interactionchecker',
      modifiesRisk: 'increases'
    }]
  },
  {
    id: 'herbal_supplements',
    name: 'Herbal Supplements',
    description: 'Natural supplements that may interact with hormones',
    examples: ['St. John\'s Wort', 'Ginkgo Biloba', 'Ginseng'],
    interactions: [{
      severity: 'moderate',
      message: 'St. John\'s Wort may reduce HRT effectiveness through enzyme induction',
      recommendation: 'Avoid concurrent use or monitor HRT effectiveness closely',
      source: 'https://www.fda.gov/consumers/consumer-updates/drug-interactions-what-you-should-know'
    }]
  },
  {
    id: 'thyroid_medications',
    name: 'Thyroid Medications',
    description: 'Medications for thyroid disorders',
    examples: ['Levothyroxine', 'Liothyronine', 'Methimazole'],
    interactions: [{
      severity: 'moderate',
      message: 'HRT may increase thyroid-binding proteins, requiring dose adjustment',
      recommendation: 'Monitor thyroid function tests and adjust thyroid medication dose if needed',
      source: 'https://www.endocrine.org/guidelines-and-clinical-practice/clinical-practice-guidelines'
    }]
  },
  {
    id: 'diabetes_medications',
    name: 'Diabetes Medications',
    description: 'Medications used to control blood sugar',
    examples: ['Metformin', 'Insulin', 'Sulfonylureas', 'SGLT2 inhibitors'],
    interactions: [{
      severity: 'low',
      message: 'HRT may affect glucose metabolism and insulin sensitivity',
      recommendation: 'Monitor blood glucose levels more frequently when starting HRT',
      source: 'https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2014/01/hormone-therapy',
      modifiesRisk: 'increases'
    }]
  },
  {
    id: 'blood_pressure_medications',
    name: 'Blood Pressure Medications',
    description: 'Medications for hypertension management',
    examples: ['ACE inhibitors', 'ARBs', 'Beta blockers', 'Calcium channel blockers'],
    interactions: [{
      severity: 'low',
      message: 'HRT may have mild effects on blood pressure control',
      recommendation: 'Monitor blood pressure regularly and adjust antihypertensive therapy if needed',
      source: 'https://www.nice.org.uk/guidance/ng23'
    }]
  },
  {
    id: 'cholesterol_medications',
    name: 'Cholesterol Medications (Statins)',
    description: 'Medications used to lower cholesterol',
    examples: ['Atorvastatin', 'Simvastatin', 'Rosuvastatin', 'Pravastatin'],
    interactions: [{
      severity: 'low',
      message: 'Generally compatible with HRT, may have synergistic cardiovascular benefits',
      recommendation: 'Continue statin therapy, monitor lipid profile periodically',
      source: 'https://www.endocrine.org/guidelines-and-clinical-practice/clinical-practice-guidelines'
    }]
  }
];

/**
 * Check for drug interactions with HRT
 */
export function checkDrugInteractions(hrtMedications: string[], otherMedications: string[]): InteractionAlert[] {
  const alerts: InteractionAlert[] = [];
  
  for (const hrt of hrtMedications) {
    for (const other of otherMedications) {
      const interaction = getInteraction(hrt, other);
      if (interaction) {
        alerts.push(interaction);
      }
    }
  }
  
  return alerts;
}

/**
 * Get specific interaction between two medications
 */
function getInteraction(hrtMed: string, otherMed: string): InteractionAlert | null {
  const hrtLower = hrtMed.toLowerCase();
  const otherLower = otherMed.toLowerCase();
  
  // Anticoagulant interactions
  if (isAnticoagulant(otherLower)) {
    return {
      severity: 'major',
      message: `${otherMed} may interact with ${hrtMed}. Estrogens can increase clotting factors and reduce anticoagulant effectiveness.`,
      recommendation: 'Monitor INR/clotting parameters closely. Consider dose adjustment of anticoagulant.',
      medications: [hrtMed, otherMed]
    };
  }
  
  // Enzyme inducer interactions
  if (isEnzymeInducer(otherLower)) {
    return {
      severity: 'moderate',
      message: `${otherMed} may reduce the effectiveness of ${hrtMed} by increasing hepatic metabolism.`,
      recommendation: 'Monitor for reduced HRT efficacy. Consider higher HRT dose or alternative route (transdermal).',
      medications: [hrtMed, otherMed]
    };
  }
  
  // Thyroid medication interactions
  if (isThyroidMedication(otherLower)) {
    return {
      severity: 'moderate',
      message: `${hrtMed} may increase thyroid-binding globulin, potentially requiring adjustment of ${otherMed} dose.`,
      recommendation: 'Monitor TSH levels. May need to increase thyroid medication dose.',
      medications: [hrtMed, otherMed]
    };
  }
  
  // Corticosteroid interactions
  if (isCorticosteroid(otherLower)) {
    return {
      severity: 'moderate',
      message: `Concurrent use of ${hrtMed} and ${otherMed} may increase risk of thromboembolism.`,
      recommendation: 'Monitor for signs of VTE. Consider thromboprophylaxis if prolonged corticosteroid use.',
      medications: [hrtMed, otherMed]
    };
  }
  
  // Diabetes medication interactions
  if (isDiabetesMedication(otherLower)) {
    return {
      severity: 'minor',
      message: `${hrtMed} may affect glucose tolerance and insulin sensitivity.`,
      recommendation: 'Monitor blood glucose levels more frequently. May need adjustment of diabetes medication.',
      medications: [hrtMed, otherMed]
    };
  }
  
  return null;
}

// Helper functions to identify medication categories
function isAnticoagulant(med: string): boolean {
  const anticoagulants = ['warfarin', 'coumadin', 'rivaroxaban', 'xarelto', 'apixaban', 'eliquis', 'dabigatran', 'pradaxa'];
  return anticoagulants.some(ac => med.includes(ac));
}

function isEnzymeInducer(med: string): boolean {
  const inducers = ['carbamazepine', 'tegretol', 'phenytoin', 'dilantin', 'phenobarbital', 'rifampin', 'rifadin', 'st john', 'hypericum'];
  return inducers.some(ind => med.includes(ind));
}

function isThyroidMedication(med: string): boolean {
  const thyroid = ['levothyroxine', 'synthroid', 'levoxyl', 'thyroxine'];
  return thyroid.some(thy => med.includes(thy));
}

function isCorticosteroid(med: string): boolean {
  const steroids = ['prednisolone', 'prednisone', 'dexamethasone', 'methylprednisolone', 'hydrocortisone'];
  return steroids.some(ster => med.includes(ster));
}

function isDiabetesMedication(med: string): boolean {
  const diabetes = ['insulin', 'metformin', 'glucophage', 'glipizide', 'glyburide'];
  return diabetes.some(diab => med.includes(diab));
}

/**
 * Check for HRT contraindications based on patient data
 */
export function checkHRTContraindications(patientData: any): ContraindicationAlert[] {
  const alerts: ContraindicationAlert[] = [];
  
  // Absolute contraindications
  if (patientData.personalHistoryBreastCancer) {
    alerts.push({
      type: 'absolute',
      condition: 'Personal History of Breast Cancer',
      message: 'HRT is absolutely contraindicated in patients with a personal history of breast cancer.',
      recommendation: 'Consider non-hormonal alternatives for menopausal symptoms. Consult oncology if needed.'
    });
  }
  
  if (patientData.personalHistoryDVT) {
    alerts.push({
      type: 'absolute',
      condition: 'Personal History of VTE',
      message: 'HRT is contraindicated due to previous venous thromboembolism.',
      recommendation: 'Consider transdermal estrogen with caution only if benefits clearly outweigh risks. Anticoagulation may be needed.'
    });
  }
  
  if (patientData.thrombophilia) {
    alerts.push({
      type: 'absolute',
      condition: 'Known Thrombophilia',
      message: 'HRT is contraindicated in patients with inherited thrombophilia.',
      recommendation: 'Refer to hematology. Non-hormonal therapies strongly preferred.'
    });
  }
  
  // Relative contraindications (warnings)
  if (patientData.familyHistoryBreastCancer) {
    alerts.push({
      type: 'relative',
      condition: 'Family History of Breast Cancer',
      message: 'Strong family history of breast cancer increases risk with HRT use.',
      recommendation: 'Discuss risks/benefits carefully. Consider genetic counseling. Enhanced surveillance recommended.'
    });
  }
  
  if (patientData.bmi && patientData.bmi > 35) {
    alerts.push({
      type: 'relative',
      condition: 'Severe Obesity',
      message: 'BMI >35 increases VTE risk with oral HRT.',
      recommendation: 'Prefer transdermal route. Weight reduction counseling. Consider non-hormonal alternatives.'
    });
  }
  
  if (patientData.smoking) {
    alerts.push({
      type: 'relative',
      condition: 'Current Smoking',
      message: 'Smoking increases cardiovascular and VTE risks with HRT.',
      recommendation: 'Smoking cessation counseling essential. Consider transdermal route if HRT used.'
    });
  }
  
  if (patientData.hypertension) {
    alerts.push({
      type: 'relative',
      condition: 'Hypertension',
      message: 'Uncontrolled hypertension may increase cardiovascular risk with HRT.',
      recommendation: 'Ensure optimal BP control before initiating HRT. Monitor closely.'
    });
  }
  
  if (patientData.diabetes) {
    alerts.push({
      type: 'relative',
      condition: 'Diabetes Mellitus',
      message: 'Diabetes increases cardiovascular risk; HRT effects on glucose metabolism variable.',
      recommendation: 'Monitor glucose control closely. Prefer transdermal route. Optimize diabetes management.'
    });
  }
  
  return alerts;
}

/**
 * Drug interaction result interface
 */
export interface DrugInteractionResult {
  medication: string;
  severity: 'low' | 'moderate' | 'high';
  message: string;
  recommendation: string;
  source: string;
}

/**
 * Check for drug interactions based on selected medication categories
 */
export const checkCategoryDrugInteractions = (selectedCategoryIds: string[]): DrugInteractionResult[] => {
  const interactions: DrugInteractionResult[] = [];
  
  selectedCategoryIds.forEach(categoryId => {
    const category = MEDICATION_CATEGORIES.find(cat => cat.id === categoryId);
    if (category) {
      category.interactions.forEach(interaction => {
        // Use specific medicine names from examples instead of category name
        const medicineNames = category.examples && category.examples.length > 0 
          ? category.examples.slice(0, 2).join(', ') // Show first 2 medicines as examples
          : category.name; // Fallback to category name if no examples
        
        interactions.push({
          medication: medicineNames,
          severity: interaction.severity,
          message: interaction.message,
          recommendation: interaction.recommendation,
          source: interaction.source
        });
      });
    }
  });
  
  return interactions;
};

/**
 * Get enhanced contraindications based on selected medications
 */
export const getEnhancedContraindications = (
  patient: PatientData, 
  selectedMedicationCategories: string[]
): ContraindicationAlert[] => {
  // Get base contraindications
  const baseContraindications = checkHRTContraindications(patient);
  
  // Add medication-related contraindications
  const medicationContraindications: ContraindicationAlert[] = [];
  
  selectedMedicationCategories.forEach(categoryId => {
    const category = MEDICATION_CATEGORIES.find(cat => cat.id === categoryId);
    if (category) {
      category.interactions.forEach(interaction => {
        if (interaction.affectsContraindications && interaction.severity === 'high') {
          medicationContraindications.push({
            type: 'relative', // Medication interactions are typically relative contraindications
            condition: `Current use of ${category.name}`,
            message: interaction.message,
            recommendation: `${interaction.recommendation}. Consider specialist consultation.`
          });
        }
      });
    }
  });
  
  return [...baseContraindications, ...medicationContraindications];
};

/**
 * Get medication-adjusted treatment recommendations
 */
export const getMedicationAdjustedRecommendations = (
  patient: PatientData,
  contraindications: ContraindicationAlert[],
  selectedMedicationCategories: string[]
): TreatmentRecommendation[] => {
  const baseRecommendations = getPersonalizedTreatmentRecommendations(patient, contraindications);
  
  // Modify recommendations based on medication interactions
  const hasHighRiskMedications = selectedMedicationCategories.some(categoryId => {
    const category = MEDICATION_CATEGORIES.find(cat => cat.id === categoryId);
    return category?.interactions.some(int => int.severity === 'high');
  });
  
  const hasModerateRiskMedications = selectedMedicationCategories.some(categoryId => {
    const category = MEDICATION_CATEGORIES.find(cat => cat.id === categoryId);
    return category?.interactions.some(int => int.severity === 'moderate');
  });
  
  if (hasHighRiskMedications) {
    // Add high-risk medication considerations
    baseRecommendations.push({
      category: 'caution',
      title: 'High-Risk Medication Interactions',
      description: 'Current medications require careful monitoring with HRT.',
      options: [
        'Specialist consultation recommended',
        'Enhanced monitoring protocols',
        'Consider medication timing adjustments',
        'Alternative HRT formulations may be needed'
      ],
      source: 'https://www.fda.gov/drugs/drug-interactions-labeling/drug-development-and-drug-interactions-table-substrates-inhibitors-and-inducers'
    });
  } else if (hasModerateRiskMedications) {
    // Add moderate-risk medication considerations
    baseRecommendations.push({
      category: 'caution',
      title: 'Moderate Medication Interactions',
      description: 'Some current medications may interact with HRT.',
      options: [
        'Regular monitoring recommended',
        'Consider dose adjustments',
        'Monitor for effectiveness changes',
        'Review medication timing'
      ],
      source: 'https://reference.medscape.com/drug-interactionchecker'
    });
  }
  
  return baseRecommendations;
};

/**
 * Get medication-specific alternative therapies
 */
export const getMedicationSpecificAlternatives = (
  selectedMedicationCategories: string[]
): AlternativeTherapy[] => {
  const baseAlternatives = getAlternativeTherapies();
  
  // Add medication-specific considerations
  const additionalAlternatives: AlternativeTherapy[] = [];
  
  if (selectedMedicationCategories.includes('anticoagulants')) {
    additionalAlternatives.push({
      category: 'medication',
      title: 'Non-Hormonal Options for Anticoagulant Users',
      description: 'Safer alternatives for patients on blood thinners',
      evidence: 'Reduced bleeding risk compared to systemic HRT',
      source: 'https://www.nice.org.uk/guidance/ng23'
    });
  }
  
  if (selectedMedicationCategories.includes('anticonvulsants')) {
    additionalAlternatives.push({
      category: 'medication',
      title: 'Seizure-Safe Menopause Management',
      description: 'Options that don\'t interfere with seizure control',
      evidence: 'No interaction with antiepileptic drugs',
      source: 'https://www.epilepsy.org.uk'
    });
  }
  
  return [...baseAlternatives, ...additionalAlternatives];
};

/**
 * Get contraindications specific to selected medicine type
 */
export const getMedicineTypeContraindications = (
  patient: PatientData,
  medicineTypeId: string
): ContraindicationAlert[] => {
  const medicineType = MEDICINE_TYPES.find(m => m.id === medicineTypeId);
  if (!medicineType || !medicineType.hasContraindications) {
    return [];
  }
  
  const contraindications: ContraindicationAlert[] = [];
  
  switch (medicineTypeId) {
    case 'hormone_replacement_therapy':
    case 'selective_estrogen_modulators':
      // Get standard HRT contraindications
      return checkHRTContraindications(patient);
      
    case 'antidepressants':
      if (patient.personalHistoryBreastCancer) {
        contraindications.push({
          type: 'relative',
          condition: 'History of Breast Cancer',
          message: 'Some antidepressants may interact with breast cancer treatments',
          recommendation: 'Consult oncologist before starting. Avoid drugs that inhibit CYP2D6.'
        });
      }
      break;
      
    case 'anticonvulsants_menopause':
      if (patient.personalHistoryDVT) {
        contraindications.push({
          type: 'relative',
          condition: 'History of Blood Clots',
          message: 'Monitor for potential bleeding interactions',
          recommendation: 'Regular monitoring if on anticoagulants'
        });
      }
      break;
      
    case 'blood_pressure_menopause':
      if (patient.hypertension) {
        contraindications.push({
          type: 'relative',
          condition: 'Existing Hypertension',
          message: 'Additional blood pressure medications require careful monitoring',
          recommendation: 'Regular BP monitoring and dose adjustment may be needed'
        });
      }
      break;
  }
  
  return contraindications;
};

/**
 * Get medicine-type-specific treatment recommendations
 */
export const getMedicineTypeRecommendations = (
  patient: PatientData,
  medicineTypeId: string,
  contraindications: ContraindicationAlert[]
): TreatmentRecommendation[] => {
  const medicineType = MEDICINE_TYPES.find(m => m.id === medicineTypeId);
  if (!medicineType) return [];
  
  const recommendations: TreatmentRecommendation[] = [];
  const hasContraindications = contraindications.length > 0;
  
  switch (medicineTypeId) {
    case 'hormone_replacement_therapy':
      if (!hasContraindications) {
        recommendations.push({
          category: 'recommended',
          title: 'HRT Appropriate',
          description: 'Hormone replacement therapy may be suitable for this patient.',
          options: [
            'Estrogen-only (if hysterectomy) or combined therapy',
            'Consider transdermal route if VTE risk factors',
            'Start with lowest effective dose',
            'Regular follow-up every 3-6 months'
          ],
          source: 'https://www.nice.org.uk/guidance/ng23'
        });
      } else {
        recommendations.push({
          category: 'not_recommended',
          title: 'HRT Not Recommended',
          description: 'Contraindications present for hormone replacement therapy.',
          options: [
            'Consider non-hormonal alternatives',
            'Specialist consultation recommended',
            'Address modifiable risk factors'
          ],
          source: 'https://www.nice.org.uk/guidance/ng23'
        });
      }
      break;
      
    case 'herbal_estrogens':
      recommendations.push({
        category: 'caution',
        title: 'Herbal Estrogens - Use with Caution',
        description: 'Limited evidence for efficacy and safety of herbal estrogens.',
        options: [
          'Discuss with healthcare provider before use',
          'Monitor for estrogenic effects',
          'Quality and potency may vary between products',
          'May interact with other medications'
        ],
        source: 'https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD001395.pub4/full'
      });
      break;
      
    case 'antidepressants':
      if (!hasContraindications) {
        recommendations.push({
          category: 'recommended',
          title: 'Antidepressants for Menopause',
          description: 'Evidence-based non-hormonal option for menopausal symptoms.',
          options: [
            'Paroxetine 7.5mg daily effective for hot flashes',
            'Venlafaxine 37.5-75mg daily for vasomotor symptoms',
            'Monitor for side effects and drug interactions',
            'Gradual dose titration recommended'
          ],
          source: 'https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2014/01/hormone-therapy'
        });
      }
      break;
  }
  
  return recommendations;
};

/**
 * Get alternatives specific to medicine type
 */
export const getMedicineTypeAlternatives = (
  medicineTypeId: string,
  showWhenContraindicated: boolean = false
): AlternativeTherapy[] => {
  const medicineType = MEDICINE_TYPES.find(m => m.id === medicineTypeId);
  if (!medicineType) return [];
  
  // Show alternatives when medicine is contraindicated or not recommended
  if (!showWhenContraindicated) return [];
  
  const alternatives: AlternativeTherapy[] = [];
  
  switch (medicineType.category) {
    case 'hormonal':
      alternatives.push(
        {
          category: 'medication',
          title: 'Non-Hormonal Medications',
          description: 'SSRIs, SNRIs, Gabapentin, Clonidine for symptom management',
          evidence: 'Proven efficacy for hot flashes and mood symptoms',
          source: 'https://www.nice.org.uk/guidance/ng23'
        },
        {
          category: 'lifestyle',
          title: 'Lifestyle Modifications',
          description: 'Diet, exercise, stress management, cooling techniques',
          evidence: 'Evidence-based approaches for symptom relief',
          source: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity'
        }
      );
      break;
      
    case 'herbal':
      alternatives.push(
        {
          category: 'medication',
          title: 'Prescription Alternatives',
          description: 'FDA-approved medications with proven efficacy',
          evidence: 'Clinical trial evidence superior to herbal options',
          source: 'https://www.fda.gov/drugs/drug-safety-and-availability/fda-approved-drug-products'
        }
      );
      break;
      
    case 'non_hormonal':
      alternatives.push(
        {
          category: 'psychological',
          title: 'Cognitive Behavioral Therapy',
          description: 'CBT specifically designed for menopause management',
          evidence: 'Strong evidence for improving quality of life',
          source: 'https://www.nice.org.uk/guidance/ng23'
        }
      );
      break;
  }
  
  return alternatives;
};

/**
 * Treatment recommendation interface
 */
export interface TreatmentRecommendation {
  category: 'recommended' | 'caution' | 'not_recommended';
  title: string;
  description: string;
  options: string[];
  source: string;
}

/**
 * Generate personalized treatment recommendations
 */
export const getPersonalizedTreatmentRecommendations = (
  patient: PatientData,
  contraindications: ContraindicationAlert[]
): TreatmentRecommendation[] => {
  const recommendations: TreatmentRecommendation[] = [];
  
  // Determine risk level
  const hasAbsoluteContraindications = contraindications.some(c => c.type === 'absolute');
  const hasRelativeContraindications = contraindications.some(c => c.type === 'relative');
  
  if (hasAbsoluteContraindications) {
    // High risk - HRT not recommended
    recommendations.push({
      category: 'not_recommended',
      title: 'HRT Not Recommended',
      description: 'Absolute contraindications present. HRT is not recommended for this patient.',
      options: [
        'Non-hormonal therapies recommended',
        'Lifestyle modifications',
        'Specialist consultation required'
      ],
      source: 'https://www.nice.org.uk/guidance/ng23'
    });
  } else if (hasRelativeContraindications) {
    // Moderate risk - HRT with caution
    recommendations.push({
      category: 'caution',
      title: 'HRT with Caution',
      description: 'Relative contraindications present. Careful risk-benefit analysis required.',
      options: [
        'Low-dose transdermal estrogen',
        'Close monitoring required',
        'Regular review appointments',
        'Consider alternative therapies'
      ],
      source: 'https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2014/01/hormone-therapy'
    });
  } else {
    // Low risk - HRT may be appropriate
    const age = patient.age || 50;
    
    if (age < 60) {
      recommendations.push({
        category: 'recommended',
        title: 'HRT May Be Appropriate',
        description: 'No contraindications identified. HRT may provide benefits for menopausal symptoms.',
        options: [
          'Standard-dose HRT options available',
          'Oral or transdermal routes',
          'Combined therapy if uterus present',
          'Regular monitoring'
        ],
        source: 'https://www.endocrine.org/guidelines-and-clinical-practice/clinical-practice-guidelines'
      });
    } else {
      recommendations.push({
        category: 'caution',
        title: 'HRT with Careful Consideration',
        description: 'Age considerations require careful risk-benefit analysis.',
        options: [
          'Low-dose HRT preferred',
          'Transdermal route preferred',
          'Regular cardiovascular monitoring',
          'Consider duration limits'
        ],
        source: 'https://www.nice.org.uk/guidance/ng23'
      });
    }
  }
  
  return recommendations;
};

/**
 * Alternative therapy interface
 */
export interface AlternativeTherapy {
  category: 'medication' | 'lifestyle' | 'psychological' | 'complementary';
  title: string;
  description: string;
  evidence: string;
  source: string;
}

/**
 * Get alternative therapy suggestions
 */
export const getAlternativeTherapies = (): AlternativeTherapy[] => {
  return [
    {
      category: 'medication',
      title: 'SSRIs/SNRIs',
      description: 'Selective serotonin reuptake inhibitors for hot flashes and mood symptoms',
      evidence: 'Evidence-based non-hormonal option with proven efficacy',
      source: 'https://www.nice.org.uk/guidance/ng23'
    },
    {
      category: 'medication',
      title: 'Gabapentin',
      description: 'Anticonvulsant medication effective for hot flashes',
      evidence: 'Clinical trials show significant reduction in hot flash frequency',
      source: 'https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2014/01/hormone-therapy'
    },
    {
      category: 'medication',
      title: 'Clonidine',
      description: 'Alpha-2 agonist for hot flashes and night sweats',
      evidence: 'Modest efficacy for vasomotor symptoms',
      source: 'https://www.endocrine.org/guidelines-and-clinical-practice/clinical-practice-guidelines'
    },
    {
      category: 'psychological',
      title: 'Cognitive Behavioral Therapy (CBT)',
      description: 'Structured therapy approach for menopausal symptoms and mood',
      evidence: 'Strong evidence for improving quality of life and symptom management',
      source: 'https://www.nice.org.uk/guidance/ng23'
    },
    {
      category: 'lifestyle',
      title: 'Exercise and Diet',
      description: 'Regular physical activity and Mediterranean-style diet',
      evidence: 'Proven benefits for cardiovascular health and bone density',
      source: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity'
    },
    {
      category: 'lifestyle',
      title: 'Weight Management',
      description: 'Achieving and maintaining healthy BMI',
      evidence: 'Weight loss can reduce hot flash frequency and improve overall health',
      source: 'https://www.nice.org.uk/guidance/ng23'
    },
    {
      category: 'complementary',
      title: 'Phytoestrogens',
      description: 'Soy isoflavones and other plant-based compounds',
      evidence: 'Limited evidence for mild symptom relief',
      source: 'https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD001395.pub4/full'
    },
    {
      category: 'complementary',
      title: 'Acupuncture',
      description: 'Traditional Chinese medicine approach',
      evidence: 'Some evidence for hot flash reduction',
      source: 'https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD007410.pub3/full'
    }
  ];
};

/**
 * Get personalized medication recommendations (legacy function - enhanced)
 */
export const getMedicationRecommendations = (
  patient: PatientData, 
  contraindications: ContraindicationAlert[]
): string[] => {
  const recommendations: string[] = [];
  
  // Enhanced recommendations based on comprehensive analysis
  const treatmentRecs = getPersonalizedTreatmentRecommendations(patient, contraindications);
  
  treatmentRecs.forEach(rec => {
    recommendations.push(`${rec.title}: ${rec.description}`);
    rec.options.forEach(option => recommendations.push(`• ${option}`));
  });
  
  return recommendations;
};

/**
 * Quick medication search function
 */
export function searchMedications(query: string): Medication[] {
  const allMedications = [...HRT_MEDICATIONS, ...INTERACTING_MEDICATIONS];
  const searchTerm = query.toLowerCase();
  
  return allMedications.filter(med => 
    med.name.toLowerCase().includes(searchTerm) ||
    med.genericName?.toLowerCase().includes(searchTerm) ||
    med.brandNames?.some(brand => brand.toLowerCase().includes(searchTerm))
  );
}

/**
 * Get all interactions for a specific medication
 */
export function getMedicationInteractions(medication: string): InteractionAlert[] {
  const hrtMeds = HRT_MEDICATIONS.map(med => med.name);
  return checkDrugInteractions([medication], hrtMeds);
}