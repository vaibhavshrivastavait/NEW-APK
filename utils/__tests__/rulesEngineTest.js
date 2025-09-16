// Simple test file to verify the rules engine integration
// This mimics the original Node.js test but for React Native

import { evaluate } from '../rulesEngine';

// Test cases from the examples.json
const testCases = [
  {
    id: "case-1",
    input: {
      age: 58,
      ASCVD: 25,
      Gail: 0.8,
      TyrerCuzick: 5,
      Wells: 0,
      FRAX: 8,
      meds: ["statins"],
      therapy_selected: "estrogen_oral",
      symptom_severity: 7
    }
  },
  {
    id: "case-2", 
    input: {
      age: 62,
      ASCVD: 3,
      Gail: 4.0,
      TyrerCuzick: 22,
      Wells: 0,
      FRAX: 12,
      meds: [],
      therapy_selected: "estrogen_oral",
      symptom_severity: 8
    }
  },
  {
    id: "case-3",
    input: {
      age: 49,
      ASCVD: 2,
      Gail: 0.3,
      TyrerCuzick: 1.2,
      Wells: 4,
      wells_recent_event: true,
      FRAX: 2,
      meds: ["anticoagulants"],
      therapy_selected: "estrogen_transdermal",
      symptom_severity: 6
    }
  },
  {
    id: "case-4",
    input: {
      age: 51,
      ASCVD: 4,
      Gail: 0.5,
      TyrerCuzick: 2,
      Wells: 0,
      FRAX: 25,
      meds: ["calcium"],
      therapy_selected: "none",
      symptom_severity: 3
    }
  },
  {
    id: "case-5",
    input: {
      age: 44,
      ASCVD: 1,
      Gail: 0.2,
      TyrerCuzick: 0.5,
      Wells: 0,
      FRAX: 1,
      meds: ["anticonvulsants"],
      therapy_selected: "estrogen_oral",
      symptom_severity: 8
    }
  }
];

// Test runner function
export function runRulesEngineTests() {
  console.log('🧪 Running Rules Engine Tests...');
  const results = [];
  
  testCases.forEach((testCase, index) => {
    try {
      console.log(`\n--- ${testCase.id} ---`);
      console.log('therapy_selected:', testCase.input.therapy_selected, 'meds:', testCase.input.meds);
      
      const result = evaluate(testCase.input);
      
      console.log('Primary:', result.primary);
      console.log('Suitability:', result.suitability);
      console.log('Rationale:', result.rationale);
      if (result.warnings && result.warnings.length) {
        console.log('Warnings:', result.warnings.join(', '));
      }
      
      results.push({
        testCase: testCase.id,
        passed: true,
        result: result
      });
      
    } catch (error) {
      console.error(`❌ Test ${testCase.id} failed:`, error);
      results.push({
        testCase: testCase.id,
        passed: false,
        error: error.message
      });
    }
  });
  
  const passedTests = results.filter(r => r.passed).length;
  console.log(`\n✅ Tests completed: ${passedTests}/${results.length} passed`);
  
  return results;
}

// Export test cases for other uses
export { testCases };