# Medicine-Based Treatment Plan Generator

## Overview

This document describes the implementation of the medicine-based treatment plan generator that fixes the Decision Support → Generate Treatment Plan crash/blank screen issue and provides robust, guideline-aware treatment plan generation.

## Files Added/Modified

### New Files Created:
- `/utils/treatmentPlanRules.json` - Medicine interaction rules and contraindications database
- `/utils/medicineBasedTreatmentGenerator.ts` - Core treatment plan generation engine
- `/MEDICINE_TREATMENT_PLAN_README.md` - This documentation file

### Files Modified:
- `/screens/DecisionSupportScreen.tsx` - Added medicine selection UI and robust plan generation
- `/screens/TreatmentPlanScreen.tsx` - Added support for medicine-based generated plans

## Local Rules Structure

The treatment plan generation is driven by local JSON rules in `/utils/treatmentPlanRules.json`:

### Medicine Interactions
```json
{
  "medicationInteractions": {
    "HRT_ESTROGEN": {
      "interactsWith": ["ANTICOAGULANT", "ANTIDEPRESSANT_SSRI"],
      "severity": {
        "ANTICOAGULANT": "HIGH",
        "ANTIDEPRESSANT_SSRI": "MODERATE"
      },
      "warnings": {
        "ANTICOAGULANT": "Increased bleeding risk. Monitor INR closely.",
        "ANTIDEPRESSANT_SSRI": "May reduce HRT effectiveness."
      }
    }
  }
}
```

### Contraindications
```json
{
  "contraindications": {
    "HRT_ESTROGEN": {
      "absolute": [
        "ACTIVE_BREAST_CANCER",
        "ACTIVE_DVT_PE",
        "ACUTE_LIVER_DISEASE"
      ],
      "relative": [
        "HISTORY_BREAST_CANCER",
        "HYPERTRIGLYCERIDEMIA"
      ]
    }
  }
}
```

### Treatment Recommendations
```json
{
  "recommendations": {
    "NO_MEDICATIONS": {
      "title": "General Menopause Management",
      "actions": ["Lifestyle modifications", "Symptom evaluation"],
      "alternatives": ["CBT", "Exercise program"],
      "monitoring": ["Annual assessment"]
    }
  }
}
```

## How to Update Rules

### Adding New Medicine Types:
1. Add the medicine type to `medicationInteractions` in `treatmentPlanRules.json`
2. Define interactions with other medicine types
3. Set severity levels: `HIGH`, `MODERATE`, `LOW`
4. Add descriptive warnings for each interaction

### Adding New Interactions:
```json
{
  "NEW_MEDICINE_TYPE": {
    "interactsWith": ["EXISTING_TYPE"],
    "severity": {
      "EXISTING_TYPE": "MODERATE"
    },
    "warnings": {
      "EXISTING_TYPE": "Clinical description of interaction"
    }
  }
}
```

### Adding New Contraindications:
```json
{
  "NEW_MEDICINE_TYPE": {
    "absolute": ["CONDITION_1", "CONDITION_2"],
    "relative": ["CONDITION_3", "CONDITION_4"]
  }
}
```

### Adding New Treatment Recommendations:
```json
{
  "NEW_SCENARIO": {
    "title": "Scenario Name",
    "actions": ["Action 1", "Action 2"],
    "alternatives": ["Alternative 1", "Alternative 2"],
    "monitoring": ["Monitor 1", "Monitor 2"]
  }
}
```

## Medicine Type Detection

The system automatically detects medicine types from names:

### Supported Types:
- `HRT_ESTROGEN` - Estradiol, estrogen patches, Premarin
- `HRT_PROGESTOGEN` - Progesterone, progestin, Medroxyprogesterone
- `ANTIDEPRESSANT_SSRI` - Sertraline, Fluoxetine, Venlafaxine
- `ANTICOAGULANT` - Warfarin, Apixaban, Rivaroxaban
- `HERBAL_SUPPLEMENT` - Black Cohosh, Red Clover, herbal supplements
- `UNKNOWN` - Unrecognized medicines

### Adding New Detection Rules:
In `/utils/medicineBasedTreatmentGenerator.ts`, update the `detectMedicineType()` function:

```typescript
const detectMedicineType = (medicineName: string): string => {
  const name = medicineName.toLowerCase();
  
  // Add new detection logic
  if (name.includes('new_medicine_keyword')) {
    return 'NEW_MEDICINE_TYPE';
  }
  
  return 'UNKNOWN';
};
```

## Test Cases Implementation

The system includes built-in test cases for validation:

### Test Case A: No Medications
```typescript
await medicineBasedTreatmentGenerator.generateTestCase('A');
```
**Expected Output**: General treatment suggestions and lifestyle recommendations

### Test Case B: Single HRT Medicine
```typescript
await medicineBasedTreatmentGenerator.generateTestCase('B');
```
**Expected Output**: HRT-specific recommendations with appropriate monitoring

### Test Case C: HRT + Anticoagulant
```typescript
await medicineBasedTreatmentGenerator.generateTestCase('C');
```
**Expected Output**: Interaction warnings and alternative suggestions

### Test Case D: Herbal Supplement
```typescript
await medicineBasedTreatmentGenerator.generateTestCase('D');
```
**Expected Output**: Limited evidence warning and interaction checks

### Test Case E: Unknown Medicine
```typescript
await medicineBasedTreatmentGenerator.generateTestCase('E');
```
**Expected Output**: Unknown medication warning with validation prompt

## Error Handling Features

### Robust Error Recovery:
- **Timeout Protection**: 10-second timeout for plan generation
- **Input Validation**: Sanitizes and validates all medicine inputs
- **Graceful Fallbacks**: Provides local guidelines when server unavailable
- **User-Friendly Errors**: Clear error messages with retry options

### Loading States:
- **Progress Indicators**: Real-time progress updates during generation
- **Loading Spinners**: Visual feedback for long operations
- **Status Messages**: Informative text about current operation

### Offline Operation:
- **Local Rules Engine**: All generation logic runs client-side
- **No External Dependencies**: Works without internet connection
- **Offline Mode Indicators**: Clear messaging when in offline mode

## UI/UX Features

### Medicine Selection:
- **Quick Add Buttons**: One-click addition of common medicines
- **Custom Input**: Manual entry with type detection
- **Selected List**: Visual display of chosen medicines with removal
- **Type Indicators**: Shows detected medicine types and categories

### Treatment Plan Display:
- **Color-Coded Warnings**: High/Moderate/Low risk color scheme
- **Interaction Alerts**: Prominent display of drug interactions
- **Contraindication Flags**: Clear warnings for absolute/relative contraindications
- **Alternative Suggestions**: Non-hormonal and lifestyle alternatives

### Special Features:
- **Herbal Supplement Notes**: Special handling with evidence limitations
- **Unknown Medicine Handling**: Graceful handling of unrecognized drugs
- **Guideline References**: Links to IMS/NAMS/NICE guidelines

## Performance Optimizations

### Background Processing:
- Uses `InteractionManager.runAfterInteractions()` to avoid UI blocking
- Efficient rule lookups with optimized data structures
- Memory-conscious processing for large medicine lists

### Caching:
- Generated plans are cached to avoid re-generation
- Rule lookups are optimized for repeated access
- Patient data is efficiently stored and retrieved

## Security & Privacy

### Data Protection:
- **Local Processing**: All generation occurs on-device
- **No External Transmission**: Patient data never leaves the device
- **Secure Storage**: Generated plans stored in app-specific storage
- **Privacy Compliance**: Follows medical data privacy best practices

## Troubleshooting

### Common Issues:

#### "Treatment Plan Generation Failed"
- **Cause**: Complex medication interactions or missing patient data
- **Solution**: Retry with simplified medicine selection or check patient data completeness

#### "Unknown Medication Warning"
- **Cause**: Medicine name not recognized by detection system
- **Solution**: Add detection rule in `detectMedicineType()` or select from quick-add buttons

#### "Timeout Error"
- **Cause**: Generation taking longer than 10 seconds
- **Solution**: Reduce number of selected medicines or check device performance

### Debug Information:
- Enable console logging in development mode
- Check `/var/log/supervisor/expo.out.log` for detailed error messages
- Verify medicine type detection is working correctly

## Deployment Notes

### Production Checklist:
- [ ] All medicine interaction rules validated
- [ ] Test cases A-E passing
- [ ] Error handling tested with invalid inputs
- [ ] Offline mode verified
- [ ] Performance tested with complex medicine combinations
- [ ] UI tested on various screen sizes

### APK/Standalone Builds:
- All rules are embedded in the app bundle
- No external server dependencies
- Works completely offline
- Full functionality available without Metro

This implementation provides a robust, offline-capable treatment plan generator that eliminates the crash/blank screen issue while providing comprehensive medicine-based analysis for clinical decision support.