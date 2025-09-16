/**
 * Unit Tests for Medical Risk Calculators
 * Validates accuracy of clinical algorithms and edge cases
 */

import { 
  calculateFraminghamRisk,
  calculateASCVDRisk,
  calculateGailRisk,
  calculateTyrerCuzickRisk,
  calculateWellsScore,
  calculateFRAXRisk,
  calculateAllRisks,
  type PatientRiskData 
} from '../medicalCalculators';

describe('Medical Risk Calculators', () => {
  
  // Sample patient data for testing
  const basePatient: PatientRiskData = {
    age: 55,
    gender: 'female',
    weight: 70,
    height: 165,
    bmi: 25.7,
    smoking: false,
    diabetes: false,
    hypertension: false,
    cholesterolHigh: false,
    familyHistoryBreastCancer: false,
    personalHistoryBreastCancer: false,
    personalHistoryDVT: false,
    thrombophilia: false,
    menopausalStatus: 'postmenopausal',
    hysterectomy: false
  };

  const highRiskPatient: PatientRiskData = {
    ...basePatient,
    age: 65,
    smoking: true,
    diabetes: true,
    hypertension: true,
    cholesterolHigh: true,
    familyHistoryBreastCancer: true,
    bmi: 32
  };

  describe('Framingham Risk Calculator', () => {
    test('should calculate low risk for healthy patient', () => {
      const result = calculateFraminghamRisk(basePatient);
      expect(result.risk).toBeGreaterThanOrEqual(0);
      expect(result.risk).toBeLessThanOrEqual(100);
      expect(result.category).toBeDefined();
      expect(['Low', 'Intermediate', 'High']).toContain(result.category);
    });

    test('should calculate higher risk for high-risk patient', () => {
      const result = calculateFraminghamRisk(highRiskPatient);
      expect(result.risk).toBeGreaterThan(0);
      expect(result.category).toBeDefined();
    });

    test('should handle edge cases - very young patient', () => {
      const youngPatient = { ...basePatient, age: 25 };
      const result = calculateFraminghamRisk(youngPatient);
      expect(result.risk).toBeGreaterThanOrEqual(0);
      expect(result.category).toBe('Low');
    });

    test('should handle edge cases - very old patient', () => {
      const oldPatient = { ...basePatient, age: 85 };
      const result = calculateFraminghamRisk(oldPatient);
      expect(result.risk).toBeGreaterThan(0);
    });
  });

  describe('ASCVD Risk Calculator', () => {
    test('should calculate reasonable risk for base patient', () => {
      const result = calculateASCVDRisk(basePatient);
      expect(result.risk).toBeGreaterThanOrEqual(0);
      expect(result.risk).toBeLessThanOrEqual(100);
      expect(['Low', 'Borderline', 'Intermediate', 'High']).toContain(result.category);
    });

    test('should show increased risk with risk factors', () => {
      const result = calculateASCVDRisk(highRiskPatient);
      expect(result.risk).toBeGreaterThan(0);
      expect(result.category).toBeDefined();
    });

    test('should handle diabetes as major risk factor', () => {
      const diabeticPatient = { ...basePatient, diabetes: true };
      const baseResult = calculateASCVDRisk(basePatient);
      const diabeticResult = calculateASCVDRisk(diabeticPatient);
      expect(diabeticResult.risk).toBeGreaterThan(baseResult.risk);
    });
  });

  describe('Gail Model Breast Cancer Risk', () => {
    test('should calculate baseline risk for average patient', () => {
      const result = calculateGailRisk(basePatient);
      expect(result.risk).toBeGreaterThanOrEqual(0);
      expect(result.risk).toBeLessThanOrEqual(10);
      expect(['Low', 'Moderate', 'High']).toContain(result.category);
    });

    test('should increase risk with family history', () => {
      const familyHistoryPatient = { ...basePatient, familyHistoryBreastCancer: true };
      const baseResult = calculateGailRisk(basePatient);
      const familyResult = calculateGailRisk(familyHistoryPatient);
      expect(familyResult.risk).toBeGreaterThan(baseResult.risk);
    });

    test('should handle personal history as very high risk', () => {
      const personalHistoryPatient = { ...basePatient, personalHistoryBreastCancer: true };
      const result = calculateGailRisk(personalHistoryPatient);
      expect(result.risk).toBeGreaterThan(2);
      expect(result.category).toBe('High');
    });

    test('should increase risk with age', () => {
      const youngerPatient = { ...basePatient, age: 40 };
      const olderPatient = { ...basePatient, age: 70 };
      const youngerResult = calculateGailRisk(youngerPatient);
      const olderResult = calculateGailRisk(olderPatient);
      expect(olderResult.risk).toBeGreaterThan(youngerResult.risk);
    });
  });

  describe('Tyrer-Cuzick Breast Cancer Risk', () => {
    test('should calculate risk within reasonable bounds', () => {
      const result = calculateTyrerCuzickRisk(basePatient);
      expect(result.risk).toBeGreaterThanOrEqual(0);
      expect(result.risk).toBeLessThanOrEqual(15);
      expect(['Low', 'Moderate', 'High']).toContain(result.category);
    });

    test('should factor in obesity', () => {
      const obesePatient = { ...basePatient, bmi: 35 };
      const baseResult = calculateTyrerCuzickRisk(basePatient);
      const obeseResult = calculateTyrerCuzickRisk(obesePatient);
      expect(obeseResult.risk).toBeGreaterThan(baseResult.risk);
    });
  });

  describe('Wells Score for VTE', () => {
    test('should calculate low risk for healthy patient', () => {
      const result = calculateWellsScore(basePatient);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(['Low', 'Moderate', 'High']).toContain(result.category);
      expect(result.interpretation).toBeDefined();
    });

    test('should increase score with DVT history', () => {
      const dvtPatient = { ...basePatient, personalHistoryDVT: true };
      const result = calculateWellsScore(dvtPatient);
      expect(result.score).toBeGreaterThanOrEqual(3);
    });

    test('should increase score with thrombophilia', () => {
      const thrombophiliaPatient = { ...basePatient, thrombophilia: true };
      const result = calculateWellsScore(thrombophiliaPatient);
      expect(result.score).toBeGreaterThanOrEqual(3);
    });

    test('should have appropriate interpretation for each category', () => {
      const lowRiskResult = calculateWellsScore(basePatient);
      expect(lowRiskResult.interpretation).toContain('Low probability');
      
      const highRiskPatientVTE = { ...basePatient, personalHistoryDVT: true, thrombophilia: true };
      const highRiskResult = calculateWellsScore(highRiskPatientVTE);
      expect(highRiskResult.category).toBe('High');
    });
  });

  describe('FRAX Fracture Risk Calculator', () => {
    test('should calculate fracture risk within reasonable bounds', () => {
      const result = calculateFRAXRisk(basePatient);
      expect(result.hipFractureRisk).toBeGreaterThanOrEqual(0);
      expect(result.hipFractureRisk).toBeLessThanOrEqual(30);
      expect(result.majorFractureRisk).toBeGreaterThanOrEqual(0);
      expect(result.majorFractureRisk).toBeLessThanOrEqual(50);
      expect(['Low', 'Moderate', 'High']).toContain(result.category);
    });

    test('should increase risk with age', () => {
      const youngerPatient = { ...basePatient, age: 50 };
      const olderPatient = { ...basePatient, age: 75 };
      const youngerResult = calculateFRAXRisk(youngerPatient);
      const olderResult = calculateFRAXRisk(olderPatient);
      expect(olderResult.majorFractureRisk).toBeGreaterThan(youngerResult.majorFractureRisk);
    });

    test('should increase risk with smoking', () => {
      const smokerPatient = { ...basePatient, smoking: true };
      const baseResult = calculateFRAXRisk(basePatient);
      const smokerResult = calculateFRAXRisk(smokerPatient);
      expect(smokerResult.majorFractureRisk).toBeGreaterThan(baseResult.majorFractureRisk);
    });

    test('should increase risk with hysterectomy (early menopause)', () => {
      const hysterectomyPatient = { ...basePatient, hysterectomy: true };
      const baseResult = calculateFRAXRisk(basePatient);
      const hysterectomyResult = calculateFRAXRisk(hysterectomyPatient);
      expect(hysterectomyResult.majorFractureRisk).toBeGreaterThan(baseResult.majorFractureRisk);
    });
  });

  describe('Comprehensive Risk Assessment', () => {
    test('should calculate all risks simultaneously', () => {
      const results = calculateAllRisks(basePatient);
      
      expect(results.framingham).toBeDefined();
      expect(results.ascvd).toBeDefined();
      expect(results.gail).toBeDefined();
      expect(results.tyrerCuzick).toBeDefined();
      expect(results.wells).toBeDefined();
      expect(results.frax).toBeDefined();
      expect(results.calculatedAt).toBeInstanceOf(Date);
    });

    test('should handle high-risk patient comprehensively', () => {
      const results = calculateAllRisks(highRiskPatient);
      
      // High risk patient should have elevated scores across multiple domains
      expect(results.framingham.risk).toBeGreaterThan(0);
      expect(results.ascvd.risk).toBeGreaterThan(0);
      expect(results.gail.risk).toBeGreaterThan(0);
      expect(results.tyrerCuzick.risk).toBeGreaterThan(0);
      expect(results.frax.majorFractureRisk).toBeGreaterThan(0);
    });

    test('should maintain consistency across calculations', () => {
      const results1 = calculateAllRisks(basePatient);
      const results2 = calculateAllRisks(basePatient);
      
      // Same patient data should yield same results
      expect(results1.framingham.risk).toBe(results2.framingham.risk);
      expect(results1.ascvd.risk).toBe(results2.ascvd.risk);
      expect(results1.gail.risk).toBe(results2.gail.risk);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle missing BMI gracefully', () => {
      const noBMIPatient = { ...basePatient, bmi: undefined };
      const results = calculateAllRisks(noBMIPatient);
      
      expect(results.framingham).toBeDefined();
      expect(results.ascvd).toBeDefined();
      expect(results.frax).toBeDefined();
    });

    test('should handle extreme ages', () => {
      const veryOldPatient = { ...basePatient, age: 95 };
      const results = calculateAllRisks(veryOldPatient);
      
      expect(results.framingham.risk).toBeGreaterThanOrEqual(0);
      expect(results.ascvd.risk).toBeGreaterThanOrEqual(0);
    });

    test('should ensure risk categories are consistent with risk values', () => {
      const results = calculateAllRisks(basePatient);
      
      // Low risk should correspond to low percentages
      if (results.framingham.category === 'Low') {
        expect(results.framingham.risk).toBeLessThan(10);
      }
      
      if (results.ascvd.category === 'Low') {
        expect(results.ascvd.risk).toBeLessThan(5);
      }
    });
  });
});