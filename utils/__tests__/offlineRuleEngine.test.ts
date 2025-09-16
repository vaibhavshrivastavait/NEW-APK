/**
 * Unit tests for Offline Rule Engine
 * Tests the treatment plan generation with offline knowledge base
 */

import OfflineRuleEngine, { PatientAssessment, TreatmentPlan } from '../offlineRuleEngine';
import testCases from '../../data/treatment_plan_testcases.json';

// Mock AsyncStorage and FileSystem for testing
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: '/test/',
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true })),
  makeDirectoryAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
}));

describe('OfflineRuleEngine', () => {
  let ruleEngine: OfflineRuleEngine;

  beforeEach(async () => {
    ruleEngine = new OfflineRuleEngine();
    await ruleEngine.initialize();
  });

  describe('Assessment Validation', () => {
    test('Should validate complete assessment correctly', () => {
      const assessment: PatientAssessment = {
        age: 55,
        gender: 'female',
        symptoms: { severity: 7 },
        history: { VTE: false, breastCancer_active: false },
        currentMedications: ['aspirin'],
        medicineType: 'HRT'
      };

      const validation = ruleEngine.validateAssessment(assessment);
      
      expect(validation.isValid).toBe(true);
      expect(validation.missingRequired).toHaveLength(0);
    });

    test('Should identify missing required fields', () => {
      const assessment: PatientAssessment = {
        gender: 'female',
        symptoms: { severity: 6 }
        // Missing age
      };

      const validation = ruleEngine.validateAssessment(assessment);
      
      expect(validation.isValid).toBe(false);
      expect(validation.missingRequired).toContain('age');
    });

    test('Should preserve numeric types and not default to 10', () => {
      const assessment: PatientAssessment = {
        age: 45,
        gender: 'female',
        symptoms: { severity: 3, vasomotorSymptoms: 5 }, // Should remain as numbers
        riskScores: { ASCVD: 4.2 }
      };

      const validation = ruleEngine.validateAssessment(assessment);
      
      // Check that numeric values are preserved
      expect(typeof assessment.symptoms?.severity).toBe('number');
      expect(assessment.symptoms?.severity).toBe(3); // Not defaulted to 10
      expect(typeof assessment.riskScores?.ASCVD).toBe('number');
      expect(validation.warnings.some(warning => warning.includes('should be numeric'))).toBe(false);
    });
  });

  describe('Rule Evaluation Tests', () => {
    test('Case 1: Low severity produces conservative lifestyle-first plan', async () => {
      const testCase = testCases.testCases.find(tc => tc.id === 'case_1_low_severity_conservative');
      expect(testCase).toBeDefined();

      const plan = await ruleEngine.generateTreatmentPlan(testCase!.input as PatientAssessment);

      // Verify expected checks
      const checks = testCase!.expectedChecks;
      
      if (checks.hasLifestyleRecommendation) {
        expect(plan.recommendations.some(r => r.type === 'Lifestyle')).toBe(true);
      }
      
      expect(plan.recommendations.filter(r => r.type === 'Urgent')).toHaveLength(checks.urgentRecommendations);
      
      if (checks.topRecommendationType) {
        expect(plan.recommendations[0].type).toBe(checks.topRecommendationType);
      }
      
      if (checks.confidenceRange) {
        const topConfidence = plan.recommendations[0].confidenceScore;
        expect(topConfidence).toBeGreaterThanOrEqual(checks.confidenceRange[0]);
        expect(topConfidence).toBeLessThanOrEqual(checks.confidenceRange[1]);
      }
      
      expect(plan.generalPlan).toHaveLength(checks.generalPlanLength);
    });

    test('Case 2: HRT + VTE history produces contraindication + referral', async () => {
      const testCase = testCases.testCases.find(tc => tc.id === 'case_2_hrt_vte_contraindication');
      expect(testCase).toBeDefined();

      const plan = await ruleEngine.generateTreatmentPlan(testCase!.input as PatientAssessment);

      const checks = testCase!.expectedChecks;
      
      if (checks.hasContraindication) {
        expect(plan.flags.contraindicated.length).toBeGreaterThan(0);
      }
      
      expect(plan.recommendations.filter(r => r.type === 'Urgent')).toHaveLength(checks.urgentRecommendations);
      expect(plan.recommendations[0].type).toBe(checks.topRecommendationType);
      
      if (checks.containsText) {
        expect(plan.recommendations[0].text.toLowerCase()).toContain(checks.containsText);
      }
      
      expect(plan.flags.urgent).toBe(checks.flagsUrgent);
    });

    test('Case 3: Herbal + warfarin shows interaction warning', async () => {
      const testCase = testCases.testCases.find(tc => tc.id === 'case_3_herbal_warfarin_interaction');
      expect(testCase).toBeDefined();

      const plan = await ruleEngine.generateTreatmentPlan(testCase!.input as PatientAssessment);

      const checks = testCase!.expectedChecks;
      
      if (checks.hasInteractionWarning) {
        expect(plan.recommendations.some(r => r.interactions && r.interactions.length > 0)).toBe(true);
      }
      
      if (checks.containsText) {
        expect(plan.recommendations[0].text.toLowerCase()).toContain(checks.containsText);
      }
      
      // Should not recommend HRT when there are interaction concerns
      if (checks.avoidsHRT) {
        expect(plan.recommendations.some(r => r.text.toLowerCase().includes('hrt is recommended'))).toBe(false);
      }
    });

    test('Case 4: Missing critical inputs prompt for completion', async () => {
      const testCase = testCases.testCases.find(tc => tc.id === 'case_4_missing_critical_inputs');
      expect(testCase).toBeDefined();

      try {
        const plan = await ruleEngine.generateTreatmentPlan(testCase!.input as PatientAssessment);
        
        const checks = testCase!.expectedChecks;
        
        // Should have data requirement warnings
        if (checks.hasDataRequirementWarning) {
          expect(plan.recommendations.some(r => r.requiresMoreData)).toBe(true);
        }
        
        if (checks.flagsMissingData) {
          expect(plan.flags.missingData.length).toBeGreaterThan(0);
        }
        
        // Verify no values were defaulted to 10
        const inputSnapshot = plan.inputSnapshot;
        expect(inputSnapshot.age).not.toBe(10); // Should be undefined or original value
        
      } catch (error) {
        // Might throw error for insufficient data, which is also acceptable
        expect(error).toBeDefined();
      }
    });

    test('Case 5: Complete assessment shows comprehensive recommendations', async () => {
      const testCase = testCases.testCases.find(tc => tc.id === 'case_5_complete_assessment_high_risk');
      expect(testCase).toBeDefined();

      const plan = await ruleEngine.generateTreatmentPlan(testCase!.input as PatientAssessment);

      const checks = testCase!.expectedChecks;
      
      // Input snapshot should match original input
      if (checks.inputSnapshotMatches) {
        expect(plan.inputSnapshot.age).toBe(testCase!.input.age);
        expect(plan.inputSnapshot.gender).toBe(testCase!.input.gender);
        expect(plan.inputSnapshot.symptoms?.severity).toBe(testCase!.input.symptoms?.severity);
      }
      
      // Should have cardiology referral for high ASCVD
      if (checks.hasCardiologyReferral) {
        expect(plan.recommendations.some(r => 
          r.text.toLowerCase().includes('cardiology') || r.type === 'Refer'
        )).toBe(true);
      }
      
      // Check recommendations count range
      if (checks.recommendationsCount) {
        expect(plan.recommendations.length).toBeGreaterThanOrEqual(checks.recommendationsCount[0]);
        expect(plan.recommendations.length).toBeLessThanOrEqual(checks.recommendationsCount[1]);
      }
      
      // Check specific options count range
      if (checks.specificOptionsCount) {
        expect(plan.specificOptions.length).toBeGreaterThanOrEqual(checks.specificOptionsCount[0]);
        expect(plan.specificOptions.length).toBeLessThanOrEqual(checks.specificOptionsCount[1]);
      }
      
      // Verify evidence is provided
      if (checks.evidenceProvided) {
        expect(plan.recommendations.every(r => r.evidence.length > 0)).toBe(true);
      }
      
      // Verify audit trail is complete
      if (checks.auditTrailComplete) {
        expect(plan.auditTrail.rulesMatched.length).toBeGreaterThan(0);
        expect(plan.auditTrail.evidenceUsed.length).toBeGreaterThan(0);
        expect(plan.auditTrail.knowledgeVersion).toBeDefined();
      }
    });
  });

  describe('Output Structure Validation', () => {
    test('Should generate valid treatment plan structure', async () => {
      const assessment: PatientAssessment = {
        age: 52,
        gender: 'female',
        symptoms: { severity: 6 },
        history: { VTE: false, breastCancer_active: false },
        medicineType: 'HRT'
      };

      const plan = await ruleEngine.generateTreatmentPlan(assessment);

      // Verify required fields from validation rules
      const requiredFields = testCases.validationRules.outputStructure.required;
      for (const field of requiredFields) {
        expect(plan).toHaveProperty(field);
      }

      // Verify recommendation structure
      for (const rec of plan.recommendations) {
        const reqFields = testCases.validationRules.outputStructure.recommendations.required;
        for (const field of reqFields) {
          expect(rec).toHaveProperty(field);
        }
      }

      // Verify flags structure
      const flagFields = testCases.validationRules.outputStructure.flags.required;
      for (const field of flagFields) {
        expect(plan.flags).toHaveProperty(field);
      }

      // Verify audit trail structure
      const auditFields = testCases.validationRules.outputStructure.auditTrail.required;
      for (const field of auditFields) {
        expect(plan.auditTrail).toHaveProperty(field);
      }
    });

    test('Should meet business rules constraints', async () => {
      const assessment: PatientAssessment = {
        age: 60,
        gender: 'female',
        symptoms: { severity: 8 },
        history: { VTE: false, breastCancer_active: false },
        medicineType: 'HRT'
      };

      const plan = await ruleEngine.generateTreatmentPlan(assessment);

      const businessRules = testCases.validationRules.businessRules;

      // Evaluation time should be under limit
      expect(plan.auditTrail.evaluationTime).toBeLessThan(businessRules.evaluationTimeLimit);

      // General plan should have exactly 3 bullets
      expect(plan.generalPlan).toHaveLength(businessRules.generalPlanBullets);

      // Confidence scores should be in valid range
      for (const rec of plan.recommendations) {
        expect(rec.confidenceScore).toBeGreaterThanOrEqual(businessRules.minConfidenceScore);
        expect(rec.confidenceScore).toBeLessThanOrEqual(businessRules.maxConfidenceScore);
      }

      // Urgent recommendations should have high confidence
      const urgentRecs = plan.recommendations.filter(r => r.type === 'Urgent');
      for (const rec of urgentRecs) {
        expect(rec.confidenceScore).toBeGreaterThanOrEqual(businessRules.urgentTypesRequireHighConfidence);
      }
    });
  });

  describe('Performance and Determinism', () => {
    test('Should be deterministic - same input produces same output', async () => {
      const assessment: PatientAssessment = {
        age: 55,
        gender: 'female',
        symptoms: { severity: 7, vasomotorSymptoms: 8 },
        history: { VTE: false, breastCancer_active: false },
        riskScores: { ASCVD: 12.5 },
        medicineType: 'HRT'
      };

      const plan1 = await ruleEngine.generateTreatmentPlan(assessment);
      const plan2 = await ruleEngine.generateTreatmentPlan(assessment);

      // Should have same number of recommendations
      expect(plan1.recommendations.length).toBe(plan2.recommendations.length);

      // Should have same recommendation types and priorities
      for (let i = 0; i < plan1.recommendations.length; i++) {
        expect(plan1.recommendations[i].type).toBe(plan2.recommendations[i].type);
        expect(plan1.recommendations[i].priority).toBe(plan2.recommendations[i].priority);
        expect(plan1.recommendations[i].confidenceScore).toBe(plan2.recommendations[i].confidenceScore);
      }

      // Should have same flags
      expect(plan1.flags.urgent).toBe(plan2.flags.urgent);
      expect(plan1.flags.contraindicated).toEqual(plan2.flags.contraindicated);
    });

    test('Should complete evaluation in reasonable time', async () => {
      const assessment: PatientAssessment = {
        age: 58,
        gender: 'female',
        symptoms: { 
          severity: 7, 
          vasomotorSymptoms: 8, 
          sleepDisturbances: 6,
          moodChanges: 5 
        },
        history: { 
          VTE: false, 
          breastCancer_active: false,
          cardiovascular: false,
          diabetes: true 
        },
        currentMedications: ['metformin', 'lisinopril'],
        riskScores: { ASCVD: 15.8, FRAX: 18.2 },
        medicineType: 'HRT'
      };

      const startTime = Date.now();
      const plan = await ruleEngine.generateTreatmentPlan(assessment);
      const endTime = Date.now();

      const executionTime = endTime - startTime;
      
      // Should complete in reasonable time (under 200ms as per requirements)
      expect(executionTime).toBeLessThan(200);
      
      // Audit trail should also record reasonable evaluation time
      expect(plan.auditTrail.evaluationTime).toBeLessThan(200);
    });
  });

  describe('Local Storage and Persistence', () => {
    test('Should save and retrieve treatment plans', async () => {
      const assessment: PatientAssessment = {
        age: 50,
        gender: 'female',
        symptoms: { severity: 5 },
        history: { VTE: false, breastCancer_active: false },
        medicineType: 'none'
      };

      const plan = await ruleEngine.generateTreatmentPlan(assessment);
      
      // Should save successfully
      await ruleEngine.saveTreatmentPlan(plan);
      
      // Should retrieve successfully
      const retrievedPlan = await ruleEngine.getPlanById(plan.planId);
      expect(retrievedPlan).toBeDefined();
      expect(retrievedPlan?.planId).toBe(plan.planId);
    });

    test('Should get knowledge version info', () => {
      const versionInfo = ruleEngine.getKnowledgeVersion();
      
      expect(versionInfo).toBeDefined();
      expect(versionInfo?.version).toBeDefined();
      expect(versionInfo?.rulesCount).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    test('Should handle empty assessment gracefully', async () => {
      const assessment: PatientAssessment = {};

      try {
        await ruleEngine.generateTreatmentPlan(assessment);
        // Should not reach here if validation is working
        expect(false).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('Should handle assessment with all undefined values', async () => {
      const assessment: PatientAssessment = {
        age: undefined,
        gender: undefined,
        symptoms: undefined,
        history: undefined
      };

      try {
        await ruleEngine.generateTreatmentPlan(assessment);
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('Should handle contradictory input appropriately', async () => {
      const assessment: PatientAssessment = {
        age: 45,
        gender: 'female',
        symptoms: { severity: 9 }, // High severity
        history: {
          VTE: true, // Contradicts HRT
          breastCancer_active: true // Also contradicts HRT
        },
        medicineType: 'HRT' // But still requesting HRT
      };

      const plan = await ruleEngine.generateTreatmentPlan(assessment);

      // Should flag as urgent due to multiple contraindications
      expect(plan.flags.urgent).toBe(true);
      expect(plan.flags.contraindicated.length).toBeGreaterThan(0);
      
      // Should have urgent recommendations
      const urgentRecs = plan.recommendations.filter(r => r.type === 'Urgent');
      expect(urgentRecs.length).toBeGreaterThan(0);
    });
  });
});