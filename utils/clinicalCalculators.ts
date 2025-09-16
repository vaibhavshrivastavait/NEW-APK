/**
 * Clinical Calculators for Medical Assessment
 * 
 * Contains validated formulas for:
 * - BMI (Body Mass Index)
 * - BSA (Body Surface Area) 
 * - eGFR (estimated Glomerular Filtration Rate)
 * - HRT-specific risk calculations
 */

export interface BMIResult {
  bmi: number;
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese Class I' | 'Obese Class II' | 'Obese Class III';
  interpretation: string;
  healthRisk: 'Low' | 'Moderate' | 'High' | 'Very High';
}

export interface BSAResult {
  bsa: number; // m²
  method: string;
  interpretation: string;
}

export interface eGFRResult {
  egfr: number; // ml/min/1.73m²
  stage: 'Normal' | 'Mild Decrease' | 'Moderate Decrease' | 'Severe Decrease' | 'Kidney Failure';
  interpretation: string;
  category: 'Normal' | 'Mild' | 'Moderate' | 'Severe' | 'Failure';
}

export interface HRTRiskResult {
  overallRisk: 'Low' | 'Moderate' | 'High';
  breastCancerRisk: number; // relative risk
  vteRisk: number; // relative risk
  strokeRisk: number; // relative risk
  contraindications: string[];
  recommendations: string[];
  interpretation: string;
}

/**
 * Calculate BMI (Body Mass Index)
 * Formula: weight (kg) / height (m)²
 */
export function calculateBMI(weight: number, height: number): BMIResult {
  if (!weight || !height || weight <= 0 || height <= 0) {
    return {
      bmi: 0,
      category: 'Normal',
      interpretation: 'Invalid input - please enter valid weight and height',
      healthRisk: 'Low'
    };
  }

  const heightInMeters = height / 100; // Convert cm to meters
  const bmi = weight / (heightInMeters * heightInMeters);

  let category: BMIResult['category'];
  let healthRisk: BMIResult['healthRisk'];
  let interpretation: string;

  if (bmi < 18.5) {
    category = 'Underweight';
    healthRisk = 'Moderate';
    interpretation = 'Below normal weight. May indicate malnutrition or underlying health issues.';
  } else if (bmi < 25) {
    category = 'Normal';
    healthRisk = 'Low';
    interpretation = 'Normal healthy weight. Maintain current lifestyle and diet.';
  } else if (bmi < 30) {
    category = 'Overweight';
    healthRisk = 'Moderate';
    interpretation = 'Above normal weight. Consider lifestyle modifications to reduce cardiovascular risk.';
  } else if (bmi < 35) {
    category = 'Obese Class I';
    healthRisk = 'High';
    interpretation = 'Obesity Class I. Significant health risks. Weight loss recommended.';
  } else if (bmi < 40) {
    category = 'Obese Class II';
    healthRisk = 'Very High';
    interpretation = 'Obesity Class II. Very high health risks. Medical evaluation recommended.';
  } else {
    category = 'Obese Class III';
    healthRisk = 'Very High';
    interpretation = 'Obesity Class III (Morbid Obesity). Extreme health risks. Urgent medical intervention needed.';
  }

  return {
    bmi: Math.round(bmi * 10) / 10,
    category,
    interpretation,
    healthRisk
  };
}

/**
 * Calculate BSA (Body Surface Area) using Du Bois formula
 * Formula: BSA (m²) = 0.007184 × weight^0.425 × height^0.725
 */
export function calculateBSA(weight: number, height: number): BSAResult {
  if (!weight || !height || weight <= 0 || height <= 0) {
    return {
      bsa: 0,
      method: 'Du Bois Formula',
      interpretation: 'Invalid input - please enter valid weight and height'
    };
  }

  // Du Bois formula
  const bsa = 0.007184 * Math.pow(weight, 0.425) * Math.pow(height, 0.725);

  let interpretation: string;
  if (bsa < 1.5) {
    interpretation = 'Below average body surface area. May require dose adjustments for medications.';
  } else if (bsa <= 2.0) {
    interpretation = 'Normal body surface area. Standard medication dosing typically appropriate.';
  } else {
    interpretation = 'Above average body surface area. May require higher medication doses.';
  }

  return {
    bsa: Math.round(bsa * 100) / 100,
    method: 'Du Bois Formula',
    interpretation
  };
}

/**
 * Calculate eGFR using CKD-EPI 2021 equation (without race)
 * Updated equation that removed race coefficient
 */
export function calculateeGFR(
  age: number, 
  gender: 'male' | 'female', 
  creatinine: number // mg/dL
): eGFRResult {
  if (!age || !creatinine || age <= 0 || creatinine <= 0) {
    return {
      egfr: 0,
      stage: 'Normal',
      category: 'Normal',
      interpretation: 'Invalid input - please enter valid age and creatinine'
    };
  }

  // CKD-EPI 2021 equation (race-free)
  let egfr: number;
  
  if (gender === 'female') {
    if (creatinine <= 0.7) {
      egfr = 142 * Math.pow(creatinine / 0.7, -0.241) * Math.pow(0.9938, age);
    } else {
      egfr = 142 * Math.pow(creatinine / 0.7, -1.200) * Math.pow(0.9938, age);
    }
  } else {
    if (creatinine <= 0.9) {
      egfr = 142 * Math.pow(creatinine / 0.9, -0.302) * Math.pow(0.9938, age);
    } else {
      egfr = 142 * Math.pow(creatinine / 0.9, -1.200) * Math.pow(0.9938, age);
    }
  }

  // Determine CKD stage
  let stage: eGFRResult['stage'];
  let category: eGFRResult['category'];
  let interpretation: string;

  if (egfr >= 90) {
    stage = 'Normal';
    category = 'Normal';
    interpretation = 'Normal kidney function. No evidence of kidney disease.';
  } else if (egfr >= 60) {
    stage = 'Mild Decrease';
    category = 'Mild';
    interpretation = 'Mild decrease in kidney function. Monitor and address risk factors.';
  } else if (egfr >= 30) {
    stage = 'Moderate Decrease';
    category = 'Moderate';
    interpretation = 'Moderate decrease in kidney function. Nephrology referral may be considered.';
  } else if (egfr >= 15) {
    stage = 'Severe Decrease';
    category = 'Severe';
    interpretation = 'Severe decrease in kidney function. Nephrology referral recommended.';
  } else {
    stage = 'Kidney Failure';
    category = 'Failure';
    interpretation = 'Kidney failure. Urgent nephrology referral and preparation for renal replacement therapy.';
  }

  return {
    egfr: Math.round(egfr),
    stage,
    category,
    interpretation
  };
}

/**
 * HRT-Specific Risk Calculator
 * Assesses risks and benefits of hormone replacement therapy
 */
export function calculateHRTRisk(
  age: number,
  timeSinceMenopause: number,
  personalHistoryBC: boolean,
  familyHistoryBC: boolean,
  personalHistoryVTE: boolean,
  smoking: boolean,
  hypertension: boolean,
  diabetes: boolean,
  bmi: number
): HRTRiskResult {
  let breastCancerRisk = 1.0; // baseline relative risk
  let vteRisk = 1.0;
  let strokeRisk = 1.0;
  const contraindications: string[] = [];
  const recommendations: string[] = [];

  // Absolute contraindications
  if (personalHistoryBC) {
    contraindications.push('Personal history of breast cancer');
    breastCancerRisk = 0; // Should not use HRT
  }

  if (personalHistoryVTE) {
    contraindications.push('Personal history of venous thromboembolism');
    vteRisk = 0; // Should not use HRT
  }

  // Relative risk factors
  if (age >= 60) {
    breastCancerRisk *= 1.3;
    vteRisk *= 2.0;
    strokeRisk *= 1.5;
    recommendations.push('Consider transdermal estrogen to reduce VTE risk');
  }

  if (timeSinceMenopause > 10) {
    vteRisk *= 1.4;
    strokeRisk *= 1.2;
    recommendations.push('Window of opportunity may have passed - discuss risks vs benefits');
  }

  if (familyHistoryBC) {
    breastCancerRisk *= 1.2;
    recommendations.push('Enhanced breast cancer screening recommended');
  }

  if (smoking) {
    vteRisk *= 2.0;
    strokeRisk *= 1.8;
    contraindications.push('Smoking increases cardiovascular risks');
    recommendations.push('Smoking cessation strongly recommended before HRT');
  }

  if (bmi >= 30) {
    breastCancerRisk *= 1.2;
    vteRisk *= 1.5;
    recommendations.push('Weight loss may reduce risks');
  }

  if (hypertension) {
    strokeRisk *= 1.3;
    recommendations.push('Blood pressure control essential');
  }

  if (diabetes) {
    strokeRisk *= 1.4;
    recommendations.push('Glucose control optimization important');
  }

  // Determine overall risk
  let overallRisk: HRTRiskResult['overallRisk'];
  let interpretation: string;

  if (contraindications.length > 0) {
    overallRisk = 'High';
    interpretation = 'HRT may not be appropriate due to contraindications. Consider alternatives.';
  } else if (age >= 60 || timeSinceMenopause > 10 || (breastCancerRisk > 1.5 || vteRisk > 2.0)) {
    overallRisk = 'Moderate';
    interpretation = 'HRT may be considered with caution. Enhanced monitoring required.';
  } else {
    overallRisk = 'Low';
    interpretation = 'HRT appears appropriate. Standard monitoring recommended.';
  }

  // Add general recommendations
  if (contraindications.length === 0) {
    recommendations.push('Regular follow-up every 3-6 months initially');
    recommendations.push('Annual mammograms and breast exams');
    recommendations.push('Use lowest effective dose for shortest duration');
  }

  return {
    overallRisk,
    breastCancerRisk: Math.round(breastCancerRisk * 100) / 100,
    vteRisk: Math.round(vteRisk * 100) / 100,
    strokeRisk: Math.round(strokeRisk * 100) / 100,
    contraindications,
    recommendations,
    interpretation
  };
}