# 🏥 Treatment Plan & Risk Decision Engine

## Overview

The Treatment Plan & Risk Decision Engine is a deterministic, rule-driven system that evaluates medical treatment options based on patient data, risk scores, contraindications, and drug interactions. It provides evidence-based recommendations with full audit trails.

## Architecture

### Core Components

1. **TreatmentPlanEngine** (`utils/treatmentPlanEngine.ts`)
   - Main decision engine that applies rules in strict precedence order
   - Loads and processes JSON rule files at runtime
   - Produces structured recommendations with audit trails

2. **EnhancedRiskCalculators** (`utils/enhancedRiskCalculators.ts`)
   - Implements validated medical risk calculators (ASCVD, FRAX, Gail, Wells, etc.)
   - Handles precedence: external scores > computed scores > unavailable
   - Detects conflicts between external and computed scores (>5% difference)

3. **DecisionSupportDetailScreen** (`screens/DecisionSupportDetailScreen.tsx`)
   - Full UI for treatment analysis with simulation capabilities
   - Real-time recalculation with 300ms debounce
   - Accessibility-compliant design with reduce motion support

4. **JSON Rule Files** (`data/`)
   - `thresholds.json` - Risk thresholds and actions
   - `contraindications.json` - Absolute and relative contraindications
   - `interactions.json` - Drug interaction rules
   - `example_cases.json` - Test cases for validation

## Rule Precedence (Deterministic Order)

The engine applies rules in this exact order as specified in `thresholds.json`:

1. **Absolute Contraindications** → Immediate block (Do NOT prescribe)
2. **High-Severity Drug Interactions** → Block or advise avoid
3. **Risk-Threshold High** → Treat as high-priority safety actions
4. **Moderate-Risk Rules** → Suggest review/monitor
5. **Patient Preference/Symptom Guidance** → Last consideration

### Example Rule Flow

```typescript
// 1. Check absolute contraindications first
if (pregnancy) → "Do NOT prescribe HRT" (STOP)

// 2. Check high-severity interactions
if (estrogen + warfarin) → "Avoid combination" (STOP)

// 3. Check high-risk thresholds
if (ASCVD ≥ 20%) → "Avoid estrogen-based HRT"

// 4. Continue with moderate risks...
```

## Risk Calculator Implementation

### Supported Calculators

1. **ASCVD (10-year)** - Pooled Cohort Equations
2. **Framingham Risk Score** - CHD risk assessment
3. **FRAX** - Fracture risk (major osteoporotic & hip)
4. **Gail Model** - Breast cancer risk (5-year)
5. **Wells Score** - VTE probability

### Score Precedence Logic

```typescript
// 1. External score (from other systems)
if (externalScore) use externalScore;

// 2. Computed score (calculated locally)
else if (canCompute) use computedScore;

// 3. Unavailable
else return "insufficient data";

// Conflict detection
if (both exist && difference > 5%) showConflictWarning();
```

## UI Features

### DecisionSupportDetailScreen

- **Summary View** - Read-only patient and risk data
- **Primary Recommendation** - Color-coded by strength (Strong/Conditional/Not recommended)
- **Fired Rules Panel** - Expandable audit trail showing which rules triggered
- **Alternatives & Monitoring** - Evidence-based alternatives and monitoring plans
- **Clinician Review Banner** - Prominent warning when review required

### Simulation Mode

- **Default Editable Fields**: medicine selection, current medications, age, weight, smoking, BP, diabetes
- **Advanced Mode**: Edit all available inputs
- **Live Recalculation**: 300ms debounced updates
- **Reset & Compare**: Original vs simulated recommendations
- **Ephemeral Changes**: No data persistence

## Data Files

### thresholds.json

Defines risk cutoffs and associated actions:

```json
{
  "risk_thresholds": {
    "ASCVD": { "cutoffs": { "low": 7.5, "high": 20 } }
  },
  "actions": {
    "ASCVD_high": ["Avoid estrogen-based HRT", "Cardiology review"]
  },
  "precedence": ["absolute_contraindications", "interactions_high", ...]
}
```

### contraindications.json

Medical contraindications:

```json
{
  "contraindications": [
    {
      "id": "C_ABS_PREGNANCY",
      "condition": "pregnancy",
      "type": "absolute",
      "message": "Pregnancy — DO NOT prescribe HRT."
    }
  ]
}
```

### interactions.json

Drug interaction rules:

```json
{
  "interactions": [
    {
      "id": "I_HI_EST_WARF",
      "drug_a": "Estrogen (systemic)",
      "drug_b": "Warfarin",
      "severity": "high",
      "action": "avoid",
      "message": "Estrogen alters warfarin metabolism..."
    }
  ]
}
```

## Testing

### Unit Tests

Run comprehensive tests against example cases:

```bash
npm test -- treatmentPlanEngine.test.ts
```

### Test Coverage

- ✅ All 10 example cases from `example_cases.json`
- ✅ Contraindication handling (absolute vs relative)
- ✅ Drug interaction processing (high, moderate, low severity)
- ✅ Risk threshold evaluation
- ✅ Rule precedence verification
- ✅ Insufficient data handling
- ✅ Source traceability for audit

### Expected Outcomes

Each test case validates:
- Required rules fire (`mustFire` array)
- Appropriate recommendation strength
- Correct audit trail
- Proper precedence handling

## Usage

### Basic Treatment Evaluation

```typescript
import { TreatmentPlanEngine } from './utils/treatmentPlanEngine';

const engine = new TreatmentPlanEngine();

const inputs = {
  age: 55,
  sex: 'female',
  ASCVD: 12,
  selected_medicine: 'Estrogen (systemic)',
  current_medications: ['Warfarin'],
  conditions: []
};

const recommendation = engine.evaluateTreatment(inputs);

console.log(recommendation.primaryRecommendation.text);
console.log(recommendation.firedRules.map(r => r.id));
```

### Navigation Integration

```typescript
// From DecisionSupportScreen
navigation.navigate('DecisionSupportDetail', {
  patientData: currentPatient,
  riskResults: assessmentResults,
  selectedMedicine: 'Estrogen (systemic)',
  currentMedications: ['Warfarin']
});
```

## Accessibility

- **Screen Reader Support** - Proper accessibility labels and roles
- **Large Text** - Responsive to iOS/Android text size settings
- **Reduce Motion** - Respects motion reduction preferences
- **Keyboard Navigation** - Full keyboard accessibility
- **Color Contrast** - WCAG compliant color schemes

## Security & Compliance

- **No Data Persistence** - All processing is ephemeral
- **Deterministic Output** - Same inputs always produce same results
- **Audit Trail** - Complete traceability of rule firing
- **Source Attribution** - Every rule references its source JSON file

## Updating Rules

To update clinical rules:

1. **Modify JSON files** in `data/` directory
2. **Add new rules** following existing ID patterns
3. **Update test cases** in `example_cases.json`
4. **Run tests** to validate changes
5. **Version control** changes for audit purposes

### Rule ID Conventions

- **Contraindications**: `C_[ABS|REL]_[CONDITION]`
- **Interactions**: `I_[HI|MOD|LOW]_[DRUG1]_[DRUG2]`
- **Risk Thresholds**: `[SCORE]_[high|moderate|low]`

## Performance

- **Rule Evaluation**: O(n) where n = number of rules
- **Memory Usage**: JSON files loaded once at startup
- **Debounced Updates**: 300ms delay prevents excessive recalculation
- **Optimized Rendering**: React.memo and useMemo for complex components

## Integration Points

### With Existing Screens

- **DecisionSupportScreen** - "View Decision Support" button navigates to detail screen
- **ResultsScreen** - Can integrate "Generate Treatment Plan" button
- **Risk Calculators** - Seamless integration with existing assessment flow

### Data Flow

```
Patient Assessment → Risk Calculation → Treatment Engine → Recommendation → UI Display
                                    ↓
                              JSON Rule Files
```

## Future Enhancements

- **Custom Rule Builder** - UI for clinicians to modify rules
- **Outcome Tracking** - Monitor recommendation effectiveness
- **ML Integration** - Hybrid approach with deterministic base + ML insights
- **Multi-language** - Internationalization of rules and messages
- **API Integration** - Real-time drug database updates

---

**Note**: This engine prioritizes patient safety through deterministic, evidence-based decision making. All recommendations should be reviewed by qualified healthcare professionals.