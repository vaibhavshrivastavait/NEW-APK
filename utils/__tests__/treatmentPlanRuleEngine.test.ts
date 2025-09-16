import TreatmentPlanRuleEngine, { PatientData } from '../treatmentPlanRuleEngine';
import testCases from '../../data/treatmentPlanTestCases.json';

// Mock AsyncStorage for testing
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(() => Promise.resolve(null)),
}));

describe('TreatmentPlanRuleEngine', () => {
  let ruleEngine: TreatmentPlanRuleEngine;

  beforeEach(() => {
    ruleEngine = new TreatmentPlanRuleEngine();
  });

  describe('Rule Evaluation Tests', () => {
    test('Should generate high-urgency contraindication for active breast cancer + HRT', () => {
      const patientData: PatientData = {
        age: 52,
        gender: 'female',
        medicineType: 'HRT',
        history: {
          breastCancer_active: true,
          VTE: false
        },
        riskScores: {}
      };

      const plan = ruleEngine.generateTreatmentPlan(patientData);

      expect(plan.primaryRecommendations).toHaveLength(1);
      expect(plan.primaryRecommendations[0].urgency).toBe('high');
      expect(plan.primaryRecommendations[0].recommendation).toContain('contraindicated');
      expect(plan.primaryRecommendations[0].confidence).toBeGreaterThanOrEqual(90);
      expect(plan.urgentFlags).toHaveLength(1);
    });

    test('Should generate VTE history contraindication for HRT', () => {
      const patientData: PatientData = {
        age: 55,
        gender: 'female',
        medicineType: 'HRT',
        history: {
          VTE: true,
          breastCancer_active: false
        },
        riskScores: {}
      };

      const plan = ruleEngine.generateTreatmentPlan(patientData);

      expect(plan.primaryRecommendations).toHaveLength(1);
      expect(plan.primaryRecommendations[0].recommendation).toContain('VTE history');
      expect(plan.primaryRecommendations[0].confidence).toBe(90);
      expect(plan.primaryRecommendations[0].urgency).toBe('medium');
    });

    test('Should detect herb-drug interactions', () => {
      const patientData: PatientData = {
        age: 58,
        gender: 'female',
        medicineType: 'HerbalSupplement',
        currentMedications: ['warfarin', 'metformin'],
        medicationListContains: ['warfarin'],
        riskScores: {}
      };

      const plan = ruleEngine.generateTreatmentPlan(patientData);

      expect(plan.primaryRecommendations).toHaveLength(1);
      expect(plan.primaryRecommendations[0].recommendation).toContain('herb-drug interaction');
      expect(plan.primaryRecommendations[0].confidence).toBe(85);
      expect(plan.primaryRecommendations[0].urgency).toBe('medium');
    });

    test('Should recommend cardiology consult for high ASCVD + HRT', () => {
      const patientData: PatientData = {
        age: 62,
        gender: 'female',
        medicineType: 'HRT',
        riskScores: {
          ASCVD: 16.5
        },
        history: {
          VTE: false,
          breastCancer_active: false
        }
      };

      const plan = ruleEngine.generateTreatmentPlan(patientData);

      expect(plan.primaryRecommendations).toHaveLength(1);
      expect(plan.primaryRecommendations[0].recommendation).toContain('cardiology consultation');
      expect(plan.primaryRecommendations[0].confidence).toBe(80);
      expect(plan.primaryRecommendations[0].urgency).toBe('medium');
    });

    test('Should recommend osteoporosis specialist for high FRAX', () => {
      const patientData: PatientData = {
        age: 68,
        gender: 'female',
        riskScores: {
          FRAX: 22.3
        },
        history: {
          VTE: false,
          breastCancer_active: false
        }
      };

      const plan = ruleEngine.generateTreatmentPlan(patientData);

      expect(plan.primaryRecommendations).toHaveLength(1);
      expect(plan.primaryRecommendations[0].recommendation).toContain('osteoporosis specialist');
      expect(plan.primaryRecommendations[0].confidence).toBe(85);
      expect(plan.primaryRecommendations[0].urgency).toBe('medium');
    });

    test('Should flag urgent thrombosis evaluation for high Wells score', () => {
      const patientData: PatientData = {
        age: 59,
        gender: 'female',
        riskScores: {
          Wells: 7.5
        },
        symptoms: {
          legSwelling: true,
          legPain: true
        }
      };

      const plan = ruleEngine.generateTreatmentPlan(patientData);

      expect(plan.primaryRecommendations).toHaveLength(1);
      expect(plan.primaryRecommendations[0].recommendation).toContain('Urgent thrombosis evaluation');
      expect(plan.primaryRecommendations[0].confidence).toBe(95);
      expect(plan.primaryRecommendations[0].urgency).toBe('high');
      expect(plan.urgentFlags).toHaveLength(1);
    });
  });

  describe('Data Validation Tests', () => {
    test('Should throw error for missing required fields', () => {
      const invalidData = {
        gender: 'female'
        // Missing age
      } as PatientData;

      expect(() => {
        ruleEngine.generateTreatmentPlan(invalidData);
      }).toThrow('Incomplete data: age');
    });

    test('Should calculate data completeness correctly', () => {
      const partialData: PatientData = {
        age: 55,
        gender: 'female',
        medicineType: 'HRT',
        riskScores: {
          ASCVD: 12.5,
          // Missing other scores
        }
      };

      const plan = ruleEngine.generateTreatmentPlan(partialData);
      expect(plan.patientData.dataCompleteness).toBeLessThan(100);
      expect(plan.patientData.dataCompleteness).toBeGreaterThan(0);
    });
  });

  describe('Confidence and Urgency Tests', () => {
    test('Should sort recommendations by urgency and confidence', () => {
      const patientData: PatientData = {
        age: 52,
        gender: 'female',
        medicineType: 'HRT',
        riskScores: {
          ASCVD: 16.5,
          Wells: 7.0
        },
        history: {
          breastCancer_active: true,
          VTE: false
        }
      };

      const plan = ruleEngine.generateTreatmentPlan(patientData);

      // Should have multiple recommendations
      expect(plan.primaryRecommendations.length).toBeGreaterThan(1);

      // High urgency should come first
      const urgencies = plan.primaryRecommendations.map(r => r.urgency);
      const highUrgencyIndex = urgencies.indexOf('high');
      const mediumUrgencyIndex = urgencies.indexOf('medium');
      
      if (highUrgencyIndex !== -1 && mediumUrgencyIndex !== -1) {
        expect(highUrgencyIndex).toBeLessThan(mediumUrgencyIndex);
      }
    });

    test('Should calculate overall confidence correctly', () => {
      const patientData: PatientData = {
        age: 62,
        gender: 'female',
        medicineType: 'HRT',
        riskScores: {
          ASCVD: 16.5
        },
        history: {
          VTE: false,
          breastCancer_active: false
        }
      };

      const plan = ruleEngine.generateTreatmentPlan(patientData);

      expect(plan.auditTrail.overallConfidence).toBeGreaterThan(0);
      expect(plan.auditTrail.overallConfidence).toBeLessThanOrEqual(100);
    });
  });

  describe('Test Cases Validation', () => {
    test('Should process all predefined test cases without errors', () => {
      testCases.testCases.forEach((testCase, index) => {
        try {
          const plan = ruleEngine.generateTreatmentPlan(testCase.input as PatientData);
          expect(plan).toBeDefined();
          expect(plan.planId).toBeDefined();
          expect(plan.primaryRecommendations).toBeDefined();
          console.log(`✅ Test case ${index + 1} (${testCase.id}) passed`);
        } catch (error) {
          console.error(`❌ Test case ${index + 1} (${testCase.id}) failed:`, error);
          throw error;
        }
      });
    });
  });

  describe('Clinical Summary and Action Items', () => {
    test('Should generate appropriate clinical summary', () => {
      const patientData: PatientData = {
        age: 55,
        gender: 'female',
        medicineType: 'HRT',
        riskScores: {
          ASCVD: 12.5
        },
        history: {
          VTE: false,
          breastCancer_active: false
        }
      };

      const plan = ruleEngine.generateTreatmentPlan(patientData);

      expect(plan.clinicalSummary).toContain('55-year-old female');
      expect(plan.clinicalSummary).toContain('advisory');
      expect(plan.clinicalSummary).toContain('clinician review');
    });

    test('Should generate action items based on urgency', () => {
      const patientData: PatientData = {
        age: 52,
        gender: 'female',
        medicineType: 'HRT',
        history: {
          breastCancer_active: true,
          VTE: false
        },
        riskScores: {}
      };

      const plan = ruleEngine.generateTreatmentPlan(patientData);

      expect(plan.actionItems).toContain('🔴 URGENT: Schedule immediate clinician consultation');
      expect(plan.actionItems.length).toBeGreaterThan(1);
    });
  });

  describe('Alternative Therapies', () => {
    test('Should include alternative therapies', () => {
      const patientData: PatientData = {
        age: 55,
        gender: 'female',
        medicineType: 'HRT',
        history: {
          VTE: true,
          breastCancer_active: false
        },
        riskScores: {}
      };

      const plan = ruleEngine.generateTreatmentPlan(patientData);

      expect(plan.alternativeTherapies.length).toBeGreaterThan(0);
      expect(plan.alternativeTherapies).toContain('Lifestyle modifications (diet, exercise, stress management)');
    });
  });

  describe('Audit Trail', () => {
    test('Should maintain audit trail of fired rules', () => {
      const patientData: PatientData = {
        age: 55,
        gender: 'female',
        medicineType: 'HRT',
        history: {
          VTE: true,
          breastCancer_active: false
        },
        riskScores: {}
      };

      const plan = ruleEngine.generateTreatmentPlan(patientData);

      expect(plan.auditTrail.firedRules).toContain('hrt_vte_history');
      expect(plan.auditTrail.inputSnapshot).toEqual(expect.objectContaining({
        age: 55,
        gender: 'female',
        medicineType: 'HRT'
      }));
    });
  });
});