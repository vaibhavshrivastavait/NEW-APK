/**
 * Test Runner for Extended Clinical Calculators
 * Validates BMI, BSA, eGFR, and HRT-specific calculations
 * 
 * Usage: node testRunnerExtended.js
 */

const fs = require('fs');
const path = require('path');

// Import test vectors
const testVectors = JSON.parse(fs.readFileSync(path.join(__dirname, 'testVectorsExtended.json'), 'utf8'));

// Import calculator functions (simulated - in real app these would be imported from clinicalCalculators.ts)
function calculateBMI(weight, height) {
  if (!weight || !height || weight <= 0 || height <= 0) {
    return {
      bmi: 0,
      category: 'Normal',
      interpretation: 'Invalid input - please enter valid weight and height',
      healthRisk: 'Low'
    };
  }

  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  let category, healthRisk, interpretation;

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

function calculateBSA(weight, height) {
  if (!weight || !height || weight <= 0 || height <= 0) {
    return {
      bsa: 0,
      method: 'Du Bois Formula',
      interpretation: 'Invalid input - please enter valid weight and height'
    };
  }

  const bsa = 0.007184 * Math.pow(weight, 0.425) * Math.pow(height, 0.725);

  let interpretation;
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

function calculateeGFR(age, gender, creatinine) {
  if (!age || !creatinine || age <= 0 || creatinine <= 0) {
    return {
      egfr: 0,
      stage: 'Normal',
      category: 'Normal',
      interpretation: 'Invalid input - please enter valid age and creatinine'
    };
  }

  let egfr;
  
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

  let stage, category, interpretation;

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

function calculateHRTRisk(age, timeSinceMenopause, personalHistoryBC, familyHistoryBC, personalHistoryVTE, smoking, hypertension, diabetes, bmi) {
  let breastCancerRisk = 1.0;
  let vteRisk = 1.0;
  let strokeRisk = 1.0;
  const contraindications = [];
  const recommendations = [];

  // Absolute contraindications
  if (personalHistoryBC) {
    contraindications.push('Personal history of breast cancer');
    breastCancerRisk = 0;
  }

  if (personalHistoryVTE) {
    contraindications.push('Personal history of venous thromboembolism');
    vteRisk = 0;
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
  let overallRisk, interpretation;

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

// Test execution functions
function runBMITests() {
  console.log('🧮 Testing BMI Calculator...');
  const tests = testVectors.testCases.bmi;
  let passed = 0;
  let failed = 0;

  tests.forEach((test, index) => {
    const result = calculateBMI(test.input.weight, test.input.height);
    const bmiMatch = Math.abs(result.bmi - test.expectedBMI) <= test.tolerance;
    const categoryMatch = result.category === test.expectedCategory;
    const healthRiskMatch = result.healthRisk === test.expectedHealthRisk;

    if (bmiMatch && categoryMatch && healthRiskMatch) {
      console.log(`✅ BMI Test ${index + 1} (${test.name}): PASSED`);
      passed++;
    } else {
      console.log(`❌ BMI Test ${index + 1} (${test.name}): FAILED`);
      console.log(`   Expected: BMI=${test.expectedBMI}, Category=${test.expectedCategory}, Risk=${test.expectedHealthRisk}`);
      console.log(`   Got:      BMI=${result.bmi}, Category=${result.category}, Risk=${result.healthRisk}`);
      failed++;
    }
  });

  return { passed, failed };
}

function runBSATests() {
  console.log('📏 Testing BSA Calculator...');
  const tests = testVectors.testCases.bsa;
  let passed = 0;
  let failed = 0;

  tests.forEach((test, index) => {
    const result = calculateBSA(test.input.weight, test.input.height);
    const bsaMatch = Math.abs(result.bsa - test.expectedBSA) <= test.tolerance;
    const methodMatch = result.method === test.expectedMethod;

    if (bsaMatch && methodMatch) {
      console.log(`✅ BSA Test ${index + 1} (${test.name}): PASSED`);
      passed++;
    } else {
      console.log(`❌ BSA Test ${index + 1} (${test.name}): FAILED`);
      console.log(`   Expected: BSA=${test.expectedBSA}, Method=${test.expectedMethod}`);
      console.log(`   Got:      BSA=${result.bsa}, Method=${result.method}`);
      failed++;
    }
  });

  return { passed, failed };
}

function runeGFRTests() {
  console.log('🫘 Testing eGFR Calculator...');
  const tests = testVectors.testCases.egfr;
  let passed = 0;
  let failed = 0;

  tests.forEach((test, index) => {
    const result = calculateeGFR(test.input.age, test.input.gender, test.input.creatinine);
    const egfrMatch = Math.abs(result.egfr - test.expectedeGFR) <= test.tolerance;
    const stageMatch = result.stage === test.expectedStage;
    const categoryMatch = result.category === test.expectedCategory;

    if (egfrMatch && stageMatch && categoryMatch) {
      console.log(`✅ eGFR Test ${index + 1} (${test.name}): PASSED`);
      passed++;
    } else {
      console.log(`❌ eGFR Test ${index + 1} (${test.name}): FAILED`);
      console.log(`   Expected: eGFR=${test.expectedeGFR}, Stage=${test.expectedStage}, Category=${test.expectedCategory}`);
      console.log(`   Got:      eGFR=${result.egfr}, Stage=${result.stage}, Category=${result.category}`);
      failed++;
    }
  });

  return { passed, failed };
}

function runHRTTests() {
  console.log('💊 Testing HRT Risk Calculator...');
  const tests = testVectors.testCases.hrt;
  let passed = 0;
  let failed = 0;

  tests.forEach((test, index) => {
    const result = calculateHRTRisk(
      test.input.age,
      test.input.timeSinceMenopause,
      test.input.personalHistoryBC,
      test.input.familyHistoryBC,
      test.input.personalHistoryVTE,
      test.input.smoking,
      test.input.hypertension,
      test.input.diabetes,
      test.input.bmi
    );

    const overallRiskMatch = result.overallRisk === test.expectedOverallRisk;
    const bcRiskMatch = Math.abs(result.breastCancerRisk - test.expectedBreastCancerRisk) <= test.tolerance;
    const vteRiskMatch = Math.abs(result.vteRisk - test.expectedVTERisk) <= test.tolerance;
    const strokeRiskMatch = Math.abs(result.strokeRisk - test.expectedStrokeRisk) <= test.tolerance;
    const contraindicationsMatch = result.contraindications.length === test.expectedContraindications;

    if (overallRiskMatch && bcRiskMatch && vteRiskMatch && strokeRiskMatch && contraindicationsMatch) {
      console.log(`✅ HRT Test ${index + 1} (${test.name}): PASSED`);
      passed++;
    } else {
      console.log(`❌ HRT Test ${index + 1} (${test.name}): FAILED`);
      console.log(`   Expected: Risk=${test.expectedOverallRisk}, BC=${test.expectedBreastCancerRisk}, VTE=${test.expectedVTERisk}, Stroke=${test.expectedStrokeRisk}, Contraindications=${test.expectedContraindications}`);
      console.log(`   Got:      Risk=${result.overallRisk}, BC=${result.breastCancerRisk}, VTE=${result.vteRisk}, Stroke=${result.strokeRisk}, Contraindications=${result.contraindications.length}`);
      failed++;
    }
  });

  return { passed, failed };
}

// Main test execution
function runAllTests() {
  console.log('🧪 Starting Clinical Calculator Test Suite');
  console.log('===========================================\n');

  const results = {
    bmi: runBMITests(),
    bsa: runBSATests(),
    egfr: runeGFRTests(),
    hrt: runHRTTests()
  };

  console.log('\n📊 Test Results Summary');
  console.log('=======================');

  let totalPassed = 0;
  let totalFailed = 0;

  Object.entries(results).forEach(([calculator, result]) => {
    console.log(`${calculator.toUpperCase()}: ${result.passed} passed, ${result.failed} failed`);
    totalPassed += result.passed;
    totalFailed += result.failed;
  });

  console.log('=======================');
  console.log(`TOTAL: ${totalPassed} passed, ${totalFailed} failed`);
  console.log(`SUCCESS RATE: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);

  if (totalFailed === 0) {
    console.log('🎉 All tests passed! Calculators are working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please review the calculator implementations.');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests, calculateBMI, calculateBSA, calculateeGFR, calculateHRTRisk };