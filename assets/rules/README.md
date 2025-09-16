# Drug Interaction Rules - Clinical Documentation

## Overview

This file contains local drug interaction rules for the MHT Assessment app. These rules provide evidence-based clinical decision support for hormone replacement therapy and related medications.

## JSON Schema

Each rule contains the following fields:

```json
{
  "primary": "Primary medication group (string)",
  "interaction_with": "Category of interacting medication (string)", 
  "examples": ["array", "of", "specific", "drug", "names"],
  "severity": "HIGH | MODERATE | LOW",
  "rationale": "Clinical reasoning for the interaction (string)",
  "recommended_action": "Specific clinical advice (string)"
}
```

## Severity Definitions

- **HIGH**: Critical interactions requiring avoidance or specialist consultation
- **MODERATE**: Significant interactions requiring close monitoring or dose adjustment  
- **LOW**: Minor interactions requiring patient education or timing adjustments

## Current Rule Coverage

### Primary Medication Groups
1. **Hormone Replacement Therapy (HRT)**
   - Interactions with: Anticoagulants, NSAIDs, Anticonvulsants, Antibiotics, Antifungals
   - Coverage: 5 interaction categories with 22+ specific drug examples

2. **Selective Estrogen Receptor Modulators (SERMs)**
   - Interactions with: Anticoagulants  
   - Coverage: 1 interaction category with 2+ specific drug examples

3. **Tibolone**
   - Interactions with: Anticonvulsants
   - Coverage: 1 interaction category with 2+ specific drug examples

4. **SSRIs / SNRIs (for vasomotor symptoms)**
   - Interactions with: Anticoagulants, Tamoxifen
   - Coverage: 2 interaction categories with 4+ specific drug examples

5. **Bisphosphonates**
   - Interactions with: Calcium/antacids, NSAIDs
   - Coverage: 2 interaction categories with 4+ specific drug examples

6. **Additional Groups**
   - Anticonvulsants, Thyroid replacement, Antidepressants, Statins
   - Generic fallback rules for herbal supplements and common drug classes

## Clinical Sign-Off Requirements

**⚠️ CLINICAL REVIEW REQUIRED**

Before deploying this drug interaction database to production, the following clinical review must be completed:

### Review Checklist
- [ ] **Clinical accuracy**: All severity ratings reviewed and approved by licensed clinician
- [ ] **Evidence base**: Rationale statements verified against current clinical guidelines
- [ ] **Recommended actions**: All clinical advice reviewed for appropriateness and clarity
- [ ] **Coverage assessment**: Primary medication groups cover relevant clinical scenarios
- [ ] **Missing interactions**: Identified any significant missing drug interactions
- [ ] **Update frequency**: Established process for regular clinical review and updates

### Clinical Reviewer Information
- **Reviewer Name**: ________________
- **Medical License #**: ________________  
- **Specialty**: ________________
- **Review Date**: ________________
- **Approval Signature**: ________________

### Clinical Notes
```
[Space for clinical reviewer notes and recommendations]




```

## How to Edit Rules

### Adding New Rules
1. Open `/assets/rules/drug_interactions.json`
2. Add new rule object to the `rules` array
3. Follow the JSON schema format exactly
4. Include comprehensive `examples` array with both generic and brand names
5. Update `generatedAt` timestamp
6. Increment version number
7. **Require clinical review before deployment**

### Updating Existing Rules
1. Modify the specific rule object
2. Update `generatedAt` timestamp  
3. Document changes in git commit
4. **Require clinical review for severity or rationale changes**

### Example New Rule
```json
{
  "primary": "Beta Blockers",
  "interaction_with": "Insulin / Antidiabetics", 
  "examples": ["metoprolol", "propranolol", "atenolol"],
  "severity": "MODERATE",
  "rationale": "Beta blockers can mask hypoglycemic symptoms and affect glucose metabolism.",
  "recommended_action": "Monitor blood glucose more frequently; educate patient on non-cardiac hypoglycemia symptoms."
}
```

## App Integration

### How Rules Are Loaded
1. Rules are loaded once at app startup via `loadLocalRules()`
2. Performance indexes are built for O(1) lookups by primary group and drug examples
3. Rules are cached in memory for fast repeated access

### Matching Algorithm
1. **Exact Match**: Direct comparison of drug name with `examples` array (case-insensitive)
2. **Category Match**: Partial matching with `interaction_with` field
3. **Fallback Rules**: Generic interaction patterns for unmatched drugs
4. **Severity Priority**: Results sorted by severity score (HIGH=3, MODERATE=2, LOW=1)

### Enabling Online Checks
Users can enable online API checks to supplement local rules:

1. Go to Drug Interaction Checker settings
2. Toggle "Enable online drug checks" 
3. Select API provider (OpenFDA, RxNorm, DrugBank)
4. Online results are merged with local rules, with local rules taking priority for matching pairs

### Reloading Rules in App
For development and testing:
```javascript
import { reloadRules } from '../utils/drugRules';
await reloadRules(); // Forces reload from JSON file
```

## Quality Assurance

### Automated Testing
- Unit tests cover 22 test cases including exact matching, category matching, error handling
- Integration tests verify UI components and persistence
- Performance tests ensure sub-second response times for large medication lists

### Manual Testing Checklist
- [ ] Select two medicines → Analyze → results show interactions (local rules)
- [ ] Remove a selected medicine → Analyze → removed drug excluded (persisted removal)  
- [ ] Multi-select remove → Analyze updated accordingly
- [ ] Turn off network → analysis uses local rules and shows "online check skipped" 
- [ ] Default panel is Drug Interaction Checker
- [ ] All buttons have accessibility labels
- [ ] Remove control reachable by keyboard/assistive technology

## Security and Privacy

### Data Handling
- All rules processed locally - no PHI sent to external servers by default
- Debug logs contain only medication names and analysis metadata (no patient identifiers)
- Online API calls (when enabled) send only medication names, not patient data

### Rule Updates
- Rules file is read-only in production
- Updates require app update or secure remote configuration
- All changes logged with timestamps and review status

## Maintenance Schedule

### Recommended Review Frequency
- **Quarterly**: Review new drug approvals and significant safety updates
- **Annually**: Comprehensive clinical review of all rules and severities  
- **Ad-hoc**: Following major clinical guideline updates or safety alerts

### Update Process
1. Clinical team identifies need for rule changes
2. Rules updated in development environment
3. Clinical review and approval
4. Automated testing verification
5. Staged deployment with monitoring
6. Documentation update

---

**Last Updated**: _______________  
**Version**: 1.0.0  
**Next Review Due**: _______________

**Clinical Approval Required Before Production Use**