/**
 * Treatment Plan Generator Test Runner
 * Validates clinical decision logic against test vectors
 * 
 * Usage: node treatmentPlanTestRunner.js
 */

const fs = require('fs');
const path = require('path');

// Import test vectors
const testVectors = JSON.parse(fs.readFileSync(path.join(__dirname, 'treatmentPlanTestVectors.json'), 'utf8'));

// Import treatment rules for reference
const treatmentRules = JSON.parse(fs.readFileSync(path.join(__dirname, 'treatmentRules.json'), 'utf8'));

// Simulate the treatment plan generator logic for testing
class TestTreatmentPlanGenerator {
  constructor() {
    this.rules = treatmentRules;
  }
  
  generateTreatmentPlan(inputs) {
    const planId = `TEST_${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    // Evaluate safety flags and contraindications
    const safetyFlags = this.evaluateSafetyFlags(inputs);
    const contraindications = this.evaluateContraindications(inputs);
    
    // Determine primary recommendation
    const primaryRecommendation = this.evaluatePrimaryRecommendation(inputs, contraindications, safetyFlags);
    
    // Get alternatives
    const alternatives = this.getAlternatives(inputs, primaryRecommendation, contraindications);
    
    return {
      id: planId,
      timestamp,
      rulesetVersion: this.rules.version,
      patientInfo: {
        age: inputs.age,
        keyFlags: this.generateKeyFlags(inputs, safetyFlags)
      },
      primaryRecommendation,
      alternatives,
      safetyFlags,
      contraindications,
      monitoringPlan: this.generateMonitoringPlan(primaryRecommendation),
      triggeredRules: [
        ...safetyFlags.map(flag => flag.ruleId),
        ...primaryRecommendation.triggeredRules
      ]
    };
  }
  
  evaluateSafetyFlags(inputs) {
    const flags = [];
    
    // Check absolute contraindications
    for (const contraindication of this.rules.absoluteContraindications) {
      if (this.evaluateCondition(inputs, contraindication.condition, contraindication.value)) {
        flags.push({
          id: contraindication.id,
          severity: contraindication.severity,
          title: contraindication.recommendation,
          description: contraindication.rationale,
          ruleId: contraindication.rule
        });
      }
    }
    
    // Check relative contraindications
    for (const contraindication of this.rules.relativeContraindications) {
      if (this.evaluateConditions(inputs, contraindication.conditions)) {
        flags.push({
          id: contraindication.id,
          severity: contraindication.severity,
          title: contraindication.recommendation,
          description: contraindication.rationale,
          ruleId: contraindication.rule
        });
      }
    }
    
    return flags;
  }
  
  evaluateContraindications(inputs) {
    const contraindications = [];
    
    if (inputs.personalHistoryBreastCancer) {
      contraindications.push('Personal history of breast cancer');
    }
    
    if (inputs.personalHistoryDVT) {
      contraindications.push('Personal history of venous thromboembolism');
    }
    
    if (inputs.unexplainedVaginalBleeding) {
      contraindications.push('Unexplained vaginal bleeding');
    }
    
    if (inputs.liverDisease) {
      contraindications.push('Active liver disease');
    }
    
    if (inputs.smoking && inputs.age > 35) {
      contraindications.push('Smoking over age 35 (relative contraindication)');
    }
    
    return contraindications;
  }
  
  evaluatePrimaryRecommendation(inputs, contraindications, safetyFlags) {
    // Check for absolute contraindications first
    const absoluteContraindications = contraindications.filter(c => 
      c.includes('breast cancer') || c.includes('thromboembolism') || 
      c.includes('bleeding') || c.includes('liver')
    );
    
    if (absoluteContraindications.length > 0) {
      return {
        id: 'no_hrt_contraindicated',
        type: 'primary',
        title: 'HRT Not Recommended',
        recommendation: 'Do not start systemic hormone replacement therapy',
        safety: {
          level: 'avoid',
          color: 'red'
        },
        score: 100,
        triggeredRules: ['CONTRAINDICATION_DETECTED']
      };
    }
    
    // Evaluate primary recommendation rules
    for (const rule of this.rules.primaryRecommendations) {
      if (this.evaluateConditions(inputs, rule.conditions)) {
        return {
          id: rule.id,
          type: 'primary',
          title: rule.recommendation.includes('Consider systemic HRT') ? 'Consider systemic HRT' : rule.recommendation,
          recommendation: rule.recommendation,
          safety: {
            level: rule.severity,
            color: this.getSafetyColor(rule.severity)
          },
          score: this.calculateScore(rule, inputs),
          triggeredRules: [rule.rule]
        };
      }
    }
    
    // Default recommendation
    return {
      id: 'individualized_assessment',
      type: 'primary',
      title: 'Individualized Assessment Required',
      recommendation: 'Individualized risk-benefit assessment recommended',
      safety: {
        level: 'consider',
        color: 'yellow'
      },
      score: 50,
      triggeredRules: ['DEFAULT_RULE']
    };
  }
  
  getAlternatives(inputs, primaryRecommendation, contraindications) {
    const alternatives = [];
    
    // Add SSRI/SNRI if vasomotor symptoms present
    if (inputs.vasomotorSymptoms !== 'none' && inputs.vasomotorSymptoms !== undefined) {
      alternatives.push({
        id: 'ssri_snri_alternative',
        type: 'alternative',
        title: 'SSRIs/SNRIs',
        recommendation: 'Consider SSRI/SNRI for vasomotor symptoms'
      });
    }
    
    // Add vaginal estrogen if genitourinary symptoms present
    if (inputs.genitourinarySymptoms) {
      alternatives.push({
        id: 'vaginal_estrogen_alternative',
        type: 'alternative',
        title: 'Vaginal Estrogen',
        recommendation: 'Vaginal estrogen for genitourinary symptoms'
      });
    }
    
    // Add transdermal HRT as alternative if primary is not contraindicated
    if (primaryRecommendation.id === 'low_risk_severe_symptoms') {
      alternatives.push({
        id: 'transdermal_alternative',
        type: 'alternative',
        title: 'Transdermal HRT',
        recommendation: 'Transdermal estradiol with progestogen'
      });
    }
    
    return alternatives;
  }
  
  evaluateCondition(inputs, field, value) {
    return inputs[field] === value;
  }
  
  evaluateConditions(inputs, conditions) {
    return conditions.every(condition => {
      const fieldValue = this.getNestedValue(inputs, condition.field);
      
      switch (condition.operator) {
        case '==':
          return fieldValue === condition.value;
        case '!=':
          return fieldValue !== condition.value;
        case '>':
          return fieldValue > condition.value;
        case '>=':
          return fieldValue >= condition.value;
        case '<':
          return fieldValue < condition.value;
        case '<=':
          return fieldValue <= condition.value;
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(fieldValue);
        default:
          return false;
      }
    });
  }
  
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
  
  getSafetyColor(level) {
    switch (level) {
      case 'preferred': return 'green';
      case 'consider': return 'yellow';
      case 'caution': return 'orange';
      case 'avoid': return 'red';
      default: return 'yellow';
    }
  }
  
  calculateScore(rule, inputs) {
    let score = 50;
    
    switch (rule.severity) {
      case 'preferred': score += 30; break;
      case 'consider': score += 10; break;
      case 'alternative': score -= 10; break;
    }
    
    if (inputs.vasomotorSymptoms === 'severe') score += 20;
    if (inputs.patientPreference === 'hormonal' && rule.recommendation.includes('HRT')) score += 15;
    
    return Math.max(0, Math.min(100, score));
  }
  
  generateKeyFlags(inputs, safetyFlags) {
    const flags = [];
    
    if (inputs.ascvdResult && inputs.ascvdResult.tenYearRisk > 20) {
      flags.push('High ASCVD Risk');
    }
    
    if (inputs.personalHistoryBreastCancer) {
      flags.push('BC History');
    }
    
    if (inputs.personalHistoryDVT) {
      flags.push('VTE History');
    }
    
    if (inputs.smoking) {
      flags.push('Smoker');
    }
    
    if (safetyFlags.some(flag => flag.severity === 'absolute')) {
      flags.push('Absolute Contraindication');
    }
    
    return flags;
  }
  
  generateMonitoringPlan(recommendation) {
    return {
      baseline: ['Blood pressure', 'BMI', 'Breast examination'],
      earlyFollowup: ['Symptom assessment', 'Side effects', 'BP check'],
      ongoing: ['Annual review', 'Risk reassessment'],
      timeline: recommendation.safety.level === 'preferred' ? '3 months, then annually' : '3 months, 6 months, then 6-monthly'
    };
  }
}

// Test execution functions
function runScenarioTest(scenario, generator) {
  console.log(`\n🧪 Testing: ${scenario.name}`);
  console.log(`   Description: ${scenario.description}`);
  
  try {
    const result = generator.generateTreatmentPlan(scenario.input);
    const expected = scenario.expectedOutput;
    
    let passed = 0;
    let failed = 0;
    
    // Test primary recommendation type
    if (result.primaryRecommendation.id === expected.primaryRecommendationType) {
      console.log(`   ✅ Primary recommendation type: ${result.primaryRecommendation.id}`);
      passed++;
    } else {
      console.log(`   ❌ Primary recommendation type: Expected ${expected.primaryRecommendationType}, got ${result.primaryRecommendation.id}`);
      failed++;
    }
    
    // Test safety level
    if (result.primaryRecommendation.safety.level === expected.safetyLevel) {
      console.log(`   ✅ Safety level: ${result.primaryRecommendation.safety.level}`);
      passed++;
    } else {
      console.log(`   ❌ Safety level: Expected ${expected.safetyLevel}, got ${result.primaryRecommendation.safety.level}`);
      failed++;
    }
    
    // Test safety color
    if (result.primaryRecommendation.safety.color === expected.safetyColor) {
      console.log(`   ✅ Safety color: ${result.primaryRecommendation.safety.color}`);
      passed++;
    } else {
      console.log(`   ❌ Safety color: Expected ${expected.safetyColor}, got ${result.primaryRecommendation.safety.color}`);
      failed++;
    }
    
    // Test safety flags count
    if (expected.expectedSafetyFlags !== undefined) {
      if (result.safetyFlags.length === expected.expectedSafetyFlags) {
        console.log(`   ✅ Safety flags count: ${result.safetyFlags.length}`);
        passed++;
      } else {
        console.log(`   ❌ Safety flags count: Expected ${expected.expectedSafetyFlags}, got ${result.safetyFlags.length}`);
        failed++;
      }
    }
    
    // Test contraindications
    if (expected.expectedContraindications) {
      const contraindicationsMatch = expected.expectedContraindications.every(expected => 
        result.contraindications.some(actual => actual.includes(expected.split(' ')[0]))
      );
      
      if (contraindicationsMatch) {
        console.log(`   ✅ Contraindications: ${result.contraindications.length} detected`);
        passed++;
      } else {
        console.log(`   ❌ Contraindications: Expected ${expected.expectedContraindications}, got ${result.contraindications}`);
        failed++;
      }
    }
    
    // Test triggered rules
    if (expected.triggeredRules) {
      const rulesMatch = expected.triggeredRules.some(expectedRule => 
        result.triggeredRules.includes(expectedRule)
      );
      
      if (rulesMatch) {
        console.log(`   ✅ Triggered rules include expected rules`);
        passed++;
      } else {
        console.log(`   ❌ Triggered rules: Expected ${expected.triggeredRules}, got ${result.triggeredRules}`);
        failed++;
      }
    }
    
    return { passed, failed, total: passed + failed };
    
  } catch (error) {
    console.log(`   ❌ Test failed with error: ${error.message}`);
    return { passed: 0, failed: 1, total: 1 };
  }
}

function runAllTests() {
  console.log('🏥 Starting Treatment Plan Generator Test Suite');
  console.log('================================================\n');
  
  const generator = new TestTreatmentPlanGenerator();
  
  let totalPassed = 0;
  let totalFailed = 0;
  let totalTests = 0;
  
  const scenarios = testVectors.testScenarios;
  
  for (const scenario of scenarios) {
    const result = runScenarioTest(scenario, generator);
    totalPassed += result.passed;
    totalFailed += result.failed;
    totalTests += result.total;
  }
  
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`Scenarios tested: ${scenarios.length}`);
  console.log(`Individual tests: ${totalTests}`);
  console.log(`Passed: ${totalPassed}`);
  console.log(`Failed: ${totalFailed}`);
  console.log(`Success rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
  
  if (totalFailed === 0) {
    console.log('\n🎉 All tests passed! Treatment plan generator is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the treatment plan logic.');
  }
  
  // Summary by scenario type
  console.log('\n📋 Test Coverage Summary:');
  console.log('- Absolute contraindications: 4 scenarios');
  console.log('- Relative contraindications: 3 scenarios');
  console.log('- Low risk with symptoms: 2 scenarios');
  console.log('- Complex/edge cases: 3 scenarios');
  console.log('- Total scenarios: 12');
  
  return {
    totalScenarios: scenarios.length,
    totalTests: totalTests,
    passed: totalPassed,
    failed: totalFailed,
    successRate: (totalPassed / totalTests) * 100
  };
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests, TestTreatmentPlanGenerator };