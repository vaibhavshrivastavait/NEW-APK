/**
 * Simple test script for drug interaction functionality
 * This can be run in the browser console to test the logic
 */

// Test the drug interaction logic directly
(async function testDrugInteractions() {
  console.log('🧪 Testing Drug Interaction Logic...');
  
  try {
    // Import our drug interaction handler
    const { findDrugInteractions, groupInteractionsBySeverity } = await import('./utils/drugInteractionHandler.ts');
    
    // Test case 1: HRT + Blood thinner
    console.log('\n📝 Test 1: HRT + Warfarin');
    const interactions1 = await findDrugInteractions('Estrogen HRT', ['Warfarin']);
    console.log('Interactions found:', interactions1.length);
    interactions1.forEach(interaction => {
      console.log(`- ${interaction.mainMedicine} + ${interaction.optionalMedicine} = ${interaction.severity}`);
    });
    
    const grouped1 = groupInteractionsBySeverity(interactions1);
    console.log('Overall risk level:', grouped1.overallRiskLevel);
    
    // Test case 2: Multiple medicines
    console.log('\n📝 Test 2: Estrogen + Multiple medicines');
    const interactions2 = await findDrugInteractions('Estrogen', ['Warfarin', 'Aspirin', 'Levothyroxine']);
    console.log('Interactions found:', interactions2.length);
    interactions2.forEach(interaction => {
      console.log(`- ${interaction.mainMedicine} + ${interaction.optionalMedicine} = ${interaction.severity}`);
    });
    
    const grouped2 = groupInteractionsBySeverity(interactions2);
    console.log('Overall risk level:', grouped2.overallRiskLevel);
    console.log('High risk:', grouped2.highRisk.length);
    console.log('Moderate risk:', grouped2.moderateRisk.length);
    console.log('Low risk:', grouped2.lowRisk.length);
    
    console.log('✅ Drug interaction testing completed successfully!');
    
  } catch (error) {
    console.error('❌ Drug interaction testing failed:', error);
  }
})();

// Export for use in React components
window.testDrugInteractions = testDrugInteractions;