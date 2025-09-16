/**
 * Unit Tests for Drug Interaction Checker
 * Validates HRT-specific interactions and contraindication detection
 */

import {
  checkDrugInteractions,
  checkHRTContraindications,
  getMedicationRecommendations,
  searchMedications,
  getMedicationInteractions,
  HRT_MEDICATIONS,
  INTERACTING_MEDICATIONS
} from '../drugInteractionChecker';

describe('Drug Interaction Checker', () => {

  // Sample patient data
  const basePatient = {
    age: 55,
    personalHistoryBreastCancer: false,
    personalHistoryDVT: false,
    thrombophilia: false,
    familyHistoryBreastCancer: false,
    bmi: 25,
    smoking: false,
    hypertension: false,
    diabetes: false,
    hysterectomy: false
  };

  const highRiskPatient = {
    ...basePatient,
    personalHistoryBreastCancer: true,
    personalHistoryDVT: true,
    thrombophilia: true,
    familyHistoryBreastCancer: true,
    bmi: 38,
    smoking: true,
    hypertension: true,
    diabetes: true
  };

  describe('HRT Medication Database', () => {
    test('should contain essential HRT medications', () => {
      const hrtNames = HRT_MEDICATIONS.map(med => med.name.toLowerCase());
      
      expect(hrtNames).toContain('estradiol');
      expect(hrtNames).toContain('conjugated estrogens');
      expect(hrtNames).toContain('micronized progesterone');
      expect(hrtNames).toContain('tibolone');
    });

    test('should contain interacting medications', () => {
      const interactingNames = INTERACTING_MEDICATIONS.map(med => med.name.toLowerCase());
      
      expect(interactingNames).toContain('warfarin');
      expect(interactingNames).toContain('levothyroxine');
      expect(interactingNames).toContain('carbamazepine');
    });
  });

  describe('Drug Interaction Detection', () => {
    test('should detect anticoagulant interactions', () => {
      const hrtMeds = ['Estradiol'];
      const otherMeds = ['Warfarin'];
      const interactions = checkDrugInteractions(hrtMeds, otherMeds);
      
      expect(interactions).toHaveLength(1);
      expect(interactions[0].severity).toBe('major');
      expect(interactions[0].message).toContain('may interact');
      expect(interactions[0].recommendation).toContain('Monitor INR');
    });

    test('should detect enzyme inducer interactions', () => {
      const hrtMeds = ['Estradiol'];
      const otherMeds = ['Carbamazepine'];
      const interactions = checkDrugInteractions(hrtMeds, otherMeds);
      
      expect(interactions).toHaveLength(1);
      expect(interactions[0].severity).toBe('moderate');
      expect(interactions[0].message).toContain('reduce the effectiveness');
    });

    test('should detect thyroid medication interactions', () => {
      const hrtMeds = ['Estradiol'];
      const otherMeds = ['Levothyroxine'];
      const interactions = checkDrugInteractions(hrtMeds, otherMeds);
      
      expect(interactions).toHaveLength(1);
      expect(interactions[0].severity).toBe('moderate');
      expect(interactions[0].message).toContain('thyroid-binding globulin');
    });

    test('should handle multiple medications', () => {
      const hrtMeds = ['Estradiol', 'Micronized Progesterone'];
      const otherMeds = ['Warfarin', 'Levothyroxine'];
      const interactions = checkDrugInteractions(hrtMeds, otherMeds);
      
      expect(interactions.length).toBeGreaterThan(1);
    });

    test('should return empty array for no interactions', () => {
      const hrtMeds = ['Estradiol'];
      const otherMeds = ['Aspirin']; // Not in interaction database
      const interactions = checkDrugInteractions(hrtMeds, otherMeds);
      
      expect(interactions).toHaveLength(0);
    });

    test('should be case insensitive', () => {
      const hrtMeds = ['ESTRADIOL'];
      const otherMeds = ['warfarin'];
      const interactions = checkDrugInteractions(hrtMeds, otherMeds);
      
      expect(interactions).toHaveLength(1);
    });
  });

  describe('HRT Contraindication Detection', () => {
    test('should detect absolute contraindications', () => {
      const alerts = checkHRTContraindications(highRiskPatient);
      
      const absoluteAlerts = alerts.filter(alert => alert.type === 'absolute');
      expect(absoluteAlerts.length).toBeGreaterThan(0);
      
      const breastCancerAlert = absoluteAlerts.find(alert => 
        alert.condition.includes('Breast Cancer')
      );
      expect(breastCancerAlert).toBeDefined();
      expect(breastCancerAlert?.message).toContain('absolutely contraindicated');
    });

    test('should detect VTE contraindications', () => {
      const vtePatient = { ...basePatient, personalHistoryDVT: true };
      const alerts = checkHRTContraindications(vtePatient);
      
      const vteAlert = alerts.find(alert => alert.condition.includes('VTE'));
      expect(vteAlert).toBeDefined();
      expect(vteAlert?.type).toBe('absolute');
    });

    test('should detect thrombophilia contraindications', () => {
      const thrombophiliaPatient = { ...basePatient, thrombophilia: true };
      const alerts = checkHRTContraindications(thrombophiliaPatient);
      
      const thrombophiliaAlert = alerts.find(alert => 
        alert.condition.includes('Thrombophilia')
      );
      expect(thrombophiliaAlert).toBeDefined();
      expect(thrombophiliaAlert?.type).toBe('absolute');
    });

    test('should detect relative contraindications', () => {
      const relativeRiskPatient = {
        ...basePatient,
        familyHistoryBreastCancer: true,
        bmi: 38,
        smoking: true
      };
      const alerts = checkHRTContraindications(relativeRiskPatient);
      
      const relativeAlerts = alerts.filter(alert => alert.type === 'relative');
      expect(relativeAlerts.length).toBeGreaterThan(0);
      
      const familyHistoryAlert = relativeAlerts.find(alert => 
        alert.condition.includes('Family History')
      );
      expect(familyHistoryAlert).toBeDefined();
    });

    test('should handle low-risk patient with no contraindications', () => {
      const alerts = checkHRTContraindications(basePatient);
      
      // Should have no absolute contraindications
      const absoluteAlerts = alerts.filter(alert => alert.type === 'absolute');
      expect(absoluteAlerts).toHaveLength(0);
    });

    test('should provide appropriate recommendations for each alert', () => {
      const alerts = checkHRTContraindications(highRiskPatient);
      
      alerts.forEach(alert => {
        expect(alert.recommendation).toBeDefined();
        expect(alert.recommendation.length).toBeGreaterThan(10);
      });
    });
  });

  describe('Medication Recommendations', () => {
    test('should recommend against HRT with absolute contraindications', () => {
      const absoluteContraindications = [
        {
          type: 'absolute' as const,
          condition: 'Personal History of Breast Cancer',
          message: 'Test',
          recommendation: 'Test'
        }
      ];
      
      const recommendations = getMedicationRecommendations(
        basePatient, 
        absoluteContraindications
      );
      
      expect(recommendations[0]).toContain('contraindicated');
      expect(recommendations.some(rec => rec.includes('SSRIs'))).toBe(true);
      expect(recommendations.some(rec => rec.includes('Gabapentin'))).toBe(true);
    });

    test('should recommend ET for hysterectomy patients', () => {
      const hysterectomyPatient = { ...basePatient, hysterectomy: true };
      const noContraindications: any[] = [];
      
      const recommendations = getMedicationRecommendations(
        hysterectomyPatient, 
        noContraindications
      );
      
      expect(recommendations.some(rec => rec.includes('Estrogen-only'))).toBe(true);
    });

    test('should recommend EPT for intact uterus', () => {
      const noContraindications: any[] = [];
      
      const recommendations = getMedicationRecommendations(
        basePatient, 
        noContraindications
      );
      
      expect(recommendations.some(rec => rec.includes('Combined estrogen-progestogen'))).toBe(true);
    });

    test('should recommend transdermal route for VTE risk', () => {
      const vteRiskPatient = { ...basePatient, bmi: 35, smoking: true };
      const noContraindications: any[] = [];
      
      const recommendations = getMedicationRecommendations(
        vteRiskPatient, 
        noContraindications
      );
      
      expect(recommendations.some(rec => rec.includes('Transdermal route preferred'))).toBe(true);
    });

    test('should recommend micronized progesterone', () => {
      const noContraindications: any[] = [];
      
      const recommendations = getMedicationRecommendations(
        basePatient, 
        noContraindications
      );
      
      expect(recommendations.some(rec => rec.includes('Micronized progesterone'))).toBe(true);
    });
  });

  describe('Medication Search', () => {
    test('should find medications by name', () => {
      const results = searchMedications('estradiol');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name.toLowerCase()).toContain('estradiol');
    });

    test('should find medications by brand name', () => {
      const results = searchMedications('premarin');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].brandNames).toContain('Premarin');
    });

    test('should be case insensitive', () => {
      const lowerResults = searchMedications('warfarin');
      const upperResults = searchMedications('WARFARIN');
      const mixedResults = searchMedications('Warfarin');
      
      expect(lowerResults).toEqual(upperResults);
      expect(upperResults).toEqual(mixedResults);
    });

    test('should return empty array for unknown medication', () => {
      const results = searchMedications('unknownmedication123');
      
      expect(results).toHaveLength(0);
    });
  });

  describe('Individual Medication Interactions', () => {
    test('should get interactions for specific medication', () => {
      const interactions = getMedicationInteractions('Warfarin');
      
      expect(interactions.length).toBeGreaterThan(0);
      expect(interactions[0].medications).toContain('Warfarin');
    });

    test('should return empty array for non-interacting medication', () => {
      const interactions = getMedicationInteractions('Aspirin');
      
      expect(interactions).toHaveLength(0);
    });
  });

  describe('Clinical Scenarios', () => {
    test('should handle complex polypharmacy scenario', () => {
      const hrtMeds = ['Estradiol', 'Micronized Progesterone'];
      const otherMeds = ['Warfarin', 'Levothyroxine', 'Carbamazepine'];
      const interactions = checkDrugInteractions(hrtMeds, otherMeds);
      
      expect(interactions.length).toBeGreaterThanOrEqual(3); // Each HRT med with each interacting med
      
      const severities = interactions.map(i => i.severity);
      expect(severities).toContain('major');
      expect(severities).toContain('moderate');
    });

    test('should provide comprehensive assessment for high-risk patient', () => {
      const contraindications = checkHRTContraindications(highRiskPatient);
      const recommendations = getMedicationRecommendations(highRiskPatient, contraindications);
      
      expect(contraindications.length).toBeGreaterThan(3);
      expect(recommendations[0]).toContain('contraindicated');
      expect(recommendations.some(rec => rec.includes('non-hormonal'))).toBe(true);
    });

    test('should handle postmenopausal patient with diabetes', () => {
      const diabeticPatient = { ...basePatient, diabetes: true };
      const contraindications = checkHRTContraindications(diabeticPatient);
      
      const diabetesAlert = contraindications.find(alert => 
        alert.condition.includes('Diabetes')
      );
      expect(diabetesAlert).toBeDefined();
      expect(diabetesAlert?.type).toBe('relative');
    });
  });
});