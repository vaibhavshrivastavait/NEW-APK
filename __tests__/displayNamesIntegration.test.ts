/**
 * Integration test for display names in Evidence-Based Decision Support
 * Tests that interaction results show actual medicine names instead of "Unknown"
 */

import { drugAnalyzer, createMedicineItem, MedicineItem } from '../utils/enhancedDrugAnalyzer';

describe('Display Names Integration Tests', () => {
  beforeEach(() => {
    // Reset analyzer state if needed
  });

  test('should create medicine with proper display name from optional medicines list', () => {
    // Test with a medicine that exists in optional_medicines.json
    const medicine = createMedicineItem('ibuprofen', 'anti_inflammatory', 'nsaid', 'medium');
    
    expect(medicine.displayName).toBe('Ibuprofen'); // Should be capitalized display name
    expect(medicine.name).toBe('ibuprofen'); // Original input
    expect(medicine.severity).toBe('medium'); // Should use provided severity
    expect(medicine.key).toBe('nsaid'); // Should use mapped key
    expect(medicine.category).toBe('anti_inflammatory'); // Should use mapped category
  });

  test('should create medicine with fallback display name for unknown medicines', () => {
    // Test with a medicine not in optional_medicines.json
    const medicine = createMedicineItem('Unknown Medicine', 'custom', 'custom', 'low');
    
    expect(medicine.displayName).toBe('Unknown Medicine'); // Should use input as display name
    expect(medicine.name).toBe('Unknown Medicine');
    expect(medicine.severity).toBe('low');
    expect(medicine.key).toBe('custom');
    expect(medicine.category).toBe('custom');
  });

  test('should use display names in interaction analysis results', async () => {
    // Create two medicines that should interact
    const medicine1 = createMedicineItem('warfarin', 'anticoagulant', 'anticoagulant', 'high');
    const medicine2 = createMedicineItem('ibuprofen', 'anti_inflammatory', 'nsaid', 'medium');
    
    const medicines: MedicineItem[] = [medicine1, medicine2];
    
    // Analyze interactions
    const result = await drugAnalyzer.analyzeMedicines(medicines);
    
    // Check that results use display names
    expect(result).toBeDefined();
    expect(result.interactions.length).toBeGreaterThan(0);
    
    // Find the warfarin-ibuprofen interaction
    const interaction = result.interactions.find(
      inter => inter.medications.includes('Warfarin') && inter.medications.includes('Ibuprofen')
    );
    
    expect(interaction).toBeDefined();
    expect(interaction?.medications).toContain('Warfarin'); // Display name, not "warfarin"
    expect(interaction?.medications).toContain('Ibuprofen'); // Display name, not "ibuprofen"
    expect(interaction?.medications).not.toContain('Unknown medications');
  });

  test('should handle severity levels correctly', () => {
    const highSeverityMedicine = createMedicineItem('warfarin', 'anticoagulant', 'anticoagulant', 'high');
    const mediumSeverityMedicine = createMedicineItem('ibuprofen', 'anti_inflammatory', 'nsaid', 'medium');
    const lowSeverityMedicine = createMedicineItem('simvastatin', 'lipid_lowering', 'statin', 'low');
    
    expect(highSeverityMedicine.severity).toBe('high');
    expect(mediumSeverityMedicine.severity).toBe('medium');
    expect(lowSeverityMedicine.severity).toBe('low');
  });

  test('should preserve display names in medicine chips and UI components', () => {
    const medicines = [
      createMedicineItem('warfarin', 'anticoagulant', 'anticoagulant', 'high'),
      createMedicineItem('sertraline', 'antidepressant', 'ssri', 'medium'),
      createMedicineItem('estradiol', 'hormone', 'estrogen_oral', 'medium')
    ];
    
    // Verify all have proper display names
    expect(medicines[0].displayName).toBe('Warfarin');
    expect(medicines[1].displayName).toBe('Sertraline');  
    expect(medicines[2].displayName).toBe('Estradiol');
    
    // Verify all have different severity levels if specified
    expect(medicines[0].severity).toBe('high');
    expect(medicines[1].severity).toBe('medium');
    expect(medicines[2].severity).toBe('medium');
  });
});