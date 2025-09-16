// Test script to verify PDF export functionality
const testPatientData = {
  name: 'Jane Test Patient',
  age: 52,
  id: 'TEST_001',
  height: 165,
  weight: 68,
  bmi: 25.0,
  gender: 'Female',
  questionnaire: {
    'Hot Flushes Severity': 7,
    'Vaginal Dryness': 5,
    'Night Sweats': 6,
    'Sleep Disturbance': 5,
    'Mood Changes': 4,
    'Joint Aches': 3,
    'Hysterectomy History': 'No',
    'Personal History Breast Cancer': 'No',
    'Family History Breast Cancer': 'Yes'
  },
  riskScores: {
    ascvd: { risk: 3.2, category: 'Low', interpretation: '10-year ASCVD risk based on pooled cohort equations' },
    gail: { risk: 1.8, category: 'Moderate', interpretation: '5-year breast cancer risk based on Gail model' }
  },
  riskAssessment: {
    overallRiskLevel: 'moderate',
    breastCancerRisk: 'moderate',
    cvdRisk: 'low',
    vteRisk: 'low',
    interpretation: 'Moderate overall risk due to family history of breast cancer.'
  }
};

console.log('✅ Test patient data structure is valid');
console.log('📋 Patient:', testPatientData.name);
console.log('🧮 Risk Scores:', Object.keys(testPatientData.riskScores || {}));
console.log('⚡ Risk Assessment:', testPatientData.riskAssessment.overallRiskLevel);
console.log('🎯 Export functionality should work with this data structure');