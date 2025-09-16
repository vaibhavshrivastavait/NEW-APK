// Simple test runner for Treatment Plan Engine
const { TreatmentPlanEngine } = require('./utils/treatmentPlanEngine.ts');

// Test basic functionality
console.log('🧪 Testing Treatment Plan Engine...\n');

try {
  const engine = new TreatmentPlanEngine();
  
  // Test Case 1: Pregnancy contraindication
  console.log('=== Test Case 1: Pregnancy Contraindication ===');
  const inputs1 = {
    age: 45,
    sex: 'female',
    selected_medicine: 'Estrogen (systemic)',
    current_medications: [],
    conditions: ['pregnancy']
  };
  
  const result1 = engine.evaluateTreatment(inputs1);
  console.log('Primary Recommendation:', result1.primaryRecommendation.text);
  console.log('Strength:', result1.primaryRecommendation.strength);
  console.log('Fired Rules:', result1.firedRules.map(r => r.id).join(', '));
  console.log('Clinician Review Required:', result1.clinicianReviewRequired);
  console.log('✅ Test 1 Complete\n');
  
  // Test Case 2: High ASCVD with warfarin interaction
  console.log('=== Test Case 2: High ASCVD + Warfarin Interaction ===');
  const inputs2 = {
    age: 62,
    sex: 'female',
    ASCVD: 22.4,
    ASCVD_source: 'external',
    selected_medicine: 'Estrogen (systemic)',
    current_medications: ['Warfarin'],
    conditions: []
  };
  
  const result2 = engine.evaluateTreatment(inputs2);
  console.log('Primary Recommendation:', result2.primaryRecommendation.text);
  console.log('Strength:', result2.primaryRecommendation.strength);
  console.log('Fired Rules:', result2.firedRules.map(r => r.id).join(', '));
  console.log('Alternatives:', result2.alternatives.slice(0, 2).join(', '));
  console.log('✅ Test 2 Complete\n');
  
  // Test Case 3: Normal case
  console.log('=== Test Case 3: Low Risk Patient ===');
  const inputs3 = {
    age: 48,
    sex: 'female',
    ASCVD: 4.2,
    ASCVD_source: 'external',
    selected_medicine: 'Low-dose estrogen',
    current_medications: [],
    conditions: []
  };
  
  const result3 = engine.evaluateTreatment(inputs3);
  console.log('Primary Recommendation:', result3.primaryRecommendation.text);
  console.log('Strength:', result3.primaryRecommendation.strength);
  console.log('Fired Rules:', result3.firedRules.map(r => r.id).join(', ') || 'None');
  console.log('✅ Test 3 Complete\n');
  
  console.log('🎉 All basic tests passed successfully!');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
}