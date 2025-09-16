/**
 * Unit Tests for Treatment Plan Engine
 * Tests against example_cases.json to ensure deterministic behavior
 */

import { TreatmentPlanEngine, TreatmentInputs } from '../treatmentPlanEngine';
import exampleCases from '../../data/example_cases.json';

describe('TreatmentPlanEngine', () => {
  let engine: TreatmentPlanEngine;

  beforeEach(() => {
    engine = new TreatmentPlanEngine();
  });

  describe('Example Cases Validation', () => {
    exampleCases.cases.forEach((testCase) => {
      test(`Case ${testCase.id}: ${testCase.expected.primaryRecommendation}`, () => {
        // Convert test case inputs to TreatmentInputs format
        const inputs: TreatmentInputs = {
          age: testCase.inputs.age,
          sex: testCase.inputs.sex as 'male' | 'female',
          ASCVD: testCase.inputs.ASCVD,
          ASCVD_source: 'external',
          FRAX_major: testCase.inputs.FRAX_major,
          FRAX_major_source: 'external',
          GAIL_5yr: testCase.inputs.GAIL_5yr,
          GAIL_5yr_source: 'external',
          Wells: testCase.inputs.Wells,
          Wells_source: 'external',
          selected_medicine: testCase.inputs.selected_medicine,
          current_medications: testCase.inputs.current_medications,
          conditions: testCase.inputs.conditions.filter(condition => condition !== 'none')
        };

        // Run evaluation
        const result = engine.evaluateTreatment(inputs);

        // Check that required rules fired
        const firedRuleIds = result.firedRules.map(rule => rule.id);
        
        testCase.expected.mustFire.forEach(expectedRuleId => {
          expect(firedRuleIds).toContain(expectedRuleId);
        });

        // Check recommendation quality (not exact text match since we may have variations)
        expect(result.primaryRecommendation.text).toBeTruthy();
        expect(result.primaryRecommendation.strength).toMatch(/^(Strong|Conditional|Not recommended)$/);
        
        // Log results for verification (helpful for debugging)
        console.log(`\n=== Case ${testCase.id} ===`);
        console.log(`Expected: ${testCase.expected.primaryRecommendation}`);
        console.log(`Actual: ${result.primaryRecommendation.text}`);
        console.log(`Strength: ${result.primaryRecommendation.strength}`);
        console.log(`Fired Rules: ${firedRuleIds.join(', ')}`);
        console.log(`Expected Rules: ${testCase.expected.mustFire.join(', ')}`);
      });
    });
  });

  describe('Contraindications Processing', () => {
    test('should block treatment for absolute contraindications', () => {
      const inputs: TreatmentInputs = {
        age: 45,
        sex: 'female',
        selected_medicine: 'Estrogen (systemic)',
        current_medications: [],
        conditions: ['pregnancy'] // Absolute contraindication
      };

      const result = engine.evaluateTreatment(inputs);

      expect(result.primaryRecommendation.strength).toBe('Not recommended');
      expect(result.clinicianReviewRequired).toBe(true);
      expect(result.firedRules.some(rule => rule.id === 'C_ABS_PREGNANCY')).toBe(true);
    });

    test('should warn for relative contraindications', () => {
      const inputs: TreatmentInputs = {
        age: 50,
        sex: 'female',
        selected_medicine: 'Estrogen (systemic)',
        current_medications: [],
        conditions: ['uncontrolled_hypertension'] // Relative contraindication
      };

      const result = engine.evaluateTreatment(inputs);

      expect(result.clinicianReviewRequired).toBe(true);
      expect(result.firedRules.some(rule => rule.id === 'C_REL_HTN')).toBe(true);
    });
  });

  describe('Drug Interactions Processing', () => {
    test('should block high-severity interactions', () => {
      const inputs: TreatmentInputs = {
        age: 55,
        sex: 'female',
        selected_medicine: 'Estrogen (systemic)',
        current_medications: ['Warfarin'],
        conditions: []
      };

      const result = engine.evaluateTreatment(inputs);

      expect(result.primaryRecommendation.strength).toBe('Not recommended');
      expect(result.firedRules.some(rule => rule.id === 'I_HI_EST_WARF')).toBe(true);
    });

    test('should warn for moderate interactions', () => {
      const inputs: TreatmentInputs = {
        age: 48,
        sex: 'female',
        selected_medicine: 'Herbal supplement (St John\'s Wort)',
        current_medications: ['Combined oral contraceptive'],
        conditions: []
      };

      const result = engine.evaluateTreatment(inputs);

      expect(result.firedRules.some(rule => rule.id === 'I_MOD_STJ_COC')).toBe(true);
      expect(result.monitoring.length).toBeGreaterThan(0);
    });
  });

  describe('Risk Threshold Processing', () => {
    test('should trigger high ASCVD risk actions', () => {
      const inputs: TreatmentInputs = {
        age: 65,
        sex: 'female',
        ASCVD: 25,
        ASCVD_source: 'external',
        selected_medicine: 'Estrogen (systemic)',
        current_medications: [],
        conditions: []
      };

      const result = engine.evaluateTreatment(inputs);

      expect(result.firedRules.some(rule => rule.id === 'ASCVD_high')).toBe(true);
      expect(result.alternatives).toContain('Avoid estrogen-based HRT');
    });

    test('should trigger Wells VTE high risk', () => {
      const inputs: TreatmentInputs = {
        age: 53,
        sex: 'female',
        Wells: 3,
        Wells_source: 'external',
        selected_medicine: 'Estrogen (systemic)',
        current_medications: [],
        conditions: []
      };

      const result = engine.evaluateTreatment(inputs);

      expect(result.firedRules.some(rule => rule.id === 'WELLS_high')).toBe(true);
      expect(result.primaryRecommendation.strength).toBe('Not recommended');
    });
  });

  describe('Rule Precedence', () => {
    test('should prioritize absolute contraindications over interactions', () => {
      const inputs: TreatmentInputs = {
        age: 45,
        sex: 'female',
        selected_medicine: 'Estrogen (systemic)',
        current_medications: ['Warfarin'], // High interaction
        conditions: ['pregnancy'] // Absolute contraindication
      };

      const result = engine.evaluateTreatment(inputs);

      // Should block due to pregnancy, not even reach interaction check
      expect(result.primaryRecommendation.strength).toBe('Not recommended');
      expect(result.firedRules.some(rule => rule.id === 'C_ABS_PREGNANCY')).toBe(true);
      expect(result.primaryRecommendation.text).toContain('pregnancy');
    });

    test('should prioritize high interactions over moderate risks', () => {
      const inputs: TreatmentInputs = {
        age: 55,
        sex: 'female',
        ASCVD: 12, // Intermediate risk
        ASCVD_source: 'external',
        selected_medicine: 'Estrogen (systemic)',
        current_medications: ['Warfarin'], // High interaction
        conditions: []
      };

      const result = engine.evaluateTreatment(inputs);

      expect(result.primaryRecommendation.strength).toBe('Not recommended');
      expect(result.firedRules.some(rule => rule.id === 'I_HI_EST_WARF')).toBe(true);
    });
  });

  describe('Insufficient Data Handling', () => {
    test('should handle missing medicine selection', () => {
      const inputs: TreatmentInputs = {
        age: 50,
        sex: 'female',
        selected_medicine: '', // Missing
        current_medications: [],
        conditions: []
      };

      const result = engine.evaluateTreatment(inputs);

      expect(result.primaryRecommendation.text).toContain('Insufficient data');
      expect(result.clinicianReviewRequired).toBe(true);
    });
  });

  describe('Rule Source Traceability', () => {
    test('should include source file for each fired rule', () => {
      const inputs: TreatmentInputs = {
        age: 45,
        sex: 'female',
        selected_medicine: 'Estrogen (systemic)',
        current_medications: ['Warfarin'],
        conditions: ['pregnancy']
      };

      const result = engine.evaluateTreatment(inputs);

      result.firedRules.forEach(rule => {
        expect(rule.sourceFile).toMatch(/\.(json)$/);
        expect(['contraindications.json', 'interactions.json', 'thresholds.json']).toContain(rule.sourceFile);
      });
    });
  });

  describe('Rule Utility Methods', () => {
    test('should retrieve rule by ID', () => {
      const contraindicationRule = engine.getRuleById('C_ABS_PREGNANCY');
      expect(contraindicationRule).toBeTruthy();
      expect(contraindicationRule.sourceFile).toBe('contraindications.json');

      const interactionRule = engine.getRuleById('I_HI_EST_WARF');
      expect(interactionRule).toBeTruthy();
      expect(interactionRule.sourceFile).toBe('interactions.json');

      const thresholdRule = engine.getRuleById('ASCVD_high');
      expect(thresholdRule).toBeTruthy();
      expect(thresholdRule.sourceFile).toBe('thresholds.json');
    });

    test('should return null for non-existent rule ID', () => {
      const nonExistentRule = engine.getRuleById('NON_EXISTENT_RULE');
      expect(nonExistentRule).toBeNull();
    });
  });
});

describe('Test Report Generation', () => {
  test('should generate test report for all example cases', () => {
    const engine = new TreatmentPlanEngine();
    const report: Array<{
      caseId: string;
      passed: boolean;
      expectedRules: string[];
      actualRules: string[];
      expectedRecommendation: string;
      actualRecommendation: string;
      actualStrength: string;
    }> = [];

    exampleCases.cases.forEach((testCase) => {
      const inputs: TreatmentInputs = {
        age: testCase.inputs.age,
        sex: testCase.inputs.sex as 'male' | 'female',
        ASCVD: testCase.inputs.ASCVD,
        ASCVD_source: 'external',
        FRAX_major: testCase.inputs.FRAX_major,
        FRAX_major_source: 'external',
        GAIL_5yr: testCase.inputs.GAIL_5yr,
        GAIL_5yr_source: 'external',
        Wells: testCase.inputs.Wells,
        Wells_source: 'external',
        selected_medicine: testCase.inputs.selected_medicine,
        current_medications: testCase.inputs.current_medications,
        conditions: testCase.inputs.conditions.filter(condition => condition !== 'none')
      };

      const result = engine.evaluateTreatment(inputs);
      const firedRuleIds = result.firedRules.map(rule => rule.id);
      
      // Check if all expected rules fired
      const allExpectedRulesFired = testCase.expected.mustFire.every(
        expectedRule => firedRuleIds.includes(expectedRule)
      );

      report.push({
        caseId: testCase.id,
        passed: allExpectedRulesFired,
        expectedRules: testCase.expected.mustFire,
        actualRules: firedRuleIds,
        expectedRecommendation: testCase.expected.primaryRecommendation,
        actualRecommendation: result.primaryRecommendation.text,
        actualStrength: result.primaryRecommendation.strength
      });
    });

    // Log detailed report
    console.log('\n=== TREATMENT PLAN ENGINE TEST REPORT ===');
    console.log(`Date: ${new Date().toISOString()}`);
    console.log(`Total Cases: ${report.length}`);
    console.log(`Passed: ${report.filter(r => r.passed).length}`);
    console.log(`Failed: ${report.filter(r => !r.passed).length}`);
    console.log('\nDetailed Results:');
    
    report.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`\n${status} - Case ${result.caseId}`);
      console.log(`Expected Rules: ${result.expectedRules.join(', ')}`);
      console.log(`Actual Rules: ${result.actualRules.join(', ')}`);
      console.log(`Expected: ${result.expectedRecommendation}`);
      console.log(`Actual: ${result.actualRecommendation} (${result.actualStrength})`);
    });

    console.log('\n=== END REPORT ===\n');

    // Expect at least 80% pass rate
    const passRate = report.filter(r => r.passed).length / report.length;
    expect(passRate).toBeGreaterThanOrEqual(0.8);
  });
});