/**
 * Drug Interaction Data Extractor
 * Extracts all available medicines from drug_interactions.json for comprehensive UI display
 */

interface DrugInteractionData {
  version: string;
  notes: string;
  pairs: Array<{
    main: string;
    optionals: Array<{
      drug: string;
      severity: string;
    }>;
  }>;
  defaults?: {
    missingSeverity: string;
  };
}

interface MedicineDisplayInfo {
  key: string;
  displayName: string;
  category: 'main' | 'optional';
}

/**
 * Convert internal drug keys to user-friendly display names
 */
const DRUG_DISPLAY_NAMES: { [key: string]: string } = {
  // Main medicines (hormones)
  'hormone_estradiol': 'Estrogen HRT',
  'hormone_progesterone': 'Progesterone HRT', 
  'hormone_testosterone': 'Testosterone HRT',
  'tibolone': 'Tibolone',
  'raloxifene': 'Raloxifene (SERM)',
  'bazedoxifene': 'Bazedoxifene',
  'gabapentin': 'Gabapentin',
  'pregabalin': 'Pregabalin',
  'clonidine': 'Clonidine',
  'paroxetine': 'Paroxetine (SSRI)',
  'venlafaxine': 'Venlafaxine (SNRI)',
  'alendronate': 'Alendronate (Bisphosphonate)',
  'risedronate': 'Risedronate (Bisphosphonate)',
  
  // Optional medicines (common medications)
  'warfarin': 'Warfarin',
  'ibuprofen': 'Ibuprofen',
  'aspirin': 'Aspirin',
  'clopidogrel': 'Clopidogrel',
  'heparin': 'Heparin',
  'rivaroxaban': 'Rivaroxaban',
  'apixaban': 'Apixaban',
  'simvastatin': 'Simvastatin',
  'atorvastatin': 'Atorvastatin',
  'levothyroxine': 'Levothyroxine',
  'metformin': 'Metformin',
  'amlodipine': 'Amlodipine',
  'lisinopril': 'Lisinopril',
  'insulin': 'Insulin',
  'morphine': 'Morphine',
  'oxycodone': 'Oxycodone',
  'tramadol': 'Tramadol',
  'alcohol': 'Alcohol',
  'lorazepam': 'Lorazepam',
  'diazepam': 'Diazepam',
  'propranolol': 'Propranolol',
  'metoprolol': 'Metoprolol',
  'verapamil': 'Verapamil',
  'diltiazem': 'Diltiazem',
  'tricyclic_antidepressants': 'Tricyclic Antidepressants',
  'tamoxifen': 'Tamoxifen',
  'linezolid': 'Linezolid',
  'calcium': 'Calcium Supplements',
  'iron': 'Iron Supplements',
  'magnesium': 'Magnesium Supplements',
  'cholestyramine': 'Cholestyramine'
};

/**
 * Load and parse drug interaction data
 */
async function loadDrugInteractionData(): Promise<DrugInteractionData | null> {
  try {
    const drugInteractionsData = require('../assets/rules/drug_interactions.json');
    return drugInteractionsData as DrugInteractionData;
  } catch (error) {
    console.error('❌ Failed to load drug_interactions.json:', error);
    return null;
  }
}

/**
 * Extract all main medicines from drug_interactions.json
 */
export async function extractMainMedicines(): Promise<MedicineDisplayInfo[]> {
  const data = await loadDrugInteractionData();
  if (!data) return [];

  const mainMedicines = new Set<string>();
  
  // Extract all unique main medicine keys
  data.pairs.forEach(pair => {
    mainMedicines.add(pair.main);
  });

  // Convert to display format
  return Array.from(mainMedicines).map(key => ({
    key,
    displayName: DRUG_DISPLAY_NAMES[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    category: 'main' as const
  })).sort((a, b) => a.displayName.localeCompare(b.displayName));
}

/**
 * Extract all optional medicines from drug_interactions.json
 */
export async function extractOptionalMedicines(): Promise<MedicineDisplayInfo[]> {
  const data = await loadDrugInteractionData();
  if (!data) return [];

  const optionalMedicines = new Set<string>();
  
  // Extract all unique optional medicine keys
  data.pairs.forEach(pair => {
    pair.optionals.forEach(optional => {
      optionalMedicines.add(optional.drug);
    });
  });

  // Convert to display format
  return Array.from(optionalMedicines).map(key => ({
    key,
    displayName: DRUG_DISPLAY_NAMES[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    category: 'optional' as const
  })).sort((a, b) => a.displayName.localeCompare(b.displayName));
}

/**
 * Get all available medicines (both main and optional)
 */
export async function getAllAvailableMedicines(): Promise<{
  mainMedicines: MedicineDisplayInfo[];
  optionalMedicines: MedicineDisplayInfo[];
}> {
  const [mainMedicines, optionalMedicines] = await Promise.all([
    extractMainMedicines(),
    extractOptionalMedicines()
  ]);

  return {
    mainMedicines,
    optionalMedicines
  };
}

/**
 * Get interactions for a specific main medicine
 */
export async function getInteractionsForMainMedicine(mainMedicineKey: string): Promise<Array<{
  drug: string;
  displayName: string;
  severity: string;
}>> {
  const data = await loadDrugInteractionData();
  if (!data) return [];

  const pair = data.pairs.find(p => p.main === mainMedicineKey);
  if (!pair) return [];

  return pair.optionals.map(optional => ({
    drug: optional.drug,
    displayName: DRUG_DISPLAY_NAMES[optional.drug] || optional.drug.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    severity: optional.severity
  }));
}

export default {
  extractMainMedicines,
  extractOptionalMedicines,
  getAllAvailableMedicines,
  getInteractionsForMainMedicine
};