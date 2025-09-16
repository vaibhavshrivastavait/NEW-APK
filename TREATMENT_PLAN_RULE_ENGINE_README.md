# 🏥 Treatment Plan Rule Engine - README

## Overview

The **General-Specific Treatment Plan Generator** is a rule-based decision support system for the MHT Assessment app. It generates tailored, advisory treatment recommendations based on patient data, risk scores, and medical history using a deterministic rule engine.

## 🎯 Key Features

### Advisory Language
- All recommendations use **non-prescriptive language**: "consider", "discuss", "may be considered"
- No exact dosages or prescription regimens
- Mandatory disclaimer on all generated plans
- Clear "Discuss with clinician" messaging

### Rule-Based Decision Engine
- JSON-based rules for transparency and maintainability
- Confidence scoring (0-100%) for each recommendation
- Urgency levels: Low, Medium, High
- Audit trail of which rules fired for each recommendation

### Safety First
- Contraindication detection (breast cancer, VTE history)
- Drug interaction alerts
- High-risk situation flagging with urgent referral
- Fallback to generic advice when data is insufficient

## 📁 File Structure

```
/app
├── data/
│   ├── treatmentPlanRules.json          # Core rules definitions
│   └── treatmentPlanTestCases.json      # Test cases for validation
├── utils/
│   ├── treatmentPlanRuleEngine.ts       # Main rule engine logic
│   ├── treatmentPlanPDFExport.ts        # PDF export functionality
│   └── __tests__/
│       └── treatmentPlanRuleEngine.test.ts  # Unit tests
├── screens/
│   └── GeneralSpecificTreatmentPlanScreen.tsx  # Main UI component
└── TREATMENT_PLAN_RULE_ENGINE_README.md
```

## 🔧 Rule Engine Architecture

### Core Components

1. **Rule Evaluation Engine**: Processes JSON rules against patient data
2. **Confidence Calculator**: Assigns confidence scores based on rule weights
3. **Audit Trail System**: Tracks which inputs triggered which recommendations
4. **Safety Validator**: Checks for contraindications and high-risk conditions

### Rule Structure

Each rule in `treatmentPlanRules.json` follows this format:

```json
{
  "id": "unique_rule_identifier",
  "conditions": {
    "field_name": "expected_value",
    "nested.field": ">threshold_value"
  },
  "action": {
    "recommendation": "Advisory recommendation text",
    "rationale": "Brief explanation for the recommendation",
    "confidence": 85,
    "urgency": "medium",
    "category": "interaction|contraindication|caution|referral",
    "alternatives": ["Alternative option 1", "Alternative option 2"],
    "references": ["Guideline reference", "Study citation"]
  }
}
```

### Condition Operators

- **Direct match**: `"medicineType": "HRT"`
- **Greater than**: `"riskScores.ASCVD": ">15"`
- **Less than**: `"age": "<65"`
- **Array contains**: `"medicationListContains": ["warfarin"]`
- **Boolean**: `"history.VTE": true`

## 🚀 Usage

### Generating a Treatment Plan

```typescript
import TreatmentPlanRuleEngine, { PatientData } from '../utils/treatmentPlanRuleEngine';

const ruleEngine = new TreatmentPlanRuleEngine();

const patientData: PatientData = {
  age: 55,
  gender: 'female',
  medicineType: 'HRT',
  riskScores: {
    ASCVD: 12.5,
    FRAX: 8.2
  },
  history: {
    VTE: false,
    breastCancer_active: false
  }
};

const treatmentPlan = ruleEngine.generateTreatmentPlan(patientData);
```

### Navigation Integration

From Decision Support screen:

```typescript
navigation.navigate('GeneralSpecificTreatmentPlan', {
  patientData: preparedPatientData
});
```

## 📊 Test Cases

The system includes 10 comprehensive test cases covering:

1. **Contraindications**: Active breast cancer + HRT
2. **VTE History**: Previous thrombosis + HRT request
3. **Bone Health**: High FRAX score requiring specialist referral
4. **Drug Interactions**: Warfarin + herbal supplements
5. **Cardiovascular Risk**: High ASCVD with HRT consideration
6. **Lifestyle First**: Low-risk patients with mild symptoms
7. **SSRI Interactions**: Multiple drug interaction scenarios
8. **Elderly Care**: Renal impairment in older patients
9. **Urgent Thrombosis**: High Wells score requiring immediate care
10. **Incomplete Data**: Insufficient information scenarios

## 🔒 Safety Features

### Mandatory Disclaimer

Every treatment plan displays this disclaimer:

> **Disclaimer:** This treatment plan is an educational aid generated from the provided information. It is **not** a substitute for professional medical advice, diagnosis, or treatment. Recommendations are advisory only — always consult a qualified healthcare provider before acting on these suggestions. The app does not prescribe medications or dosages. If you are experiencing an emergency, seek immediate medical attention.

### Confidence Thresholds

- **High Confidence (80%+)**: Standard recommendations
- **Medium Confidence (60-79%)**: Recommendations with caveats
- **Low Confidence (<60%)**: Marked as "Hypothesis — confirm with clinician"

### Urgency Levels

- **High**: Red flags, immediate clinician contact required
- **Medium**: Clinician review within 2 weeks
- **Low**: Routine follow-up appropriate

## 📄 PDF Export

Generated treatment plans can be exported as structured HTML/PDF files containing:

- **Header**: App name, Plan ID, generation date
- **Patient Information**: Basic demographics and risk scores
- **Primary Recommendations**: Numbered with rationale and confidence
- **Alternative Therapies**: Non-pharmacological options
- **Clinical Summary**: Overall assessment and guidance
- **Action Items**: Next steps with urgency indicators
- **References**: Guidelines and evidence sources
- **Footer**: Disclaimer and generation details

## 🧪 Testing

### Running Unit Tests

```bash
# Run all treatment plan rule engine tests
npm test -- treatmentPlanRuleEngine.test.ts

# Run specific test suite
npm test -- --testNamePattern="Rule Evaluation Tests"
```

### Test Coverage

- ✅ Rule evaluation logic
- ✅ Contraindication detection
- ✅ Drug interaction alerts
- ✅ Confidence calculation
- ✅ Urgency prioritization
- ✅ Data validation
- ✅ Audit trail generation

## 🔄 Adding New Rules

### Step 1: Define Rule in JSON

Add to `data/treatmentPlanRules.json`:

```json
{
  "id": "new_rule_identifier",
  "conditions": {
    "your_condition_field": "expected_value"
  },
  "action": {
    "recommendation": "Your advisory recommendation",
    "rationale": "Brief explanation",
    "confidence": 75,
    "urgency": "medium",
    "category": "caution"
  }
}
```

### Step 2: Add Test Case

Add to `data/treatmentPlanTestCases.json`:

```json
{
  "id": "test_new_rule",
  "description": "Description of test scenario",
  "input": {
    // Patient data that should trigger your rule
  },
  "expectedRecommendations": [
    "Your expected recommendation text"
  ],
  "expectedConfidence": 75,
  "expectedUrgency": "medium"
}
```

### Step 3: Write Unit Test

Add test case to `utils/__tests__/treatmentPlanRuleEngine.test.ts`:

```typescript
test('Should trigger new rule for specific condition', () => {
  const patientData: PatientData = {
    // Test data
  };

  const plan = ruleEngine.generateTreatmentPlan(patientData);

  expect(plan.primaryRecommendations[0].recommendation).toContain('expected text');
  expect(plan.primaryRecommendations[0].confidence).toBe(75);
});
```

## 📋 Configuration

### Feature Toggles

In `treatmentPlanRules.json`:

```json
{
  "config": {
    "ENABLE_SPECIFIC_SUGGESTIONS": true,
    "MIN_CONFIDENCE_THRESHOLD": 50,
    "HIGH_URGENCY_THRESHOLD": 90,
    "MEDIUM_URGENCY_THRESHOLD": 70
  }
}
```

## 🔄 Guideline Updates

### Update Process

1. **Review New Guidelines**: Check NAMS, ACOG, AHA/ACC updates
2. **Update Rules**: Modify `treatmentPlanRules.json` with new criteria
3. **Update References**: Add new guideline citations
4. **Test Changes**: Run unit tests to ensure no regressions
5. **Update Test Cases**: Add new scenarios if needed
6. **Document Changes**: Update this README with significant changes

### Common Update Scenarios

- **New Risk Thresholds**: Update condition values in existing rules
- **New Contraindications**: Add new rule with high urgency
- **Guideline Reference Updates**: Update reference arrays in actions
- **Confidence Adjustments**: Modify confidence scores based on evidence strength

## 🚨 Troubleshooting

### Common Issues

1. **Rules Not Firing**
   - Check condition syntax in JSON
   - Verify field names match PatientData interface
   - Test with console.log in rule evaluation

2. **Low Confidence Scores**
   - Review rule confidence values
   - Check if multiple low-confidence rules are averaging down
   - Consider adjusting urgency weights

3. **Missing Recommendations**
   - Verify patient data completeness
   - Check data type matching (string vs number)
   - Review nested field access patterns

4. **PDF Export Issues**
   - Check file permissions for FileSystem
   - Verify Sharing module availability
   - Test HTML generation separately

## 📞 Support

For questions or issues with the treatment plan rule engine:

1. Check unit tests for examples
2. Review test cases for reference implementations
3. Validate JSON syntax in rule files
4. Ensure TypeScript interfaces match data structures

## ⚡ Performance Notes

- **Rule Engine**: O(n) complexity where n = number of rules
- **Data Validation**: Minimal overhead, early returns on missing data
- **Storage**: Local AsyncStorage for plan persistence
- **Memory**: Minimal footprint, no heavy dependencies

---

**Version**: 1.0.0  
**Last Updated**: September 2025  
**Compatibility**: Expo SDK 50+, React Native 0.73+