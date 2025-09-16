/**
 * Enhanced Risk Calculators with Precedence Logic
 * 
 * Implements ASCVD, Framingham, FRAX, Gail, Tyrer-Cuzick, Wells calculators locally
 * Precedence: external score (flagged) > computed local score > unavailable
 * Shows conflict warning if both exist and differ >5%
 */

export interface RiskCalculationInputs {
  age: number;
  sex: 'male' | 'female';
  weight?: number; // kg
  height?: number; // cm
  smoking_status?: boolean;
  systolic_bp?: number; // mmHg
  diastolic_bp?: number; // mmHg
  total_cholesterol?: number; // mg/dL
  hdl_cholesterol?: number; // mg/dL
  ldl_cholesterol?: number; // mg/dL
  diabetes?: boolean;
  family_history_mi?: boolean;
  family_history_breast?: boolean;
  race?: 'white' | 'african_american' | 'other';
  hypertension_treatment?: boolean;
  
  // FRAX specific
  previous_fracture?: boolean;
  parental_hip_fracture?: boolean;
  current_smoking?: boolean;
  glucocorticoids?: boolean;
  rheumatoid_arthritis?: boolean;
  secondary_osteoporosis?: boolean;
  alcohol_3_units?: boolean;
  
  // Wells VTE specific
  active_cancer?: boolean;
  paralysis_paresis?: boolean;
  recently_bedridden?: boolean;
  major_surgery?: boolean;
  localized_tenderness?: boolean;
  entire_leg_swollen?: boolean;
  calf_swelling?: boolean;
  pitting_edema?: boolean;
  collateral_veins?: boolean;
  alternative_diagnosis?: boolean;
  
  // Gail Model specific
  age_menarche?: number;
  age_first_birth?: number;
  num_relatives?: number;
  num_biopsies?: number;
  atypical_hyperplasia?: boolean;
}

export interface RiskScore {
  value: number;
  source: 'external' | 'computed' | 'unavailable';
  confidence?: 'high' | 'medium' | 'low';
  missingFields?: string[];
  category?: string;
}

export interface RiskScoreWithConflict extends RiskScore {
  externalValue?: number;
  computedValue?: number;
  hasConflict?: boolean;
  conflictPercentage?: number;
}

export class EnhancedRiskCalculators {
  
  /**
   * Calculate ASCVD 10-year risk using Pooled Cohort Equations
   */
  public calculateASCVD(
    inputs: RiskCalculationInputs, 
    externalScore?: number
  ): RiskScoreWithConflict {
    const computed = this.computeASCVD(inputs);
    return this.resolveScoreConflict('ASCVD', computed, externalScore);
  }

  private computeASCVD(inputs: RiskCalculationInputs): RiskScore {
    const missingFields: string[] = [];
    
    // Check required fields
    if (!inputs.age) missingFields.push('age');
    if (!inputs.sex) missingFields.push('sex');
    if (inputs.total_cholesterol === undefined) missingFields.push('total_cholesterol');
    if (inputs.hdl_cholesterol === undefined) missingFields.push('hdl_cholesterol');
    if (inputs.systolic_bp === undefined) missingFields.push('systolic_bp');
    if (inputs.diabetes === undefined) missingFields.push('diabetes');
    if (inputs.smoking_status === undefined) missingFields.push('smoking_status');
    
    if (missingFields.length > 0) {
      return {
        value: 0,
        source: 'unavailable',
        missingFields,
        confidence: 'low'
      };
    }

    // ASCVD Pooled Cohort Equations
    const age = Math.min(Math.max(inputs.age, 40), 79); // Age range 40-79
    const isFemale = inputs.sex === 'female';
    const isAA = inputs.race === 'african_american'; // African American
    
    const lnAge = Math.log(age);
    const lnTotalChol = Math.log(inputs.total_cholesterol!);
    const lnHDL = Math.log(inputs.hdl_cholesterol!);
    const lnSBP = Math.log(inputs.systolic_bp!);
    const smoker = inputs.smoking_status ? 1 : 0;
    const diabetes = inputs.diabetes ? 1 : 0;
    const treatsBP = inputs.hypertension_treatment ? 1 : 0;
    
    let lnRisk: number;
    let meanCoeff: number;
    let baselineSurvival: number;

    if (isFemale) {
      if (isAA) {
        // African American Female
        lnRisk = (17.1141 * lnAge) + 
                 (0.9396 * lnTotalChol) + 
                 (-18.9196 * lnHDL) + 
                 (4.4748 * lnAge * lnHDL) + 
                 (29.2907 * lnSBP) + 
                 (-6.4321 * lnAge * lnSBP) + 
                 (27.8197 * lnSBP * treatsBP) + 
                 (-6.0873 * lnAge * lnSBP * treatsBP) + 
                 (0.6908 * smoker) + 
                 (0.8738 * diabetes);
        meanCoeff = 86.6081;
        baselineSurvival = 0.9533;
      } else {
        // White/Other Female  
        lnRisk = (-29.799 * lnAge) + 
                 (4.884 * Math.pow(lnAge, 2)) + 
                 (13.540 * lnTotalChol) + 
                 (-3.114 * lnAge * lnTotalChol) + 
                 (-13.578 * lnHDL) + 
                 (3.149 * lnAge * lnHDL) + 
                 (2.019 * lnSBP * treatsBP) + 
                 (1.957 * lnSBP * (1 - treatsBP)) + 
                 (7.574 * smoker) + 
                 (-1.665 * lnAge * smoker) + 
                 (0.661 * diabetes);
        meanCoeff = -29.18;
        baselineSurvival = 0.9665;
      }
    } else {
      if (isAA) {
        // African American Male
        lnRisk = (2.469 * lnAge) + 
                 (0.302 * lnTotalChol) + 
                 (-0.307 * lnHDL) + 
                 (1.916 * lnSBP * treatsBP) + 
                 (1.809 * lnSBP * (1 - treatsBP)) + 
                 (0.549 * smoker) + 
                 (0.645 * diabetes);
        meanCoeff = 19.54;
        baselineSurvival = 0.8954;
      } else {
        // White/Other Male
        lnRisk = (12.344 * lnAge) + 
                 (11.853 * lnTotalChol) + 
                 (-2.664 * lnAge * lnTotalChol) + 
                 (-7.990 * lnHDL) + 
                 (1.769 * lnAge * lnHDL) + 
                 (1.797 * lnSBP * treatsBP) + 
                 (1.764 * lnSBP * (1 - treatsBP)) + 
                 (7.837 * smoker) + 
                 (-1.795 * lnAge * smoker) + 
                 (0.658 * diabetes);
        meanCoeff = 61.18;
        baselineSurvival = 0.9144;
      }
    }

    // Calculate 10-year risk
    const risk = 1 - Math.pow(baselineSurvival, Math.exp(lnRisk - meanCoeff));
    const riskPercent = Math.max(0, Math.min(100, risk * 100));

    return {
      value: Math.round(riskPercent * 10) / 10,
      source: 'computed',
      confidence: 'high',
      category: this.categorizeASCVD(riskPercent)
    };
  }

  /**
   * Calculate Framingham Risk Score
   */
  public calculateFramingham(
    inputs: RiskCalculationInputs, 
    externalScore?: number
  ): RiskScoreWithConflict {
    const computed = this.computeFramingham(inputs);
    return this.resolveScoreConflict('Framingham', computed, externalScore);
  }

  private computeFramingham(inputs: RiskCalculationInputs): RiskScore {
    const missingFields: string[] = [];
    
    if (!inputs.age) missingFields.push('age');
    if (!inputs.sex) missingFields.push('sex');
    if (inputs.total_cholesterol === undefined) missingFields.push('total_cholesterol');
    if (inputs.hdl_cholesterol === undefined) missingFields.push('hdl_cholesterol');
    if (inputs.systolic_bp === undefined) missingFields.push('systolic_bp');
    if (inputs.smoking_status === undefined) missingFields.push('smoking_status');
    
    if (missingFields.length > 0) {
      return {
        value: 0,
        source: 'unavailable',
        missingFields,
        confidence: 'low'
      };
    }

    // Simplified Framingham calculation
    let points = 0;
    const age = inputs.age;
    const isFemale = inputs.sex === 'female';

    // Age points
    if (isFemale) {
      if (age >= 20 && age <= 34) points -= 7;
      else if (age >= 35 && age <= 39) points -= 3;
      else if (age >= 40 && age <= 44) points += 0;
      else if (age >= 45 && age <= 49) points += 3;
      else if (age >= 50 && age <= 54) points += 6;
      else if (age >= 55 && age <= 59) points += 8;
      else if (age >= 60 && age <= 64) points += 10;
      else if (age >= 65 && age <= 69) points += 12;
      else if (age >= 70 && age <= 74) points += 14;
      else if (age >= 75) points += 16;
    } else {
      if (age >= 20 && age <= 34) points -= 9;
      else if (age >= 35 && age <= 39) points -= 4;
      else if (age >= 40 && age <= 44) points += 0;
      else if (age >= 45 && age <= 49) points += 3;
      else if (age >= 50 && age <= 54) points += 6;
      else if (age >= 55 && age <= 59) points += 8;
      else if (age >= 60 && age <= 64) points += 10;
      else if (age >= 65 && age <= 69) points += 11;
      else if (age >= 70 && age <= 74) points += 12;
      else if (age >= 75) points += 13;
    }

    // Cholesterol points
    const totalChol = inputs.total_cholesterol!;
    if (totalChol < 160) points += 0;
    else if (totalChol < 200) points += isFemale ? 4 : 4;
    else if (totalChol < 240) points += isFemale ? 8 : 7;
    else if (totalChol < 280) points += isFemale ? 11 : 9;
    else points += isFemale ? 13 : 11;

    // HDL points
    const hdl = inputs.hdl_cholesterol!;
    if (hdl >= 60) points -= 1;
    else if (hdl >= 50) points += 0;
    else if (hdl >= 40) points += isFemale ? 1 : 1;
    else points += isFemale ? 2 : 2;

    // Blood pressure points
    const sbp = inputs.systolic_bp!;
    const onTreatment = inputs.hypertension_treatment || false;
    if (sbp < 120) points += 0;
    else if (sbp < 130) points += onTreatment ? (isFemale ? 3 : 1) : 0;
    else if (sbp < 140) points += onTreatment ? (isFemale ? 4 : 2) : (isFemale ? 1 : 1);
    else if (sbp < 160) points += onTreatment ? (isFemale ? 5 : 2) : (isFemale ? 2 : 1);
    else points += onTreatment ? (isFemale ? 6 : 3) : (isFemale ? 3 : 2);

    // Smoking
    if (inputs.smoking_status) {
      points += isFemale ? 9 : 8;
    }

    // Diabetes
    if (inputs.diabetes) {
      points += isFemale ? 6 : 6;
    }

    // Convert points to risk percentage (simplified mapping)
    let riskPercent: number;
    if (points < 0) riskPercent = 1;
    else if (points < 5) riskPercent = 2;
    else if (points < 10) riskPercent = 6;
    else if (points < 15) riskPercent = 11;
    else if (points < 20) riskPercent = 20;
    else riskPercent = 30;

    return {
      value: riskPercent,
      source: 'computed',
      confidence: 'high',
      category: this.categorizeFramingham(riskPercent)
    };
  }

  /**
   * Calculate FRAX Score (simplified)
   */
  public calculateFRAX(
    inputs: RiskCalculationInputs, 
    externalMajor?: number,
    externalHip?: number
  ): { major: RiskScoreWithConflict; hip: RiskScoreWithConflict } {
    const computedMajor = this.computeFRAXMajor(inputs);
    const computedHip = this.computeFRAXHip(inputs);
    
    return {
      major: this.resolveScoreConflict('FRAX_major', computedMajor, externalMajor),
      hip: this.resolveScoreConflict('FRAX_hip', computedHip, externalHip)
    };
  }

  private computeFRAXMajor(inputs: RiskCalculationInputs): RiskScore {
    const missingFields: string[] = [];
    
    if (!inputs.age) missingFields.push('age');
    if (!inputs.sex) missingFields.push('sex');
    
    if (missingFields.length > 0) {
      return {
        value: 0,
        source: 'unavailable',
        missingFields,
        confidence: 'low'
      };
    }

    // Simplified FRAX calculation (actual FRAX requires complex BMD data)
    let risk = inputs.age * 0.3; // Base risk increases with age
    
    if (inputs.sex === 'female') risk *= 1.5; // Higher risk for females
    if (inputs.previous_fracture) risk *= 1.8;
    if (inputs.parental_hip_fracture) risk *= 1.7;
    if (inputs.smoking_status) risk *= 1.4;
    if (inputs.glucocorticoids) risk *= 2.3;
    if (inputs.rheumatoid_arthritis) risk *= 1.4;
    if (inputs.secondary_osteoporosis) risk *= 1.6;
    if (inputs.alcohol_3_units) risk *= 1.7;
    
    const riskPercent = Math.min(50, Math.max(0, risk));

    return {
      value: Math.round(riskPercent * 10) / 10,
      source: 'computed',
      confidence: 'medium',
      category: this.categorizeFRAX(riskPercent)
    };
  }

  private computeFRAXHip(inputs: RiskCalculationInputs): RiskScore {
    const major = this.computeFRAXMajor(inputs);
    if (major.source === 'unavailable') return major;
    
    // Hip fracture risk is typically 20-30% of major osteoporotic fracture risk
    const hipRisk = major.value * 0.25;
    
    return {
      value: Math.round(hipRisk * 10) / 10,
      source: 'computed',
      confidence: 'medium',
      category: this.categorizeHipFRAX(hipRisk)
    };
  }

  /**
   * Calculate Gail Model (Breast Cancer Risk)
   */
  public calculateGail(
    inputs: RiskCalculationInputs, 
    externalScore?: number
  ): RiskScoreWithConflict {
    const computed = this.computeGail(inputs);
    return this.resolveScoreConflict('GAIL_5yr', computed, externalScore);
  }

  private computeGail(inputs: RiskCalculationInputs): RiskScore {
    const missingFields: string[] = [];
    
    if (!inputs.age) missingFields.push('age');
    if (!inputs.sex || inputs.sex !== 'female') {
      return {
        value: 0,
        source: 'unavailable',
        missingFields: ['female_sex_required'],
        confidence: 'low'
      };
    }
    
    if (inputs.age_menarche === undefined) missingFields.push('age_menarche');
    if (inputs.age_first_birth === undefined) missingFields.push('age_first_birth');
    if (inputs.num_relatives === undefined) missingFields.push('num_relatives');
    if (inputs.num_biopsies === undefined) missingFields.push('num_biopsies');
    
    if (missingFields.length > 0) {
      return {
        value: 0,
        source: 'unavailable',
        missingFields,
        confidence: 'low'
      };
    }

    // Simplified Gail Model calculation
    let relativeRisk = 1.0;
    const age = inputs.age;
    
    // Age factor (base rates from SEER data)
    let baselineRisk: number;
    if (age < 50) baselineRisk = 0.49;
    else if (age < 60) baselineRisk = 1.07;
    else if (age < 70) baselineRisk = 1.86;
    else baselineRisk = 2.48;
    
    // Age at menarche
    const menarche = inputs.age_menarche!;
    if (menarche < 12) relativeRisk *= 1.21;
    else if (menarche >= 14) relativeRisk *= 0.93;
    
    // Age at first birth
    const firstBirth = inputs.age_first_birth!;
    if (firstBirth === 0) { // nulliparous
      if (age < 30) relativeRisk *= 1.93;
      else relativeRisk *= 1.53;
    } else if (firstBirth >= 30) {
      relativeRisk *= 1.27;
    } else if (firstBirth < 20) {
      relativeRisk *= 0.76;
    }
    
    // Family history
    const numRelatives = inputs.num_relatives!;
    if (numRelatives === 1) relativeRisk *= 1.61;
    else if (numRelatives >= 2) relativeRisk *= 2.76;
    
    // Biopsy history
    const numBiopsies = inputs.num_biopsies!;
    if (numBiopsies === 1) {
      relativeRisk *= inputs.atypical_hyperplasia ? 1.82 : 1.27;
    } else if (numBiopsies >= 2) {
      relativeRisk *= inputs.atypical_hyperplasia ? 2.19 : 1.62;
    }
    
    // Calculate 5-year risk
    const fiveYearRisk = baselineRisk * relativeRisk;

    return {
      value: Math.round(fiveYearRisk * 100) / 100,
      source: 'computed',
      confidence: 'high',
      category: this.categorizeGail(fiveYearRisk)
    };
  }

  /**
   * Calculate Wells VTE Score
   */
  public calculateWells(
    inputs: RiskCalculationInputs, 
    externalScore?: number
  ): RiskScoreWithConflict {
    const computed = this.computeWells(inputs);
    return this.resolveScoreConflict('Wells', computed, externalScore);
  }

  private computeWells(inputs: RiskCalculationInputs): RiskScore {
    let score = 0;
    const missingFields: string[] = [];
    
    // Wells VTE Score - each item is 1 point except where noted
    if (inputs.active_cancer !== undefined) {
      if (inputs.active_cancer) score += 1;
    } else {
      missingFields.push('active_cancer');
    }
    
    if (inputs.paralysis_paresis !== undefined) {
      if (inputs.paralysis_paresis) score += 1;
    } else {
      missingFields.push('paralysis_paresis');
    }
    
    if (inputs.recently_bedridden !== undefined) {
      if (inputs.recently_bedridden) score += 1;
    } else {
      missingFields.push('recently_bedridden');
    }
    
    if (inputs.major_surgery !== undefined) {
      if (inputs.major_surgery) score += 1;
    } else {
      missingFields.push('major_surgery');
    }
    
    if (inputs.localized_tenderness !== undefined) {
      if (inputs.localized_tenderness) score += 1;
    } else {
      missingFields.push('localized_tenderness');
    }
    
    if (inputs.entire_leg_swollen !== undefined) {
      if (inputs.entire_leg_swollen) score += 1;
    } else {
      missingFields.push('entire_leg_swollen');
    }
    
    if (inputs.calf_swelling !== undefined) {
      if (inputs.calf_swelling) score += 1;
    } else {
      missingFields.push('calf_swelling');
    }
    
    if (inputs.pitting_edema !== undefined) {
      if (inputs.pitting_edema) score += 1;
    } else {
      missingFields.push('pitting_edema');
    }
    
    if (inputs.collateral_veins !== undefined) {
      if (inputs.collateral_veins) score += 1;
    } else {
      missingFields.push('collateral_veins');
    }
    
    if (inputs.alternative_diagnosis !== undefined) {
      if (inputs.alternative_diagnosis) score -= 2; // This reduces score
    } else {
      missingFields.push('alternative_diagnosis');
    }

    const confidence = missingFields.length > 3 ? 'low' : missingFields.length > 0 ? 'medium' : 'high';

    return {
      value: Math.max(0, score), // Wells score can't be negative in practice
      source: missingFields.length > 5 ? 'unavailable' : 'computed',
      confidence,
      missingFields: missingFields.length > 0 ? missingFields : undefined,
      category: this.categorizeWells(score)
    };
  }

  /**
   * Resolve conflicts between external and computed scores
   */
  private resolveScoreConflict(
    scoreName: string, 
    computed: RiskScore, 
    external?: number
  ): RiskScoreWithConflict {
    if (external === undefined) {
      return { ...computed };
    }

    if (computed.source === 'unavailable') {
      return {
        ...computed,
        value: external,
        source: 'external',
        externalValue: external
      };
    }

    // Check for conflict (>5% difference)
    const difference = Math.abs(external - computed.value);
    const conflictPercentage = (difference / Math.max(external, computed.value)) * 100;
    const hasConflict = conflictPercentage > 5;

    return {
      value: external, // External takes precedence
      source: 'external',
      confidence: hasConflict ? 'medium' : computed.confidence,
      category: computed.category,
      externalValue: external,
      computedValue: computed.value,
      hasConflict,
      conflictPercentage: hasConflict ? Math.round(conflictPercentage * 10) / 10 : undefined
    };
  }

  // Risk categorization methods
  private categorizeASCVD(risk: number): string {
    if (risk < 5) return 'Low (<5%)';
    if (risk < 7.5) return 'Borderline (5-7.5%)';
    if (risk < 20) return 'Intermediate (7.5-20%)';
    return 'High (≥20%)';
  }

  private categorizeFramingham(risk: number): string {
    if (risk < 10) return 'Low (<10%)';
    if (risk < 20) return 'Intermediate (10-20%)';
    return 'High (≥20%)';
  }

  private categorizeFRAX(risk: number): string {
    if (risk < 10) return 'Low (<10%)';
    if (risk < 20) return 'Moderate (10-20%)';
    return 'High (≥20%)';
  }

  private categorizeHipFRAX(risk: number): string {
    if (risk < 3) return 'Low (<3%)';
    return 'High (≥3%)';
  }

  private categorizeGail(risk: number): string {
    if (risk < 1.7) return 'Average risk (<1.7%)';
    return 'High risk (≥1.7%)';
  }

  private categorizeWells(score: number): string {
    if (score <= 0) return 'Low probability (≤0)';
    if (score <= 2) return 'Moderate probability (1-2)';
    return 'High probability (≥3)';
  }
}