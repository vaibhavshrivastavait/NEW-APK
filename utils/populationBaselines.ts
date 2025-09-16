/**
 * Population Baseline Data for Risk Calculator Comparisons
 * 
 * Sources:
 * - ASCVD: 2013 ACC/AHA Pooled Cohort Equations population data
 * - FRAX: WHO reference tables by age/sex 
 * - Gail: SEER cancer registry population baselines
 * 
 * All data represents age-sex matched population means for graphical comparison
 */

// ASCVD Population Baselines (10-year risk %)
export interface ASCVDBaseline {
  ageGroup: string;
  femaleRisk: number;
  maleRisk: number;
}

export const ASCVD_POPULATION_BASELINES: ASCVDBaseline[] = [
  { ageGroup: '40-44', femaleRisk: 2.0, maleRisk: 5.9 },
  { ageGroup: '45-49', femaleRisk: 2.8, maleRisk: 8.1 },
  { ageGroup: '50-54', femaleRisk: 4.1, maleRisk: 11.0 },
  { ageGroup: '55-59', femaleRisk: 5.7, maleRisk: 14.3 },
  { ageGroup: '60-64', femaleRisk: 7.9, maleRisk: 17.8 },
  { ageGroup: '65-69', femaleRisk: 10.7, maleRisk: 21.4 },
  { ageGroup: '70-74', femaleRisk: 14.2, maleRisk: 25.0 },
  { ageGroup: '75-79', femaleRisk: 18.4, maleRisk: 28.4 },
];

// FRAX Population Baselines (10-year major fracture risk %)
export interface FRAXBaseline {
  ageGroup: string;
  femaleMajorFracture: number;
  maleMajorFracture: number;
  femaleHipFracture: number;
  maleHipFracture: number;
}

export const FRAX_POPULATION_BASELINES: FRAXBaseline[] = [
  { ageGroup: '50-54', femaleMajorFracture: 3.2, maleMajorFracture: 2.8, femaleHipFracture: 0.4, maleHipFracture: 0.3 },
  { ageGroup: '55-59', femaleMajorFracture: 5.1, maleMajorFracture: 4.2, femaleHipFracture: 0.7, maleHipFracture: 0.5 },
  { ageGroup: '60-64', femaleMajorFracture: 7.8, maleMajorFracture: 6.1, femaleHipFracture: 1.2, maleHipFracture: 0.8 },
  { ageGroup: '65-69', femaleMajorFracture: 11.2, maleMajorFracture: 8.7, femaleHipFracture: 2.1, maleHipFracture: 1.4 },
  { ageGroup: '70-74', femaleMajorFracture: 15.8, maleMajorFracture: 12.3, femaleHipFracture: 3.8, maleHipFracture: 2.5 },
  { ageGroup: '75-79', femaleMajorFracture: 22.1, maleMajorFracture: 17.2, femaleHipFracture: 6.9, maleHipFracture: 4.2 },
  { ageGroup: '80-84', femaleMajorFracture: 29.8, maleMajorFracture: 23.1, femaleHipFracture: 12.2, maleHipFracture: 7.1 },
];

// Gail Model Population Baselines (5-year breast cancer risk % for women)
export interface GailBaseline {
  ageGroup: string;
  averageRisk: number;
  whiteFemaleRisk: number;
  blackFemaleRisk: number;
  hispanicFemaleRisk: number;
  asianFemaleRisk: number;
}

export const GAIL_POPULATION_BASELINES: GailBaseline[] = [
  { ageGroup: '35-39', averageRisk: 0.4, whiteFemaleRisk: 0.4, blackFemaleRisk: 0.5, hispanicFemaleRisk: 0.3, asianFemaleRisk: 0.2 },
  { ageGroup: '40-44', averageRisk: 0.7, whiteFemaleRisk: 0.7, blackFemaleRisk: 0.8, hispanicFemaleRisk: 0.5, asianFemaleRisk: 0.4 },
  { ageGroup: '45-49', averageRisk: 1.0, whiteFemaleRisk: 1.0, blackFemaleRisk: 1.1, hispanicFemaleRisk: 0.7, asianFemaleRisk: 0.5 },
  { ageGroup: '50-54', averageRisk: 1.4, whiteFemaleRisk: 1.4, blackFemaleRisk: 1.3, hispanicFemaleRisk: 0.9, asianFemaleRisk: 0.7 },
  { ageGroup: '55-59', averageRisk: 1.7, whiteFemaleRisk: 1.7, blackFemaleRisk: 1.5, hispanicFemaleRisk: 1.1, asianFemaleRisk: 0.9 },
  { ageGroup: '60-64', averageRisk: 2.0, whiteFemaleRisk: 2.0, blackFemaleRisk: 1.7, hispanicFemaleRisk: 1.3, asianFemaleRisk: 1.0 },
  { ageGroup: '65-69', averageRisk: 2.3, whiteFemaleRisk: 2.3, blackFemaleRisk: 1.8, hispanicFemaleRisk: 1.5, asianFemaleRisk: 1.2 },
  { ageGroup: '70-74', averageRisk: 2.6, whiteFemaleRisk: 2.6, blackFemaleRisk: 2.0, hispanicFemaleRisk: 1.7, asianFemaleRisk: 1.4 },
  { ageGroup: '75-85', averageRisk: 2.9, whiteFemaleRisk: 2.9, blackFemaleRisk: 2.1, hispanicFemaleRisk: 1.8, asianFemaleRisk: 1.5 },
];

/**
 * Get population baseline for ASCVD risk by age and gender
 */
export const getASCVDBaseline = (age: number, gender: 'female' | 'male'): number => {
  const ageGroup = getAgeGroup(age, [40, 45, 50, 55, 60, 65, 70, 75]);
  const baseline = ASCVD_POPULATION_BASELINES.find(b => b.ageGroup === ageGroup);
  
  if (!baseline) {
    // Return approximate baseline for ages outside range
    if (age < 40) return gender === 'female' ? 1.0 : 3.0;
    if (age >= 80) return gender === 'female' ? 22.0 : 32.0;
    return gender === 'female' ? 8.0 : 15.0; // fallback average
  }
  
  return gender === 'female' ? baseline.femaleRisk : baseline.maleRisk;
};

/**
 * Get population baseline for FRAX major fracture risk by age and gender
 */
export const getFRAXBaseline = (age: number, gender: 'female' | 'male'): { majorFracture: number; hipFracture: number } => {
  const ageGroup = getAgeGroup(age, [50, 55, 60, 65, 70, 75, 80]);
  const baseline = FRAX_POPULATION_BASELINES.find(b => b.ageGroup === ageGroup);
  
  if (!baseline) {
    // Return approximate baseline for ages outside range
    if (age < 50) return { majorFracture: 2.0, hipFracture: 0.2 };
    if (age >= 85) return gender === 'female' ? { majorFracture: 35.0, hipFracture: 18.0 } : { majorFracture: 28.0, hipFracture: 10.0 };
    return gender === 'female' ? { majorFracture: 12.0, hipFracture: 3.0 } : { majorFracture: 10.0, hipFracture: 2.0 };
  }
  
  return {
    majorFracture: gender === 'female' ? baseline.femaleMajorFracture : baseline.maleMajorFracture,
    hipFracture: gender === 'female' ? baseline.femaleHipFracture : baseline.maleHipFracture
  };
};

/**
 * Get population baseline for Gail breast cancer risk by age
 * Only applicable to women
 */
export const getGailBaseline = (age: number, ethnicity: 'white' | 'black' | 'hispanic' | 'asian' | 'other' = 'white'): number => {
  const ageGroup = getAgeGroup(age, [35, 40, 45, 50, 55, 60, 65, 70, 75]);
  const baseline = GAIL_POPULATION_BASELINES.find(b => b.ageGroup === ageGroup);
  
  if (!baseline) {
    // Return approximate baseline for ages outside range
    if (age < 35) return 0.2;
    if (age >= 85) return 3.2;
    return 1.5; // fallback average
  }
  
  switch (ethnicity) {
    case 'white': return baseline.whiteFemaleRisk;
    case 'black': return baseline.blackFemaleRisk;
    case 'hispanic': return baseline.hispanicFemaleRisk;
    case 'asian': return baseline.asianFemaleRisk;
    default: return baseline.averageRisk;
  }
};

/**
 * Helper function to determine age group from age ranges
 */
const getAgeGroup = (age: number, breakpoints: number[]): string => {
  for (let i = 0; i < breakpoints.length - 1; i++) {
    if (age >= breakpoints[i] && age < breakpoints[i + 1]) {
      return `${breakpoints[i]}-${breakpoints[i + 1] - 1}`;
    }
  }
  
  // Handle last group
  const lastBreakpoint = breakpoints[breakpoints.length - 1];
  if (age >= lastBreakpoint) {
    return `${lastBreakpoint}-${lastBreakpoint + 4}`;
  }
  
  // Handle first group
  return `${breakpoints[0] - 5}-${breakpoints[0] - 1}`;
};

/**
 * Calculate percentile rank of patient risk vs population
 */
export const calculatePercentileRank = (patientRisk: number, populationMean: number): number => {
  // Simple approximation: assume normal distribution
  // More sophisticated percentile calculation could use actual distribution data
  const ratio = patientRisk / populationMean;
  
  if (ratio <= 0.5) return 25; // Below average
  if (ratio <= 0.8) return 40;
  if (ratio <= 1.2) return 50; // Around average
  if (ratio <= 1.5) return 65;
  if (ratio <= 2.0) return 75;
  if (ratio <= 3.0) return 85;
  return 95; // Well above average
};