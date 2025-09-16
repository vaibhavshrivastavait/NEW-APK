# Drug Interaction Mapping System

A comprehensive drug interaction mapping system that provides detailed analysis between Primary medication groups and Optional/Current medication categories for the MHT Assessment app.

## Overview

This system maps Primary medication groups (from assessment/treatment recommendations) to Optional/Current medication categories and specific drugs, providing severity-graded interaction analysis with clinical rationale and actionable recommendations.

## Architecture

### Core Components

1. **`/assets/rules/drug_interactions.json`** - Comprehensive rule database
2. **`/utils/drugInteractionMapper.ts`** - Core mapping and analysis engine
3. **Unit Tests** - Comprehensive test suite with 22 test cases
4. **Integration Helper Functions** - UI display utilities

### Rule Structure

The rules database contains interactions with the following structure:

```json
{
  "primary": "Hormone Replacement Therapy (HRT)",
  "interaction_with": "Anticoagulants",
  "examples": ["warfarin", "coumadin", "rivaroxaban"],
  "severity": "HIGH",
  "score": 4,
  "rationale": "Clinical reasoning...",
  "recommended_action": "Clinical advice...",
  "source": "Rules (local)"
}
```

### Severity Levels

- **HIGH** (Score 4): Critical interactions requiring avoidance
- **MAJOR** (Score 3): Significant interactions requiring close monitoring
- **MODERATE** (Score 2): Important interactions requiring attention
- **MINOR** (Score 1): Low-risk interactions requiring awareness
- **LOW** (Score 1): Minimal clinical significance

## Setup and Integration

### 1. Initialize the System

```typescript
import { initializeDrugInteractionMapper } from '../utils/drugInteractionMapper';

// Call once at app startup
await initializeDrugInteractionMapper();
```

### 2. Basic Usage

```typescript
import { 
  findBestRule, 
  analyzeMedicationsForPrimary,
  formatInteractionDisplay,
  getSeverityColor 
} from '../utils/drugInteractionMapper';

// Single medication analysis
const result = findBestRule(
  'Hormone Replacement Therapy (HRT)', 
  'warfarin', 
  'anticoagulant'
);

if (result) {
  console.log(`${result.medication} + ${result.primary} — ${result.severity}`);
  console.log(`Rationale: ${result.rationale}`);
  console.log(`Action: ${result.recommended_action}`);
}

// Multiple medications analysis
const medications = [
  { name: 'warfarin', category: 'anticoagulant' },
  { name: 'ibuprofen', category: 'nsaid' }
];

const results = analyzeMedicationsForPrimary(
  'Hormone Replacement Therapy (HRT)', 
  medications
);
```

### 3. UI Integration

```typescript
// Display formatted interaction
const displayText = formatInteractionDisplay(result);
// "warfarin + Hormone Replacement Therapy (HRT) — HIGH (Critical)"

// Get appropriate colors for severity
const severityColor = getSeverityColor(result.severity);
const severityIcon = getSeverityIcon(result.severity);
```

## Matching Algorithm

The system uses a hierarchical matching strategy:

1. **Exact Match**: Direct match between medication name and rule examples
2. **Category Match**: Partial matching and category-based matching
3. **Interaction Match**: Matching by interaction category
4. **Fallback Rules**: Generic rules for common interaction patterns

### Example Matching Flow

```typescript
// 1. Exact match: "warfarin" → finds HRT + Anticoagulants rule
findBestRule('HRT', 'warfarin') // ✅ HIGH severity

// 2. Category match: "advil" → matches NSAIDs category
findBestRule('HRT', 'advil', 'nsaid') // ✅ MAJOR severity

// 3. Fallback: "st john's wort" → generic herbal interaction
findBestRule('Unknown Primary', 'st john\'s wort') // ✅ MAJOR severity

// 4. No match: triggers online lookup flow
findBestRule('Unknown Primary', 'unknown med') // null → online check
```

## Testing

### Run Unit Tests

```bash
# Run all drug interaction mapper tests
npm test -- drugInteractionMapper.test.ts

# Run with coverage
npm test -- --coverage drugInteractionMapper.test.ts
```

### Test Coverage

The test suite includes 22 comprehensive test cases covering:

- ✅ Rule loading and caching
- ✅ Exact medication matching
- ✅ Case-insensitive matching
- ✅ Category-based matching
- ✅ Fallback rule handling
- ✅ Multiple medication analysis
- ✅ Severity level validation
- ✅ UI formatting functions
- ✅ Error handling scenarios
- ✅ Integration workflows

## API Configuration

### Online Check Fallback

When local rules don't match, the system can trigger online API checks:

```typescript
import { isUnknownMedication } from '../utils/drugInteractionMapper';

const isUnknown = isUnknownMedication(primaryGroup, medicationName);
if (isUnknown && onlineChecksEnabled) {
  // Trigger API call to external service
  const apiResult = await callExternalDrugAPI(medicationName);
  // Display: "No local rule — API result: {apiResult}"
}
```

### Toggle Online Checks

```typescript
// In your settings/configuration
const settings = {
  onlineChecksEnabled: true,  // Enable API fallback
  apiProvider: 'drugs.com',   // Configure provider
  localRulesFirst: true       // Always check local rules first
};
```

## Medicine Persistence & Invalidation

### Save Selections

```typescript
import { medicinePersistence } from '../utils/medicinePersistence';

// When user adds/removes medicines
const updateMedicines = async (patientId: string, medicines: MedicineItem[]) => {
  await medicinePersistence.saveMedicinesForPatient(patientId, medicines);
  await medicinePersistence.invalidateAnalysisCache(patientId);
};
```

### Handle Removal

```typescript
const removeMedicine = async (medicineId: string) => {
  const updatedMedicines = medicines.filter(m => m.id !== medicineId);
  setMedicines(updatedMedicines);
  
  // Persist and invalidate
  if (currentPatient) {
    await medicinePersistence.saveMedicinesForPatient(
      currentPatient.id, 
      updatedMedicines
    );
    await medicinePersistence.invalidateAnalysisCache(currentPatient.id);
  }
  
  // Re-run analysis without removed medicine
  const newAnalysis = await analyzeUpdatedMedicines(updatedMedicines);
  setAnalysisResult(newAnalysis);
};
```

## UI Display Format

### Result Display Template

```
{SelectedMedName} + {Primary} — {Severity} ({SeverityLabel})

Rationale: {Clinical reasoning}
Clinical Impact: {Detailed explanation}
Recommended Action: {Actionable advice}
Source: {Rules (local) | API | Mixed}
```

### Example Display

```
Warfarin + Hormone Replacement Therapy (HRT) — HIGH (Critical)

Rationale: Estrogens/progestogens alter coagulation and metabolism; combined with anticoagulants increases bleeding risk or INR variability.

Recommended Action: Avoid combination if possible. If used, closely monitor INR/bleeding; consult specialist.

Source: Rules (local)
```

## Extending the Rule Database

### Adding New Rules

1. Edit `/assets/rules/drug_interactions.json`
2. Add new rule following the established format
3. Include comprehensive `examples` array
4. Use consistent severity levels
5. Update version number and generatedAt timestamp

### Example New Rule

```json
{
  "primary": "Beta Blockers",
  "interaction_with": "Insulin / Antidiabetics",
  "examples": ["metoprolol", "propranolol", "atenolol"],
  "severity": "MODERATE",
  "score": 2,
  "rationale": "Beta blockers can mask hypoglycemic symptoms and affect glucose metabolism.",
  "recommended_action": "Monitor blood glucose more frequently; educate patient on non-cardiac hypoglycemia symptoms.",
  "source": "Rules (local)"
}
```

## Troubleshooting

### Common Issues

1. **Rules not loading**: Check file path and JSON syntax
2. **No matches found**: Verify medication names in `examples` arrays
3. **Wrong severity**: Ensure score matches severity level
4. **Cache issues**: Restart app to reload rules

### Debug Mode

```typescript
// Enable detailed logging
const result = findBestRule(primary, medication, category);
console.log('Match type:', result?.match_type);
console.log('Rule source:', result?.source);
```

## Performance Considerations

- Rules are loaded once and cached in memory
- Matching uses normalized string comparison
- Results are sorted by severity score for priority display
- Supports both local and API-based interaction checking

## Security & Privacy

- All rules stored locally for offline operation
- No external API calls unless explicitly enabled
- Patient medication data handled according to app privacy policy
- Cached analysis invalidated when medicines are modified

---

For technical support or questions about extending the system, refer to the comprehensive unit tests in `/utils/__tests__/drugInteractionMapper.test.ts` for implementation examples.